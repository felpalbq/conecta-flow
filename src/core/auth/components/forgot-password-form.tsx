'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { requestPasswordReset } from '../actions/forgot-password';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/forgot-password-schema';

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  if (status.success) {
    return (
      <p className="text-sm text-muted-foreground">
        Se o e-mail informado existir em nossa base, enviamos um link de recuperação.
      </p>
    );
  }

  const onSubmit = (values: ForgotPasswordInput) => {
    setStatus({});
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      setStatus(result);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      {status.error && <p className="text-sm text-destructive">{status.error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
      </Button>
    </form>
  );
}
