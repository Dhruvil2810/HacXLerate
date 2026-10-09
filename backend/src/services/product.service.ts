import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.util.js';
import { createAuditLog } from './audit.service.js';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator.js';

export async function createProduct(
  userId: string,
  input: CreateProductInput,
  ip?: string,
  userAgent?: string
) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) {
    throw new AppError('Brand profile not found. Please complete brand onboarding first.', 400, 'BRAND_PROFILE_REQUIRED');
  }

  const product = await prisma.product.create({
    data: {
      brandId: brandProfile.id,
      name: input.name,
      description: input.description,
      category: input.category,
      websiteUrl: input.websiteUrl || null,
      productUrl: input.productUrl || null,
      usp: input.usp || null,
      features: input.features || [],
      pricingDetails: input.pricingDetails || null,
      targetAudience: input.targetAudience || null,
      brandGuidelines: input.brandGuidelines || null,
      restrictions: input.restrictions || null,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: 'PRODUCT_CREATED',
    entityType: 'Product',
    entityId: product.id,
    ipAddress: ip,
    userAgent: userAgent,
    metadata: { productName: product.name },
  });

  return product;
}

export async function getBrandProducts(userId: string) {
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) {
    return [];
  }

  return prisma.product.findMany({
    where: { brandId: brandProfile.id },
    include: {
      documents: true,
      _count: {
        select: { campaigns: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductById(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      brand: true,
      documents: true,
      campaigns: {
        select: {
          id: true,
          title: true,
          status: true,
          cpmRate: true,
          budgetCredits: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }

  return product;
}

export async function updateProduct(
  userId: string,
  productId: string,
  input: UpdateProductInput
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { brand: true },
  });

  if (!product || product.brand.userId !== userId) {
    throw new AppError('Product not found or unauthorized', 404, 'NOT_FOUND');
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      websiteUrl: input.websiteUrl,
      productUrl: input.productUrl,
      usp: input.usp,
      features: input.features,
      pricingDetails: input.pricingDetails,
      targetAudience: input.targetAudience,
      brandGuidelines: input.brandGuidelines,
      restrictions: input.restrictions,
    },
  });

  return updated;
}

export async function deleteProduct(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { brand: true },
  });

  if (!product || product.brand.userId !== userId) {
    throw new AppError('Product not found or unauthorized', 404, 'NOT_FOUND');
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  return { message: 'Product deleted successfully' };
}
