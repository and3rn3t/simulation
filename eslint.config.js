import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        screen: 'readonly',
        // Node.js globals for build tools
        require: 'readonly',
        NodeJS: 'readonly',
        // Web Workers
        self: 'readonly',
        importScripts: 'readonly',
        postMessage: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': 'warn', // Changed from error to warn
      '@typescript-eslint/no-explicit-any': 'off', // Disabled for now
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // General JavaScript rules
      'no-console': 'off', // Allow console for debugging
      'no-debugger': 'error',
      'no-duplicate-imports': 'warn', // Changed from error to warn
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-template': 'warn', // Changed from error
      'object-shorthand': 'warn', // Changed from error
      'prefer-arrow-callback': 'warn', // Changed from error
      'no-unused-vars': 'off', // Let TypeScript handle this
      'no-redeclare': 'warn', // Changed from error
      'no-case-declarations': 'warn', // Changed from error
      'no-return-await': 'warn', // Changed from error

      // Code complexity rules - very relaxed for now
      complexity: 'off', // Disabled
      'max-depth': 'off', // Disabled
      'max-lines-per-function': 'off', // Disabled
      'max-params': 'off', // Disabled

      // Best practices
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      'prefer-promise-reject-errors': 'error',
    },
  },
  {
    files: ['scripts/**/*.js', 'scripts/**/*.mjs', 'scripts/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module', // ES modules for .mjs files
      globals: {
        // Node.js globals
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'public/**'],
  },
];
