import { describe, it, expect } from 'vitest';
import { InterviewRequestSchema } from './types';

describe('Zod Validation Schemas', () => {
  it('should validate a correct interview request', () => {
    const validData = {
      history: [
        { role: 'interviewer', content: 'Hi', timestamp: '2024-01-01' }
      ],
      jobTitle: 'Engineer',
      jobDescription: 'Code things'
    };
    const result = InterviewRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid data', () => {
    const invalidData = {
      history: 'not an array',
      jobTitle: 123
    };
    const result = InterviewRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
