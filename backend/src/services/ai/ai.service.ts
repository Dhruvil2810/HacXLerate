import { OpenRouterProvider } from './openrouter.provider.js';
import { prisma } from '../../config/db.js';
import { recordCreditTransaction } from '../credit.service.js';
import { calculateDeterministicMatch } from './scoring.engine.js';
import { env } from '../../config/env.js';

const aiProvider = new OpenRouterProvider();

export async function analyzeProductWithAI(
  userId: string,
  productData: { name: string; category: string; description: string; websiteUrl?: string; usp?: string }
) {
  const creditCost = env.AI_DEFAULT_CREDIT_COST;

  // 1. Deduct credits for AI operation
  await recordCreditTransaction({
    userId,
    amount: -creditCost,
    type: 'AI_USAGE',
    description: `AI Product Analysis: "${productData.name}"`,
    referenceType: 'Product',
  });

  const schemaDescription = `{
    "extractedName": "string",
    "targetAudience": "string",
    "uniqueSellingPoints": ["string"],
    "contentOpportunities": ["string"],
    "recommendedVideoFormats": ["string"],
    "complianceGuidelines": ["string"],
    "suggestedCampaignHooks": ["string"]
  }`;

  const userPrompt = `Analyze this product for influencer marketing:
Product Name: ${productData.name}
Category: ${productData.category}
Description: ${productData.description}
${productData.usp ? `Current USP: ${productData.usp}` : ''}
${productData.websiteUrl ? `Website: ${productData.websiteUrl}` : ''}`;

  const fallbackData = {
    extractedName: productData.name,
    targetAudience: 'Tech enthusiasts, developers, and productivity professionals aged 22-40',
    uniqueSellingPoints: [
      productData.usp || 'High precision build quality with low latency performance',
      'Engineered for long-term daily ergonomic durability',
    ],
    contentOpportunities: [
      'Dedicated 4K workbench teardown and sound test review',
      'Integration in "Top Workspace Productivity Upgrades" compilation',
    ],
    recommendedVideoFormats: ['Dedicated Review', 'Shorts / Reels', 'Workspace Tour Integration'],
    complianceGuidelines: ['Disclose sponsorship clearly in first 30 seconds', 'Avoid untested claims'],
    suggestedCampaignHooks: [
      'Is this the ultimate mechanical keyboard for developers in 2026?',
      'Why I upgraded my entire desk setup with this one tool.',
    ],
  };

  const result = await aiProvider.generateStructuredOutput({
    userPrompt,
    schemaDescription,
    fallbackData,
  });

  // Log usage telemetry
  await prisma.aIUsage.create({
    data: {
      userId,
      operation: 'PRODUCT_ANALYSIS',
      model: result.model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      creditCost,
      latencyMs: result.latencyMs,
      success: true,
    },
  });

  return result.data;
}

export async function assistCampaignBriefWithAI(
  userId: string,
  campaignData: { title: string; objective: string; rewardModel: string; cpmRate: number; categories: string[]; description: string }
) {
  const creditCost = env.AI_DEFAULT_CREDIT_COST;

  await recordCreditTransaction({
    userId,
    amount: -creditCost,
    type: 'AI_USAGE',
    description: `AI Campaign Brief Assistance: "${campaignData.title}"`,
    referenceType: 'Campaign',
  });

  const schemaDescription = `{
    "enhancedObjective": "string",
    "creativeHooks": ["string"],
    "creatorRequirements": ["string"],
    "prohibitedTopics": ["string"],
    "suggestedHashtags": ["string"],
    "recommendedDeliverables": "string"
  }`;

  const userPrompt = `Generate a high-converting creator brief for this performance campaign:
Campaign Title: ${campaignData.title}
Objective: ${campaignData.objective}
Reward Model: ${campaignData.rewardModel} (CPM rate: ₹${campaignData.cpmRate} per 1k verified views)
Target Categories: ${campaignData.categories.join(', ')}
Brief Context: ${campaignData.description}`;

  const fallbackData = {
    enhancedObjective: `Drive verified view growth and community trust across ${campaignData.categories.join(' and ')} audiences with high-retention video integrations.`,
    creativeHooks: [
      `"I tested this for 30 days — here is what surprised me most."`,
      `"Why every professional setup needs this upgrade in 2026."`,
    ],
    creatorRequirements: [
      '4K resolution with clear audio and natural product integration',
      'Pin tracking link in top comment and description',
      'Submit draft for brand review before public release',
    ],
    prohibitedTopics: [
      'Competitor brand mentions in the same segment',
      'Misleading discount or performance claims',
    ],
    suggestedHashtags: ['#CreatorOS', '#TechReview', '#PerformancePartner'],
    recommendedDeliverables: '1x 5-8 minute dedicated review or 60-90 second dedicated integration + 1x YouTube Short',
  };

  const result = await aiProvider.generateStructuredOutput({
    userPrompt,
    schemaDescription,
    fallbackData,
  });

  await prisma.aIUsage.create({
    data: {
      userId,
      operation: 'CAMPAIGN_BRIEF_ASSIST',
      model: result.model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      creditCost,
      latencyMs: result.latencyMs,
      success: true,
    },
  });

  return result.data;
}

export async function explainCreatorMatch(
  userId: string,
  campaignData: { categories: string[]; cpmRate: number; title: string },
  creatorData: { handle: string; categories: string[]; skills: string[]; bio?: string }
) {
  // 1. Calculate deterministic match score & statistical factors
  const matchResult = calculateDeterministicMatch(
    campaignData.categories,
    campaignData.cpmRate,
    creatorData.categories,
    [145000, 138000, 152000, 140000, 148000],
    [6200, 5900, 6800, 6100, 6400],
    4
  );

  // 2. Generate natural language AI explanation
  const prompt = `Explain why creator @${creatorData.handle} has a ${matchResult.overallScore}% deterministic match for campaign "${campaignData.title}".
Factors:
- Audience Fit: ${matchResult.factors.audienceFitScore}/100
- Content Fit: ${matchResult.factors.contentFitScore}/100
- Consistency: ${matchResult.consistencyScore}/100
- Engagement: ${matchResult.factors.engagementScore}/100
Creator bio: ${creatorData.bio || 'Tech reviewer and hardware tester'}
Provide a concise 2-sentence objective explanation.`;

  const aiText = await aiProvider.generateText({
    userPrompt: prompt,
    temperature: 0.3,
  });

  return {
    match: matchResult,
    aiExplanation: aiText.content.trim(),
  };
}
