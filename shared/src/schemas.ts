import { z } from 'zod';

export const JoinSchema = z.object({
  name: z.string().min(1).max(20),
  token: z.string().optional()
});

export const PathSchema = z.array(z.enum(['UP', 'DOWN', 'LEFT', 'RIGHT']));
export const R4ActionSchema = z.enum(['ALLOW', 'BLOCK']);

// Add more zod validation logic as needed
