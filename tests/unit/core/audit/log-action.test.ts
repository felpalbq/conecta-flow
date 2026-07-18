import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/infrastructure/supabase/server-client');

import { logAction } from '@/core/audit/log-action';
import * as clientModule from '@/infrastructure/supabase/server-client';

const insertMock = vi.fn().mockResolvedValue({ error: null });
const fromMock = vi.fn().mockReturnValue({ insert: insertMock });
const getUserMock = vi.fn();
const createClientMock = vi.fn().mockResolvedValue({
  auth: { getUser: getUserMock },
  from: fromMock,
});

vi.mocked(clientModule.createClient).mockImplementation(createClientMock);

describe('logAction', () => {
  it('does nothing when there is no authenticated user', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } });

    await logAction({ companyId: 'company-1', action: 'company.updated', entity: 'companies:1' });

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('inserts an audit row as the authenticated actor', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });

    await logAction({
      companyId: 'company-1',
      action: 'company.updated',
      entity: 'companies:company-1',
      metadata: { fields: ['name'] },
    });

    expect(fromMock).toHaveBeenCalledWith('audit_logs');
    expect(insertMock).toHaveBeenCalledWith({
      actor_id: 'user-1',
      company_id: 'company-1',
      action: 'company.updated',
      entity: 'companies:company-1',
      metadata: { fields: ['name'] },
    });
  });

  it('does not throw when the insert fails', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    insertMock.mockResolvedValueOnce({ error: { message: 'boom' } });

    await expect(
      logAction({ companyId: null, action: 'profile.updated', entity: 'profiles:user-1' }),
    ).resolves.toBeUndefined();
  });
});
