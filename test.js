'use strict'

const test = require('tape')
const doubleHmac = require('.')

test('equality', function (assert) {
  const a = Buffer.from('some password 89123 +-.¨')
  const b = Buffer.from('some password 89123 +-.¨')

  assert.notStrictEqual(a, b)

  doubleHmac(a, b, function (err, equality) {
    assert.error(err)
    assert.ok(equality)
    assert.end()
  })
})

test('inequality', function (assert) {
  assert.plan(6 + 6 * 2)

  const a = Buffer.from('some password 89123 +-.¨dsa')
  const b = Buffer.from('some password 89123 +-.¨')
  const c = Buffer.from('something wildly different')
  const d = Buffer.from('')

  assert.notStrictEqual(a, b)
  assert.notStrictEqual(a, c)
  assert.notStrictEqual(a, d)
  assert.notStrictEqual(b, c)
  assert.notStrictEqual(b, d)
  assert.notStrictEqual(c, d)

  doubleHmac(a, b, assertCb)
  doubleHmac(a, c, assertCb)
  doubleHmac(a, d, assertCb)
  doubleHmac(b, c, assertCb)
  doubleHmac(b, d, assertCb)
  doubleHmac(c, d, assertCb)

  function assertCb (err, equality) {
    assert.error(err)
    assert.notOk(equality)
  }
})

test('failure modes', function (assert) {
  assert.plan(5 + 1 + 3)

  assert.throws(_ => doubleHmac())
  assert.throws(_ => doubleHmac('pass', 'pass'))
  assert.throws(_ => doubleHmac(null, null))
  assert.throws(_ => doubleHmac({}, {}))
  assert.throws(_ => doubleHmac(Buffer.alloc(0), Buffer.alloc(0)))

  assert.throws(_ => doubleHmac('pass', null, _ => assert.fail()))

  assert.throws(_ => doubleHmac('pass', 'pass', _ => assert.fail()), 'should throw on string')
  assert.throws(_ => doubleHmac(null, null, _ => assert.fail()), 'should throw on null')
  assert.throws(_ => doubleHmac({}, {}, _ => assert.fail()), 'should throw on objects')
})
