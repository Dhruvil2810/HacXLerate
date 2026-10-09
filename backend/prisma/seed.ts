import { PrismaClient, UserRole, UserStatus, PlatformType, VerificationStatus, RewardModel, CampaignStatus, PublishedContentStatus, SourceType, CreditTransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CreatorOS Enterprise Database Seeder...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ----------------------------------------------------------------------------
  // 1. BRAND SEEDING
  // ----------------------------------------------------------------------------
  const brandUser = await prisma.user.upsert({
    where: { email: 'brand@creatoros.io' },
    update: {},
    create: {
      email: 'brand@creatoros.io',
      passwordHash,
      name: 'Apex Audio Labs',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      roles: {
        create: [{ role: UserRole.BRAND }],
      },
      brandProfile: {
        create: {
          companyName: 'Apex Audio Labs',
          industry: 'Consumer Electronics & Audio',
          websiteUrl: 'https://apexaudio.example.com',
          description: 'Pioneering premium wireless acoustics and studio microphones with edge AI sound optimization.',
        },
      },
      creditWallet: {
        create: {
          balance: 8500,
          reservedBalance: 4500,
          lifetimeEarned: 15000,
          lifetimeSpent: 6500,
        },
      },
    },
    include: {
      brandProfile: true,
      creditWallet: true,
    },
  });

  console.log(`✓ Brand created: ${brandUser.name} (${brandUser.email})`);

  // Products
  const productEarbuds = await prisma.product.create({
    data: {
      brandId: brandUser.brandProfile!.id,
      name: 'Apex Pro ANC Wireless Earbuds',
      description: 'Studio-grade active noise cancelling earbuds with spatial audio and 38-hour battery endurance.',
      category: 'Electronics & Audio',
      websiteUrl: 'https://apexaudio.example.com/earbuds',
      usp: 'Adaptive 48dB active noise cancellation with ultra-low 25ms audio latency for creators.',
      features: [
        'Hybrid 6-mic ANC array',
        'Lossless LDAC & aptX Adaptive audio codecs',
        'IPX7 water & sweat resistance',
        'Wireless charging case',
      ],
      targetAudience: 'Tech enthusiasts, mobile creators, music producers, and remote workers aged 20-38.',
      brandGuidelines: 'Highlight real-world noise isolation testing in cafe/travel scenarios and microphone voice clarity.',
    },
  });

  const productMic = await prisma.product.create({
    data: {
      brandId: brandUser.brandProfile!.id,
      name: 'Apex SoundDesk 360 Studio Microphone',
      description: 'Professional XLR/USB-C dynamic broadcast microphone with built-in DSP equalizer.',
      category: 'Pro Audio & Podcasting',
      websiteUrl: 'https://apexaudio.example.com/sounddesk',
      usp: 'Integrated hardware DSP preamp and dynamic cardioid polar pattern eliminating keyboard click noise.',
      targetAudience: 'YouTubers, streamers, podcasters, and voice actors.',
    },
  });

  console.log('✓ Products seeded: Apex Pro Earbuds, SoundDesk 360 Mic');

  // Campaigns
  const campaignEarbuds = await prisma.campaign.create({
    data: {
      brandId: brandUser.brandProfile!.id,
      productId: productEarbuds.id,
      title: 'Apex Pro ANC Wireless Earbuds Launch',
      objective: 'Drive verified video impressions and product awareness for the new Apex Pro ANC wireless earbuds.',
      description: 'Looking for tech reviewers, audio gear reviewers, and desk setup creators to create hands-on YouTube reviews and Shorts showcasing the 48dB ANC isolation and call clarity.',
      budgetCredits: 4500,
      allocatedCredits: 4500,
      spentCredits: 2723,
      rewardModel: RewardModel.CPM,
      cpmRate: 65.0,
      status: CampaignStatus.LIVE,
      contentPlatform: PlatformType.YOUTUBE,
      creatorCategories: ['Tech', 'Audio', 'Lifestyle', 'Productivity'],
      requiredSkills: ['YouTube Long-form Video', 'YouTube Shorts', 'Audio Tech Testing'],
      contentRequirements: 'Showcase unboxing, sound quality breakdown, and real-world active noise cancellation test.',
      ctaUrl: 'https://apexaudio.example.com/earbuds?ref=creatoros',
      hashtags: ['ApexProANC', 'WirelessEarbuds', 'AudioTech', 'TechReview'],
      startDate: new Date(Date.now() - 7 * 86400000),
      endDate: new Date(Date.now() + 23 * 86400000),
    },
  });

  console.log(`✓ Campaign created: "${campaignEarbuds.title}" (Escrow: 4,500 credits, CPM: ₹65)`);

  // ----------------------------------------------------------------------------
  // 2. CREATOR SEEDING
  // ----------------------------------------------------------------------------
  const creatorsData = [
    {
      email: 'creator@creatoros.io',
      name: 'Alex Rivera',
      handle: 'alexriveratech',
      bio: 'In-depth consumer tech breakdowns, audio engineering comparisons, and desk productivity setups.',
      location: 'San Francisco, CA',
      categories: ['Tech', 'Audio', 'Electronics', 'Productivity'],
      subscribers: 265000,
      avgViews: 58000,
      totalViews: 14250000,
      retention: 59.3,
      verified: true,
      earnedWalletCredits: 3450,
      videoId: 'dQw4w9WgXcQ',
      videoInitialViews: 1200,
      videoCurrentViews: 28400,
      videoIncrementalViews: 27200,
      earnedFromCampaign: 1768,
    },
    {
      email: 'elena@creatoros.io',
      name: 'Elena Rostova',
      handle: 'elenadesigns',
      bio: 'Minimalist workspace design, creator gear reviews, and creative tech workflows.',
      location: 'Berlin, Germany',
      categories: ['Design', 'Tech', 'Productivity', 'Lifestyle'],
      subscribers: 182000,
      avgViews: 39000,
      totalViews: 8400000,
      retention: 54.8,
      verified: true,
      earnedWalletCredits: 1955,
      videoId: 'L_LUpnjgPso',
      videoInitialViews: 500,
      videoCurrentViews: 15200,
      videoIncrementalViews: 14700,
      earnedFromCampaign: 955,
    },
    {
      email: 'marcus@creatoros.io',
      name: 'Marcus Vance',
      handle: 'marcuscode',
      bio: 'Software engineer exploring developer ergonomics, smart hardware, and AI development tools.',
      location: 'Seattle, WA',
      categories: ['Tech', 'Coding', 'Productivity', 'AI'],
      subscribers: 340000,
      avgViews: 74000,
      totalViews: 22100000,
      retention: 62.1,
      verified: true,
      earnedWalletCredits: 4200,
      videoId: 'kJQP7kiw5Fk',
      videoInitialViews: 0,
      videoCurrentViews: 0,
      videoIncrementalViews: 0,
      earnedFromCampaign: 0,
    },
  ];

  for (const c of creatorsData) {
    const creatorUser = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        name: c.name,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        roles: {
          create: [{ role: UserRole.CREATOR }],
        },
        creatorProfile: {
          create: {
            handle: c.handle,
            bio: c.bio,
            location: c.location,
            categories: c.categories,
            skills: ['4K Video Production', 'Scriptwriting', 'Audio Testing'],
            tools: ['DaVinci Resolve', 'Sony A7SIII', 'Shure SM7B'],
            isVerified: c.verified,
            statsSummary: {
              subscribers: c.subscribers,
              averageViews: c.avgViews,
              avgRetentionRate: c.retention,
              consistencyScore: 92.5,
            },
          },
        },
        creditWallet: {
          create: {
            balance: c.earnedWalletCredits,
            reservedBalance: 0,
            lifetimeEarned: c.earnedWalletCredits,
            lifetimeSpent: 120,
          },
        },
      },
      include: {
        creatorProfile: true,
        creditWallet: true,
      },
    });

    // Create Social Account & YouTube Channel
    const socialAccount = await prisma.socialAccount.create({
      data: {
        creatorId: creatorUser.creatorProfile!.id,
        platform: PlatformType.YOUTUBE,
        platformAccountId: `UC_${c.handle}_channel`,
        accountName: c.name,
        verificationStatus: VerificationStatus.PLATFORM_VERIFIED,
        verifiedAt: new Date(),
        youtubeChannel: {
          create: {
            channelId: `UC_${c.handle}_channel`,
            title: `${c.name} YouTube Channel`,
            description: c.bio,
            customUrl: `@${c.handle}`,
            subscriberCount: BigInt(c.subscribers),
            videoCount: 142,
            viewCount: BigInt(c.totalViews),
            country: 'US',
            isVerified: true,
            lastSyncedAt: new Date(),
          },
        },
      },
    });

    // Create Campaign Participation
    await prisma.campaignCreator.create({
      data: {
        campaignId: campaignEarbuds.id,
        creatorId: creatorUser.creatorProfile!.id,
        status: 'ACTIVE',
        totalVerifiedViews: BigInt(c.videoIncrementalViews),
        earnedCredits: c.earnedFromCampaign,
      },
    });

    // Create Published Content Track
    if (c.videoIncrementalViews > 0) {
      const pubContent = await prisma.publishedContent.create({
        data: {
          campaignId: campaignEarbuds.id,
          creatorId: creatorUser.creatorProfile!.id,
          socialAccountId: socialAccount.id,
          platform: PlatformType.YOUTUBE,
          publishedUrl: `https://www.youtube.com/watch?v=${c.videoId}`,
          externalContentId: c.videoId,
          status: PublishedContentStatus.TRACKING,
          initialViews: BigInt(c.videoInitialViews),
          currentViews: BigInt(c.videoCurrentViews),
          incrementalViews: BigInt(c.videoIncrementalViews),
          earnedCredits: c.earnedFromCampaign,
          publishedAt: new Date(Date.now() - 3 * 86400000),
          lastSyncedAt: new Date(),
          snapshots: {
            create: [
              {
                snapshotTimestamp: new Date(Date.now() - 2 * 3600000),
                views: BigInt(c.videoCurrentViews),
                incrementalViews: BigInt(c.videoIncrementalViews),
                likes: BigInt(Math.floor(c.videoCurrentViews * 0.08)),
                comments: BigInt(Math.floor(c.videoCurrentViews * 0.012)),
                watchTimeMinutes: c.videoCurrentViews * 3.8,
                sourceType: SourceType.PLATFORM_VERIFIED,
              },
              {
                snapshotTimestamp: new Date(Date.now() - 24 * 3600000),
                views: BigInt(Math.floor(c.videoCurrentViews * 0.65)),
                incrementalViews: BigInt(Math.floor(c.videoIncrementalViews * 0.65)),
                likes: BigInt(Math.floor(c.videoCurrentViews * 0.05)),
                comments: BigInt(Math.floor(c.videoCurrentViews * 0.008)),
                watchTimeMinutes: c.videoCurrentViews * 2.5,
                sourceType: SourceType.PLATFORM_VERIFIED,
              },
            ],
          },
        },
      });

      // Add Credit Ledger entry for the payout
      await prisma.creditLedgerEntry.create({
        data: {
          walletId: creatorUser.creditWallet!.id,
          userId: creatorUser.id,
          amount: c.earnedFromCampaign,
          type: CreditTransactionType.CAMPAIGN_REWARD,
          description: `Verified CPM reward for "${campaignEarbuds.title}" (${c.videoIncrementalViews.toLocaleString()} views)`,
          referenceType: 'PublishedContent',
          referenceId: pubContent.id,
          idempotencyKey: `payout_seed_${pubContent.id}`,
        },
      });
    }

    console.log(`✓ Creator seeded: @${c.handle} (${c.name}) - ${c.subscribers.toLocaleString()} subs`);
  }

  // ----------------------------------------------------------------------------
  // 3. ADMIN SEEDING
  // ----------------------------------------------------------------------------
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@creatoros.io' },
    update: {},
    create: {
      email: 'admin@creatoros.io',
      passwordHash,
      name: 'Platform Operations Admin',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      roles: {
        create: [{ role: UserRole.ADMIN }],
      },
      creditWallet: {
        create: {
          balance: 100000,
          reservedBalance: 0,
        },
      },
    },
  });

  console.log(`✓ Admin created: ${adminUser.name} (${adminUser.email})`);
  console.log('\n🎉 CreatorOS Database successfully seeded with showcase demo data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
