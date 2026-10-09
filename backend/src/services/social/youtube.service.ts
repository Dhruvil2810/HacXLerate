import { YouTubeConnector } from './youtube.connector.js';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/response.util.js';
import { encryptSecret, decryptSecret } from '../../utils/crypto.util.js';
import { createAuditLog } from '../audit.service.js';

const youtubeConnector = new YouTubeConnector();

export function getYouTubeAuthUrl(userId: string): string {
  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
  return youtubeConnector.generateAuthUrl(state);
}

export async function handleYouTubeOAuthCallback(code: string, stateBase64: string, ip?: string, userAgent?: string) {
  let userId: string;
  try {
    const parsed = JSON.parse(Buffer.from(stateBase64, 'base64').toString('utf8'));
    userId = parsed.userId;
  } catch {
    throw new AppError('Invalid OAuth state parameter', 400, 'INVALID_OAUTH_STATE');
  }

  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    throw new AppError('Creator profile not found. Please complete creator profile setup first.', 400, 'CREATOR_PROFILE_REQUIRED');
  }

  // 1. Exchange auth code for tokens
  const tokens = await youtubeConnector.exchangeCodeForTokens(code);

  // 2. Fetch normalized channel metadata
  const channelData = await youtubeConnector.getChannelProfile(tokens);

  // 3. Encrypt sensitive tokens at rest
  const encryptedAccess = encryptSecret(tokens.accessToken);
  const encryptedRefresh = tokens.refreshToken ? encryptSecret(tokens.refreshToken) : null;

  // 4. Upsert SocialAccount & SocialOAuthCredential
  const result = await prisma.$transaction(async (tx) => {
    const socialAccount = await tx.socialAccount.upsert({
      where: {
        creatorId_platform_platformAccountId: {
          creatorId: creatorProfile.id,
          platform: 'YOUTUBE',
          platformAccountId: channelData.platformAccountId,
        },
      },
      update: {
        accountName: channelData.title,
        avatarUrl: channelData.avatarUrl,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      },
      create: {
        creatorId: creatorProfile.id,
        platform: 'YOUTUBE',
        platformAccountId: channelData.platformAccountId,
        accountName: channelData.title,
        avatarUrl: channelData.avatarUrl,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    await tx.socialOAuthCredential.upsert({
      where: { socialAccountId: socialAccount.id },
      update: {
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: tokens.expiresAt || null,
        scope: tokens.scope || null,
      },
      create: {
        socialAccountId: socialAccount.id,
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: tokens.expiresAt || null,
        scope: tokens.scope || null,
      },
    });

    const youtubeChannel = await tx.youTubeChannel.upsert({
      where: { socialAccountId: socialAccount.id },
      update: {
        channelId: channelData.platformAccountId,
        title: channelData.title,
        description: channelData.description,
        customUrl: channelData.customUrl,
        subscriberCount: BigInt(channelData.subscriberCount),
        totalViews: BigInt(channelData.totalViews),
        videoCount: channelData.videoCount,
        publishedAt: channelData.publishedAt,
        lastSyncedAt: new Date(),
      },
      create: {
        socialAccountId: socialAccount.id,
        channelId: channelData.platformAccountId,
        title: channelData.title,
        description: channelData.description,
        customUrl: channelData.customUrl,
        subscriberCount: BigInt(channelData.subscriberCount),
        totalViews: BigInt(channelData.totalViews),
        videoCount: channelData.videoCount,
        publishedAt: channelData.publishedAt,
        lastSyncedAt: new Date(),
      },
    });

    // Mark creator profile verified
    await tx.creatorProfile.update({
      where: { id: creatorProfile.id },
      data: { isVerified: true },
    });

    return { socialAccount, youtubeChannel };
  });

  // Sync videos and snapshot
  await syncYouTubeChannel(userId, ip, userAgent);

  await createAuditLog({
    actorId: userId,
    action: 'YOUTUBE_CONNECTED',
    entityType: 'SocialAccount',
    entityId: result.socialAccount.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { channelTitle: channelData.title, platformAccountId: channelData.platformAccountId },
  });

  return result;
}

export async function syncYouTubeChannel(userId: string, ip?: string, userAgent?: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      socialAccounts: {
        where: { platform: 'YOUTUBE' },
        include: {
          oauthCredential: true,
          youtubeChannel: true,
        },
      },
    },
  });

  if (!creatorProfile || !creatorProfile.socialAccounts[0]) {
    throw new AppError('No connected YouTube account found', 404, 'NOT_FOUND');
  }

  const socialAccount = creatorProfile.socialAccounts[0];
  const credential = socialAccount.oauthCredential;

  if (!credential) {
    throw new AppError('OAuth credentials missing for YouTube connection', 400, 'CREDENTIALS_MISSING');
  }

  const decryptedAccess = decryptSecret(credential.encryptedAccessToken);
  const decryptedRefresh = credential.encryptedRefreshToken ? decryptSecret(credential.encryptedRefreshToken) : null;

  const tokens = {
    accessToken: decryptedAccess,
    refreshToken: decryptedRefresh,
  };

  // 1. Fetch channel, videos, snapshots, and audience
  const [channelData, videos, snapshots, audience] = await Promise.all([
    youtubeConnector.getChannelProfile(tokens),
    youtubeConnector.getPublishedVideos(tokens, 10),
    youtubeConnector.getAnalyticsSnapshots(tokens),
    youtubeConnector.getAudienceDemographics(tokens),
  ]);

  // 2. Persist in database
  const channel = await prisma.youTubeChannel.update({
    where: { socialAccountId: socialAccount.id },
    data: {
      title: channelData.title,
      description: channelData.description,
      subscriberCount: BigInt(channelData.subscriberCount),
      totalViews: BigInt(channelData.totalViews),
      videoCount: channelData.videoCount,
      lastSyncedAt: new Date(),
    },
  });

  // Upsert videos
  for (const v of videos) {
    await prisma.youTubeVideo.upsert({
      where: {
        youtubeChannelId_videoId: {
          youtubeChannelId: channel.id,
          videoId: v.videoId,
        },
      },
      update: {
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        views: BigInt(v.views),
        likes: BigInt(v.likes),
        comments: BigInt(v.comments),
        lastSyncedAt: new Date(),
      },
      create: {
        youtubeChannelId: channel.id,
        videoId: v.videoId,
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        views: BigInt(v.views),
        likes: BigInt(v.likes),
        comments: BigInt(v.comments),
        publishedAt: v.publishedAt,
        lastSyncedAt: new Date(),
      },
    });
  }

  // Create incremental time-series snapshots
  for (const s of snapshots) {
    await prisma.youTubeAnalyticsSnapshot.create({
      data: {
        youtubeChannelId: channel.id,
        snapshotDate: s.snapshotDate,
        views: BigInt(s.views),
        watchTimeMinutes: s.watchTimeMinutes,
        avgDurationSeconds: s.avgDurationSeconds,
        avgViewPercentage: s.avgViewPercentage,
        likes: BigInt(s.likes),
        comments: BigInt(s.comments),
        shares: BigInt(s.shares),
        subscribersGained: s.subscribersGained,
        subscribersLost: s.subscribersLost,
        sourceType: 'PLATFORM_VERIFIED',
      },
    });
  }

  // Create audience snapshot
  await prisma.youTubeAudienceSnapshot.create({
    data: {
      youtubeChannelId: channel.id,
      snapshotDate: new Date(),
      geographyJson: audience.geography,
      ageDemographicsJson: audience.ageGroups,
      genderDemographicsJson: audience.gender,
      sourceType: 'PLATFORM_VERIFIED',
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'ANALYTICS_SYNC_COMPLETED',
    entityType: 'YouTubeChannel',
    entityId: channel.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { videosSynced: videos.length, snapshotsCount: snapshots.length },
  });

  return {
    channel,
    videosCount: videos.length,
    lastSyncedAt: new Date(),
  };
}

