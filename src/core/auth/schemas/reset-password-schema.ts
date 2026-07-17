import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha precisa ter no mínimo 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
