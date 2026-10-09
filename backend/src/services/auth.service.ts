import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { createAuditLog } from './audit.service.js';
import { env } from '../config/env.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { RoleType } from '@prisma/client';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    status: string;
    roles: string[];
    activeRole: string;
    brandProfile: any | null;
    creatorProfile: any | null;
    creditWallet: {
      balance: number;
      reservedBalance: number;
    } | null;
  };
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(
  input: RegisterInput,
  ip?: string,
  userAgent?: string
): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  const hashedPassword = await hashPassword(input.password);
  const selectedRole = input.role as RoleType;

  // Determine starting credits based on role
  const startingCredits =
    selectedRole === 'BRAND'
      ? env.DEFAULT_STARTING_CREDITS_BRAND
      : env.DEFAULT_STARTING_CREDITS_CREATOR;

  // Transactionally create User, UserRole, Initial Profile placeholder, Wallet, and Ledger Entry
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash: hashedPassword,
        roles: {
          create: {
            role: selectedRole,
            isPrimary: true,
          },
        },
      },
      include: {
        roles: true,
      },
    });

    // Create profile placeholder based on role
    if (selectedRole === 'BRAND') {
      await tx.brandProfile.create({
        data: {
          userId: newUser.id,
          companyName: `${input.name}'s Brand`,
        },
      });
    } else if (selectedRole === 'CREATOR') {
      const generatedHandle = `${input.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.creatorProfile.create({
        data: {
          userId: newUser.id,
          handle: generatedHandle,
        },
      });
    }

    // Initialize Credit Wallet
    const wallet = await tx.creditWallet.create({
      data: {
        userId: newUser.id,
        balance: startingCredits,
        lifetimeEarned: startingCredits,
      },
    });

    // Create Initial Credit Grant Ledger Entry
    await tx.creditLedgerEntry.create({
      data: {
        walletId: wallet.id,
        userId: newUser.id,
        amount: startingCredits,
        type: 'CREDIT_GRANT',
        description: `Welcome bonus on registration (${selectedRole})`,
      },
    });

    return newUser;
  });

  // Log audit event
  await createAuditLog({
    actorId: user.id,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { role: selectedRole, email: user.email },
  });

  const fullUser = await getUserWithDetails(user.id);
  const roles = fullUser.roles.map((r) => r.role);
  const activeRole = selectedRole;

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    roles,
    activeRole,
  });

  const refreshToken = signRefreshToken(user.id);

  return {
    user: formatUserResponse(fullUser, activeRole),
    accessToken,
    refreshToken,
  };
}

export async function loginUser(
  input: LoginInput,
  ip?: string,
  userAgent?: string
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      roles: true,
      brandProfile: true,
      creatorProfile: true,
      creditWallet: true,
    },
  });

  if (!user || !user.passwordHash) {
    await createAuditLog({
      action: 'LOGIN_FAILED',
      entityType: 'User',
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { email: input.email, reason: 'USER_NOT_FOUND' },
    });
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
    throw new AppError('Your account has been suspended or deactivated', 403, 'ACCOUNT_INACTIVE');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    await createAuditLog({
      actorId: user.id,
      action: 'LOGIN_FAILED',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip,
      userAgent: userAgent,
      metadata: { email: input.email, reason: 'INVALID_PASSWORD' },
    });
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const roles = user.roles.map((r) => r.role);
  const primaryRole = user.roles.find((r) => r.isPrimary)?.role || roles[0] || 'BRAND';
  const activeRole = primaryRole;

  await createAuditLog({
    actorId: user.id,
    action: 'LOGIN_SUCCESS',
    entityType: 'User',
    entityId: user.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { email: user.email, activeRole },
  });

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    roles,
    activeRole,
  });

  const refreshToken = signRefreshToken(user.id);

  return {
    user: formatUserResponse(user, activeRole),
    accessToken,
    refreshToken,
  };
}

export async function refreshUserSession(refreshToken: string): Promise<{ accessToken: string }> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Invalid or inactive user session', 401, 'UNAUTHORIZED');
    }

    const roles = user.roles.map((r) => r.role);
    const primaryRole = user.roles.find((r) => r.isPrimary)?.role || roles[0] || 'BRAND';

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      roles,
      activeRole: primaryRole,
    });

    return { accessToken: newAccessToken };
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }
}

export async function switchUserRole(
  userId: string,
  targetRole: RoleType,
  ip?: string,
  userAgent?: string
): Promise<{ activeRole: string; accessToken: string; user: any }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
      brandProfile: true,
      creatorProfile: true,
      creditWallet: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Check if role is assigned; if not, add target role (single user can operate both Brand and Creator)
  const hasRole = user.roles.some((r) => r.role === targetRole);
  if (!hasRole) {
    await prisma.$transaction(async (tx) => {
      await tx.userRole.create({
        data: {
          userId: user.id,
          role: targetRole,
          isPrimary: false,
        },
      });

      // Create profile for new role if not already created
      if (targetRole === 'BRAND' && !user.brandProfile) {
        await tx.brandProfile.create({
          data: {
            userId: user.id,
            companyName: `${user.name}'s Brand`,
          },
        });
      } else if (targetRole === 'CREATOR' && !user.creatorProfile) {
        const handle = `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
        await tx.creatorProfile.create({
          data: {
            userId: user.id,
            handle,
          },
        });
      }
    });
  }

  // Update primary role designation
  await prisma.userRole.updateMany({
    where: { userId: user.id },
    data: { isPrimary: false },
  });

  await prisma.userRole.updateMany({
    where: { userId: user.id, role: targetRole },
    data: { isPrimary: true },
  });

  await createAuditLog({
    actorId: user.id,
    action: 'ROLE_CHANGED',
    entityType: 'UserRole',
    entityId: user.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { targetRole },
  });

  const updatedUser = await getUserWithDetails(user.id);
  const roles = updatedUser.roles.map((r) => r.role);

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    roles,
    activeRole: targetRole,
  });

  return {
    activeRole: targetRole,
    accessToken,
    user: formatUserResponse(updatedUser, targetRole),
  };
}

export async function getAuthenticatedUser(userId: string, activeRole?: string): Promise<any> {
  const user = await getUserWithDetails(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  const currentRole = activeRole || user.roles.find((r) => r.isPrimary)?.role || 'BRAND';
  return formatUserResponse(user, currentRole);
}

// Helpers
async function getUserWithDetails(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      roles: true,
      brandProfile: true,
      creatorProfile: true,
      creditWallet: true,
    },
  });
}

function formatUserResponse(user: any, activeRole: string) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    status: user.status,
    roles: user.roles.map((r: any) => r.role),
    activeRole,
    brandProfile: user.brandProfile || null,
    creatorProfile: user.creatorProfile || null,
    creditWallet: user.creditWallet
      ? {
          balance: user.creditWallet.balance,
          reservedBalance: user.creditWallet.reservedBalance,
        }
      : null,
  };
}
