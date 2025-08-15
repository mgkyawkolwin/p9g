import next from '@next/eslint-plugin-next';
import typescript from '@typescript-eslint/eslint-plugin';

export default [
  {
    plugins: {
      '@next/next': next,
      '@typescript-eslint': typescript,
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
];
