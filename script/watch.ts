import * as rollup from 'rollup'
import * as path from 'path'
import gulp from 'gulp'
import configs from '../rollup.config'
import connect from 'electron-connect'
const electron = connect.server.create()

const outDir = path.join(__dirname, '../out')

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
        electron.restart([], () => {
          // don't know why, just delay done
          setTimeout(done, 1000)
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
