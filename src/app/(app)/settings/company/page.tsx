import { getActiveCompanyOrThrow } from '@/core/tenancy/services/get-active-company';
import { CompanyForm } from '@/features/settings/components/company-form';
import { createClient } from '@/infrastructure/supabase/server-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default async function CompanySettingsPage() {
  const { membership } = await getActiveCompanyOrThrow();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from('companies')
    .select('name, timezone, locale')
    .eq('id', membership.companyId)
    .single();

  const isOwner = membership.role === 'owner';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        {!isOwner && (
          <CardDescription>
            Apenas o Owner da empresa pode editar estas informações.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <CompanyForm
          defaultValues={{
            name: company?.name ?? '',
            timezone: company?.timezone ?? '',
            locale: company?.locale ?? '',
          }}
          disabled={!isOwner}
        />
      </CardContent>
    </Card>
  );
}
