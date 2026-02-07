//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  { ignores: ['eslint.config.js', 'prettier.config.js'] },
  ...tanstackConfig,
  { files: ['**/*.ts', '**/*.tsx'], rules: { 'no-console': 'warn' } },
]
