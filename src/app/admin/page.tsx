import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function AdminHomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission Control</CardTitle>
        <CardDescription>
          Escopo platform validado (ADR-011) — empresas, usuários e saúde do sistema chegam no Marco
          4.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
