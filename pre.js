// 执行 npm install 操作

const { exec } = require('child_process')

exec('npm install', (err, stdout, stderr) => {
  if (err) {
    console.log(err)
  }
  console.log(stdout)
  console.log(stderr)
})