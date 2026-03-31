import { defineConfig } from 'tsdown'

export default defineConfig({
  name: 'npm-upstream-check',
  entry: ['src/index.ts'],
  clean: true,
  platform: 'node',
  format: 'cjs',
  fixedExtension: false,
  hash: false,
  deps: {
    alwaysBundle: ['@actions/core'],
    onlyBundle: false,
  },
})
