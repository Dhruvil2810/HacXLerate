export interface AITextRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AITextResponse {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

export interface AIStructuredRequest<T> {
  systemPrompt?: string;
  userPrompt: string;
  schemaDescription: string;
  fallbackData: T;
  temperature?: number;
}

export interface AIStructuredResponse<T> {
  data: T;
  rawContent: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  usedFallback: boolean;
}

export interface AIProvider {
  providerName: string;
  generateText(request: AITextRequest): Promise<AITextResponse>;
  generateStructuredOutput<T>(request: AIStructuredRequest<T>): Promise<AIStructuredResponse<T>>;
}
