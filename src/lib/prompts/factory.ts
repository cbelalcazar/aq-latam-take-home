import { INTERVIEWER_TEMPLATE, EVALUATION_TEMPLATE } from './templates';

export class PromptFactory {
  public static getInterviewerPrompt(jobTitle: string, jobDescription: string, questionPack: string): string {
    return INTERVIEWER_TEMPLATE
      .replace('{{jobTitle}}', jobTitle)
      .replace('{{jobDescription}}', jobDescription)
      .replace('{{questionPack}}', questionPack);
  }

  public static getEvaluationPrompt(jobTitle: string): string {
    return EVALUATION_TEMPLATE
      .replace('{{jobTitle}}', jobTitle);
  }
}
