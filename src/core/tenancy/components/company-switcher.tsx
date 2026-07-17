'use client';

import { useTransition } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';

import { setActiveCompany } from '../actions/set-active-company';
import type { MembershipWithCompany } from '../services/get-memberships';

interface CompanySwitcherProps {
  memberships: MembershipWithCompany[];
  activeCompanyId: string;
}

/** Hidden when the user has a single membership — nothing to switch between. */
export function CompanySwitcher({ memberships, activeCompanyId }: CompanySwitcherProps) {
  const [isPending, startTransition] = useTransition();

  if (memberships.length <= 1) {
    return null;
  }

  const active = memberships.find((m) => m.companyId === activeCompanyId);

  const handleSelect = (companyId: string) => {
    if (companyId === activeCompanyId) return;

    startTransition(async () => {
      await setActiveCompany(companyId);
      // Hard navigation, not router.refresh(): every server component on the
      // page reads the active-company cookie, and a full reload guarantees
      // none of them can show a stale mix of old/new tenant data.
      window.location.assign('/');
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" disabled={isPending} />}>
        {active?.companyName ?? 'Selecionar empresa'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {memberships.map((m) => (
          <DropdownMenuItem key={m.companyId} onClick={() => handleSelect(m.companyId)}>
            {m.companyName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
