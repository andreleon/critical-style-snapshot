(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"buffer":2,"rH1JPG":4}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/buffer/index.js","/../../node_modules/buffer")
},{"base64-js":1,"buffer":2,"ieee754":3,"rH1JPG":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"buffer":2,"rH1JPG":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/process/browser.js","/../../node_modules/process")
},{"buffer":2,"rH1JPG":4}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showPopup = undefined;

var _getMatchedCssRules = require('../polyfills/get-matched-css-rules.jsx');

var _getMatchedCssRules2 = _interopRequireDefault(_getMatchedCssRules);

var _CriticalCSS = require('../generators/CriticalCSS.jsx');

var _CriticalCSS2 = _interopRequireDefault(_CriticalCSS);

var _selectText = require('../utilities/selectText.jsx');

var _selectText2 = _interopRequireDefault(_selectText);

var _removeDocumentStyles = require('../utilities/removeDocumentStyles.jsx');

var _removeDocumentStyles2 = _interopRequireDefault(_removeDocumentStyles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generates the popup with wich the user will interact
function showPopup() {
    var copyGeneratedStylesheet = function copyGeneratedStylesheet(event) {
        event.preventDefault();
        event.stopPropagation();

        (0, _selectText2.default)('CriticalSnap__output-css');
        document.execCommand('copy');
        copyButton.style.backgroundColor = "#34A853";
        copyButton.style.color = "#fff";
        copyButton.innerHTML = "Copied <span>👍</span>";
    };

    var previewGeneratedStylesheet = function previewGeneratedStylesheet(event) {
        event.preventDefault();
        event.stopPropagation();

        (0, _removeDocumentStyles2.default)();

        var previewStyle = document.createElement('style');
        previewStyle.innerHTML = stylesheet;
        document.getElementsByTagName('head')[0].appendChild(previewStyle);

        previewButton.removeEventListener('click', previewGeneratedStylesheet);
        previewButton.remove();

        minifyPopup();
    };

    var selectGeneratedStylesheet = function selectGeneratedStylesheet(event) {
        event.preventDefault();
        event.stopPropagation();
        (0, _selectText2.default)('CriticalSnap__output-css');
    };

    var closePopup = function closePopup(event) {
        if (event) event.preventDefault();
        destroyPopup();
    };

    var createPopup = function createPopup(content) {
        var popup = document.createElement('div');
        popup.id = 'CriticalSnap';

        var divHTML = '';
        divHTML += '<div><h1>Critical Snapshot</h1>';
        divHTML += '<p id="CriticalSnap__output-css">';
        divHTML += content;
        divHTML += '</p>';
        divHTML += '<div id="CriticalSnap__buttons">';
        divHTML += '<button type="button" class="CriticalSnap__button" id="CriticalSnap__copy">Copy</button>';
        divHTML += '<button type="button" class="CriticalSnap__button" id="CriticalSnap__preview">Preview</button>';
        divHTML += '<button type="button" class="CriticalSnap__button" id="CriticalSnap__close">Close</button>';
        divHTML += '</div>';
        divHTML += '</div>';

        popup.innerHTML = divHTML;

        return popup;
    };

    var minifyPopup = function minifyPopup() {
        popup.className = 'CriticalSnap__minified';
    };

    var destroyPopup = function destroyPopup() {
        copyButton.removeEventListener('click', copyGeneratedStylesheet);
        previewButton.removeEventListener('click', previewGeneratedStylesheet);
        outputElement.removeEventListener('click', selectGeneratedStylesheet);
        containerElement.removeEventListener('click', closePopup);
        popup.remove();
    };

    // scroll to top before generating CSS
    document.body.scrollTop = 0;

    var snapshot = new _CriticalCSS2.default(window, document);
    var stylesheet = snapshot.generate();

    var popup = createPopup(stylesheet);
    document.body.appendChild(popup);

    var copyButton = document.getElementById('CriticalSnap__copy');
    var previewButton = document.getElementById('CriticalSnap__preview');
    var outputElement = document.getElementById('CriticalSnap__output-css');
    var containerElement = document.getElementById('CriticalSnap');

    copyButton.addEventListener('click', copyGeneratedStylesheet);
    previewButton.addEventListener('click', previewGeneratedStylesheet);
    outputElement.addEventListener('click', selectGeneratedStylesheet);
    containerElement.addEventListener('click', closePopup);
};

exports.showPopup = showPopup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBvcHVwLmpzeCJdLCJuYW1lcyI6WyJzaG93UG9wdXAiLCJjb3B5R2VuZXJhdGVkU3R5bGVzaGVldCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJkb2N1bWVudCIsImV4ZWNDb21tYW5kIiwiY29weUJ1dHRvbiIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwiY29sb3IiLCJpbm5lckhUTUwiLCJwcmV2aWV3R2VuZXJhdGVkU3R5bGVzaGVldCIsInByZXZpZXdTdHlsZSIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZXNoZWV0IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJhcHBlbmRDaGlsZCIsInByZXZpZXdCdXR0b24iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlIiwibWluaWZ5UG9wdXAiLCJzZWxlY3RHZW5lcmF0ZWRTdHlsZXNoZWV0IiwiY2xvc2VQb3B1cCIsImRlc3Ryb3lQb3B1cCIsImNyZWF0ZVBvcHVwIiwiY29udGVudCIsInBvcHVwIiwiaWQiLCJkaXZIVE1MIiwiY2xhc3NOYW1lIiwib3V0cHV0RWxlbWVudCIsImNvbnRhaW5lckVsZW1lbnQiLCJib2R5Iiwic2Nyb2xsVG9wIiwic25hcHNob3QiLCJ3aW5kb3ciLCJnZW5lcmF0ZSIsImdldEVsZW1lbnRCeUlkIiwiYWRkRXZlbnRMaXN0ZW5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBLFNBQVNBLFNBQVQsR0FBcUI7QUFDakIsUUFBSUMsMEJBQTBCLFNBQTFCQSx1QkFBMEIsQ0FBU0MsS0FBVCxFQUFnQjtBQUMxQ0EsY0FBTUMsY0FBTjtBQUNBRCxjQUFNRSxlQUFOOztBQUVBLGtDQUFXLDBCQUFYO0FBQ0FDLGlCQUFTQyxXQUFULENBQXFCLE1BQXJCO0FBQ0FDLG1CQUFXQyxLQUFYLENBQWlCQyxlQUFqQixHQUFtQyxTQUFuQztBQUNBRixtQkFBV0MsS0FBWCxDQUFpQkUsS0FBakIsR0FBeUIsTUFBekI7QUFDQUgsbUJBQVdJLFNBQVgsR0FBdUIsd0JBQXZCO0FBQ0gsS0FURDs7QUFXQSxRQUFJQyw2QkFBNkIsU0FBN0JBLDBCQUE2QixDQUFTVixLQUFULEVBQWdCO0FBQzdDQSxjQUFNQyxjQUFOO0FBQ0FELGNBQU1FLGVBQU47O0FBRUE7O0FBRUEsWUFBSVMsZUFBZVIsU0FBU1MsYUFBVCxDQUF1QixPQUF2QixDQUFuQjtBQUNBRCxxQkFBYUYsU0FBYixHQUF5QkksVUFBekI7QUFDQVYsaUJBQVNXLG9CQUFULENBQThCLE1BQTlCLEVBQXNDLENBQXRDLEVBQXlDQyxXQUF6QyxDQUFxREosWUFBckQ7O0FBRUFLLHNCQUFjQyxtQkFBZCxDQUFrQyxPQUFsQyxFQUEyQ1AsMEJBQTNDO0FBQ0FNLHNCQUFjRSxNQUFkOztBQUVBQztBQUNILEtBZEQ7O0FBZ0JBLFFBQUlDLDRCQUE0QixTQUE1QkEseUJBQTRCLENBQVNwQixLQUFULEVBQWdCO0FBQzVDQSxjQUFNQyxjQUFOO0FBQ0FELGNBQU1FLGVBQU47QUFDQSxrQ0FBVywwQkFBWDtBQUNILEtBSkQ7O0FBTUEsUUFBSW1CLGFBQWEsU0FBYkEsVUFBYSxDQUFTckIsS0FBVCxFQUFnQjtBQUM3QixZQUFJQSxLQUFKLEVBQVdBLE1BQU1DLGNBQU47QUFDWHFCO0FBQ0gsS0FIRDs7QUFLQSxRQUFJQyxjQUFjLFNBQWRBLFdBQWMsQ0FBU0MsT0FBVCxFQUFrQjtBQUNoQyxZQUFJQyxRQUFRdEIsU0FBU1MsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0FhLGNBQU1DLEVBQU4sR0FBVyxjQUFYOztBQUVBLFlBQUlDLFVBQVUsRUFBZDtBQUNBQSxtQkFBWSxpQ0FBWjtBQUNBQSxtQkFBZ0IsbUNBQWhCO0FBQ0FBLG1CQUFvQkgsT0FBcEI7QUFDQUcsbUJBQWdCLE1BQWhCO0FBQ0FBLG1CQUFnQixrQ0FBaEI7QUFDQUEsbUJBQW9CLDBGQUFwQjtBQUNBQSxtQkFBb0IsZ0dBQXBCO0FBQ0FBLG1CQUFvQiw0RkFBcEI7QUFDQUEsbUJBQWdCLFFBQWhCO0FBQ0FBLG1CQUFZLFFBQVo7O0FBRUFGLGNBQU1oQixTQUFOLEdBQWtCa0IsT0FBbEI7O0FBRUEsZUFBT0YsS0FBUDtBQUNILEtBbkJEOztBQXFCQSxRQUFJTixjQUFjLFNBQWRBLFdBQWMsR0FBVztBQUN6Qk0sY0FBTUcsU0FBTixHQUFrQix3QkFBbEI7QUFDSCxLQUZEOztBQUlBLFFBQUlOLGVBQWUsU0FBZkEsWUFBZSxHQUFXO0FBQzFCakIsbUJBQVdZLG1CQUFYLENBQStCLE9BQS9CLEVBQXdDbEIsdUJBQXhDO0FBQ0FpQixzQkFBY0MsbUJBQWQsQ0FBa0MsT0FBbEMsRUFBMkNQLDBCQUEzQztBQUNBbUIsc0JBQWNaLG1CQUFkLENBQWtDLE9BQWxDLEVBQTJDRyx5QkFBM0M7QUFDQVUseUJBQWlCYixtQkFBakIsQ0FBcUMsT0FBckMsRUFBOENJLFVBQTlDO0FBQ0FJLGNBQU1QLE1BQU47QUFDSCxLQU5EOztBQVFBO0FBQ0FmLGFBQVM0QixJQUFULENBQWNDLFNBQWQsR0FBMEIsQ0FBMUI7O0FBRUEsUUFBSUMsV0FBVywwQkFBZ0JDLE1BQWhCLEVBQXdCL0IsUUFBeEIsQ0FBZjtBQUNBLFFBQUlVLGFBQWFvQixTQUFTRSxRQUFULEVBQWpCOztBQUVBLFFBQUlWLFFBQVFGLFlBQVlWLFVBQVosQ0FBWjtBQUNBVixhQUFTNEIsSUFBVCxDQUFjaEIsV0FBZCxDQUEwQlUsS0FBMUI7O0FBRUEsUUFBSXBCLGFBQWFGLFNBQVNpQyxjQUFULENBQXdCLG9CQUF4QixDQUFqQjtBQUNBLFFBQUlwQixnQkFBZ0JiLFNBQVNpQyxjQUFULENBQXdCLHVCQUF4QixDQUFwQjtBQUNBLFFBQUlQLGdCQUFnQjFCLFNBQVNpQyxjQUFULENBQXdCLDBCQUF4QixDQUFwQjtBQUNBLFFBQUlOLG1CQUFtQjNCLFNBQVNpQyxjQUFULENBQXdCLGNBQXhCLENBQXZCOztBQUVBL0IsZUFBV2dDLGdCQUFYLENBQTRCLE9BQTVCLEVBQXFDdEMsdUJBQXJDO0FBQ0FpQixrQkFBY3FCLGdCQUFkLENBQStCLE9BQS9CLEVBQXdDM0IsMEJBQXhDO0FBQ0FtQixrQkFBY1EsZ0JBQWQsQ0FBK0IsT0FBL0IsRUFBd0NqQix5QkFBeEM7QUFDQVUscUJBQWlCTyxnQkFBakIsQ0FBa0MsT0FBbEMsRUFBMkNoQixVQUEzQztBQUNIOztRQUVRdkIsUyxHQUFBQSxTIiwiZmlsZSI6InBvcHVwLmpzeCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnZXROb2RlQ1NTUnVsZXMgZnJvbSAnLi4vcG9seWZpbGxzL2dldC1tYXRjaGVkLWNzcy1ydWxlcy5qc3gnO1xuaW1wb3J0IENyaXRpY2FsQ1NTIGZyb20gJy4uL2dlbmVyYXRvcnMvQ3JpdGljYWxDU1MuanN4JztcbmltcG9ydCBzZWxlY3RUZXh0IGZyb20gJy4uL3V0aWxpdGllcy9zZWxlY3RUZXh0LmpzeCc7XG5pbXBvcnQgcmVtb3ZlRG9jdW1lbnRTdHlsZXMgZnJvbSAnLi4vdXRpbGl0aWVzL3JlbW92ZURvY3VtZW50U3R5bGVzLmpzeCc7XG5cbi8vIEdlbmVyYXRlcyB0aGUgcG9wdXAgd2l0aCB3aWNoIHRoZSB1c2VyIHdpbGwgaW50ZXJhY3RcbmZ1bmN0aW9uIHNob3dQb3B1cCgpIHtcbiAgICB2YXIgY29weUdlbmVyYXRlZFN0eWxlc2hlZXQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBzZWxlY3RUZXh0KCdDcml0aWNhbFNuYXBfX291dHB1dC1jc3MnKTtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICAgICAgY29weUJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiMzNEE4NTNcIjtcbiAgICAgICAgY29weUJ1dHRvbi5zdHlsZS5jb2xvciA9IFwiI2ZmZlwiO1xuICAgICAgICBjb3B5QnV0dG9uLmlubmVySFRNTCA9IFwiQ29waWVkIDxzcGFuPvCfkY08L3NwYW4+XCI7XG4gICAgfTtcblxuICAgIHZhciBwcmV2aWV3R2VuZXJhdGVkU3R5bGVzaGVldCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHJlbW92ZURvY3VtZW50U3R5bGVzKCk7XG5cbiAgICAgICAgdmFyIHByZXZpZXdTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHByZXZpZXdTdHlsZS5pbm5lckhUTUwgPSBzdHlsZXNoZWV0O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHByZXZpZXdTdHlsZSk7XG5cbiAgICAgICAgcHJldmlld0J1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZpZXdHZW5lcmF0ZWRTdHlsZXNoZWV0KTtcbiAgICAgICAgcHJldmlld0J1dHRvbi5yZW1vdmUoKTtcblxuICAgICAgICBtaW5pZnlQb3B1cCgpO1xuICAgIH07XG5cbiAgICB2YXIgc2VsZWN0R2VuZXJhdGVkU3R5bGVzaGVldCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBzZWxlY3RUZXh0KCdDcml0aWNhbFNuYXBfX291dHB1dC1jc3MnKTtcbiAgICB9O1xuXG4gICAgdmFyIGNsb3NlUG9wdXAgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQpIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGRlc3Ryb3lQb3B1cCgpO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRlUG9wdXAgPSBmdW5jdGlvbihjb250ZW50KSB7XG4gICAgICAgIHZhciBwb3B1cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBwb3B1cC5pZCA9ICdDcml0aWNhbFNuYXAnO1xuXG4gICAgICAgIHZhciBkaXZIVE1MID0gJyc7XG4gICAgICAgIGRpdkhUTUwgKz0gICc8ZGl2PjxoMT5Dcml0aWNhbCBTbmFwc2hvdDwvaDE+JztcbiAgICAgICAgZGl2SFRNTCArPSAgICAgICc8cCBpZD1cIkNyaXRpY2FsU25hcF9fb3V0cHV0LWNzc1wiPic7XG4gICAgICAgIGRpdkhUTUwgKz0gICAgICAgICAgY29udGVudFxuICAgICAgICBkaXZIVE1MICs9ICAgICAgJzwvcD4nO1xuICAgICAgICBkaXZIVE1MICs9ICAgICAgJzxkaXYgaWQ9XCJDcml0aWNhbFNuYXBfX2J1dHRvbnNcIj4nO1xuICAgICAgICBkaXZIVE1MICs9ICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cIkNyaXRpY2FsU25hcF9fYnV0dG9uXCIgaWQ9XCJDcml0aWNhbFNuYXBfX2NvcHlcIj5Db3B5PC9idXR0b24+JztcbiAgICAgICAgZGl2SFRNTCArPSAgICAgICAgICAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJDcml0aWNhbFNuYXBfX2J1dHRvblwiIGlkPVwiQ3JpdGljYWxTbmFwX19wcmV2aWV3XCI+UHJldmlldzwvYnV0dG9uPic7XG4gICAgICAgIGRpdkhUTUwgKz0gICAgICAgICAgJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiQ3JpdGljYWxTbmFwX19idXR0b25cIiBpZD1cIkNyaXRpY2FsU25hcF9fY2xvc2VcIj5DbG9zZTwvYnV0dG9uPic7XG4gICAgICAgIGRpdkhUTUwgKz0gICAgICAnPC9kaXY+JztcbiAgICAgICAgZGl2SFRNTCArPSAgJzwvZGl2Pic7XG5cbiAgICAgICAgcG9wdXAuaW5uZXJIVE1MID0gZGl2SFRNTDtcblxuICAgICAgICByZXR1cm4gcG9wdXA7XG4gICAgfTtcblxuICAgIHZhciBtaW5pZnlQb3B1cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBwb3B1cC5jbGFzc05hbWUgPSAnQ3JpdGljYWxTbmFwX19taW5pZmllZCc7XG4gICAgfTtcblxuICAgIHZhciBkZXN0cm95UG9wdXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29weUJ1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHlHZW5lcmF0ZWRTdHlsZXNoZWV0KTtcbiAgICAgICAgcHJldmlld0J1dHRvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZpZXdHZW5lcmF0ZWRTdHlsZXNoZWV0KTtcbiAgICAgICAgb3V0cHV0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGVjdEdlbmVyYXRlZFN0eWxlc2hlZXQpO1xuICAgICAgICBjb250YWluZXJFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VQb3B1cCk7XG4gICAgICAgIHBvcHVwLnJlbW92ZSgpO1xuICAgIH07XG5cbiAgICAvLyBzY3JvbGwgdG8gdG9wIGJlZm9yZSBnZW5lcmF0aW5nIENTU1xuICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gMDtcblxuICAgIHZhciBzbmFwc2hvdCA9IG5ldyBDcml0aWNhbENTUyh3aW5kb3csIGRvY3VtZW50KTtcbiAgICB2YXIgc3R5bGVzaGVldCA9IHNuYXBzaG90LmdlbmVyYXRlKCk7XG5cbiAgICB2YXIgcG9wdXAgPSBjcmVhdGVQb3B1cChzdHlsZXNoZWV0KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBvcHVwKTtcblxuICAgIHZhciBjb3B5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0NyaXRpY2FsU25hcF9fY29weScpO1xuICAgIHZhciBwcmV2aWV3QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0NyaXRpY2FsU25hcF9fcHJldmlldycpO1xuICAgIHZhciBvdXRwdXRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0NyaXRpY2FsU25hcF9fb3V0cHV0LWNzcycpO1xuICAgIHZhciBjb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0NyaXRpY2FsU25hcCcpO1xuXG4gICAgY29weUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHlHZW5lcmF0ZWRTdHlsZXNoZWV0KTtcbiAgICBwcmV2aWV3QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmlld0dlbmVyYXRlZFN0eWxlc2hlZXQpO1xuICAgIG91dHB1dEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxlY3RHZW5lcmF0ZWRTdHlsZXNoZWV0KTtcbiAgICBjb250YWluZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VQb3B1cCk7XG59O1xuXG5leHBvcnQgeyBzaG93UG9wdXAgfTtcbiJdfQ==
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/components/popup.jsx","/components")
},{"../generators/CriticalCSS.jsx":7,"../polyfills/get-matched-css-rules.jsx":8,"../utilities/removeDocumentStyles.jsx":10,"../utilities/selectText.jsx":11,"buffer":2,"rH1JPG":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var _popup = require('./components/popup.jsx');

(0, _popup.showPopup)();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfNGM0Njg4NzUuanMiXSwibmFtZXMiOlsiX3BvcHVwIiwicmVxdWlyZSIsInNob3dQb3B1cCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsSUFBSUEsU0FBU0MsUUFBUSx3QkFBUixDQUFiOztBQUVBLENBQUMsR0FBR0QsT0FBT0UsU0FBWCIsImZpbGUiOiJmYWtlXzRjNDY4ODc1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX3BvcHVwID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BvcHVwLmpzeCcpO1xuXG4oMCwgX3BvcHVwLnNob3dQb3B1cCkoKTsiXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_4c468875.js","/")
},{"./components/popup.jsx":5,"buffer":2,"rH1JPG":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _explainWarning = require('../utilities/explainWarning.jsx');

var _explainWarning2 = _interopRequireDefault(_explainWarning);

var _getMatchedCssRules = require('../polyfills/get-matched-css-rules.jsx');

var _getMatchedCssRules2 = _interopRequireDefault(_getMatchedCssRules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// CSS generator
var CriticalCSS = function CriticalCSS(window, document, options) {
    var options = options || {};
    var parsedCSS = {};

    var pushCSS = function pushCSS(rule) {
        if (!!parsedCSS[rule.selectorText] === false) parsedCSS[rule.selectorText] = {};

        var styles = rule.style.cssText.split(/;(?![A-Za-z0-9])/);

        styles.forEach(function (style) {
            if (!!style === false) return;

            var pair = style.split(': ');
            pair[0] = pair[0].trim();
            pair[1] = pair[1].trim();
            parsedCSS[rule.selectorText][pair[0]] = pair[1];
        });
    };

    var parseTree = function parseTree() {
        var height = window.innerHeight;
        var walker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, function (node) {
            return NodeFilter.FILTER_ACCEPT;
        }, true);

        while (walker.nextNode()) {
            var node = walker.currentNode;
            var rect = node.getBoundingClientRect();
            if (rect.top < height || options.scanFullPage) {
                var rules;
                if (typeof window.getMatchedCSSRules !== 'function') {
                    rules = (0, _getMatchedCssRules2.default)(node);
                } else {
                    rules = window.getMatchedCSSRules(node);

                    (0, _explainWarning2.default)();
                }
                if (!rules) rules = (0, _getMatchedCssRules2.default)(node);

                if (!!rules) {
                    for (var i = 0; i < rules.length; i++) {
                        pushCSS(rules[i]);
                    }
                }
            }
        }
    };

    this.generate = function () {
        var outputCSS = '';

        for (var key in parsedCSS) {
            outputCSS += key + '{';

            for (var innerKey in parsedCSS[key]) {
                outputCSS += innerKey + ':' + parsedCSS[key][innerKey] + ';';
            }

            outputCSS += '}';
        }

        return outputCSS;
    };

    parseTree();
};

exports.default = CriticalCSS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyaXRpY2FsQ1NTLmpzeCJdLCJuYW1lcyI6WyJDcml0aWNhbENTUyIsIndpbmRvdyIsImRvY3VtZW50Iiwib3B0aW9ucyIsInBhcnNlZENTUyIsInB1c2hDU1MiLCJydWxlIiwic2VsZWN0b3JUZXh0Iiwic3R5bGVzIiwic3R5bGUiLCJjc3NUZXh0Iiwic3BsaXQiLCJmb3JFYWNoIiwicGFpciIsInRyaW0iLCJwYXJzZVRyZWUiLCJoZWlnaHQiLCJpbm5lckhlaWdodCIsIndhbGtlciIsImNyZWF0ZVRyZWVXYWxrZXIiLCJOb2RlRmlsdGVyIiwiU0hPV19FTEVNRU5UIiwibm9kZSIsIkZJTFRFUl9BQ0NFUFQiLCJuZXh0Tm9kZSIsImN1cnJlbnROb2RlIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInRvcCIsInNjYW5GdWxsUGFnZSIsInJ1bGVzIiwiZ2V0TWF0Y2hlZENTU1J1bGVzIiwiaSIsImxlbmd0aCIsImdlbmVyYXRlIiwib3V0cHV0Q1NTIiwia2V5IiwiaW5uZXJLZXkiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUNBO0FBQ0EsSUFBSUEsY0FBYyxTQUFkQSxXQUFjLENBQVNDLE1BQVQsRUFBaUJDLFFBQWpCLEVBQTJCQyxPQUEzQixFQUFvQztBQUNsRCxRQUFJQSxVQUFVQSxXQUFXLEVBQXpCO0FBQ0EsUUFBSUMsWUFBWSxFQUFoQjs7QUFFQSxRQUFJQyxVQUFVLFNBQVZBLE9BQVUsQ0FBU0MsSUFBVCxFQUFlO0FBQ3pCLFlBQUcsQ0FBQyxDQUFDRixVQUFVRSxLQUFLQyxZQUFmLENBQUYsS0FBbUMsS0FBdEMsRUFBNkNILFVBQVVFLEtBQUtDLFlBQWYsSUFBK0IsRUFBL0I7O0FBRTdDLFlBQUlDLFNBQVNGLEtBQUtHLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQkMsS0FBbkIsQ0FBeUIsa0JBQXpCLENBQWI7O0FBRUFILGVBQU9JLE9BQVAsQ0FBZSxVQUFTSCxLQUFULEVBQWdCO0FBQzNCLGdCQUFHLENBQUMsQ0FBQ0EsS0FBRixLQUFZLEtBQWYsRUFBc0I7O0FBRXRCLGdCQUFJSSxPQUFPSixNQUFNRSxLQUFOLENBQVksSUFBWixDQUFYO0FBQ0FFLGlCQUFLLENBQUwsSUFBVUEsS0FBSyxDQUFMLEVBQVFDLElBQVIsRUFBVjtBQUNBRCxpQkFBSyxDQUFMLElBQVVBLEtBQUssQ0FBTCxFQUFRQyxJQUFSLEVBQVY7QUFDQVYsc0JBQVVFLEtBQUtDLFlBQWYsRUFBNkJNLEtBQUssQ0FBTCxDQUE3QixJQUF3Q0EsS0FBSyxDQUFMLENBQXhDO0FBRUgsU0FSRDtBQVNILEtBZEQ7O0FBZ0JBLFFBQUlFLFlBQVksU0FBWkEsU0FBWSxHQUFXO0FBQ3ZCLFlBQUlDLFNBQVNmLE9BQU9nQixXQUFwQjtBQUNBLFlBQUlDLFNBQVNoQixTQUFTaUIsZ0JBQVQsQ0FBMEJqQixRQUExQixFQUFvQ2tCLFdBQVdDLFlBQS9DLEVBQTZELFVBQVNDLElBQVQsRUFBZTtBQUFFLG1CQUFPRixXQUFXRyxhQUFsQjtBQUFrQyxTQUFoSCxFQUFrSCxJQUFsSCxDQUFiOztBQUVBLGVBQU1MLE9BQU9NLFFBQVAsRUFBTixFQUF5QjtBQUNyQixnQkFBSUYsT0FBT0osT0FBT08sV0FBbEI7QUFDQSxnQkFBSUMsT0FBT0osS0FBS0sscUJBQUwsRUFBWDtBQUNBLGdCQUFHRCxLQUFLRSxHQUFMLEdBQVdaLE1BQVgsSUFBcUJiLFFBQVEwQixZQUFoQyxFQUE4QztBQUMxQyxvQkFBSUMsS0FBSjtBQUNBLG9CQUFLLE9BQU83QixPQUFPOEIsa0JBQWQsS0FBcUMsVUFBMUMsRUFBdUQ7QUFDbkRELDRCQUFRLGtDQUFnQlIsSUFBaEIsQ0FBUjtBQUNILGlCQUZELE1BRU87QUFDSFEsNEJBQVE3QixPQUFPOEIsa0JBQVAsQ0FBMEJULElBQTFCLENBQVI7O0FBRUE7QUFDSDtBQUNELG9CQUFJLENBQUNRLEtBQUwsRUFBWUEsUUFBUSxrQ0FBZ0JSLElBQWhCLENBQVI7O0FBRVosb0JBQUcsQ0FBQyxDQUFDUSxLQUFMLEVBQVk7QUFDUix5QkFBSyxJQUFJRSxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLE1BQU1HLE1BQTFCLEVBQWtDRCxHQUFsQyxFQUF1QztBQUNuQzNCLGdDQUFReUIsTUFBTUUsQ0FBTixDQUFSO0FBRUg7QUFDSjtBQUVKO0FBQ0o7QUFDSixLQTNCRDs7QUE2QkEsU0FBS0UsUUFBTCxHQUFnQixZQUFXO0FBQ3ZCLFlBQUlDLFlBQVksRUFBaEI7O0FBRUEsYUFBSSxJQUFJQyxHQUFSLElBQWVoQyxTQUFmLEVBQTBCO0FBQ3RCK0IseUJBQWFDLE1BQU0sR0FBbkI7O0FBRUEsaUJBQUksSUFBSUMsUUFBUixJQUFvQmpDLFVBQVVnQyxHQUFWLENBQXBCLEVBQW9DO0FBQ2hDRCw2QkFBYUUsV0FBVyxHQUFYLEdBQWlCakMsVUFBVWdDLEdBQVYsRUFBZUMsUUFBZixDQUFqQixHQUE0QyxHQUF6RDtBQUVIOztBQUVERix5QkFBYSxHQUFiO0FBQ0g7O0FBRUQsZUFBT0EsU0FBUDtBQUNILEtBZkQ7O0FBaUJBcEI7QUFDSCxDQW5FRDs7a0JBcUVlZixXIiwiZmlsZSI6IkNyaXRpY2FsQ1NTLmpzeCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHBsYWluV2FybmluZyBmcm9tICcuLi91dGlsaXRpZXMvZXhwbGFpbldhcm5pbmcuanN4JztcbmltcG9ydCBnZXROb2RlQ1NTUnVsZXMgZnJvbSAnLi4vcG9seWZpbGxzL2dldC1tYXRjaGVkLWNzcy1ydWxlcy5qc3gnO1xuLy8gQ1NTIGdlbmVyYXRvclxudmFyIENyaXRpY2FsQ1NTID0gZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgb3B0aW9ucykge1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgcGFyc2VkQ1NTID0ge307XG5cbiAgICB2YXIgcHVzaENTUyA9IGZ1bmN0aW9uKHJ1bGUpIHtcbiAgICAgICAgaWYoISFwYXJzZWRDU1NbcnVsZS5zZWxlY3RvclRleHRdID09PSBmYWxzZSkgcGFyc2VkQ1NTW3J1bGUuc2VsZWN0b3JUZXh0XSA9IHt9O1xuXG4gICAgICAgIHZhciBzdHlsZXMgPSBydWxlLnN0eWxlLmNzc1RleHQuc3BsaXQoLzsoPyFbQS1aYS16MC05XSkvKTtcblxuICAgICAgICBzdHlsZXMuZm9yRWFjaChmdW5jdGlvbihzdHlsZSkge1xuICAgICAgICAgICAgaWYoISFzdHlsZSA9PT0gZmFsc2UpIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIHBhaXIgPSBzdHlsZS5zcGxpdCgnOiAnKTtcbiAgICAgICAgICAgIHBhaXJbMF0gPSBwYWlyWzBdLnRyaW0oKTtcbiAgICAgICAgICAgIHBhaXJbMV0gPSBwYWlyWzFdLnRyaW0oKTtcbiAgICAgICAgICAgIHBhcnNlZENTU1tydWxlLnNlbGVjdG9yVGV4dF1bcGFpclswXV0gPSBwYWlyWzFdO1xuXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgcGFyc2VUcmVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIHZhciB3YWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGRvY3VtZW50LCBOb2RlRmlsdGVyLlNIT1dfRUxFTUVOVCwgZnVuY3Rpb24obm9kZSkgeyByZXR1cm4gTm9kZUZpbHRlci5GSUxURVJfQUNDRVBUOyB9LCB0cnVlKTtcblxuICAgICAgICB3aGlsZSh3YWxrZXIubmV4dE5vZGUoKSkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB3YWxrZXIuY3VycmVudE5vZGU7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBpZihyZWN0LnRvcCA8IGhlaWdodCB8fCBvcHRpb25zLnNjYW5GdWxsUGFnZSkge1xuICAgICAgICAgICAgICAgIHZhciBydWxlcztcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiB3aW5kb3cuZ2V0TWF0Y2hlZENTU1J1bGVzICE9PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgICAgICAgICAgICBydWxlcyA9IGdldE5vZGVDU1NSdWxlcyhub2RlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBydWxlcyA9IHdpbmRvdy5nZXRNYXRjaGVkQ1NTUnVsZXMobm9kZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZXhwbGFpbldhcm5pbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFydWxlcykgcnVsZXMgPSBnZXROb2RlQ1NTUnVsZXMobm9kZSk7XG5cbiAgICAgICAgICAgICAgICBpZighIXJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hDU1MocnVsZXNbaV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmdlbmVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvdXRwdXRDU1MgPSAnJztcblxuICAgICAgICBmb3IodmFyIGtleSBpbiBwYXJzZWRDU1MpIHtcbiAgICAgICAgICAgIG91dHB1dENTUyArPSBrZXkgKyAneyc7XG5cbiAgICAgICAgICAgIGZvcih2YXIgaW5uZXJLZXkgaW4gcGFyc2VkQ1NTW2tleV0pIHtcbiAgICAgICAgICAgICAgICBvdXRwdXRDU1MgKz0gaW5uZXJLZXkgKyAnOicgKyBwYXJzZWRDU1Nba2V5XVtpbm5lcktleV0gKyAnOyc7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3V0cHV0Q1NTICs9ICd9JztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXRwdXRDU1M7XG4gICAgfTtcblxuICAgIHBhcnNlVHJlZSgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ3JpdGljYWxDU1M7XG4iXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/generators/CriticalCSS.jsx","/generators")
},{"../polyfills/get-matched-css-rules.jsx":8,"../utilities/explainWarning.jsx":9,"buffer":2,"rH1JPG":4}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*
 * Fallback for window.getMatchedCSSRules(node);
 * Forked from: (A Gecko only polyfill for Webkit's window.getMatchedCSSRules) https://gist.github.com/ydaniv/3033012
 * This version is compatible with most browsers hoi
 */
var ELEMENT_RE = /[\w-]+/g;
var ID_RE = /#[\w-]+/g;
var CLASS_RE = /\.[\w-]+/g;
var ATTR_RE = /\[[^\]]+\]/g;
// :not() pseudo-class does not add to specificity, but its content does as if it was outside it
var PSEUDO_CLASSES_RE = /\:(?!not)[\w-]+(\(.*\))?/g;
var PSEUDO_ELEMENTS_RE = /\:\:?(after|before|first-letter|first-line|selection)/g;

