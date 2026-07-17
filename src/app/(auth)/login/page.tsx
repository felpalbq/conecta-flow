import Link from 'next/link';

import { LoginForm } from '@/core/auth/components/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar no Conecta Flow</CardTitle>
        <CardDescription>Acesse sua conta para continuar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm />
        <Link
          href="/forgot-password"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          Esqueci minha senha
        </Link>
      </CardContent>
    </Card>
  );
}
