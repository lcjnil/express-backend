const message = {"p":"13111111111","a":"组撒的方式登记法律上的考虑烦死了都","n":"啦啦啦"}
const {genKeypair, encrypt, decrypt, unserializePubKey} = require('./lib/Ecc')
const keyPair = genKeypair()
console.log(keyPair)

const cipher = encrypt(keyPair.publicKey, message)
console.log(cipher)

console.log(decrypt(keyPair.privateKey, cipher))

