import lightwing from '@lightwing/eslint-config'

export default lightwing(
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
