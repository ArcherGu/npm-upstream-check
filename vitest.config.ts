import type { UserConfig } from 'vitest'

const config: { test: UserConfig } = {
  test: {
    testTimeout: 30 * 1000,
  },
}

export default config
