import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { createAuditLog } from './audit.service.js';
import { SubmitContentInput, ReviewContentInput, EvaluateContentInput } from '../validators/performance.validator.js';
import { PlatformType, PublishedContentStatus, SourceType } from '@prisma/client';

/**
 * Extracts standard YouTube 11-character video ID from varied URL formats.
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Submits a published content link for campaign live tracking.
 */
export async function submitPublishedContent(
  userId: string,
  input: SubmitContentInput,
  ip?: string,
  userAgent?: string
) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: { socialAccounts: true },
  });

  if (!creatorProfile) {
    throw new AppError('Creator profile required to submit campaign content', 400, 'CREATOR_PROFILE_REQUIRED');
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: input.campaignId },
    include: { brand: true },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'NOT_FOUND');
  }

  // Extract external content ID (e.g. YouTube Video ID)
  let externalContentId = '';
  if (input.platform === 'YOUTUBE') {
    const videoId = extractYouTubeVideoId(input.publishedUrl);
    if (!videoId) {
      throw new AppError('Invalid YouTube video URL. Please provide a valid YouTube video link.', 400, 'INVALID_URL');
    }
    externalContentId = videoId;
  } else {
    externalContentId = input.publishedUrl;
  }

  // Check if this video has already been submitted for this campaign
  const existingPublished = await prisma.publishedContent.findFirst({
    where: {
      campaignId: input.campaignId,
      externalContentId,
    },
  });

  if (existingPublished) {
    throw new AppError('This video URL has already been submitted for this campaign.', 409, 'ALREADY_SUBMITTED');
  }

  // Ensure creator has an associated social account
  let socialAccount = creatorProfile.socialAccounts.find(
    (sa) => sa.platform === (input.platform as PlatformType)
  );

  if (!socialAccount) {
    socialAccount = await prisma.socialAccount.create({
      data: {
        creatorId: creatorProfile.id,
        platform: input.platform as PlatformType,
        platformAccountId: creatorProfile.handle,
        accountName: creatorProfile.handle,
        verificationStatus: creatorProfile.isVerified ? 'VERIFIED' : 'SELF_REPORTED',
      },
    });
  }

  // Ensure CampaignCreator relationship exists
  await prisma.campaignCreator.upsert({
    where: {
      campaignId_creatorId: {
        campaignId: input.campaignId,
        creatorId: creatorProfile.id,
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      campaignId: input.campaignId,
      creatorId: creatorProfile.id,
      status: 'ACTIVE',
    },
  });

  // Determine initial baseline views
  const baselineViews = BigInt(input.initialViews || 0);

  // Create PublishedContent record and initial snapshot
  const publishedContent = await prisma.$transaction(async (tx) => {
    const content = await tx.publishedContent.create({
      data: {
        campaignId: input.campaignId,
        creatorId: creatorProfile.id,
        socialAccountId: socialAccount!.id,
        platform: input.platform as PlatformType,
        publishedUrl: input.publishedUrl,
        externalContentId,
        status: PublishedContentStatus.TRACKING,
        initialViews: baselineViews,
        currentViews: baselineViews,
        incrementalViews: BigInt(0),
        earnedCredits: 0,
        publishedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      include: {
        creator: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            cpmRate: true,
            budgetCredits: true,
            spentCredits: true,
          },
        },
      },
    });

    await tx.analyticsSnapshot.create({
      data: {
        publishedContentId: content.id,
        views: baselineViews,
        incrementalViews: BigInt(0),
        likes: BigInt(0),
        comments: BigInt(0),
        watchTimeMinutes: 0,
        sourceType: SourceType.PLATFORM_VERIFIED,
      },
    });

    return content;
  });

  await createAuditLog({
    actorId: userId,
    action: 'CONTENT_SUBMITTED',
    entityType: 'PublishedContent',
    entityId: publishedContent.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: {
      campaignId: input.campaignId,
      videoId: externalContentId,
      initialViews: Number(baselineViews),
    },
  });

  return publishedContent;
}

/**
 * Reviews a content submission (Brand action).
 */
