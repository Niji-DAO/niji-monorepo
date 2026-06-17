import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

const __dirname = dirname(fileURLToPath(import.meta.url));

// TypeScript plugins and parsers
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

// React plugins
import eslintReactPlugin from '@eslint-react/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

// Config
import prettierConfig from 'eslint-config-prettier';

// Other plugins
import importXPlugin from 'eslint-plugin-import-x';
import linguiPlugin from 'eslint-plugin-lingui';
import prettierPlugin from 'eslint-plugin-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import vitestPlugin from 'eslint-plugin-vitest';

// Compatibility layer for traditional configs
const compat = new FlatCompat({
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  // Commonly ignores
  {
    ignores: [
      // Build and dependency directories
      '**/node_modules/*',
      '**/dist',
      '**/.netlify',

      // Configuration files
      '**/*.config.{js,mjs,ts,mts}',
      '**/*.setup.{js,mjs,ts,mts}',

      // Generated code (use a more consistent pattern)
      '**/typechain/**',
      '**/src/{types,contracts,subgraphs}/**',
      // subgraph mappings depend on `graph codegen` output that lives at
      // packages/*-subgraph/src/types/**. Without running prebuild first the
      // mapping sources fail import resolution; treat the whole subgraph
      // package src as opt-out so dir-rename PRs don't trip on it.
      '**/packages/*-subgraph/src/**',
      '**/*.gen.ts',
    ],
  },

  // Base TypeScript configuration for all TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        // Enable project service for better TypeScript integration
        projectService: true,
        // Use fileURLToPath + dirname for a deterministically absolute
        // root directory. `import.meta.dirname` works in most setups but
        // some lint-staged invocations leave it resolving to a relative
        // './' which the typescript-eslint parser rejects.
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'import-x': importXPlugin,
      lingui: linguiPlugin,
      prettier: prettierPlugin,
      turbo: turboPlugin,
      unicorn: unicornPlugin,
      'unused-imports': unusedImportsPlugin,
      vitest: vitestPlugin,
    },
    extends: [
      ...tseslint.configs.recommended,
      importXPlugin.flatConfigs.recommended,
      importXPlugin.flatConfigs.typescript,
      prettierConfig,
    ],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Import plugin rules
      'import-x/no-unresolved': 'error',
      'import-x/named': 'warn',
      'import-x/default': 'error',
      'import-x/namespace': 'error',
      'import-x/export': 'error',
      'import-x/order': [
        'warn',
        {
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '**/*.{css,scss,sass,less,module.css,module.scss}',
              group: 'object',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      // Lingui plugin rules
      'lingui/no-unlocalized-strings': 'off',
      'lingui/t-call-in-function': 'error',
      'lingui/no-single-variables-to-translate': 'error',
      // Unicorn plugin rules
      'unicorn/better-regex': 'error',
      'unicorn/no-nested-ternary': 'error',
      // Unused imports plugin rules
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // Prettier rules
      'prettier/prettier': 'warn',
    },
    settings: {
      ...importXPlugin.configs.typescript.settings,
      'import-x/resolver': {
        ...importXPlugin.configs.typescript.settings['import-x/resolver'],
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },

  // niji-docs specific configuration
  {
    files: ['**/packages/niji-docs/**/*.{ts,tsx}'],
    settings: {
      ...importXPlugin.configs.typescript.settings,
      'import-x/resolver': {
        ...importXPlugin.configs.typescript.settings['import-x/resolver'],
        typescript: {
          project: 'packages/niji-docs/tsconfig.json',
        },
      },
    },
  },

  // Additional React-specific rules only for the webapp package
  {
    files: ['**/packages/nouns-webapp/**/*.{ts,tsx}'],
    settings: {
      ...importXPlugin.configs.typescript.settings,
      'import-x/resolver': {
        ...importXPlugin.configs.typescript.settings['import-x/resolver'],
        typescript: {
          project: 'packages/nouns-webapp/tsconfig.json',
        },
      },
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      prettier: prettierPlugin,
    },
    extends: [
      ...compat.extends('plugin:react/recommended'),
      eslintReactPlugin.configs['recommended-typescript'],
      prettierConfig,
    ],
    rules: {
      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'error',
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      // ESLint React rules
      '@eslint-react/no-class-component': 'error',
      // Typescript eslint rules
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableString: true,
        },
      ],
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: '@apollo/client',
              message:
                'Use @tanstack/react-query instead. ref: https://the-guild.dev/graphql/codegen/docs/guides/react-query#type-safe-graphql-operation-execution',
            },
            {
              name: 'react-bootstrap',
              message: 'Use tailwindcss instead',
            },
          ],
          patterns: [
            {
              regex: '.*redux.*',
              message: 'Use jotai and @tanstack/react-query instead',
            },
            {
              group: ['lucide-react'],
              allowImportNamePattern: '^(IconNode|LucideIcon|LucideProps|SVGAttributes|.+Icon)$',
              message:
                'Import specific *Icon exports instead of generic names. e.g. DownloadIcon instead of Download',
            },
          ],
        },
      ],
      // Prettier rules
      'prettier/prettier': 'error',
    },
  },

  // Base JS configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [js.configs.recommended, prettierConfig],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      'import-x': importXPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Import plugin rules for JS files
      'import-x/no-unresolved': 'error',
      'import-x/named': 'warn',
      'import-x/default': 'error',
      'import-x/namespace': 'error',
      'import-x/export': 'error',
      // Prettier rules
      'prettier/prettier': 'warn',
    },
  },

  // niji-api specific configuration (Ponder)
  // eslint-config-ponder hard-codes `tsconfigRootDir: './'` and
  // `project: true`. The former is rejected as a non-absolute path when
  // lint-staged invokes eslint from the repo root with file arguments, and
  // the latter conflicts with our base config's `projectService: true`.
  // Patch both options on the extended configs before spreading.
  ...compat.extends('ponder').map(cfg => {
    const { project: _project, ...restParserOptions } = cfg.languageOptions?.parserOptions ?? {};
    return {
      ...cfg,
      files: cfg.files ?? ['**/packages/niji-api/**/*.{ts,tsx}'],
      languageOptions: {
        ...cfg.languageOptions,
        parserOptions: {
          ...restParserOptions,
          tsconfigRootDir: __dirname,
        },
      },
    };
  }),
  {
    files: ['**/packages/niji-api/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      ...importXPlugin.configs.typescript.settings,
      'import-x/resolver': {
        ...importXPlugin.configs.typescript.settings['import-x/resolver'],
        typescript: {
          project: 'packages/niji-api/tsconfig.json',
        },
      },
    },
    rules: {
      // Disable import/no-unresolved for Ponder virtual modules
      'import-x/no-unresolved': [
        'error',
        {
          ignore: ['^ponder:'],
        },
      ],
    },
  },

  // Global ignores
  globalIgnores(['**/*.d.ts']),
]);
