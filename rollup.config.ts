import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import dts from 'rollup-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

import type { RollupCache, RollupOptions } from 'rollup';
import type { JscTarget } from '@swc/core';

let cache: RollupCache;

const dtsOutput: Record<string, Set<string>> = {};

const outputMatrix = (config: {
  input: string;
  format: 'iife' | 'umd' | 'es' | 'cjs';
  minify: boolean,
  target: JscTarget,
  bundle: boolean,
  prod: boolean,
  browser: boolean,
  dts: boolean,
  dir?: string,
  preact: boolean,
  visualizer?: boolean
}): RollupOptions[] => {
  const filenameBase = `${config.dir ?? 'dist'}/disqusjs${config.browser ? '.browser' : ''}.${config.target}.${config.format}${config.minify ? '.min' : ''}`;
  const ext = config.format === 'es' ? 'mjs' : 'js';

  const rollupOpts: RollupOptions[] = [
    {
      input: config.input,
      cache,
      output: {
        format: config.format,
        file: `${filenameBase}.${ext}`,
        sourcemap: false,
        ...((config.format === 'iife' || config.format === 'umd') && {
          name: 'DisqusJS'
        })
      },
      plugins: [
        config.preact && alias({
          entries: {
            react: 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react-dom': 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime'
          }
        }),
        nodeResolve(),
        commonjs(),
        (config.prod || config.browser) && replace({
          preventAssignment: true,
          ...(config.prod && {
            'process.env.NODE_ENV': JSON.stringify('production'),
            'import.meta.env && import.meta.env.MODE': JSON.stringify('production')
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
              },
              optimizer: {}
            },
            externalHelpers: true,
            target: config.target,
            minify: config.minify
              ? { compress: {}, mangle: {} }
              : undefined
          },
          minify: config.minify
        })),
        process.env.ANALYZE === 'true' && config.visualizer && visualizer()
      ],
      external: config.bundle ? undefined : ['react', 'react/jsx-runtime', 'react-dom', 'preact', 'preact/compat', 'preact/jsx-runtime', 'jotai']
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

const buildConfig: RollupOptions[] = [
  // For browser script tag only, no dts
  ...(['es2015', 'es2017'] as const).map(target => outputMatrix({
    input: 'src/browser.tsx',
    format: 'iife',
    minify: true,
    target,
    prod: true,
    bundle: true,
    browser: true,
    dts: false,
    preact: true
  })),
  // For browserify, webpack, Node.js SSR library in CJS environment
  ...(['es2015', 'es2017', 'es2022'] as const).flatMap(
    target => [true, false].map(
      browser => outputMatrix({
        input: 'src/browser.tsx',
        format: 'umd',
        minify: false,
        target,
        prod: true,
        bundle: true,
        browser,
        dts: true,
        preact: true,
        visualizer: target === 'es2015' && browser
      })
    )
  ),
  // For browser script[module] tag only, no dts
  outputMatrix({
    input: 'src/browser.tsx',
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
    input: 'src/browser.tsx',
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
          input: 'src/index.tsx',
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
    // eslint-disable-next-line no-bitwise
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  // eslint-disable-next-line no-bitwise
  return hash >>> 0;
}

export default buildConfig;
