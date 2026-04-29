module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/assets/optimized/**'],
  },
  {
    files: ['scripts/**/*.js', 'config.js', 'public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        console: 'readonly',
        document: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        self: 'readonly',
        window: 'readonly',
        Worker: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
