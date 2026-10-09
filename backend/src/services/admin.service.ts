import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { createAuditLog } from './audit.service.js';
import { 
  GetAdminUsersQueryInput, 
  UpdateUserStatusInput, 
  GetAuditLogsQueryInput 
} from '../validators/admin.validator.js';

export async function getAdminOverview() {
  const [
    totalUsers,
    totalBrands,
    totalCreators,
    totalCampaigns,
    walletStats,
    aiStats,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.brandProfile.count(),
    prisma.creatorProfile.count(),
    prisma.campaign.count(),
    prisma.creditWallet.aggregate({
      _sum: {
        balance: true,
        reservedBalance: true,
        lifetimeEarned: true,
      },
    }),
    prisma.aIUsage.aggregate({
      _count: true,
      _sum: {
        creditCost: true,
        promptTokens: true,
        completionTokens: true,
      },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  return {
    metrics: {
      totalUsers,
      totalBrands,
      totalCreators,
      totalCampaigns,
      totalCirculatingCredits: walletStats._sum.balance || 0,
      totalEscrowCredits: walletStats._sum.reservedBalance || 0,
      totalAiQueries: aiStats._count || 0,
      totalAiCostCredits: aiStats._sum.creditCost || 0,
    },
    recentAuditLogs,
  };
}

export async function getAdminUsers(query: GetAdminUsersQueryInput) {
  const where: any = {};

  if (query.query) {
    where.OR = [
      { name: { contains: query.query, mode: 'insensitive' } },
      { email: { contains: query.query, mode: 'insensitive' } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.role) {
    where.roles = {
      some: { role: query.role },
    };
  }

  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        roles: true,
        brandProfile: true,
        creatorProfile: true,
        creditWallet: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserStatus(
  adminUserId: string,
  targetUserId: string,
  input: UpdateUserStatusInput,
  ip?: string,
  userAgent?: string
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: input.status },
  });

  await prisma.adminAction.create({
    data: {
      adminUserId,
      targetUserId,
      actionType: `USER_STATUS_${input.status}`,
      reason: input.reason,
    },
  });

  await createAuditLog({
    actorId: adminUserId,
    action: `USER_STATUS_UPDATED`,
    entityType: 'User',
    entityId: targetUserId,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: {
      previousStatus: targetUser.status,
      newStatus: input.status,
      reason: input.reason,
    },
  });

  return updatedUser;
}

export async function getAdminAuditLogs(query: GetAuditLogsQueryInput) {
  const where: any = {};

  if (query.action) {
    where.action = query.action;
  }
  if (query.actorId) {
    where.actorId = query.actorId;
  }
  if (query.entityType) {
    where.entityType = query.entityType;
  }

  const page = query.page || 1;
  const limit = query.limit || 30;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { name: true, email: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
