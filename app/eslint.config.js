const babelParser = require('@babel/eslint-parser');
const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/localization/messages/**',
      '**/localization/translated/en.json',
      '**/coverage/**',
      'package.json',
      'package-lock.json',
      '**/*.min.js',
      // Config files
      'eslint.config.js',
      '*.config.js',
      '*.config.ts',
      // Setup and script files
      'jestsetup.js',
      'scripts/**',
      'src/common/polyfills.js',
      'webpack/**',
    ],
  },

  // Base config
  js.configs.recommended,

  // Main configuration
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
        ecmaFeatures: {
          jsx: true,
          legacyDecorators: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
        React: 'readonly',
        Utils: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        webpack: {
          config: 'webpack.config.js',
        },
      },
    },
    rules: {
      // Airbnb base rules (manually selected most important ones)
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,

      // Custom overrides
      'arrow-body-style': 0,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        caughtErrors: 'none'
      }],
      'jsx-a11y/no-static-element-interactions': 0,
      'no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
      'jsx-a11y/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
      'jsx-a11y/tabindex-no-positive': 0,
      'jsx-a11y/no-noninteractive-tabindex': 0,
      'jsx-a11y/anchor-is-valid': 0,
      'jsx-a11y/control-has-associated-label': 0,
      'import/prefer-default-export': 0,
      'import/no-extraneous-dependencies': 0,
      'react/no-unused-prop-types': 0,
      'react/react-in-jsx-scope': 0,
      'react/forbid-prop-types': 0,
      'react/jsx-no-target-blank': 0,
      'react/destructuring-assignment': 0,
      'react/static-property-placement': 0,
      'react/jsx-props-no-spreading': 0,
      'no-restricted-globals': 0,
      'prefer-destructuring': 0,
      'react/jsx-curly-brace-presence': 0,
      'react/no-access-state-in-setstate': 0,
      'react/state-in-constructor': 0,
      'react/jsx-fragments': 0,
      'import/no-cycle': 0,
      'import/named': 0,
      'no-else-return': 0,
      'react/button-has-type': 0,
      'lines-between-class-members': 0,
      'react/default-props-match-prop-types': 0,
      'react/require-default-props': 0,
      'react/display-name': 0,
      'jsx-a11y/click-events-have-key-events': 0,
      'jsx-a11y/mouse-events-have-key-events': 0,
      'react/no-unused-state': 0,
      'react/sort-comp': 0,
      'import/no-useless-path-segments': 0,
      'no-invalid-this': 0,
      'prefer-object-spread': 0,
      'react-hooks/rules-of-hooks': 2,
      'react-hooks/exhaustive-deps': 1,
      'react-hooks/static-components': 1,
      'react-hooks/preserve-manual-memoization': 0,
      'react-hooks/set-state-in-effect': 1,
      'react-hooks/purity': 1,
      'react-hooks/immutability': 1,
    },
  },

  // Prettier config (must be last to override other configs)
  eslintConfigPrettier,
];
