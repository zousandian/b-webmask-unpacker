const fs = require('fs')

class LoacalLoader {
  constructor (file) {
    this.file = file
  }

  load (offset, bytesLength) {
    const readable = fs.createReadStream(this.file, {
      start: offset,
      end: bytesLength + offset - 1
    })

    let data = Buffer.alloc(0)
    return new Promise((resolve, reject) => {
      readable.on('readable', async () => {
        let buff = readable.read()
        buff && (data = Buffer.concat([data, buff]))
      })

      readable.on('error', (err) => {
        // console.log(err)
        reject(err)
      })

      readable.on('end', () => {
        resolve(data)
      })
    })
  }
}

module.exports = LoacalLoader