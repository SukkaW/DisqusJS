import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import { dts } from 'rollup-plugin-dts';
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer';

import type { RollupCache, RollupOptions } from 'rollup';
import type { JscTarget } from '@swc/core';

let cache: RollupCache;

const dtsOutput: Record<string, Set<string>> = {};

const noBundleExternal = ['react', 'react-dom', 'preact', 'foxact'];

const outputMatrix = (config: {
  input: string,
  format: 'iife' | 'umd' | 'es' | 'cjs',
  minify: boolean,
  target: JscTarget,
  bundle: boolean,
  prod: boolean,
  browser: boolean,
  dts: boolean,
  dir?: string,
  preact: boolean
}): RollupOptions[] => {
  const filenameBase = `${config.dir ?? 'dist'}${config.browser ? '/browser' : ''}/disqusjs.${config.target}.${config.format}${config.minify ? '.min' : ''}`;

  const rollupOpts: RollupOptions[] = [
    {
      input: config.input,
      cache,
      output: config.format === 'es'
        ? ([`${filenameBase}.js`, `${filenameBase}.mjs`] as const).map(file => ({
          format: config.format,
          file,
          sourcemap: false,
          ...((config.format === 'iife' || config.format === 'umd') && {
            name: 'DisqusJS'
          })
        }))
        : {
          format: config.format,
          file: `${filenameBase}.js`,
          sourcemap: false,
          ...((config.format === 'iife' || config.format === 'umd') && {
            name: 'DisqusJS'
          })
        },
      plugins: [
        config.preact && alias({
          entries: [
            { find: 'react', replacement: 'preact/compat' },
            { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
            { find: 'react-dom', replacement: 'preact/compat' },
            { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' }
          ]
        }),
        commonjs({
          esmExternals: true
        }),
        nodeResolve({
          exportConditions: ['import', 'module', 'require', 'default']
        }),
        (config.prod || config.browser) && replace({
          preventAssignment: true,
          ...(config.prod && {
            'process.env.NODE_ENV': JSON.stringify('production')
            // 'import.meta.env && import.meta.env.MODE': JSON.stringify('production')
          }),
          ...(config.browser && {
            'typeof window': JSON.stringify('object')
          })
        }),
        postcss({
          modules: {
            generateScopedName(name: string, filename: string, css: string) {
              return `__${name}_${stringHash(css).toString(36).slice(0, 6)}`;
            }
          },
          extract: 'styles/disqusjs.css',
          minimize: true
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
                importSource: 'react'
              }
            },
            externalHelpers: true,
            target: config.target,
            minify: config.minify
              ? { compress: { unsafe: true }, mangle: true, module: true }
              : undefined
          },
          minify: config.minify,
          module: {
            type: 'es6'
          }
        })),
        process.env.ANALYZE === 'true' && bundleAnalyzer({})
      ],
      external: config.bundle
        ? undefined
        : (id) => {
          return (
            noBundleExternal.includes(id)
            || noBundleExternal.some(dep => id.startsWith(`${dep}/`))
          );
        }
    }
  ];

  if (config.dts) {
    dtsOutput[config.input] ??= new Set();
    dtsOutput[config.input].add(`${filenameBase}.d.ts`);
  }

  return rollupOpts;
};

const dtsMatrix = (): RollupOptions[] => {
  return Object.keys(dtsOutput).map(input => {
    return {
      input,
      cache,
      output: [...dtsOutput[input]].map(file => ({
        file
      })),
      plugins: [
        dts()
      ]
    };
  });
};

const buildConfig: RollupOptions[] = process.env.ANALYZE === 'true'
  ? outputMatrix({
    input: './src/browser.tsx',
    format: 'umd',
    minify: true,
    target: 'es2015',
    prod: true,
    bundle: true,
    browser: true,
    dts: false,
    preact: true
  })
  : [
    // For browser script tag only, no dts
    outputMatrix({
      input: './src/browser.tsx',
      format: 'umd',
      minify: true,
      target: 'es2015',
      prod: true,
      bundle: true,
      browser: true,
      dts: false,
      preact: true
    }),
    // For browserify, webpack, Node.js SSR library in CJS environment
    ...(['es2015', 'es2017', 'es2022'] as const).flatMap(
      target => (['es', 'umd'] as const).map(format => outputMatrix({
        input: './src/browser.tsx',
        format,
        minify: false,
        target,
        prod: true,
        bundle: true,
        browser: false,
        dts: true,
        preact: true
      }))
    ),
    ...(['es2015', 'es2017', 'es2022'] as const).map(
      target => outputMatrix({
        input: './src/browser.tsx',
        format: 'es',
        minify: false,
        target,
        prod: true,
        bundle: true,
        browser: false,
        dts: true,
        preact: true
      })
    ),
    // For browser script[module] tag only, no dts
    outputMatrix({
      input: './src/browser.tsx',
      format: 'es',
      minify: true,
      target: 'es2018',
      prod: true,
      bundle: true,
      browser: true,
      dts: false,
      preact: true
    }),
    // For rollup, webpack, Node.js, Deno. ESM, dts, es2022
    outputMatrix({
      input: './src/browser.tsx',
      format: 'es',
      minify: false,
      target: 'es2022',
      prod: true,
      bundle: true,
      browser: false,
      dts: true,
      preact: true
    }),
    ...(['cjs', 'es'] as const).flatMap(
      format => (['es2015', 'es2017', 'es2022'] as const).flatMap(
        target => [
          outputMatrix({
            input: './src/index.tsx',
            format,
            minify: false,
            target,
            prod: false,
            bundle: false,
            browser: false,
            dts: true,
            dir: 'dist/react',
            preact: false
          })
        ]
      )
    ),
    dtsMatrix()
  ].flat();

function stringHash(str: string) {
  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */

  return hash >>> 0;
}

export default buildConfig;
