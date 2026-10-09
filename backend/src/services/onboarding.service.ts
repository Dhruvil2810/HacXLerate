import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { createAuditLog } from './audit.service.js';
import { BrandOnboardingInput, CreatorOnboardingInput } from '../validators/onboarding.validator.js';

export async function completeBrandOnboarding(
  userId: string,
  input: BrandOnboardingInput,
  ip?: string,
  userAgent?: string
) {
  const brandProfile = await prisma.brandProfile.upsert({
    where: { userId },
    update: {
      companyName: input.companyName,
      industry: input.industry || null,
      websiteUrl: input.websiteUrl || null,
      description: input.description || null,
      logoUrl: input.logoUrl || null,
    },
    create: {
      userId,
      companyName: input.companyName,
      industry: input.industry || null,
      websiteUrl: input.websiteUrl || null,
      description: input.description || null,
      logoUrl: input.logoUrl || null,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'PROFILE_UPDATED',
    entityType: 'BrandProfile',
    entityId: brandProfile.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { companyName: input.companyName },
  });

  return brandProfile;
}

export async function completeCreatorOnboarding(
  userId: string,
  input: CreatorOnboardingInput,
  ip?: string,
  userAgent?: string
) {
  // Check handle uniqueness if changed
  const existingHandle = await prisma.creatorProfile.findFirst({
    where: {
      handle: input.handle,
      userId: { not: userId },
    },
  });

  if (existingHandle) {
    throw new AppError('This creator handle is already taken', 409, 'HANDLE_EXISTS');
  }

  const creatorProfile = await prisma.creatorProfile.upsert({
    where: { userId },
    update: {
      handle: input.handle,
      bio: input.bio || null,
      location: input.location || null,
      categories: input.categories,
      skills: input.skills,
      tools: input.tools,
      contentTypes: input.contentTypes,
    },
    create: {
      userId,
      handle: input.handle,
      bio: input.bio || null,
      location: input.location || null,
      categories: input.categories,
      skills: input.skills,
      tools: input.tools,
      contentTypes: input.contentTypes,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'PROFILE_UPDATED',
    entityType: 'CreatorProfile',
    entityId: creatorProfile.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { handle: input.handle },
  });

  return creatorProfile;
}
