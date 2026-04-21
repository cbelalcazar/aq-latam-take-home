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
    const titleLower = jobTitle.toLowerCase();
    const jobKey = titleLower.includes('backend') ? 'swe-backend' : 
                   titleLower.includes('product') ? 'product-manager' : 
                   'financial-analyst';
    
    const pack = JOB_QUESTION_PACKS[jobKey];
    const packString = `Behavioral: ${pack.behavioral.join(' | ')} \nTechnical: ${pack.technical.join(' | ')}`;

    // 3. Execution Layer with Defensive Parsing
    const content = await Telemetry.measure('ai_interview_completion', async () => {
      const response = await openRouterService.generateCompletion({
        systemPrompt: PromptFactory.getInterviewerPrompt(jobTitle, jobDescription, packString),
        history
      });
      return response;
    }, { jobTitle });
    
    if (!content) throw new Error("AI core returned empty signal");

    try {
      // 1. Clean markdown wrappers
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      let result = JSON.parse(cleanContent);
      
      // 2. Recovery Layer (If model forgot the 'question' key but left it in intent or elsewhere)
      if (!result.question) {
        console.warn("AI Omitted 'question' key. Attempting recovery...");
        result.question = result.reasoningTrace?.intent || "Can you elaborate more on your previous technical experience?";
      }

      // 3. Ensure arrays exist for UI safety
      if (!result.reasoningTrace) result.reasoningTrace = {};
      if (!result.reasoningTrace.skills_detected) result.reasoningTrace.skills_detected = [];

      return NextResponse.json(result);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw Content:", content);
      throw new Error("AI response format was invalid. Signal corrupted.");
    }
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
