import * as path from 'path'
import { Configuration } from 'electron-builder'
import * as projectPackage from '../package.json'

import {
  projectDir,
  distDir,
} from './constants'


const config: Configuration = {
  directories: {
    output: distDir,
    buildResources: projectDir,
  },
  asar: false,
  electronVersion: projectPackage.devDependencies.electron,
  appId: 'cc.ebichu.diablo2-wiki',
  productName: 'Diablo II Wiki',
  artifactName: 'DiabloII-Wiki.${ext}',
  mac: {
    icon: path.join(projectDir, 'static/logo.icns'),
  },
  win: {
    icon: path.join(projectDir, 'static/logo.ico'),
  }
}

export default config
