const fs = require('fs')
const Unpacker = require('./local-unpacker')

module.exports = async (filepath) => {
  const unpacker = new Unpacker(filepath)
  await unpacker.unpack()
}
