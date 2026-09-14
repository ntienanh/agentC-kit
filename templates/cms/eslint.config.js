import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.next/**', '.agent/**', 'node_modules/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': {
        rules: {
          'only-export-components': { create: () => ({}) },
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // allow any
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*', '@/features/**'], message: 'shared must not depend on feature modules.' },
            { group: ['@/layouts/*', '@/layouts/**'], message: 'shared must not depend on layouts.' },
            { group: ['@/app/*', '@/app/**'], message: 'shared must not depend on app routes.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/configs/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*'], message: 'configs must stay app-level and not depend on feature modules.' },
            { group: ['@/layouts/*'], message: 'configs must not depend on layouts.' },
            { group: ['@/app/*'], message: 'configs must not depend on app routes.' },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/layouts/**/*.{ts,tsx}',
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/error.tsx',
      'src/app/**/loading.tsx',
      'src/app/not-found.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/shared/lib/http',
                '@/shared/lib/http/*',
                '@/shared/lib/cookies*',
                '@/shared/lib/refresh-lock*',
                '@/shared/lib/proxy*',
              ],
              message: 'app/layout UI layers should not depend on low-level transport/server helpers directly.',
            },
            {
              group: ['@/features/*/*'],
              message: 'app/layout layers should consume feature public APIs via "@/features/<feature>" only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*'],
              message: 'feature modules must use relative imports internally and must not depend on other features directly.',
            },
          ],
        },
      ],
    },
  },
  prettier,
);
