const path = require('path')
const fs = require('fs')
const Unpacker = require('./unpacker')
const LocalLoader = require('./local-loader')
const RemoteLoader = require('./remote-loader')

module.exports = async (filepath) => {
  let loader 
  let dst = 'unpack-' + path.basename(filepath).split('.')[0]
  if (filepath.startsWith('http')) {
    loader = new RemoteLoader(filepath)
    dst = path.resolve('./', dst)
  } else {
    loader = new LocalLoader(filepath)
    dst = path.resolve(filepath, '..', dst)
  }

  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst)
  }

  const unpacker = new Unpacker(loader, dst)
  await unpacker.unpack()
}
