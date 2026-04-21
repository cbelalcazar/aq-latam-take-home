import { describe, it, expect } from 'vitest';
import { PromptFactory } from './factory';

describe('PromptFactory', () => {
  it('should correctly inject job title and description into interviewer prompt', () => {
    const jobTitle = 'Software Engineer';
    const jobDesc = 'Build amazing things';
    const qPack = 'Q1 | Q2';
    
    const prompt = PromptFactory.getInterviewerPrompt(jobTitle, jobDesc, qPack);
    
    expect(prompt).toContain(jobTitle);
    expect(prompt).toContain(jobDesc);
    expect(prompt).toContain(qPack);
  });

  it('should correctly inject job title into evaluation prompt', () => {
    const jobTitle = 'Product Manager';
    const prompt = PromptFactory.getEvaluationPrompt(jobTitle);
    
    expect(prompt).toContain(jobTitle);
  });
});
