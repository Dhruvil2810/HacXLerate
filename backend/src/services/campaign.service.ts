import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { createAuditLog } from './audit.service.js';
import { 
  CreateCampaignInput, 
  UpdateCampaignInput, 
  ApplyCampaignInput, 
  ReviewApplicationInput,
  InviteCreatorInput
} from '../validators/campaign.validator.js';

export async function createCampaign(
  userId: string,
  input: CreateCampaignInput,
  ip?: string,
  userAgent?: string
) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) {
    throw new AppError('Brand profile not found. Please complete brand onboarding first.', 400, 'BRAND_PROFILE_REQUIRED');
  }

  // Check wallet balance
  const wallet = await prisma.creditWallet.findUnique({
    where: { userId },
  });

  if (!wallet || wallet.balance < input.budgetCredits) {
    throw new AppError(
      `Insufficient credit balance (${wallet?.balance || 0} credits). Campaign requires ${input.budgetCredits} credits.`,
      400,
      'INSUFFICIENT_CREDITS'
    );
  }

  // Transactionally reserve credits and create campaign
  const campaign = await prisma.$transaction(async (tx) => {
    // Deduct from active balance and add to reserved escrow
    await tx.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - input.budgetCredits,
        reservedBalance: wallet.reservedBalance + input.budgetCredits,
      },
    });

    // Create ledger entry
    await tx.creditLedgerEntry.create({
      data: {
        walletId: wallet.id,
        userId,
        amount: -input.budgetCredits,
        type: 'CAMPAIGN_RESERVATION',
        description: `Budget reservation for campaign: "${input.title}"`,
      },
    });

    // Create campaign
    const newCampaign = await tx.campaign.create({
      data: {
        brandId: brandProfile.id,
        productId: input.productId || null,
        title: input.title,
        objective: input.objective,
        description: input.description,
        budgetCredits: input.budgetCredits,
        allocatedCredits: input.budgetCredits,
        rewardModel: input.rewardModel as any,
        cpmRate: input.cpmRate,
        status: 'APPLICATIONS_OPEN',
        targetAudience: input.targetAudience || null,
        targetLocation: input.targetLocation || null,
        targetAgeRange: input.targetAgeRange || null,
        targetGender: input.targetGender || null,
        contentPlatform: input.contentPlatform as any,
        contentType: input.contentType || null,
        creatorCategories: input.creatorCategories,
        requiredSkills: input.requiredSkills,
        preferredTools: input.preferredTools,
        contentRequirements: input.contentRequirements || null,
        prohibitedContent: input.prohibitedContent || null,
        ctaUrl: input.ctaUrl || null,
        hashtags: input.hashtags,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
      include: {
        product: true,
      },
    });

    return newCampaign;
  });

  await createAuditLog({
    actorId: userId,
    action: 'CAMPAIGN_CREATED',
    entityType: 'Campaign',
    entityId: campaign.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { title: campaign.title, budgetCredits: campaign.budgetCredits },
  });

  return campaign;
}

export async function getBrandCampaigns(userId: string) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) return [];

  return prisma.campaign.findMany({
    where: { brandId: brandProfile.id },
    include: {
      product: true,
      _count: {
        select: {
          applications: true,
          creators: true,
          contentSubmissions: true,
          publishedContents: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMarketplaceCampaigns(filters: { category?: string; platform?: string }) {
  return prisma.campaign.findMany({
    where: {
      status: { in: ['PUBLISHED', 'APPLICATIONS_OPEN', 'LIVE'] },
      ...(filters.platform ? { contentPlatform: filters.platform as any } : {}),
      ...(filters.category ? { creatorCategories: { has: filters.category } } : {}),
    },
    include: {
      brand: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          industry: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      _count: {
        select: {
          applications: true,
          creators: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCampaignDetails(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      brand: true,
      product: true,
      requirements: true,
      creators: {
        include: {
          creator: {
            include: {
              user: {
                select: { name: true, avatarUrl: true, email: true },
              },
            },
          },
        },
      },
      applications: {
        include: {
          creator: {
            include: {
              user: {
                select: { name: true, avatarUrl: true },
              },
            },
          },
        },
      },
      publishedContents: true,
    },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404, 'NOT_FOUND');
  }

  return campaign;
}

export async function applyToCampaign(
  userId: string,
  campaignId: string,
  input: ApplyCampaignInput,
  ip?: string,
  userAgent?: string
) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    throw new AppError('Creator profile not found. Please complete creator onboarding first.', 400, 'CREATOR_PROFILE_REQUIRED');
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || (campaign.status !== 'APPLICATIONS_OPEN' && campaign.status !== 'PUBLISHED')) {
    throw new AppError('This campaign is not currently accepting applications.', 400, 'CAMPAIGN_NOT_OPEN');
  }

  const existingApplication = await prisma.campaignApplication.findUnique({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId: creatorProfile.id,
      },
    },
  });

  if (existingApplication) {
    throw new AppError('You have already applied to this campaign.', 409, 'ALREADY_APPLIED');
  }

  const application = await prisma.campaignApplication.create({
    data: {
      campaignId,
      creatorId: creatorProfile.id,
      pitch: input.pitch,
      proposedRate: input.proposedRate || campaign.cpmRate,
      status: 'PENDING',
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'CREATOR_APPLIED',
    entityType: 'CampaignApplication',
    entityId: application.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { campaignId, creatorHandle: creatorProfile.handle },
  });

  return application;
}

export async function reviewApplication(
  userId: string,
  campaignId: string,
  applicationId: string,
  input: ReviewApplicationInput,
  ip?: string,
  userAgent?: string
) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || !brandProfile || campaign.brandId !== brandProfile.id) {
    throw new AppError('Campaign not found or unauthorized', 404, 'NOT_FOUND');
  }

  const application = await prisma.campaignApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application || application.campaignId !== campaignId) {
    throw new AppError('Application not found', 404, 'NOT_FOUND');
  }

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const updated = await tx.campaignApplication.update({
      where: { id: applicationId },
      data: { status: input.status },
    });

    if (input.status === 'ACCEPTED') {
      await tx.campaignCreator.upsert({
        where: {
          campaignId_creatorId: {
            campaignId,
            creatorId: application.creatorId,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          campaignId,
          creatorId: application.creatorId,
          status: 'ACTIVE',
        },
      });
    }

    return updated;
  });

  await createAuditLog({
    actorId: userId,
    action: input.status === 'ACCEPTED' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_REJECTED',
    entityType: 'CampaignApplication',
    entityId: applicationId,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { campaignId, status: input.status },
  });

  return updatedApplication;
}

export async function inviteCreator(
  userId: string,
  campaignId: string,
  input: InviteCreatorInput
) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || !brandProfile || campaign.brandId !== brandProfile.id) {
    throw new AppError('Campaign not found or unauthorized', 404, 'NOT_FOUND');
  }

  const invitation = await prisma.campaignInvitation.upsert({
    where: {
      campaignId_creatorId: {
        campaignId,
        creatorId: input.creatorId,
      },
    },
    update: {
      message: input.message,
      offeredCpm: input.offeredCpm || campaign.cpmRate,
      status: 'PENDING',
    },
    create: {
      campaignId,
      creatorId: input.creatorId,
      message: input.message,
      offeredCpm: input.offeredCpm || campaign.cpmRate,
      status: 'PENDING',
    },
  });

  return invitation;
}
