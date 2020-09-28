import * as rollup from 'rollup'
import gulp from 'gulp'
import configs from '../rollup.config'
import connect from 'electron-connect'
import { outDir } from './constants'

const electron = connect.server.create()

function watch(configs) {
  const watcher = rollup.watch(configs)
  let started = false

  watcher.on('event', event => {
    if (event.code === 'END' && !started) {
      // Start browser process
      electron.start()
      // Restart browser process
      gulp.watch([
        '**/*',
        '!pages/**/*',
      ], { cwd: outDir }, (done) => {
        electron.restart([], (state) => {
          if (state === 'restarted') {
            done()
          }
        })
      })
    
      // Reload renderer process
      gulp.watch([
        'pages/**/*'
      ], { cwd: outDir }, (done) => {
        electron.reload()
        // 3000ms is hard coded in electron-connect
        setTimeout(done, 3000)
      })

      started = true
    }
  })
}

watch(configs)
