import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { createAuditLog } from './audit.service.js';
import { CreditTransactionType } from '@prisma/client';
import { AdminAdjustCreditsInput, GetLedgerQueryInput } from '../validators/credit.validator.js';

export interface RecordTransactionParams {
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  referenceType?: string;
  referenceId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export async function getUserWallet(userId: string) {
  let wallet = await prisma.creditWallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.creditWallet.create({
      data: {
        userId,
        balance: 0,
        reservedBalance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      },
    });
  }

  return wallet;
}

export async function getUserLedger(userId: string, options: GetLedgerQueryInput) {
  const wallet = await getUserWallet(userId);
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { walletId: wallet.id };
  if (options.type) {
    where.type = options.type;
  }

  const [entries, total] = await Promise.all([
    prisma.creditLedgerEntry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.creditLedgerEntry.count({ where }),
  ]);

  return {
    wallet,
    entries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function recordCreditTransaction(params: RecordTransactionParams) {
  // Idempotency check if key provided
  if (params.idempotencyKey) {
    const existing = await prisma.creditLedgerEntry.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (existing) {
      return existing;
    }
  }

  const wallet = await getUserWallet(params.userId);

  // Prevent negative balance for deductions
  if (params.amount < 0 && wallet.balance + params.amount < 0) {
    throw new AppError(
      `Insufficient credits. Current balance: ${wallet.balance}, required: ${Math.abs(params.amount)}`,
      400,
      'INSUFFICIENT_CREDITS'
    );
  }

  return prisma.$transaction(async (tx) => {
    // 1. Calculate updated balance
    const newBalance = wallet.balance + params.amount;
    const isGain = params.amount > 0;

    // 2. Update wallet record
    await tx.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balance: newBalance,
        ...(isGain ? { lifetimeEarned: wallet.lifetimeEarned + params.amount } : { lifetimeSpent: wallet.lifetimeSpent + Math.abs(params.amount) }),
      },
    });

    // 3. Create immutable ledger entry
    const entry = await tx.creditLedgerEntry.create({
      data: {
        walletId: wallet.id,
        userId: params.userId,
        amount: params.amount,
        type: params.type,
        description: params.description,
        referenceType: params.referenceType || null,
        referenceId: params.referenceId || null,
        idempotencyKey: params.idempotencyKey || null,
        metadata: params.metadata || {},
      },
    });

    return entry;
  });
}

export async function adminAdjustCredits(
  adminUserId: string,
  input: AdminAdjustCreditsInput,
  ip?: string,
  userAgent?: string
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: input.targetUserId },
    include: { creditWallet: true },
  });

  if (!targetUser) {
    throw new AppError('Target user not found', 404, 'NOT_FOUND');
  }

  const entry = await recordCreditTransaction({
    userId: input.targetUserId,
    amount: input.amount,
    type: input.type as CreditTransactionType,
    description: `Admin adjustment: ${input.description}`,
    referenceType: 'AdminAction',
    referenceId: adminUserId,
    metadata: {
      adminUserId,
      reason: input.reason,
    },
  });

  // Record admin action and audit log
  await prisma.adminAction.create({
    data: {
      adminUserId,
      targetUserId: input.targetUserId,
      actionType: 'CREDIT_ADJUSTMENT',
      reason: input.reason,
      metadata: {
        amount: input.amount,
        type: input.type,
        ledgerEntryId: entry.id,
      },
    },
  });

  await createAuditLog({
    actorId: adminUserId,
    action: 'ADMIN_CREDIT_ADJUSTMENT',
    entityType: 'CreditWallet',
    entityId: targetUser.creditWallet?.id || null,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: {
      targetUserId: input.targetUserId,
      amount: input.amount,
      reason: input.reason,
    },
  });

  return entry;
}
