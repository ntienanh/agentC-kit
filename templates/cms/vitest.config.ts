import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/features/**/logic/**/*.ts',
        'src/features/**/*contract.ts',
        'src/features/**/*logic.ts',
        'src/shared/lib/error/app-error.ts',
        'src/shared/lib/error/error-codes.ts',
        'src/shared/lib/error/get-error-message.ts',
        'src/shared/lib/http/auth-header.ts',
        'src/shared/lib/http/cms-url.ts',
        'src/shared/lib/http/query.builder.ts',
        'src/shared/lib/http/response.adapter.ts',
        'src/shared/lib/validation/input-validator.ts',
        'src/shared/rbac/utils/permission-core.ts',
        'src/shared/rbac/utils/permission-utils.ts',
        'src/configs/app/design-system/tokens.config.ts',
        'src/configs/app/design-system/theme.config.ts',
        'src/configs/app/design-system/theme-presets.ts',
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',
        '**/*.d.ts',
        '**/types.ts',
        '**/mocks.ts',
        '**/mock-*.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