// convert an array-like object to array
function toArray(list) {
    list = list || {};
    return [].slice.call(list);
}

// handles extraction of `cssRules` as an `Array` from a stylesheet or something that behaves the same
function getSheetRules(stylesheet) {
    var sheet_media = stylesheet.media && stylesheet.media.mediaText;
    // if this sheet is disabled skip it
    if (stylesheet.disabled) return [];
    // if this sheet's media is specified and doesn't match the viewport then skip it
    if (sheet_media && sheet_media.length && !window.matchMedia(sheet_media).matches) return [];
    // get the style rules of this sheet

    try {
        return toArray(stylesheet.cssRules || stylesheet.rules || []);
    } catch (err) {
        return [];
    }
}

function _find(string, re) {
    var matches = string.match(re);
    return re ? re.length : 0;
}

// calculates the specificity of a given `selector`
function calculateScore(selector) {
    var score = [0, 0, 0];
    var parts = selector.split(' ');
    var part;
    var match;

    //TODO: clean the ':not' part since the last ELEMENT_RE will pick it up
    while (part = parts.shift(), typeof part == 'string') {
        // find all pseudo-elements
        match = _find(part, PSEUDO_ELEMENTS_RE);
        score[2] = match;
        // and remove them
        match && (part = part.replace(PSEUDO_ELEMENTS_RE, ''));
        // find all pseudo-classes
        match = _find(part, PSEUDO_CLASSES_RE);
        score[1] = match;
        // and remove them
        match && (part = part.replace(PSEUDO_CLASSES_RE, ''));
        // find all attributes
        match = _find(part, ATTR_RE);
        score[1] += match;
        // and remove them
        match && (part = part.replace(ATTR_RE, ''));
        // find all IDs
        match = _find(part, ID_RE);
        score[0] = match;
        // and remove them
        match && (part = part.replace(ID_RE, ''));
        // find all classes
        match = _find(part, CLASS_RE);
        score[1] += match;
        // and remove them
        match && (part = part.replace(CLASS_RE, ''));
        // find all elements
        score[2] += _find(part, ELEMENT_RE);
    }
    return parseInt(score.join(''), 10);
}

