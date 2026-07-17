import '@testing-library/jest-dom/vitest';

// Loads local Supabase env vars for tests/integration/rls. In CI these come
// from `supabase status -o env >> $GITHUB_ENV` instead, so .env.local won't
// exist there — safe to ignore.
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local — env vars are expected to already be set (CI).
}
