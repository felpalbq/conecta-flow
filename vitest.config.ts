import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Default environment covers tests/unit (component tests need DOM).
    // Files under tests/integration (e.g. RLS suite) talk to Postgres, not
    // the DOM — add a `// @vitest-environment node` docblock at the top of
    // those files to override.
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