// returns the heights possible specificity score an element can get from a give rule's selectorText
function getSpecificityScore(element, selector_text) {
    var selectors = selector_text.split(',');
    var selector;
    var score;
    var result = 0;

    while (selector = selectors.shift()) {
        element.matches = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector;
        if (element.matches(selector)) {
            score = calculateScore(selector);
            result = score > result ? score : result;
        }
    }

    return result;
}

function sortBySpecificity(element, rules) {
    // comparing function that sorts CSSStyleRules according to specificity of their `selectorText`
    function compareSpecificity(a, b) {
        return getSpecificityScore(element, b.selectorText) - getSpecificityScore(element, a.selectorText);
    }

    return rules.sort(compareSpecificity);
}

//TODO: not supporting 2nd argument for selecting pseudo elements
//TODO: not supporting 3rd argument for checking author style sheets only
function getNodeCSSRules(element /*, pseudo, author_only*/) {
    var style_sheets;
    var sheet;
    var sheet_media;
    var rules;
    var rule;
    var result = [];

    // get stylesheets and convert to a regular Array
    style_sheets = toArray(window.document.styleSheets);

    // assuming the browser hands us stylesheets in order of appearance
    // we iterate them from the beginning to follow proper cascade order
    while (sheet = style_sheets.shift()) {
        // get the style rules of this sheet
        rules = getSheetRules(sheet);
        // loop the rules in order of appearance
        while (rule = rules.shift()) {
            // if this is an @import rule
            if (rule.styleSheet) {
                // insert the imported stylesheet's rules at the beginning of this stylesheet's rules
                rules = getSheetRules(rule.styleSheet).concat(rules);
                // and skip this rule
                continue;
            }
            // if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
            else if (rule.media) {
                    // insert the contained rules of this media rule to the beginning of this stylesheet's rules
                    rules = getSheetRules(rule).concat(rules);
                    // and skip it
                    continue;
                }

            // TODO: deal with unusual selectors
            // Some sites use selectors like '[ng:cloak]' wich is not a valid selector
            // try-catching this allows the plugin to work
            try {
                // check if this element matches this rule's selector
                if (element.matches(rule.selectorText)) {
                    // push the rule to the results set
                    result.push(rule);
                }
            } catch (e) {
                // do nothing
            }
        }
    }

    // sort according to specificity
    return sortBySpecificity(element, result);
};

