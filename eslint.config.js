//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: ['eslint.config.js', 'prettier.config.js', 'e2e/.artifacts/**'],
  },
  ...tanstackConfig,
  { files: ['**/*.ts', '**/*.tsx'], rules: { 'no-console': 'warn' } },
]
