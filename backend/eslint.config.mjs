// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Les endpoints /map et /statistics lisent des agrégats SQL bruts via
      // getRawMany(), dont le type de retour est Any par construction. Sans un
      // mapping explicite vers des interfaces, ces règles ne peuvent être que
      // des faux positifs : on les garde en avertissement pour rester visibles.
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',

      // Les mocks Jest sont déclarés `async` pour renvoyer une promesse, sans
      // await à l'intérieur.
      '@typescript-eslint/require-await': 'off',

      // Permet le motif d'omission `const { secret, ...rest } = obj`, où la
      // variable destructuree sert précisément à être écartée.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],

      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    // Les mocks de tests manipulent des Any par nature.
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
);