exports.default = getNodeCSSRules;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldC1tYXRjaGVkLWNzcy1ydWxlcy5qc3giXSwibmFtZXMiOlsiRUxFTUVOVF9SRSIsIklEX1JFIiwiQ0xBU1NfUkUiLCJBVFRSX1JFIiwiUFNFVURPX0NMQVNTRVNfUkUiLCJQU0VVRE9fRUxFTUVOVFNfUkUiLCJ0b0FycmF5IiwibGlzdCIsInNsaWNlIiwiY2FsbCIsImdldFNoZWV0UnVsZXMiLCJzdHlsZXNoZWV0Iiwic2hlZXRfbWVkaWEiLCJtZWRpYSIsIm1lZGlhVGV4dCIsImRpc2FibGVkIiwibGVuZ3RoIiwid2luZG93IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJjc3NSdWxlcyIsInJ1bGVzIiwiZXJyIiwiX2ZpbmQiLCJzdHJpbmciLCJyZSIsIm1hdGNoIiwiY2FsY3VsYXRlU2NvcmUiLCJzZWxlY3RvciIsInNjb3JlIiwicGFydHMiLCJzcGxpdCIsInBhcnQiLCJzaGlmdCIsInJlcGxhY2UiLCJwYXJzZUludCIsImpvaW4iLCJnZXRTcGVjaWZpY2l0eVNjb3JlIiwiZWxlbWVudCIsInNlbGVjdG9yX3RleHQiLCJzZWxlY3RvcnMiLCJyZXN1bHQiLCJ3ZWJraXRNYXRjaGVzU2VsZWN0b3IiLCJtb3pNYXRjaGVzU2VsZWN0b3IiLCJtc01hdGNoZXNTZWxlY3RvciIsIm9NYXRjaGVzU2VsZWN0b3IiLCJzb3J0QnlTcGVjaWZpY2l0eSIsImNvbXBhcmVTcGVjaWZpY2l0eSIsImEiLCJiIiwic2VsZWN0b3JUZXh0Iiwic29ydCIsImdldE5vZGVDU1NSdWxlcyIsInN0eWxlX3NoZWV0cyIsInNoZWV0IiwicnVsZSIsImRvY3VtZW50Iiwic3R5bGVTaGVldHMiLCJzdHlsZVNoZWV0IiwiY29uY2F0IiwicHVzaCIsImUiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7Ozs7O0FBS0EsSUFBSUEsYUFBYSxTQUFqQjtBQUNBLElBQUlDLFFBQVEsVUFBWjtBQUNBLElBQUlDLFdBQVcsV0FBZjtBQUNBLElBQUlDLFVBQVUsYUFBZDtBQUNBO0FBQ0EsSUFBSUMs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QUFDQTtBQUNBLFdBQU9ILFFBQVFELGFBQWFwQixLQUFiLEVBQWYsRUFBcUM7QUFDakM7QUFDQVosZ0JBQVFYLGNBQWM0QyxLQUFkLENBQVI7QUFDQTtBQUNBLGVBQU9DLE9BQU9sQyxNQUFNWSxLQUFOLEVBQWQsRUFBNkI7QUFDekI7QUFDQSxnQkFBSXNCLEtBQUtHLFVBQVQsRUFBcUI7QUFDakI7QUFDQXJDLHdCQUFRWCxjQUFjNkMsS0FBS0csVUFBbkIsRUFBK0JDLE1BQS9CLENBQXNDdEMsS0FBdEMsQ0FBUjtBQUNBO0FBQ0E7QUFDSDtBQUNEO0FBTkEsaUJBT0ssSUFBSWtDLEtBQUsxQyxLQUFULEVBQWdCO0FBQ2pCO0FBQ0FRLDRCQUFRWCxjQUFjNkMsSUFBZCxFQUFvQkksTUFBcEIsQ0FBMkJ0QyxLQUEzQixDQUFSO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNBLGdCQUFJO0FBQ0E7QUFDQSxvQkFBSWlCLFFBQVFuQixPQUFSLENBQWdCb0MsS0FBS0wsWUFBckIsQ0FBSixFQUF3QztBQUNwQztBQUNBVCwyQkFBT21CLElBQVAsQ0FBWUwsSUFBWjtBQUNIO0FBQ0osYUFORCxDQU9BLE9BQU9NLENBQVAsRUFBVTtBQUNOO0FBQ0g7QUFDSjtBQUNKOztBQUVEO0FBQ0EsV0FBT2Ysa0JBQWtCUixPQUFsQixFQUEyQkcsTUFBM0IsQ0FBUDtBQUNIOztrQkFFY1csZSIsImZpbGUiOiJnZXQtbWF0Y2hlZC1jc3MtcnVsZXMuanN4Iiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEZhbGxiYWNrIGZvciB3aW5kb3cuZ2V0TWF0Y2hlZENTU1J1bGVzKG5vZGUpO1xuICogRm9ya2VkIGZyb206IChBIEdlY2tvIG9ubHkgcG9seWZpbGwgZm9yIFdlYmtpdCdzIHdpbmRvdy5nZXRNYXRjaGVkQ1NTUnVsZXMpIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3lkYW5pdi8zMDMzMDEyXG4gKiBUaGlzIHZlcnNpb24gaXMgY29tcGF0aWJsZSB3aXRoIG1vc3QgYnJvd3NlcnMgaG9pXG4gKi9cbnZhciBFTEVNRU5UX1JFID0gL1tcXHctXSsvZztcbnZhciBJRF9SRSA9IC8jW1xcdy1dKy9nO1xudmFyIENMQVNTX1JFID0gL1xcLltcXHctXSsvZztcbnZhciBBVFRSX1JFID0gL1xcW1teXFxdXStcXF0vZztcbi8vIDpub3QoKSBwc2V1ZG8tY2xhc3MgZG9lcyBub3QgYWRkIHRvIHNwZWNpZmljaXR5LCBidXQgaXRzIGNvbnRlbnQgZG9lcyBhcyBpZiBpdCB3YXMgb3V0c2lkZSBpdFxudmFyIFBTRVVET19DTEFTU0VTX1JFID0gL1xcOig/IW5vdClbXFx3LV0rKFxcKC4qXFwpKT8vZztcbnZhciBQU0VVRE9fRUxFTUVOVFNfUkUgPSAvXFw6XFw6PyhhZnRlcnxiZWZvcmV8Zmlyc3QtbGV0dGVyfGZpcnN0LWxpbmV8c2VsZWN0aW9uKS9nO1xuXG4vLyBjb252ZXJ0IGFuIGFycmF5LWxpa2Ugb2JqZWN0IHRvIGFycmF5XG5mdW5jdGlvbiB0b0FycmF5IChsaXN0KSB7XG4gICAgbGlzdCA9IGxpc3QgfHwge307XG4gICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwobGlzdCk7XG59XG5cbi8vIGhhbmRsZXMgZXh0cmFjdGlvbiBvZiBgY3NzUnVsZXNgIGFzIGFuIGBBcnJheWAgZnJvbSBhIHN0eWxlc2hlZXQgb3Igc29tZXRoaW5nIHRoYXQgYmVoYXZlcyB0aGUgc2FtZVxuZnVuY3Rpb24gZ2V0U2hlZXRSdWxlcyAoc3R5bGVzaGVldCkge1xuICAgIHZhciBzaGVldF9tZWRpYSA9IHN0eWxlc2hlZXQubWVkaWEgJiYgc3R5bGVzaGVldC5tZWRpYS5tZWRpYVRleHQ7XG4gICAgLy8gaWYgdGhpcyBzaGVldCBpcyBkaXNhYmxlZCBza2lwIGl0XG4gICAgaWYgKCBzdHlsZXNoZWV0LmRpc2FibGVkICkgcmV0dXJuIFtdO1xuICAgIC8vIGlmIHRoaXMgc2hlZXQncyBtZWRpYSBpcyBzcGVjaWZpZWQgYW5kIGRvZXNuJ3QgbWF0Y2ggdGhlIHZpZXdwb3J0IHRoZW4gc2tpcCBpdFxuICAgIGlmICggc2hlZXRfbWVkaWEgJiYgc2hlZXRfbWVkaWEubGVuZ3RoICYmICEgd2luZG93Lm1hdGNoTWVkaWEoc2hlZXRfbWVkaWEpLm1hdGNoZXMgKSByZXR1cm4gW107XG4gICAgLy8gZ2V0IHRoZSBzdHlsZSBydWxlcyBvZiB0aGlzIHNoZWV0XG5cbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gdG9BcnJheShzdHlsZXNoZWV0LmNzc1J1bGVzIHx8IHN0eWxlc2hlZXQucnVsZXMgfHwgW10pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfZmluZCAoc3RyaW5nLCByZSkge1xuICAgIHZhciBtYXRjaGVzID0gc3RyaW5nLm1hdGNoKHJlKTtcbiAgICByZXR1cm4gcmUgPyByZS5sZW5ndGggOiAwO1xufVxuXG4vLyBjYWxjdWxhdGVzIHRoZSBzcGVjaWZpY2l0eSBvZiBhIGdpdmVuIGBzZWxlY3RvcmBcbmZ1bmN0aW9uIGNhbGN1bGF0ZVNjb3JlIChzZWxlY3Rvcikge1xuICAgIHZhciBzY29yZSA9IFswLDAsMF07XG4gICAgdmFyIHBhcnRzID0gc2VsZWN0b3Iuc3BsaXQoJyAnKTtcbiAgICB2YXIgcGFydDtcbiAgICB2YXIgbWF0Y2g7XG5cbiAgICAvL1RPRE86IGNsZWFuIHRoZSAnOm5vdCcgcGFydCBzaW5jZSB0aGUgbGFzdCBFTEVNRU5UX1JFIHdpbGwgcGljayBpdCB1cFxuICAgIHdoaWxlICggcGFydCA9IHBhcnRzLnNoaWZ0KCksIHR5cGVvZiBwYXJ0ID09ICdzdHJpbmcnICkge1xuICAgICAgICAvLyBmaW5kIGFsbCBwc2V1ZG8tZWxlbWVudHNcbiAgICAgICAgbWF0Y2ggPSBfZmluZChwYXJ0LCBQU0VVRE9fRUxFTUVOVFNfUkUpO1xuICAgICAgICBzY29yZVsyXSA9IG1hdGNoO1xuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZW1cbiAgICAgICAgbWF0Y2ggJiYgKHBhcnQgPSBwYXJ0LnJlcGxhY2UoUFNFVURPX0VMRU1FTlRTX1JFLCAnJykpO1xuICAgICAgICAvLyBmaW5kIGFsbCBwc2V1ZG8tY2xhc3Nlc1xuICAgICAgICBtYXRjaCA9IF9maW5kKHBhcnQsIFBTRVVET19DTEFTU0VTX1JFKTtcbiAgICAgICAgc2NvcmVbMV0gPSBtYXRjaDtcbiAgICAgICAgLy8gYW5kIHJlbW92ZSB0aGVtXG4gICAgICAgIG1hdGNoICYmIChwYXJ0ID0gcGFydC5yZXBsYWNlKFBTRVVET19DTEFTU0VTX1JFLCAnJykpO1xuICAgICAgICAvLyBmaW5kIGFsbCBhdHRyaWJ1dGVzXG4gICAgICAgIG1hdGNoID0gX2ZpbmQocGFydCwgQVRUUl9SRSk7XG4gICAgICAgIHNjb3JlWzFdICs9IG1hdGNoO1xuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZW1cbiAgICAgICAgbWF0Y2ggJiYgKHBhcnQgPSBwYXJ0LnJlcGxhY2UoQVRUUl9SRSwgJycpKTtcbiAgICAgICAgLy8gZmluZCBhbGwgSURzXG4gICAgICAgIG1hdGNoID0gX2ZpbmQocGFydCwgSURfUkUpO1xuICAgICAgICBzY29yZVswXSA9IG1hdGNoO1xuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZW1cbiAgICAgICAgbWF0Y2ggJiYgKHBhcnQgPSBwYXJ0LnJlcGxhY2UoSURfUkUsICcnKSk7XG4gICAgICAgIC8vIGZpbmQgYWxsIGNsYXNzZXNcbiAgICAgICAgbWF0Y2ggPSBfZmluZChwYXJ0LCBDTEFTU19SRSk7XG4gICAgICAgIHNjb3JlWzFdICs9IG1hdGNoO1xuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZW1cbiAgICAgICAgbWF0Y2ggJiYgKHBhcnQgPSBwYXJ0LnJlcGxhY2UoQ0xBU1NfUkUsICcnKSk7XG4gICAgICAgIC8vIGZpbmQgYWxsIGVsZW1lbnRzXG4gICAgICAgIHNjb3JlWzJdICs9IF9maW5kKHBhcnQsIEVMRU1FTlRfUkUpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VJbnQoc2NvcmUuam9pbignJyksIDEwKTtcbn1cblxuLy8gcmV0dXJucyB0aGUgaGVpZ2h0cyBwb3NzaWJsZSBzcGVjaWZpY2l0eSBzY29yZSBhbiBlbGVtZW50IGNhbiBnZXQgZnJvbSBhIGdpdmUgcnVsZSdzIHNlbGVjdG9yVGV4dFxuZnVuY3Rpb24gZ2V0U3BlY2lmaWNpdHlTY29yZSAoZWxlbWVudCwgc2VsZWN0b3JfdGV4dCkge1xuICAgIHZhciBzZWxlY3RvcnMgPSBzZWxlY3Rvcl90ZXh0LnNwbGl0KCcsJyk7XG4gICAgdmFyIHNlbGVjdG9yO1xuICAgIHZhciBzY29yZTtcbiAgICB2YXIgcmVzdWx0ID0gMDtcblxuICAgIHdoaWxlIChzZWxlY3RvciA9IHNlbGVjdG9ycy5zaGlmdCgpKSB7XG4gICAgICAgIGVsZW1lbnQubWF0Y2hlcyA9IGVsZW1lbnQubWF0Y2hlcyB8fCBlbGVtZW50LndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBlbGVtZW50Lm1vek1hdGNoZXNTZWxlY3RvciB8fCBlbGVtZW50Lm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsZW1lbnQub01hdGNoZXNTZWxlY3RvcjtcbiAgICAgICAgaWYgKCBlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpICkge1xuICAgICAgICAgICAgc2NvcmUgPSBjYWxjdWxhdGVTY29yZShzZWxlY3Rvcik7XG4gICAgICAgICAgICByZXN1bHQgPSBzY29yZSA+IHJlc3VsdCA/IHNjb3JlIDogcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc29ydEJ5U3BlY2lmaWNpdHkgKGVsZW1lbnQsIHJ1bGVzKSB7XG4gICAgLy8gY29tcGFyaW5nIGZ1bmN0aW9uIHRoYXQgc29ydHMgQ1NTU3R5bGVSdWxlcyBhY2NvcmRpbmcgdG8gc3BlY2lmaWNpdHkgb2YgdGhlaXIgYHNlbGVjdG9yVGV4dGBcbiAgICBmdW5jdGlvbiBjb21wYXJlU3BlY2lmaWNpdHkgKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGdldFNwZWNpZmljaXR5U2NvcmUoZWxlbWVudCwgYi5zZWxlY3RvclRleHQpIC0gZ2V0U3BlY2lmaWNpdHlTY29yZShlbGVtZW50LCBhLnNlbGVjdG9yVGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJ1bGVzLnNvcnQoY29tcGFyZVNwZWNpZmljaXR5KTtcbn1cblxuLy9UT0RPOiBub3Qgc3VwcG9ydGluZyAybmQgYXJndW1lbnQgZm9yIHNlbGVjdGluZyBwc2V1ZG8gZWxlbWVudHNcbi8vVE9ETzogbm90IHN1cHBvcnRpbmcgM3JkIGFyZ3VtZW50IGZvciBjaGVja2luZyBhdXRob3Igc3R5bGUgc2hlZXRzIG9ubHlcbmZ1bmN0aW9uIGdldE5vZGVDU1NSdWxlcyhlbGVtZW50IC8qLCBwc2V1ZG8sIGF1dGhvcl9vbmx5Ki8pIHtcbiAgICB2YXIgc3R5bGVfc2hlZXRzO1xuICAgIHZhciBzaGVldDtcbiAgICB2YXIgc2hlZXRfbWVkaWE7XG4gICAgdmFyIHJ1bGVzO1xuICAgIHZhciBydWxlO1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIC8vIGdldCBzdHlsZXNoZWV0cyBhbmQgY29udmVydCB0byBhIHJlZ3VsYXIgQXJyYXlcbiAgICBzdHlsZV9zaGVldHMgPSB0b0FycmF5KHdpbmRvdy5kb2N1bWVudC5zdHlsZVNoZWV0cyk7XG5cbiAgICAvLyBhc3N1bWluZyB0aGUgYnJvd3NlciBoYW5kcyB1cyBzdHlsZXNoZWV0cyBpbiBvcmRlciBvZiBhcHBlYXJhbmNlXG4gICAgLy8gd2UgaXRlcmF0ZSB0aGVtIGZyb20gdGhlIGJlZ2lubmluZyB0byBmb2xsb3cgcHJvcGVyIGNhc2NhZGUgb3JkZXJcbiAgICB3aGlsZSAoc2hlZXQgPSBzdHlsZV9zaGVldHMuc2hpZnQoKSkge1xuICAgICAgICAvLyBnZXQgdGhlIHN0eWxlIHJ1bGVzIG9mIHRoaXMgc2hlZXRcbiAgICAgICAgcnVsZXMgPSBnZXRTaGVldFJ1bGVzKHNoZWV0KTtcbiAgICAgICAgLy8gbG9vcCB0aGUgcnVsZXMgaW4gb3JkZXIgb2YgYXBwZWFyYW5jZVxuICAgICAgICB3aGlsZSAocnVsZSA9IHJ1bGVzLnNoaWZ0KCkpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYW4gQGltcG9ydCBydWxlXG4gICAgICAgICAgICBpZiAocnVsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICAgICAgLy8gaW5zZXJ0IHRoZSBpbXBvcnRlZCBzdHlsZXNoZWV0J3MgcnVsZXMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGlzIHN0eWxlc2hlZXQncyBydWxlc1xuICAgICAgICAgICAgICAgIHJ1bGVzID0gZ2V0U2hlZXRSdWxlcyhydWxlLnN0eWxlU2hlZXQpLmNvbmNhdChydWxlcyk7XG4gICAgICAgICAgICAgICAgLy8gYW5kIHNraXAgdGhpcyBydWxlXG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSdzIG5vIHN0eWxlc2hlZXQgYXR0cmlidXRlIEJVVCB0aGVyZSBJUyBhIG1lZGlhIGF0dHJpYnV0ZSBpdCdzIGEgbWVkaWEgcnVsZVxuICAgICAgICAgICAgZWxzZSBpZiAocnVsZS5tZWRpYSkge1xuICAgICAgICAgICAgICAgIC8vIGluc2VydCB0aGUgY29udGFpbmVkIHJ1bGVzIG9mIHRoaXMgbWVkaWEgcnVsZSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoaXMgc3R5bGVzaGVldCdzIHJ1bGVzXG4gICAgICAgICAgICAgICAgcnVsZXMgPSBnZXRTaGVldFJ1bGVzKHJ1bGUpLmNvbmNhdChydWxlcyk7XG4gICAgICAgICAgICAgICAgLy8gYW5kIHNraXAgaXRcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUT0RPOiBkZWFsIHdpdGggdW51c3VhbCBzZWxlY3RvcnNcbiAgICAgICAgICAgIC8vIFNvbWUgc2l0ZXMgdXNlIHNlbGVjdG9ycyBsaWtlICdbbmc6Y2xvYWtdJyB3aWNoIGlzIG5vdCBhIHZhbGlkIHNlbGVjdG9yXG4gICAgICAgICAgICAvLyB0cnktY2F0Y2hpbmcgdGhpcyBhbGxvd3MgdGhlIHBsdWdpbiB0byB3b3JrXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgZWxlbWVudCBtYXRjaGVzIHRoaXMgcnVsZSdzIHNlbGVjdG9yXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQubWF0Y2hlcyhydWxlLnNlbGVjdG9yVGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHVzaCB0aGUgcnVsZSB0byB0aGUgcmVzdWx0cyBzZXRcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocnVsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzb3J0IGFjY29yZGluZyB0byBzcGVjaWZpY2l0eVxuICAgIHJldHVybiBzb3J0QnlTcGVjaWZpY2l0eShlbGVtZW50LCByZXN1bHQpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0Tm9kZUNTU1J1bGVzO1xuIl19
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/polyfills/get-matched-css-rules.jsx","/polyfills")
},{"buffer":2,"rH1JPG":4}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function explainWarning() {
    if (window.explained) return;
    console.log('%cWhen \'getMatchedCSSRules()\' is removed, Critical Snapshot will fallback to a polyfill. Untill then, we will use the native version for better performance.', 'color: aqua;');
    window.explained = true;
}

