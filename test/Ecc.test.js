const Ecc = require('../lib/Ecc')

test('Ecc module encrypt/decrypt message', () => {
  const message = JSON.stringify({hello: 'world'})
  const {publicKey, privateKey} = require('../config').key

  const cipher = Ecc.encrypt(publicKey, message)
  const decodedMessage = Ecc.decrypt(privateKey, cipher)
  expect(message).toBe(decodedMessage)
})
