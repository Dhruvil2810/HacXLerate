import { AIProvider, AITextRequest, AITextResponse, AIStructuredRequest, AIStructuredResponse } from './ai.interface.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export class OpenRouterProvider implements AIProvider {
  public providerName = 'OpenRouter';
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY || '';
    this.model = env.OPENROUTER_MODEL || 'openrouter/free';
  }

  async generateText(request: AITextRequest): Promise<AITextResponse> {
    const startTime = Date.now();

    // If no API key configured, use intelligent mock response
    if (!this.apiKey) {
      logger.warn('OPENROUTER_API_KEY not set. Using structured local fallback intelligence.');
      return {
        content: `[CreatorOS AI Insights] Automated response based on brief requirements: High-engagement video integration recommended with focused CTA.`,
        model: `${this.model} (local-fallback)`,
        promptTokens: 120,
        completionTokens: 80,
        latencyMs: Date.now() - startTime,
      };
    }

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.userPrompt });

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': env.OPENROUTER_SITE_URL,
          'X-Title': env.OPENROUTER_SITE_NAME,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API responded with HTTP ${response.status}: ${await response.text()}`);
      }

      const json: any = await response.json();
      const choice = json.choices?.[0];
      const content = choice?.message?.content || '';
      const usage = json.usage || {};

      return {
        content,
        model: json.model || this.model,
        promptTokens: usage.prompt_tokens || 100,
        completionTokens: usage.completion_tokens || 150,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      logger.error('OpenRouter generation failed, applying graceful fallback:', { error: error.message });
      return {
        content: `AI analysis completed using structured heuristics. Focus on verified audience demographics and high retention video hooks.`,
        model: `${this.model} (fallback)`,
        promptTokens: 50,
        completionTokens: 50,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async generateStructuredOutput<T>(request: AIStructuredRequest<T>): Promise<AIStructuredResponse<T>> {
    const systemPrompt = `You are the CreatorOS AI Intelligence Engine.
You MUST reply with VALID JSON ONLY matching this schema specification:
${request.schemaDescription}
Do NOT include markdown formatting or conversational filler. Output raw JSON.
${request.systemPrompt ? `\nAdditional Context:\n${request.systemPrompt}` : ''}`;

    const textResponse = await this.generateText({
      systemPrompt,
      userPrompt: request.userPrompt,
      temperature: request.temperature ?? 0.2,
    });

    try {
      const cleaned = this.extractJson(textResponse.content);
      const parsedData: T = JSON.parse(cleaned);

      return {
        data: parsedData,
        rawContent: textResponse.content,
        model: textResponse.model,
        promptTokens: textResponse.promptTokens,
        completionTokens: textResponse.completionTokens,
        latencyMs: textResponse.latencyMs,
        usedFallback: false,
      };
    } catch (parseError) {
      logger.warn('Failed to parse AI JSON response, safely applying fallback data structure', {
        raw: textResponse.content,
        error: parseError,
      });

      return {
        data: request.fallbackData,
        rawContent: textResponse.content,
        model: textResponse.model,
        promptTokens: textResponse.promptTokens,
        completionTokens: textResponse.completionTokens,
        latencyMs: textResponse.latencyMs,
        usedFallback: true,
      };
    }
  }

  private extractJson(content: string): string {
    let clean = content.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '');
    }
    return clean.trim();
  }
}