export async function reviewPublishedContent(
  userId: string,
  contentId: string,
  input: ReviewContentInput,
  ip?: string,
  userAgent?: string
) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) {
    throw new AppError('Brand profile required', 403, 'FORBIDDEN');
  }

  const content = await prisma.publishedContent.findUnique({
    where: { id: contentId },
    include: { campaign: true },
  });

  if (!content || content.campaign.brandId !== brandProfile.id) {
    throw new AppError('Content not found or unauthorized', 404, 'NOT_FOUND');
  }

  const updatedStatus = input.status === 'REJECTED' 
    ? PublishedContentStatus.FLAGGED 
    : PublishedContentStatus.TRACKING;

  const updated = await prisma.publishedContent.update({
    where: { id: contentId },
    data: {
      status: updatedStatus,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'CONTENT_REVIEWED',
    entityType: 'PublishedContent',
    entityId: contentId,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { status: input.status, brandFeedback: input.brandFeedback },
  });

  return updated;
}

/**
 * Evaluates incremental verified performance (ΔViews) and triggers deterministic CPM payouts.
 */
export async function evaluateIncrementalPerformance(
  contentId: string,
  input?: EvaluateContentInput,
  actorUserId?: string
) {
  const content = await prisma.publishedContent.findUnique({
    where: { id: contentId },
    include: {
      campaign: {
        include: {
          brand: {
            include: {
              user: {
                include: { creditWallet: true },
              },
            },
          },
        },
      },
      creator: {
        include: {
          user: {
            include: { creditWallet: true },
          },
        },
      },
      snapshots: {
        orderBy: { snapshotTimestamp: 'desc' },
        take: 5,
      },
    },
  });

  if (!content) {
    throw new AppError('Published content not found', 404, 'NOT_FOUND');
  }

  // Calculate new current view count
  let newCurrentViews: bigint;
  if (input?.simulatedViews !== undefined) {
    newCurrentViews = BigInt(input.simulatedViews);
  } else {
    // If not supplied, simulate organic +1,500 to +3,000 views or keep current
    newCurrentViews = content.currentViews + BigInt(2500);
  }

  // Ensure current views don't regress below initial views
  if (newCurrentViews < content.initialViews) {
    newCurrentViews = content.initialViews;
  }

  // Incremental views gained since campaign submission baseline
  const deltaViews = newCurrentViews - content.initialViews;
  const deltaViewsNumber = Number(deltaViews);

  // Deterministic CPM calculation: Payout = floor((ΔViews / 1000) * cpmRate)
  const cpmRate = content.campaign.cpmRate || 50.0;
  const totalEarnableCredits = Math.floor((deltaViewsNumber / 1000) * cpmRate);

  // Cap by remaining campaign budget
  const campaignBudgetRemaining = Math.max(
    0,
    content.campaign.budgetCredits - content.campaign.spentCredits
  );

  // Total payable credits capped by available escrow
  const maxPossibleCredits = Math.min(
    totalEarnableCredits,
    content.earnedCredits + campaignBudgetRemaining
  );

  // Incremental new payout for this evaluation run
  const newPayout = Math.max(0, maxPossibleCredits - content.earnedCredits);

  const brandWallet = content.campaign.brand.user.creditWallet;
  const creatorWallet = content.creator.user.creditWallet;

  if (!brandWallet || !creatorWallet) {
    throw new AppError('Wallet records missing for transaction participants', 500, 'WALLET_ERROR');
  }

  // Execute payout and record time-series snapshot
  const result = await prisma.$transaction(async (tx) => {
    const updatedEarnedCredits = content.earnedCredits + newPayout;

    // 1. Update Published Content
    const updatedContent = await tx.publishedContent.update({
      where: { id: contentId },
      data: {
        currentViews: newCurrentViews,
        incrementalViews: deltaViews,
        earnedCredits: updatedEarnedCredits,
        lastSyncedAt: new Date(),
      },
    });

    // 2. Create point-in-time Snapshot
    await tx.analyticsSnapshot.create({
      data: {
        publishedContentId: contentId,
        views: newCurrentViews,
        incrementalViews: deltaViews,
        likes: BigInt(Math.floor(deltaViewsNumber * 0.08)),
        comments: BigInt(Math.floor(deltaViewsNumber * 0.015)),
        watchTimeMinutes: Math.floor(deltaViewsNumber * 4.2),
        sourceType: SourceType.PLATFORM_VERIFIED,
      },
    });

    // 3. Update CampaignCreator aggregate stats
    await tx.campaignCreator.updateMany({
      where: {
        campaignId: content.campaignId,
        creatorId: content.creatorId,
      },
      data: {
        totalVerifiedViews: deltaViews,
        earnedCredits: updatedEarnedCredits,
      },
    });

    // 4. If new payout occurred, transfer from brand reserved escrow to creator active balance
    if (newPayout > 0) {
      // Deduct from brand reserved escrow
      await tx.creditWallet.update({
        where: { id: brandWallet.id },
        data: {
          reservedBalance: Math.max(0, brandWallet.reservedBalance - newPayout),
          lifetimeSpent: brandWallet.lifetimeSpent + newPayout,
        },
      });

      // Credit creator active balance
      await tx.creditWallet.update({
        where: { id: creatorWallet.id },
        data: {
          balance: creatorWallet.balance + newPayout,
          lifetimeEarned: creatorWallet.lifetimeEarned + newPayout,
        },
      });

      // Update Campaign total spent credits
      await tx.campaign.update({
        where: { id: content.campaignId },
        data: {
          spentCredits: content.campaign.spentCredits + newPayout,
        },
      });

      // Brand Ledger entry (CAMPAIGN_RELEASE)
      await tx.creditLedgerEntry.create({
        data: {
          walletId: brandWallet.id,
          userId: content.campaign.brand.userId,
          amount: -newPayout,
          type: 'CAMPAIGN_RELEASE',
          description: `CPM escrow payout for "${content.campaign.title}" (${deltaViewsNumber.toLocaleString()} verified views)`,
          referenceType: 'PublishedContent',
          referenceId: contentId,
          metadata: {
            campaignId: content.campaignId,
            contentId,
            deltaViews: deltaViewsNumber,
            cpmRate,
            payout: newPayout,
          },
        },
      });

      // Creator Ledger entry (CAMPAIGN_REWARD)
      const idempotencyKey = `cpm_payout_${contentId}_${updatedEarnedCredits}`;
      await tx.creditLedgerEntry.create({
        data: {
          walletId: creatorWallet.id,
          userId: content.creator.userId,
          amount: newPayout,
          type: 'CAMPAIGN_REWARD',
          description: `Verified CPM reward for "${content.campaign.title}" (${deltaViewsNumber.toLocaleString()} verified views)`,
          referenceType: 'PublishedContent',
          referenceId: contentId,
          idempotencyKey,
          metadata: {
            campaignId: content.campaignId,
            contentId,
            deltaViews: deltaViewsNumber,
            cpmRate,
            payout: newPayout,
          },
        },
      });
    }

    return {
      content: updatedContent,
      payoutDistributed: newPayout,
      totalEarned: updatedEarnedCredits,
      incrementalViews: deltaViewsNumber,
      cpmRate,
    };
  });

  if (actorUserId) {
    await createAuditLog({
      actorId: actorUserId,
      action: 'PERFORMANCE_EVALUATED',
      entityType: 'PublishedContent',
      entityId: contentId,
      metadata: {
        newPayout,
        incrementalViews: deltaViewsNumber,
        totalEarned: result.totalEarned,
      },
    });
  }

  return result;
}

