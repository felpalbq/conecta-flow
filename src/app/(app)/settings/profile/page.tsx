import { requireUser } from '@/core/auth/services/require-user';
import { ProfileForm } from '@/features/settings/components/profile-form';
import { createClient } from '@/infrastructure/supabase/server-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm
          defaultValues={{ name: profile?.name ?? '', avatarUrl: profile?.avatar_url ?? '' }}
          email={profile?.email ?? user.email ?? ''}
        />
      </CardContent>
    </Card>
  );
}
