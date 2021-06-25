'use strict'

const stream = require('stream')

// 0x04224D18
const magic = Buffer.from('04224D18', 'hex')

class BinwalkLZ4Stream extends stream.Transform {
  constructor(opts = {}) {
    super({
      readableObjectMode: true
    , writableObjectMode: false
    })

    this._chunk = null
    this._current_offset = opts.start || 0
    this._byte_one = null
    this._byte_two = null
    this._byte_three = null
    this._byte_four = null
  }

  _parseChunk(fragment) {
    for (let i = 0; i < fragment.length; i++) {
      const byte = fragment[i]
      this._byte_one = this._byte_two
      this._byte_two = this._byte_three
      this._byte_three = this._byte_four
      this._byte_four = byte

      this._current_offset++

      if (this._byte_one !== magic[0]) continue
      if (this._byte_two !== magic[1]) continue
      if (this._byte_three !== magic[2]) continue
      if (this._byte_four !== magic[3]) continue

      this.push(this._current_offset - 4)
    }
  }

  _transform(chunk, encoding, cb) {
    this._parseChunk(chunk)

    process.nextTick(cb)
  }
}

module.exports = BinwalkLZ4Stream
