const pako = require('pako')

const MASK_FILE_TAG = 'MASK'
const MASK_FILE_VERSION = 1
const MASK_FILE_CHECKCODE = 2 


class Unpacker {
  constructor (dataLoader) {
    this.loader = dataLoader
    this.buffer = Buffer.alloc(0)
    this.segmentsData = []
    this.masksData = []
  }

  async loadRange (offset, bytesLength) {
    const data = await this.loader.load(offset, bytesLength)
    // console.log(data, data.length)
    return data
  }

  async checkFileType () {
    this.buffer = await this.loadRange(0, 16)
    // 前 4 个字节表示 tag
    // const tag = this.buffer.toString('utf8', 0, 4)
    const tag = this.buffer.slice(0, 4).toString()
    // 5-8 字节表示 version
    const version = this.buffer.readInt32BE(4)
    // 第 9 字节表示校验码
    const checkcode = this.buffer.readInt8(8)
    if (tag !== MASK_FILE_TAG ||
      version !== MASK_FILE_VERSION ||
      checkcode !== MASK_FILE_CHECKCODE
    ) {
      throw new Error('not a valid webmask file')
    }

    return true
  }

  async parseSegments () {
    // 13-16 字节表示分段数量，每段10秒钟
    const segments = this.buffer.readInt32BE(12)
    // 每段 16 个字节，前 8 个字节表示时间，后 8 个字节表示 offset
    const segmentsBytes = segments * 16

    this.buffer = await this.loadRange(16, segmentsBytes)
    for (let i = 0; i < segmentsBytes; i += 16) {
      if (0 === this.buffer.readInt32BE(i) && 
        0 === this.buffer.readInt32BE(i + 8)) 
      {
        this.segmentsData.push({
          time: this.buffer.readInt32BE(i + 4),
          offset: this.buffer.readInt32BE(i + 12)
        })
      }
    }

    // 用于解析最后一个 segment
    this.segmentsData.push({
      time: 0,
      offset: Infinity
    }) 

    console.log('共包含段：', this.segmentsData.length - 1)
  }
    
  async parseMasks () {
    for (let i = 0; i < this.segmentsData.length - 1; i++) {
      const offset = this.segmentsData[i].offset
      const offsetNext = this.segmentsData[i + 1].offset
      const length = offsetNext - offset
      this.buffer = await this.loadRange(offset, length)
      this.masksData = this.masksData.concat(this.parseSegmentMasks(this.buffer))
    }

    console.log('共包含蒙版数量：', this.masksData.length)
  }

  parseSegmentMasks (segment) {
    const inflatedData = Buffer.from(pako.inflate(segment))
    // console.log(inflatedData)
    const arr = []
    for (let i = 0; i < inflatedData.length;) {
      var offset = inflatedData.readInt32BE(i)
      var time = inflatedData.readInt32BE(i + 8) 
      arr.push({
        time,
        data: inflatedData.slice(i + 12, i + 12 + offset).toString()
      })

      i = i + 12 + offset
    }

    return arr
  }

  destroy () {
    this.readable = null
    this.buffer = null
  }

  async unpack () {
    try {
      const isPass = await this.checkFileType()
      if (!isPass) return this.destroy()
      await this.parseSegments()
      await this.parseMasks()
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = Unpacker