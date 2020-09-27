import path from 'path'
import fs from 'fs'
import typescript from '@rollup/plugin-typescript'
import html from '@rollup/plugin-html'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'

const base = path.resolve()
const outPath = path.join(base, 'out')
const outPagesPath = path.join(outPath, 'pages')

const pages = fs.readdirSync('./src/renderer/pages')

const common = {
  treeshake: process.env.NODE_ENV === 'production',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.js', '.json']
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript(),
  ],
}

export default [
  {
    ...common,
    input: 'src/main-process/main.ts',
    output: {
      dir: outPath,
      format: 'cjs'
    },
    external: ['electron', 'electron-connect']
  },
  ...pages.map((filename) => ({
    ...common,
    plugins: [
      ...common.plugins,
      html({
        fileName: path.basename(filename, '.ts') + '.html',
        title: 'Diablo II ❤ Wiki'
      }),
    ],
    input: `src/renderer/pages/${filename}`,
    output: {
      dir: outPagesPath,
      format: 'iife'
    },
  })),
];
