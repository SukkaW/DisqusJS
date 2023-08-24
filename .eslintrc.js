module.exports = {
  root: true,
  ignorePatterns: 'dist/**',
  overrides: [
    {
      files: ['**/*.js', '**/*.jsx'],
      extends: [
        'sukka/node'
      ],
      env: {
        es6: true
      },
      parserOptions: {
        ecmaVersion: 2021
      },
      rules: {
        'node/no-unpublished-require': 'off',
        'linebreak-style': ['error', process.platform === 'win32' ? 'win32' : 'unix']
      }
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'sukka/react',
        'sukka/typescript'
      ],
      plugins: [
        'react-hooks'
      ],
      parserOptions: {
        project: [
          './tsconfig.json'
        ]
      }
    }
  ]
};
