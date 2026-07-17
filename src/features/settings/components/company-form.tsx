'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { companySchema, type CompanyInput } from '../schemas/company-schema';
import { updateCompany } from '../services/update-company';

interface CompanyFormProps {
  defaultValues: CompanyInput;
  disabled: boolean;
}

export function CompanyForm({ defaultValues, disabled }: CompanyFormProps) {
  const [status, setStatus] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInput>({ resolver: zodResolver(companySchema), defaultValues });

  const onSubmit = (values: CompanyInput) => {
    setStatus({});
    startTransition(async () => {
      const result = await updateCompany(values);
      setStatus(result.error ? { error: result.error } : { success: true });
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nome da empresa</Label>
        <Input id="name" disabled={disabled} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Fuso horário</Label>
        <Input id="timezone" disabled={disabled} {...register('timezone')} />
        {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="locale">Idioma</Label>
        <Input id="locale" disabled={disabled} {...register('locale')} />
        {errors.locale && <p className="text-sm text-destructive">{errors.locale.message}</p>}
      </div>
      {status.error && <p className="text-sm text-destructive">{status.error}</p>}
      {status.success && <p className="text-sm text-muted-foreground">Alterações salvas.</p>}
      <Button type="submit" disabled={disabled || isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