exports.default = explainWarning;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4cGxhaW5XYXJuaW5nLmpzeCJdLCJuYW1lcyI6WyJleHBsYWluV2FybmluZyIsIndpbmRvdyIsImV4cGxhaW5lZCIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsU0FBU0EsY0FBVCxHQUEwQjtBQUN0QixRQUFJQyxPQUFPQyxTQUFYLEVBQXNCO0FBQ3RCQyxZQUFRQyxHQUFSLENBQVksZ0tBQVosRUFBOEssY0FBOUs7QUFDQUgsV0FBT0MsU0FBUCxHQUFtQixJQUFuQjtBQUNIOztrQkFFY0YsYyIsImZpbGUiOiJleHBsYWluV2FybmluZy5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBleHBsYWluV2FybmluZygpIHtcbiAgICBpZiAod2luZG93LmV4cGxhaW5lZCkgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKCclY1doZW4gXFwnZ2V0TWF0Y2hlZENTU1J1bGVzKClcXCcgaXMgcmVtb3ZlZCwgQ3JpdGljYWwgU25hcHNob3Qgd2lsbCBmYWxsYmFjayB0byBhIHBvbHlmaWxsLiBVbnRpbGwgdGhlbiwgd2Ugd2lsbCB1c2UgdGhlIG5hdGl2ZSB2ZXJzaW9uIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuJywgJ2NvbG9yOiBhcXVhOycpO1xuICAgIHdpbmRvdy5leHBsYWluZWQgPSB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHBsYWluV2FybmluZztcbiJdfQ==
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utilities/explainWarning.jsx","/utilities")
},{"buffer":2,"rH1JPG":4}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// removes all css styles from the webpage
function removeDocumentStyles() {
    var appCssElements = [].slice.call(document.querySelectorAll('[type="text/css"]'));
    appCssElements.forEach(function (elm) {
        elm.remove();
    });

    var appStylesheetElements = [].slice.call(document.querySelectorAll('[rel="stylesheet"]'));
    appStylesheetElements.forEach(function (elm) {
        elm.remove();
    });

    var appStyleElements = [].slice.call(document.getElementsByTagName('style'));
    appStyleElements.forEach(function (elm) {
        elm.remove();
    });
}

