'use strict'

const crypto = require('crypto')
const {once} = require('events')
const fs = require('fs')
const path = require('path')
const stream = require('stream')
const {promisify} = require('util')
const lz4 = require('lz4')
const tap = require('tap')
const OffsetStream = require('./index.js')

const pipeline = promisify(stream.pipeline)

function generateRandomData() {
  const len = Math.random() * 100 | 0
  const bytes = crypto.randomBytes(len)
  return bytes
}

tap.test('LZ4OffsetStream()', async (t) => {
  const items = []
  const encoded = []
  const expected_offsets = []
  let total_length = 0

  const dir = t.testdir()
  const file = path.join(dir, 'testfile.lz4')
  const ws = fs.createWriteStream(file)

  const message_count = 20
  expected_offsets.push(0)

  for (let i = 0; i < message_count; i++) {
    const item = generateRandomData()
    items.push(item)
    const payload = lz4.encode(item)
    ws.write(payload)
    total_length += payload.length
    encoded.push(payload)

    if (i !== message_count - 1)
      expected_offsets.push(total_length)
  }

  const magic = Buffer.from('04224D18', 'hex')
  ws.write(magic.slice(0, 1))
  ws.write(magic.slice(0, 2))
  ws.write(magic.slice(0, 3))
  ws.write(magic.slice(0, 4))

  expected_offsets.push(total_length + 6)
  ws.end()
  await once(ws, 'close')

  const decoder = new OffsetStream()
  const stream = fs.createReadStream(file)

  const offsets = []
  decoder.on('data', (offset) => {
    offsets.push(offset)
  })

  await pipeline(stream, decoder)

  t.same(offsets, expected_offsets, 'expected offsets match')
})
