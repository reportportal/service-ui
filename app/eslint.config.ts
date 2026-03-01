import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import typescript from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';

export default defineConfig([
  globalIgnores([
    'node_modules/',
    'build/',
    'dist/',
    'localization/',
    '.tsbuildinfo',
    '**/coverage/**',
    'package.json',
    'package-lock.json',
    '**/*.min.js',
    // Config files
    'eslint.config.ts',
    '*.config.js',
    '*.config.ts',
    // Setup and script files
    'jestsetup.js',
    'scripts/',
    'src/common/polyfills.js',
    'webpack/',
  ]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        Utils: 'readonly',
      },
    },
  },
  // jest globals
  {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  // Common rules shared between JS and TS configurations
  js.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  jsxA11y.flatConfigs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat['recommended-latest'],
  prettier,
  {
    rules: {
      // Temporary disabled rules that has lot of violations
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/jsx-key': 'off',
      'react/display-name': 'off',
      'react/no-unused-prop-types': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',

      // General rules
      'no-unused-vars': 'off', // lot of unused `React` import
      'no-throw-literal': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-await-in-loop': 'error',
      'no-nested-ternary': 'error',
      'react/no-array-index-key': 'error',
      'react/jsx-boolean-value': 'error',
      'no-plusplus': 'error',
      'global-require': 'error',
      'func-names': 'error',
    },
  },
  // Base config for JavaScript files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
        babelOptions: { presets: ['@babel/preset-react', '@babel/preset-env'] },
        ecmaFeatures: { jsx: true, legacyDecorators: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
  },

  // TypeScript-specific config
  {
    files: ['**/*.{ts,tsx}'],
    extends: [typescript.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/unbound-method': 'off', // conflicts with useIntl types
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    },
    settings: { react: { version: 'detect' } },
  },
]);
