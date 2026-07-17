import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'Informe o nome da empresa.'),
  timezone: z.string().min(1, 'Informe o fuso horário.'),
  locale: z.string().min(1, 'Informe o idioma.'),
});

export type CompanyInput = z.infer<typeof companySchema>;
