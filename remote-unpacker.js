const axios = require('axios')
const Unpacker = require('./local-unpacker')

class RemoteUnpacker extends Unpacker {
  constructor (filename) {
    super(filename)
  }

  loadRange (offset, bytesLength) {
    return new Promise((resolve, reject) => {
      this.readable.on('readable', async () => {
        let buff = null
        // const highWaterMark = this.readable.readableHighWaterMark
        buff = this.readable.read(bytesLength)
        // console.log(bytesLength, highWaterMark, buff &&  buff.length)

        if (buff === null) return

        this.readable.removeAllListeners('readable')
        this.data = buff
        resolve(this.data)
      })
    })
  }
}

module.exports = RemoteUnpacker