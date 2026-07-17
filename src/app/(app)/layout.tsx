import Link from 'next/link';

import { signOut } from '@/core/auth/actions/sign-out';
import { requireUser } from '@/core/auth/services/require-user';
import { CompanySwitcher } from '@/core/tenancy/components/company-switcher';
import { getActiveCompanyOrThrow } from '@/core/tenancy/services/get-active-company';
import { Button } from '@/shared/components/ui/button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const { membership, memberships } = await getActiveCompanyOrThrow();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/" className="font-heading text-lg font-semibold text-primary">
          Conecta Flow
        </Link>
        <div className="flex items-center gap-3">
          <CompanySwitcher memberships={memberships} activeCompanyId={membership.companyId} />
          <form action={signOut}>
            <Button type="submit" variant="ghost">
              Sair
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
