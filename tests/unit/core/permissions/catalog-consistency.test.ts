import { describe, expect, it } from 'vitest';

import { PERMISSION_CATALOG_KEYS } from '@/core/permissions/permission-catalog';
import { ROLE_PERMISSIONS } from '@/core/permissions/role-permissions';

describe('permission catalog consistency', () => {
  it('has a catalog entry for every key used by ROLE_PERMISSIONS', () => {
    const missing = Object.values(ROLE_PERMISSIONS)
      .flat()
      .filter((key) => !PERMISSION_CATALOG_KEYS.has(key));

    expect(missing).toEqual([]);
  });
});
