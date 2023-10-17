import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'npm-upstream-check',
  entry: ['src/index.ts'],
  clean: true,
  splitting: false
})
