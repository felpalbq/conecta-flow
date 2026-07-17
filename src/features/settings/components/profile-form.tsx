'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { profileSchema, type ProfileInput } from '../schemas/profile-schema';
import { updateProfile } from '../services/update-profile';

interface ProfileFormProps {
  defaultValues: ProfileInput;
  email: string;
}

export function ProfileForm({ defaultValues, email }: ProfileFormProps) {
  const [status, setStatus] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });

  const onSubmit = (values: ProfileInput) => {
    setStatus({});
    startTransition(async () => {
      const result = await updateProfile(values);
      setStatus(result.error ? { error: result.error } : { success: true });
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled readOnly />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">URL do avatar</Label>
        <Input id="avatarUrl" {...register('avatarUrl')} />
        {errors.avatarUrl && <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>}
      </div>
      {status.error && <p className="text-sm text-destructive">{status.error}</p>}
      {status.success && <p className="text-sm text-muted-foreground">Alterações salvas.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
