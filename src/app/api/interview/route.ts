import { NextResponse } from 'next/server';
import { openRouterService } from '@/lib/llm/openrouter';
import { PromptFactory } from '@/lib/prompts/factory';
import { InterviewRequestSchema, JOB_QUESTION_PACKS } from '@/lib/types';
import { Telemetry } from '@/lib/telemetry';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validation Layer
    const validation = InterviewRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.format() }, { status: 400 });
    }

    const { history, jobTitle, jobDescription } = validation.data;

    // 2. Identify Question Pack (Stretch Goal #2)
    // Find job id by searching titles
    const jobKey = jobTitle.toLowerCase().includes('backend') ? 'swe-backend' : 
                   jobTitle.toLowerCase().includes('product') ? 'product-manager' : 
                   'financial-analyst';
    
    const pack = JOB_QUESTION_PACKS[jobKey];
    const packString = `Behavioral: ${pack.behavioral.join(' | ')} \nTechnical: ${pack.technical.join(' | ')}`;

    // 3. Telemetry & Execution Layer
    const content = await Telemetry.measure('ai_interview_completion', async () => {
      return await openRouterService.generateCompletion({
        systemPrompt: PromptFactory.getInterviewerPrompt(jobTitle, jobDescription, packString),
        history
      });
    }, { jobTitle });
    
    if (!content) {
      throw new Error("No response from AI model");
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error({
      step: 'api_interview',
      error: error.message,
      reason: 'Failed to generate next question or parse JSON'
    });
    
    return NextResponse.json({
      error: 'Failed to process interview step',
      details: error.message
    }, { status: 500 });
  }
}
