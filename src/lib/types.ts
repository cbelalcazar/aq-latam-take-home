import { z } from 'zod';

// 1. Job Definitions
export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
});

export type Job = z.infer<typeof JobSchema>;

// 2. Interview Message (Turn-based)
export const MessageSchema = z.object({
  role: z.enum(['interviewer', 'candidate']),
  content: z.string(),
  timestamp: z.string(),
  reasoningTrace: z.object({
    skills_detected: z.array(z.string()),
    topics_covered: z.array(z.string()),
    current_gap: z.string(),
    intent: z.string(),
  }).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// 3. Interview Session
export const SessionSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  status: z.enum(['idle', 'ongoing', 'completed']),
  messages: z.array(MessageSchema),
  currentQuestionIndex: z.number().default(0),
});

export type Session = z.infer<typeof SessionSchema>;

// 4. Final Evaluation (Stretch Goal #1)
export const EvaluationSchema = z.object({
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  overallScore: z.number().min(0).max(100),
  technicalProficiency: z.number().min(0).max(100),
  communicationSkills: z.number().min(0).max(100),
  summary: z.string(),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;

// 5. API Request Schemas
export const InterviewRequestSchema = z.object({
  history: z.array(MessageSchema),
  jobTitle: z.string(),
  jobDescription: z.string(),
});

export type InterviewRequest = z.infer<typeof InterviewRequestSchema>;

export const EvaluationRequestSchema = z.object({
  transcript: z.array(MessageSchema),
  jobTitle: z.string(),
});

export type EvaluationReq = z.infer<typeof EvaluationRequestSchema>;

// 6. Question Packs (Stretch Goal #2)
export const JOB_QUESTION_PACKS: Record<string, { behavioral: string[], technical: string[] }> = {
  'swe-backend': {
    behavioral: [
      "Describe a time you had to solve a complex production outage under high pressure.",
      "How do you handle technical debt when a deadline is fast approaching?"
    ],
    technical: [
      "How do you ensure message durability and consistency in a distributed Kafka cluster?",
      "Can you explain your strategy for optimizing database queries in a high-throughput system?",
      "How would you design a caching layer with Redis to handle millions of concurrent users?"
    ]
  },
  'product-manager': {
    behavioral: [
      "Tell me about a time you had to say 'no' to a major stakeholder's feature request.",
      "How do you lead a cross-functional team when engineers and designers have conflicting priorities?"
    ],
    technical: [
      "What core metrics would you track for a new AI-driven evaluation tool?",
      "How do you prioritize a product roadmap when you have limited engineering resources?",
      "Describe your process for conducting user research to identify latent needs."
    ]
  },
  'financial-analyst': {
    behavioral: [
      "Describe a situation where you identified a significant financial risk that others missed.",
      "How do you ensure precision and accuracy when working with massive, messy datasets?"
    ],
    technical: [
      "How do you model market volatility in a high-stakes investment scenario?",
      "Can you explain the difference between VAR (Value at Risk) and expected shortfall?",
      "What technical tools (Python/Excel) do you use to automate financial reporting?"
    ]
  }
};

// Sample Data for Phase 1
export const SAMPLE_JOBS: Job[] = [
  {
    id: 'swe-backend',
    title: 'Software Engineer (Backend)',
    description: 'Build high-throughput data pipelines and scale core infrastructure.',
    requirements: ['Next.js', 'Python', 'Kafka', 'Redis', 'Scalability'],
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    description: 'Define product strategy and lead cross-functional teams to ship fast.',
    requirements: ['Metrics-driven', 'User Empathy', 'Strategy', 'Agile'],
  },
  {
    id: 'financial-analyst',
    title: 'Financial Analyst',
    description: 'Precision analysis for high-stakes risk management and market trends.',
    requirements: ['Quantitative Analysis', 'Risk Management', 'Excel/Python', 'Precision'],
  },
];
