import { Message } from '../types';

export interface CompletionRequest {
  systemPrompt: string;
  history: Message[];
  model?: string;
  responseFormat?: 'json_object' | 'text';
}

export interface EvaluationRequest {
  systemPrompt: string;
  transcript: Message[];
  model?: string;
}

export interface LLMProvider {
  name: string;
  generateCompletion(req: CompletionRequest): Promise<string>;
  generateEvaluation(req: EvaluationRequest): Promise<string>;
}
