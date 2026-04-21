import OpenAI from 'openai';
import { LLMProvider, CompletionRequest, EvaluationRequest } from './provider';

export class OpenRouterService implements LLMProvider {
  public readonly name = 'OpenRouter';
  private client: OpenAI;
  private defaultModel = 'meta-llama/llama-3.1-8b-instruct';

  constructor() {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AfterQuery_AI_Interviewer",
      }
    });
  }

  async generateCompletion({ systemPrompt, history, model, responseFormat = 'json_object' }: CompletionRequest): Promise<string> {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({
        role: m.role === 'interviewer' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const response = await this.client.chat.completions.create({
      model: model || this.defaultModel,
      messages,
      response_format: { type: responseFormat }
    });

    return response.choices[0].message.content || '';
  }

  async generateEvaluation({ systemPrompt, transcript, model }: EvaluationRequest): Promise<string> {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Transcript:\n${transcript.map(m => `${m.role}: ${m.content}`).join('\n')}` }
    ];

    const response = await this.client.chat.completions.create({
      model: model || this.defaultModel,
      messages,
      response_format: { type: 'json_object' }
    });

    return response.choices[0].message.content || '';
  }
}

// Export a singleton instance
export const openRouterService = new OpenRouterService();
