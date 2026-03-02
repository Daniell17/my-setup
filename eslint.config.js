import js from '@eslint/js'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.js'],
    rules: {
      ...js.configs.recommended.rules,
    },
  },
]
