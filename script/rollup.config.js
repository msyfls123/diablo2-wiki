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

import {
  srcDir,
  outDir,
} from './constants'

const outPagesDir = path.join(outDir, 'pages')
const srcPagesDir = path.join(srcDir, 'renderer/pages')
const srcTemplateDir = path.join(srcDir, 'renderer/templates')

const pages = fs.readdirSync(srcPagesDir).map(filename => path.basename(filename, '.ts'))
const isDev = process.env.NODE_ENV === "development"
const isProd = process.env.NODE_ENV === 'production'

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
        // externals: [
        //   { type: 'js', file: "file1.js", pos: 'before' },
        //   { type: 'js', file: "file2.js", pos: 'before' }
        // ]
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
    },
  }
}

export default [
  {
    ...common,
    input: 'src/main-process/main.ts',
    output: {
      format: 'cjs',
      dir: outDir,
      sourcemap: isDev ? 'inline' : false,
    },
    external: ['electron', 'electron-connect']
  },
  ...pages.map(genPageConfig)
];
