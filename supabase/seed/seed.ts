import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/supabase/types';

import { COMPANIES, DEV_PASSWORD, MEMBERSHIPS, PLATFORM_ADMINS, USERS } from './fixtures';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

// Safety guards: never seed anything but the local stack.
if (!/127\.0\.0\.1|localhost/.test(supabaseUrl)) {
  throw new Error(
    `Refusing to seed: NEXT_PUBLIC_SUPABASE_URL "${supabaseUrl}" is not a local Supabase instance.`,
  );
}
if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed: NODE_ENV is production.');
}

async function main() {
  // Standalone script (run via tsx, not through the Next.js build), so it
  // builds its own service-role client rather than importing
  // infrastructure/supabase/service-role-client.ts — that module is guarded
  // by `server-only`, which relies on webpack bundling to enforce and always
  // throws under plain Node.
  const supabase = createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const profileIdByEmail = new Map<string, string>();
  const { data: existing } = await supabase.auth.admin.listUsers();

  for (const user of Object.values(USERS)) {
    const found = existing.users.find((u) => u.email === user.email);

    if (found) {
      profileIdByEmail.set(user.email, found.id);
      continue;
    }

    const { data: created, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: { name: user.name },
    });

    if (error || !created.user) {
      throw new Error(`Failed to create user ${user.email}: ${error?.message}`);
    }

    profileIdByEmail.set(user.email, created.user.id);
  }

  const companyIdBySlug = new Map<string, string>();

  for (const company of Object.values(COMPANIES)) {
    const { data, error } = await supabase
      .from('companies')
      .upsert({ slug: company.slug, name: company.name }, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error || !data) {
      throw new Error(`Failed to upsert company ${company.slug}: ${error?.message}`);
    }

    companyIdBySlug.set(company.slug, data.id);
  }

  for (const membership of MEMBERSHIPS) {
    const profileId = profileIdByEmail.get(membership.user.email);
    const companyId = companyIdBySlug.get(membership.company.slug);

    if (!profileId || !companyId) {
      throw new Error(`Missing profile/company for membership ${JSON.stringify(membership)}`);
    }

    const { error } = await supabase
      .from('company_memberships')
      .upsert(
        { profile_id: profileId, company_id: companyId, role: membership.role, status: 'active' },
        { onConflict: 'profile_id,company_id' },
      );

    if (error) {
      throw new Error(`Failed to upsert membership: ${error.message}`);
    }
  }

  for (const admin of PLATFORM_ADMINS) {
    const profileId = profileIdByEmail.get(admin.email);

    if (!profileId) {
      throw new Error(`Missing profile for platform admin ${admin.email}`);
    }

    const { error } = await supabase
      .from('admin_users')
      .upsert({ profile_id: profileId, status: 'active' }, { onConflict: 'profile_id' });

    if (error) {
      throw new Error(`Failed to upsert admin_user: ${error.message}`);
    }
  }

  console.log('Seed complete:');
  console.log('  companies:', [...companyIdBySlug.keys()]);
  console.log('  users:', [...profileIdByEmail.keys()]);
  console.log(`  password (all seed users): ${DEV_PASSWORD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