exports.default = removeDocumentStyles;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlbW92ZURvY3VtZW50U3R5bGVzLmpzeCJdLCJuYW1lcyI6WyJyZW1vdmVEb2N1bWVudFN0eWxlcyIsImFwcENzc0VsZW1lbnRzIiwic2xpY2UiLCJjYWxsIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImVsbSIsInJlbW92ZSIsImFwcFN0eWxlc2hlZXRFbGVtZW50cyIsImFwcFN0eWxlRWxlbWVudHMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBLFNBQVNBLG9CQUFULEdBQWdDO0FBQzVCLFFBQUlDLGlCQUFpQixHQUFHQyxLQUFILENBQVNDLElBQVQsQ0FBY0MsU0FBU0MsZ0JBQVQsQ0FBMEIsbUJBQTFCLENBQWQsQ0FBckI7QUFDQUosbUJBQWVLLE9BQWYsQ0FBdUIsVUFBU0MsR0FBVCxFQUFjO0FBQ2pDQSxZQUFJQyxNQUFKO0FBQ0gsS0FGRDs7QUFJQSxRQUFJQyx3QkFBd0IsR0FBR1AsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQVNDLGdCQUFULENBQTBCLG9CQUExQixDQUFkLENBQTVCO0FBQ0FJLDBCQUFzQkgsT0FBdEIsQ0FBOEIsVUFBU0MsR0FBVCxFQUFjO0FBQ3hDQSxZQUFJQyxNQUFKO0FBQ0gsS0FGRDs7QUFJQSxRQUFJRSxtQkFBbUIsR0FBR1IsS0FBSCxDQUFTQyxJQUFULENBQWNDLFNBQVNPLG9CQUFULENBQThCLE9BQTlCLENBQWQsQ0FBdkI7QUFDQUQscUJBQWlCSixPQUFqQixDQUF5QixVQUFTQyxHQUFULEVBQWM7QUFDbkNBLFlBQUlDLE1BQUo7QUFDSCxLQUZEO0FBR0g7O2tCQUVjUixvQiIsImZpbGUiOiJyZW1vdmVEb2N1bWVudFN0eWxlcy5qc3giLCJzb3VyY2VzQ29udGVudCI6WyIvLyByZW1vdmVzIGFsbCBjc3Mgc3R5bGVzIGZyb20gdGhlIHdlYnBhZ2VcbmZ1bmN0aW9uIHJlbW92ZURvY3VtZW50U3R5bGVzKCkge1xuICAgIHZhciBhcHBDc3NFbGVtZW50cyA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW3R5cGU9XCJ0ZXh0L2Nzc1wiXScpKTtcbiAgICBhcHBDc3NFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICBlbG0ucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICB2YXIgYXBwU3R5bGVzaGVldEVsZW1lbnRzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbcmVsPVwic3R5bGVzaGVldFwiXScpKTtcbiAgICBhcHBTdHlsZXNoZWV0RWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgZWxtLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgdmFyIGFwcFN0eWxlRWxlbWVudHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdHlsZScpKTtcbiAgICBhcHBTdHlsZUVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgIGVsbS5yZW1vdmUoKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVtb3ZlRG9jdW1lbnRTdHlsZXM7XG4iXX0=
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utilities/removeDocumentStyles.jsx","/utilities")
},{"buffer":2,"rH1JPG":4}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
// Selects element text by ID
function selectText(id) {
    var element = document.getElementById(id);

    var range = document.createRange();
    range.selectNodeContents(element);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

exports.default = selectText;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlbGVjdFRleHQuanN4Il0sIm5hbWVzIjpbInNlbGVjdFRleHQiLCJpZCIsImVsZW1lbnQiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsInNlbGVjdE5vZGVDb250ZW50cyIsInNlbGVjdGlvbiIsIndpbmRvdyIsImdldFNlbGVjdGlvbiIsInJlbW92ZUFsbFJhbmdlcyIsImFkZFJhbmdlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0EsU0FBU0EsVUFBVCxDQUFvQkMsRUFBcEIsRUFBd0I7QUFDcEIsUUFBSUMsVUFBVUMsU0FBU0MsY0FBVCxDQUF3QkgsRUFBeEIsQ0FBZDs7QUFFQSxRQUFJSSxRQUFRRixTQUFTRyxXQUFULEVBQVo7QUFDQUQsVUFBTUUsa0JBQU4sQ0FBeUJMLE9BQXpCOztBQUVBLFFBQUlNLFlBQVlDLE9BQU9DLFlBQVAsRUFBaEI7QUFDQUYsY0FBVUcsZUFBVjtBQUNBSCxjQUFVSSxRQUFWLENBQW1CUCxLQUFuQjtBQUNIOztrQkFFY0wsVSIsImZpbGUiOiJzZWxlY3RUZXh0LmpzeCIsInNvdXJjZXNDb250ZW50IjpbIi8vIFNlbGVjdHMgZWxlbWVudCB0ZXh0IGJ5IElEXG5mdW5jdGlvbiBzZWxlY3RUZXh0KGlkKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcblxuICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsZW1lbnQpO1xuXG4gICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc2VsZWN0VGV4dDtcbiJdfQ==
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utilities/selectText.jsx","/utilities")
},{"buffer":2,"rH1JPG":4}]},{},[6])