import { defineConfig } from 'tsdown'

export default defineConfig({
  name: 'npm-upstream-check',
  entry: ['src/index.ts'],
  clean: true,
  platform: 'node',
  format: 'cjs',
  outputOptions: {
    codeSplitting: false,
  },
  fixedExtension: false,
  hash: false,
  deps: {
    alwaysBundle: ['@actions/core', 'npm-check-updates'],
    onlyBundle: false,
  },
})
