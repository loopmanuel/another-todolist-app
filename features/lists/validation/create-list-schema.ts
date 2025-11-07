import { z } from 'zod';

export const createListSchema = z.object({
  name: z
    .string({ required_error: 'Please enter a name for your list.' })
    .trim()
    .min(1, 'Please enter a name for your list.'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CreateListValues = z.infer<typeof createListSchema>;
