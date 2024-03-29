const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { swc, defineRollupSwcOption } = require('rollup-plugin-swc3');
const postcss = require('rollup-plugin-postcss');
const hotcss = require('rollup-plugin-hot-css');
const commonjs = require('rollup-plugin-commonjs-alternate');
const staticFiles = require('rollup-plugin-static-files');
const refresh = require('rollup-plugin-react-refresh');

const config = {
  input: './example/src/main.tsx',
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].[hash].js',
    assetFileNames: '[name].[hash][extname]'
  },
  plugins: [
    postcss(),
    hotcss({
      hot: process.env.NODE_ENV === 'development',
      filename: 'styles.css'
    }),
    swc(defineRollupSwcOption({
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true
        },
        transform: {
          react: {
            runtime: 'automatic',
            refresh: process.env.NODE_ENV === 'development'
          },
          optimizer: {
            globals: {
              vars: {
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
              }
            }
          }
        }
      }
    })),
    commonjs({
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    nodeResolve(),
    process.env.NODE_ENV === 'development' && refresh()
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins = config.plugins.concat([
    staticFiles({
      include: ['./example/public']
    })
  ]);
}

module.exports = config;
