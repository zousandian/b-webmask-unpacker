const axios = require('axios')

class RemoteLoader {
  constructor (file) {
    this.file = file
    this.client = axios.create({
      responseType: 'arraybuffer'
    })
  }

  load (offset, bytesLength) {
    const range = `bytes=${offset}-${bytesLength === Infinity ? '' : (bytesLength + offset - 1)}`
    this.client.defaults.headers.common['range'] = range
    return new Promise((resolve, reject) => {
      this.client.get(this.file).then(res => {
        resolve(res.data)
      }).catch(err => {
        // console.log(err)
        reject(err)
      })
    })
  }
}

module.exports = RemoteLoader