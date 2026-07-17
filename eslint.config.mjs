import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // Architecture boundaries (project-structure.md): feature -> core -> infrastructure,
  // feature -> shared. Never infrastructure -> feature, feature -> feature, core -> feature.
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [{ group: ['@/features/*'], message: 'infrastructure nunca importa features' }],
        },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/features/*'], message: 'core nunca importa features' }] },
      ],
    },
  },
  // Each feature may only import itself, never a sibling feature directly
  // (project-structure.md: comunicação entre features via eventos ou serviços).
  ...['inbox', 'conversations', 'contacts', 'leads', 'agent', 'dashboard', 'settings', 'admin'].map(
    (feature) => ({
      files: [`src/features/${feature}/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              'inbox',
              'conversations',
              'contacts',
              'leads',
              'agent',
              'dashboard',
              'settings',
              'admin',
            ]
              .filter((other) => other !== feature)
              .map((other) => ({
                group: [`@/features/${other}/*`],
                message:
                  'features nunca se importam diretamente — use eventos ou serviços (core/events)',
              })),
          },
        ],
      },
    }),
  ),
  // eslint-config-prettier must be last to disable formatting-conflicting rules.
  eslintConfigPrettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'supabase/types/**']),
]);

export default eslintConfig;
