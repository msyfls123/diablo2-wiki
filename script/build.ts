import * as fs from 'fs'
import { build } from 'electron-builder'
import rimraf from 'rimraf'
import config from './electron-builder-config'
import path from 'path'
import {
  projectDir,
  outDir,
  distDir,
} from './constants'

const isMacOS = process.platform === 'darwin'
const sourcePackagePath = path.join(projectDir, 'script/app.json')

rimraf(distDir, {}, () => {
  fs.copyFileSync(sourcePackagePath, path.join(outDir, 'package.json'))
  build({
    projectDir: config.directories.app,
    config,
    ...(isMacOS ? {
      mac: ['dmg'],
    } : undefined),
    win: ['nsis'],
  })
})
