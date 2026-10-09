import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { AddPortfolioItemInput, SearchCreatorsInput } from '../validators/creator.validator.js';

export async function searchCreators(filters: SearchCreatorsInput) {
  const where: any = {};

  if (filters.query) {
    where.OR = [
      { handle: { contains: filters.query, mode: 'insensitive' } },
      { bio: { contains: filters.query, mode: 'insensitive' } },
      { user: { name: { contains: filters.query, mode: 'insensitive' } } },
      { skills: { has: filters.query } },
      { tools: { has: filters.query } },
    ];
  }

  if (filters.category && filters.category !== 'All') {
    where.categories = { has: filters.category };
  }

  if (filters.skill && filters.skill !== 'All') {
    where.skills = { has: filters.skill };
  }

  if (filters.tool && filters.tool !== 'All') {
    where.tools = { has: filters.tool };
  }

  if (filters.contentType && filters.contentType !== 'All') {
    where.contentTypes = { has: filters.contentType };
  }

  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }

  if (filters.isVerified !== undefined) {
    where.isVerified = filters.isVerified === 'true';
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [creators, total] = await Promise.all([
    prisma.creatorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        portfolioItems: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
        socialAccounts: {
          select: {
            platform: true,
            accountName: true,
            verificationStatus: true,
            youtubeChannel: {
              select: {
                subscriberCount: true,
                totalViews: true,
                videoCount: true,
              },
            },
          },
        },
        _count: {
          select: {
            campaignsParticipated: true,
            portfolioItems: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.creatorProfile.count({ where }),
  ]);

  return {
    creators,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCreatorProfileByIdOrHandle(identifier: string) {
  const creator = await prisma.creatorProfile.findFirst({
    where: {
      OR: [{ id: identifier }, { handle: identifier }],
    },
    include: {
      user: {
        select: {
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
      portfolioItems: {
        orderBy: { createdAt: 'desc' },
      },
      socialAccounts: {
        include: {
          youtubeChannel: {
            include: {
              videos: {
                take: 6,
                orderBy: { publishedAt: 'desc' },
              },
            },
          },
        },
      },
      campaignsParticipated: {
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              rewardModel: true,
              cpmRate: true,
              brand: {
                select: { companyName: true },
              },
            },
          },
        },
      },
    },
  });

  if (!creator) {
    throw new AppError('Creator profile not found', 404, 'NOT_FOUND');
  }

  return creator;
}

export async function addPortfolioItem(userId: string, input: AddPortfolioItemInput) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  if (!creatorProfile) {
    throw new AppError('Creator profile not found', 400, 'CREATOR_PROFILE_REQUIRED');
  }

  return prisma.portfolioItem.create({
    data: {
      creatorId: creatorProfile.id,
      title: input.title,
      description: input.description,
      mediaUrl: input.mediaUrl,
      thumbnailUrl: input.thumbnailUrl,
      category: input.category,
      toolsUsed: input.toolsUsed,
      metricsSummary: input.metricsSummary || {},
    },
  });
}

export async function deletePortfolioItem(userId: string, itemId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
  });

  const item = await prisma.portfolioItem.findUnique({
    where: { id: itemId },
  });

  if (!item || !creatorProfile || item.creatorId !== creatorProfile.id) {
    throw new AppError('Portfolio item not found or unauthorized', 404, 'NOT_FOUND');
  }

  await prisma.portfolioItem.delete({
    where: { id: itemId },
  });

  return { message: 'Portfolio item deleted successfully' };
}
