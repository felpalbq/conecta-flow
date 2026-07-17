import { getActiveCompanyOrThrow } from '@/core/tenancy/services/get-active-company';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default async function HomePage() {
  const { membership } = await getActiveCompanyOrThrow();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bem-vindo, {membership.companyName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Fundação do Conecta Flow em construção — a Inbox chega no próximo marco.
        </p>
      </CardContent>
    </Card>
  );
}
