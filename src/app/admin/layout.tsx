import { requireAdmin } from '@/core/auth/services/require-admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-secondary px-6 py-3">
        <span className="font-heading text-lg font-semibold text-secondary-foreground">
          Mission Control
        </span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
