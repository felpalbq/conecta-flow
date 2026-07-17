import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
