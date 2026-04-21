import { NextResponse } from 'next/server';
import { openRouterService } from '@/lib/llm/openrouter';
import { PromptFactory } from '@/lib/prompts/factory';
import { EvaluationRequestSchema } from '@/lib/types';
import { Telemetry } from '@/lib/telemetry';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validation Layer
    const validation = EvaluationRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.format() }, { status: 400 });
    }

    const { transcript, jobTitle } = validation.data;

    // 2. Telemetry & Execution Layer
    const content = await Telemetry.measure('ai_evaluation_generation', async () => {
      return await openRouterService.generateEvaluation({
        systemPrompt: PromptFactory.getEvaluationPrompt(jobTitle),
        transcript
      });
    }, { jobTitle });
    
    if (!content) {
      throw new Error("No evaluation generated");
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error({
      step: 'api_evaluate',
      error: error.message,
      reason: 'Failed to generate evaluation or parse JSON'
    });
    
    return NextResponse.json({
      error: 'Failed to process evaluation',
      details: error.message
    }, { status: 500 });
  }
}
