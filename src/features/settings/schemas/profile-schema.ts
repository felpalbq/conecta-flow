import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, 'Informe seu nome.'),
  avatarUrl: z.string().url('Informe uma URL válida.').optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;