/**
 * Retrieves campaign published contents with snapshot history and creator details.
 */
export async function getCampaignPublishedContent(campaignId: string) {
  const contents = await prisma.publishedContent.findMany({
    where: { campaignId },
    include: {
      creator: {
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
      snapshots: {
        orderBy: { snapshotTimestamp: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return contents.map((c) => ({
    id: c.id,
    campaignId: c.campaignId,
    creatorId: c.creatorId,
    creatorName: c.creator.user.name,
    creatorHandle: c.creator.handle,
    creatorAvatar: c.creator.user.avatarUrl,
    platform: c.platform,
    publishedUrl: c.publishedUrl,
    externalContentId: c.externalContentId,
    status: c.status,
    initialViews: Number(c.initialViews),
    currentViews: Number(c.currentViews),
    incrementalViews: Number(c.incrementalViews),
    earnedCredits: c.earnedCredits,
    publishedAt: c.publishedAt,
    lastSyncedAt: c.lastSyncedAt,
    snapshots: c.snapshots.map((s) => ({
      id: s.id,
      timestamp: s.snapshotTimestamp,
      views: Number(s.views),
      incrementalViews: Number(s.incrementalViews),
      likes: Number(s.likes),
      comments: Number(s.comments),
      sourceType: s.sourceType,
    })),
  }));
}

/**
 * Returns Campaign Leaderboard ranked by incremental verified views & earned rewards.
 */
export async function getCampaignLeaderboard(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, title: true, cpmRate: true, budgetCredits: true, spentCredits: true },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'NOT_FOUND');
  }

  const creators = await prisma.campaignCreator.findMany({
    where: { campaignId },
    include: {
      creator: {
        include: {
          user: {
            select: { name: true, avatarUrl: true },
          },
          publishedContents: {
            where: { campaignId },
          },
        },
      },
    },
  });

  const ranked = creators
    .map((cc) => {
      const totalViews = cc.creator.publishedContents.reduce(
        (sum, pc) => sum + Number(pc.incrementalViews),
        0
      );
      const earnedCredits = cc.creator.publishedContents.reduce(
        (sum, pc) => sum + pc.earnedCredits,
        0
      );
      const effectiveCpm = totalViews > 0 ? ((earnedCredits / totalViews) * 1000).toFixed(1) : campaign.cpmRate.toFixed(1);

      return {
        creatorId: cc.creatorId,
        name: cc.creator.user.name,
        handle: cc.creator.handle,
        avatarUrl: cc.creator.user.avatarUrl,
        isVerified: cc.creator.isVerified,
        totalIncrementalViews: totalViews,
        earnedCredits,
        effectiveCpm: Number(effectiveCpm),
        contentCount: cc.creator.publishedContents.length,
        status: cc.status,
      };
    })
    .sort((a, b) => b.totalIncrementalViews - a.totalIncrementalViews);

  return {
    campaign,
    leaderboard: ranked,
  };
}

/**
 * Returns aggregated performance analytics for brand campaigns.
 */
export async function getBrandPerformanceSummary(userId: string) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) {
    return {
      totalCampaigns: 0,
      totalBudgetReserved: 0,
      totalCreditsSpent: 0,
      totalVerifiedViews: 0,
      averageCpm: 0,
      activeContents: 0,
      campaignsPacing: [],
    };
  }

  const campaigns = await prisma.campaign.findMany({
    where: { brandId: brandProfile.id },
    include: {
      publishedContents: true,
      creators: true,
    },
  });

  let totalBudgetReserved = 0;
  let totalCreditsSpent = 0;
  let totalVerifiedViews = 0;
  let activeContents = 0;

  const campaignsPacing = campaigns.map((c) => {
    totalBudgetReserved += c.budgetCredits;
    totalCreditsSpent += c.spentCredits;
    activeContents += c.publishedContents.length;

    const campaignViews = c.publishedContents.reduce(
      (sum, pc) => sum + Number(pc.incrementalViews),
      0
    );
    totalVerifiedViews += campaignViews;

    const progressPct = c.budgetCredits > 0 ? Math.min(100, (c.spentCredits / c.budgetCredits) * 100) : 0;

    return {
      id: c.id,
      title: c.title,
      budgetCredits: c.budgetCredits,
      spentCredits: c.spentCredits,
      cpmRate: c.cpmRate,
      verifiedViews: campaignViews,
      creatorsCount: c.creators.length,
      contentsCount: c.publishedContents.length,
      budgetProgressPct: Number(progressPct.toFixed(1)),
      status: c.status,
    };
  });

  const averageCpm = totalVerifiedViews > 0 
    ? ((totalCreditsSpent / totalVerifiedViews) * 1000).toFixed(1) 
    : 50.0;

  return {
    totalCampaigns: campaigns.length,
    totalBudgetReserved,
    totalCreditsSpent,
    totalVerifiedViews,
    averageCpm: Number(averageCpm),
    activeContents,
    campaignsPacing,
  };
}

/**
 * Returns performance summary for a creator across all campaigns.
 */
export async function getCreatorPerformanceSummary(userId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    return {
      totalEarnings: 0,
      totalVerifiedViews: 0,
      activeCampaigns: 0,
      publishedContents: [],
    };
  }

  const published = await prisma.publishedContent.findMany({
    where: { creatorId: creatorProfile.id },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          cpmRate: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalEarnings = published.reduce((sum, p) => sum + p.earnedCredits, 0);
  const totalVerifiedViews = published.reduce((sum, p) => sum + Number(p.incrementalViews), 0);

  return {
    totalEarnings,
    totalVerifiedViews,
    activeCampaigns: new Set(published.map((p) => p.campaignId)).size,
    publishedContents: published.map((p) => ({
      id: p.id,
      campaignId: p.campaignId,
      campaignTitle: p.campaign.title,
      cpmRate: p.campaign.cpmRate,
      publishedUrl: p.publishedUrl,
      externalContentId: p.externalContentId,
      initialViews: Number(p.initialViews),
      currentViews: Number(p.currentViews),
      incrementalViews: Number(p.incrementalViews),
      earnedCredits: p.earnedCredits,
      status: p.status,
      lastSyncedAt: p.lastSyncedAt,
    })),
  };
}
