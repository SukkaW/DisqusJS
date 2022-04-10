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

const outputMatrix = (config: {
  input: string;
  format: 'iife' | 'umd' | 'es' | 'cjs';
  minify: boolean,
  target: JscTarget,
  bundle: boolean,
  dev: boolean,
  browser: boolean,
  dts: boolean,
  dir?: string,
  preact: boolean,
  visualizer?: boolean,
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
      external: config.bundle ? undefined : ['react', 'react/jsx-runtime', 'react-dom', 'swr/immutable', 'swr/infinite', 'preact', 'preact/compat', 'preact/jsx-runtime', 'jotai'],
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
        replace({
          preventAssignment: true,
          'process.env.NODE_ENV': config.dev ? JSON.stringify('development') : JSON.stringify('production'),
          ...(config.browser && {
            'typeof window': JSON.stringify('object')
          })
        }),
        postcss({
          modules: true,
          extract: !config.bundle,
          minimize: true,
          plugins: []
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
                importSource: config.preact ? 'preact' : 'react'
              },
              optimizer: {
                globals: {
                  vars: {
                    'process.env.NODE_ENV': JSON.stringify('production')
                  }
                }
              }
            },
            externalHelpers: true,
            target: 'es2015',
            minify: config.minify
              ? { module: false }
              : undefined
          },
          minify: config.minify
        })),
        process.env.ANALYZE === 'true' && config.visualizer && visualizer()
      ]
    }
  ];

  if (config.dts) {
    rollupOpts.push({
      input: config.input,
      cache,
      output: {
        file: `${filenameBase}.d.ts`
      },
      plugins: [
        dts()
      ]
    });
  }

  return rollupOpts;
};

const buildConfig: RollupOptions[] = [
  // For browser script tag only, no dts
  ...(['es2015', 'es2017'] as const).map(target => outputMatrix({
    input: 'src/browser.tsx',
    format: 'iife',
    minify: true,
    target,
    dev: false,
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
        dev: false,
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
    dev: false,
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
    dev: false,
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
          dev: false,
          bundle: false,
          browser: false,
          dts: true,
          dir: 'dist/react',
          preact: false
        }),
        outputMatrix({
          input: 'src/index.tsx',
          format,
          minify: false,
          target,
          dev: false,
          bundle: false,
          browser: false,
          dts: true,
          dir: 'dist/preact',
          preact: true
        })
      ]
    )
  )
].flat();

export default buildConfig;
