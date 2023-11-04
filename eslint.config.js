// @ts-check
const lightwing = require('@lightwing/eslint-config').default

module.exports = lightwing(
  {
    ignores: [
      'dist',
      'node_modules',
      '*.svelte',
      '*.snap',
      '*.d.ts',
      'coverage',
      '*.md',
      'pre.js',
    ],
  },
  {
    rules: {
      'ts/no-require-imports': 'off',
    },
  },
)
