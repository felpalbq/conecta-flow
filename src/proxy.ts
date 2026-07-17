import type { NextRequest } from 'next/server';

import { updateSession } from '@/infrastructure/supabase/proxy-client';

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (see AGENTS.md — this
// codebase's Next.js version has breaking changes vs. older training data).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
