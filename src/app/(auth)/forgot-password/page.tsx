import Link from 'next/link';

import { ForgotPasswordForm } from '@/core/auth/components/forgot-password-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>Enviaremos um link para redefinir sua senha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgotPasswordForm />
        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}
