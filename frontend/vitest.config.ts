import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['vitest-canvas-mock', './src/test/setupTests.ts'],
        // Old-laptop speed: one fork (enforces the repo's serial-suites rule
        // for every `vitest run`, pre-push hook included) and shared module
        // registries where they're safe. Imports dominate this suite (~55% of
        // runtime); sharing them between files halves full-suite time. The
        // legacy component/hook suites leak module state when un-isolated, so
        // they keep per-file isolation; the Master record integration suites
        // (deep suite, catalog smokes, Security Observation form) share.
        pool: 'forks',
        poolOptions: { forks: { singleFork: true } },
        projects: [
            {
                extends: true,
                name: 'shared',
                test: {
                    isolate: false,
                    include: [
                        'src/master-records/**/*.test.tsx',
                        'src/modules/*/*.smoke.test.tsx',
                        'src/modules/securityObservations/**/*.test.tsx',
                    ],
                },
            },
            {
                extends: true,
                name: 'isolated',
                test: {
                    isolate: true,
                    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
                    exclude: [
                        '**/node_modules/**',
                        '**/dist/**',
                        'src/master-records/**/*.test.tsx',
                        'src/modules/*/*.smoke.test.tsx',
                        'src/modules/securityObservations/**/*.test.tsx',
                    ],
                },
            },
        ],
    },
});
