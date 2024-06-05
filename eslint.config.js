'use strict';

module.exports = require('eslint-config-sukka').sukka(
  {},
  {
    rules: {
      '@eslint-react/naming-convention/filename': 'off'
    }
  },
  {
    files: ['example/**/*'],
    rules: {
      'ssr-friendly/no-dom-globals-in-module-scope': 'off'
    }
  }
);
