import { describe, expect, it } from 'vitest';

import { hasPermission } from '@/core/permissions/has-permission';

describe('hasPermission', () => {
  it('grants a permission included in the role map', () => {
    expect(hasPermission({ role: 'owner' }, 'user.manage')).toBe(true);
  });

  it('denies a permission not included in the role map and not overridden', () => {
    expect(hasPermission({ role: 'attendant' }, 'user.manage')).toBe(false);
  });

  it('grants a permission present only in the membership override', () => {
    expect(
      hasPermission({ role: 'attendant', overridePermissions: ['user.manage'] }, 'user.manage'),
    ).toBe(true);
  });

  it('denies a key that exists in neither the role map nor the override', () => {
    expect(hasPermission({ role: 'owner' }, 'nonexistent.permission')).toBe(false);
  });

  it('treats an empty override as granting nothing beyond the role map', () => {
    expect(hasPermission({ role: 'attendant', overridePermissions: [] }, 'user.manage')).toBe(
      false,
    );
    expect(hasPermission({ role: 'attendant', overridePermissions: [] }, 'dashboard.read')).toBe(
      true,
    );
  });

  it('treats an undefined override as granting nothing beyond the role map', () => {
    expect(hasPermission({ role: 'attendant', overridePermissions: undefined }, 'dashboard.read')).toBe(
      true,
    );
  });
});
