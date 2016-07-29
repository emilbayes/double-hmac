'use strict'

const assert = require('assert')

const crypto = require('crypto')

const equalsConstant = require('buffer-equals-constant')
const HASH_ALGORITHM = 'sha512'
const HASH_LENGTH_BYTES = 512 / 8

/**
 * Double HMAC compare to avoid a constant time comparison (even tough one is
 * attempted)
 *
 * @param  {Buffer}   a  RHS to compare
 * @param  {Buffer}   b  LHS to compare
 * @param  {Function} cb
 */
module.exports = function compare (a, b, cb) {
  assert.ok(Buffer.isBuffer(a), 'a should be a buffer')
  assert.ok(Buffer.isBuffer(b), 'b should be a buffer')
  assert.strictEqual(typeof cb, 'function', 'cb should be a function')

  crypto.randomBytes(HASH_LENGTH_BYTES, function (err, nounce) {
    if (err) return cb(err)

    assert.ok(Buffer.isBuffer(nounce))

    const aPrime = doubleHmac(a, nounce)
    const bPrime = doubleHmac(b, nounce)

    // Finished using the nounce, so zero it
    nounce.fill(0)

    assert.ok(Buffer.isBuffer(aPrime))
    assert.ok(Buffer.isBuffer(bPrime))
    assert.notEqual(a, aPrime)
    assert.notEqual(b, bPrime)

    const equality = equalsConstant(aPrime, bPrime, HASH_LENGTH_BYTES)

    // Finished using the hmac'ed buffers
    aPrime.fill(0)
    bPrime.fill(0)

    assert.strictEqual(typeof equality, 'boolean')

    cb(null, equality)
  })

  function doubleHmac (buf, nounceBuf) {
    assert.ok(Buffer.isBuffer(buf))
    assert.ok(Buffer.isBuffer(nounceBuf))

    return crypto.createHmac(HASH_ALGORITHM, nounceBuf)
      .update(buf)
      .digest()
  }
}
