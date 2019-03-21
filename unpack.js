const Unpacker = require('./unpacker')
const LocalLoader = require('./local-loader')
const RemoteLoader = require('./remote-loader')

module.exports = async (filepath) => {
  let loader 
  if (filepath.startsWith('http')) {
    loader = new RemoteLoader(filepath)
  } else {
    loader = new LocalLoader(filepath)
  }

  const unpacker = new Unpacker(loader)
  await unpacker.unpack()
}
