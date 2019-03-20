const argv = require('yargs').argv
const unpack = require('./unpack')

argv.path && unpack(argv.path)
