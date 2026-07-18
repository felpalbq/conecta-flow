import 'server-only';

import type { Json } from '@/supabase/types';
import { createClient } from '@/infrastructure/supabase/server-client';

interface AuditEntry {
  companyId: string | null;
  /** Format dominio.acao — e.g. 'company.updated'. */
  action: string;
  /** e.g. 'companies:<id>'. */
  entity: string;
  metadata?: Record<string, unknown>;
}

/**
 * Writes the audit trail as the authenticated user (the insert policy
 * requires actor_id = auth.uid()). An audit failure must NOT roll back the
 * business operation — log to console and continue; the primary operation
 * already committed. Replace with a joint transaction once the event bus
 * (Marco 2) exists.
 */
export async function logAction(entry: AuditEntry): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: user.id,
    company_id: entry.companyId,
    action: entry.action,
    entity: entry.entity,
    metadata: (entry.metadata ?? {}) as Json,
  });

  if (error) {
    console.error('[audit] failed to write audit log:', error.message, entry.action);
  }
}
