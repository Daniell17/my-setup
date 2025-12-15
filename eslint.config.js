import js from '@eslint/js'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      ...js.configs.recommended.rules,
    },
  },
]
