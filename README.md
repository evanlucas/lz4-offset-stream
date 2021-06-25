# lz4-offset-stream

> Node.js stream that emits lz4 segment offsets

Ever wanted to try and recover a file containing lz4 segments?
If so, this is for you. This is a node Transform stream that emits data events.
The argument emitted in the data event is a number, which is the start offset of a
lz4 segment.

## Install

```console
$ npm install [--save] lz4-offset-stream
```

## Tests

```console
$ npm test
```

## Usage

```js
'use strict'

const stream = require('stream')
const fs = require('fs')
const OffsetStream = require('lz4-offset-stream')

const start = process.env.OFFSET
  ? +process.env.OFFSET
  : 0

const fd = fs.createWriteStream('./file', {start})
const decoder = new OffsetStream({start})
pipeline(fd, decoder, process.stdout, (err) => {
  console.log('done', err)
})
```

## License

SEE LICENSE IN LICENSE

## Author

Evan Lucas