export async function recordManualAnalytics(
  userId: string,
  input: { subscriberCount: number; averageViews: number; totalViews: number; notes?: string },
  ip?: string,
  userAgent?: string
) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    throw new AppError('Creator profile not found', 400, 'CREATOR_PROFILE_REQUIRED');
  }

  const socialAccount = await prisma.socialAccount.upsert({
    where: {
      creatorId_platform_platformAccountId: {
        creatorId: creatorProfile.id,
        platform: 'YOUTUBE',
        platformAccountId: `manual_${creatorProfile.handle}`,
      },
    },
    update: {
      accountName: `@${creatorProfile.handle} (Manual)`,
      verificationStatus: 'SELF_REPORTED',
      metadata: input,
    },
    create: {
      creatorId: creatorProfile.id,
      platform: 'YOUTUBE',
      platformAccountId: `manual_${creatorProfile.handle}`,
      accountName: `@${creatorProfile.handle} (Manual)`,
      verificationStatus: 'SELF_REPORTED',
      metadata: input,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'MANUAL_ANALYTICS_ENTERED',
    entityType: 'SocialAccount',
    entityId: socialAccount.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { ...input, source: 'SELF_REPORTED' },
  });

  return socialAccount;
}

export async function getCreatorYouTubeChannel(userId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    return null;
  }

  const socialAccount = await prisma.socialAccount.findFirst({
    where: {
      creatorId: creatorProfile.id,
      platform: 'YOUTUBE',
    },
    include: {
      youtubeChannel: {
        include: {
          analyticsSnapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 10,
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (!socialAccount) {
    return null;
  }

  const yt = (socialAccount as any).youtubeChannel;
  if (!yt) {
    // If only manual or uploaded metadata exists
    const meta: any = socialAccount.metadata || {};
    return {
      channelId: socialAccount.platformAccountId,
      title: socialAccount.accountName || `@${creatorProfile.handle}`,
      description: creatorProfile.bio || '',
      customUrl: `@${creatorProfile.handle}`,
      subscriberCount: meta.subscriberCount || 0,
      videoCount: 0,
      totalViews: meta.totalViews || meta.averageViews || 0,
      isVerified: socialAccount.verificationStatus === 'VERIFIED',
      verificationStatus: socialAccount.verificationStatus,
      snapshots: [],
    };
  }

  const snapshots = yt.analyticsSnapshots || [];
  return {
    channelId: yt.channelId,
    title: yt.title,
    description: yt.description || '',
    customUrl: yt.customUrl || `@${creatorProfile.handle}`,
    subscriberCount: Number(yt.subscriberCount),
    videoCount: yt.videoCount,
    totalViews: Number(yt.totalViews),
    isVerified: socialAccount.verificationStatus === 'VERIFIED',
    verificationStatus: socialAccount.verificationStatus,
    lastSyncedAt: yt.lastSyncedAt,
    snapshots: snapshots.map((s: any) => ({
      id: s.id,
      snapshotDate: s.snapshotDate ? new Date(s.snapshotDate).toISOString() : new Date().toISOString(),
      views: Number(s.views),
      watchTimeMinutes: s.watchTimeMinutes,
      avgViewPercentage: s.avgViewPercentage,
      likes: Number(s.likes),
      sourceType: s.sourceType,
    })),
  };
}

export async function recordUploadedReport(
  userId: string,
  input: { fileName: string; estimatedViews?: number; estimatedSubs?: number; notes?: string },
  ip?: string,
  userAgent?: string
) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    throw new AppError('Creator profile not found', 400, 'CREATOR_PROFILE_REQUIRED');
  }

  const socialAccount = await prisma.socialAccount.upsert({
    where: {
      creatorId_platform_platformAccountId: {
        creatorId: creatorProfile.id,
        platform: 'YOUTUBE',
        platformAccountId: `upload_${creatorProfile.handle}`,
      },
    },
    update: {
      accountName: `@${creatorProfile.handle} (Document Evidence)`,
      verificationStatus: 'UPLOADED',
      metadata: input,
    },
    create: {
      creatorId: creatorProfile.id,
      platform: 'YOUTUBE',
      platformAccountId: `upload_${creatorProfile.handle}`,
      accountName: `@${creatorProfile.handle} (Document Evidence)`,
      verificationStatus: 'UPLOADED',
      metadata: input,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'ANALYTICS_REPORT_UPLOADED',
    entityType: 'SocialAccount',
    entityId: socialAccount.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { ...input, source: 'UPLOADED_DOCUMENT' },
  });

  return socialAccount;
}
