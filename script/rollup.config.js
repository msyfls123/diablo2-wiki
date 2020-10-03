import path from 'path'
import fs from 'fs'
import typescript from '@rollup/plugin-typescript'
import svelte from 'rollup-plugin-svelte'
import html from 'rollup-plugin-html2'
import sveltePreprocessor from 'svelte-preprocess'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import css from "rollup-plugin-css-porter"
import copy from 'rollup-plugin-copy'

import {
  srcDir,
  outDir,
  projectDir,
} from './constants'

const outPagesDir = path.join(outDir, 'pages')
const srcPagesDir = path.join(srcDir, 'renderer/pages')
const srcTemplateDir = path.join(srcDir, 'renderer/templates')

const pages = fs.readdirSync(srcPagesDir).map(filename => path.basename(filename, '.ts'))
const isDev = process.env.NODE_ENV === "development"
const isProd = process.env.NODE_ENV === 'production'
const useBundledRx = isDev

const common = {
  treeshake: isProd,
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    typescript({
      sourceMap: isDev,
    }),
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.js', '.json']
    }),
    commonjs({
      include: /node_modules/,
    }),
  ],
}

function genPageConfig(fileBaseName) {
  return {
    ...common,
    plugins: [
      svelte({
        dev: isDev,
        emitCss: true,
        css: function(css) {
          css.write(`${fileBaseName}.css`)
        },
        preprocess: sveltePreprocessor(),
      }),
      html({
        template: path.join(srcTemplateDir, fileBaseName + '.html'),
        fileName: fileBaseName + '.html',
        externals: [
          ...(useBundledRx ? [{
            type: 'js',
            file: "../assets/rxjs.umd.min.js",
            pos: 'before'
          }] : []),
        ]
      }),
      css({
        dest: path.join(outPagesDir, fileBaseName + '.css'),
      }),
      ...common.plugins,
    ],
    input: path.join(srcPagesDir, fileBaseName + '.ts'),
    output: {
      format: 'iife',
      dir: outPagesDir,
      sourcemap: isDev ? 'inline' : false,
      globals: {
        electron: "require('electron')",
        ...(useBundledRx ? {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
        } : {}),
      },
    },
    external: [
      'electron',
      ...(useBundledRx ? ['rxjs', 'rxjs/operators'] : []),
    ],
  }
}

const mainConfig = {
  ...common,
  plugins: [
    ...common.plugins,
    copy({
      targets: [
        {
          src: path.join(srcDir, 'renderer/images/**/*'),
          dest: path.join(outDir, 'images'),
        },
        ...(useBundledRx ? [{
          src: path.join(projectDir, 'node_modules/rxjs/bundles/rxjs.umd.min.js'),
          dest: path.join(outDir, 'assets'),
        }]: [])
      ],
    })
  ],
  input: 'src/main-process/main.ts',
  output: {
    format: 'cjs',
    dir: outDir,
    sourcemap: isDev ? 'inline' : false,
  },
  external: [
    'electron',
    'electron-connect',
    'rxdb',
    'leveldown',
    'pouchdb-adapter-leveldb',
  ]
}

export default [
  mainConfig,
  ...pages.map(genPageConfig)
];
