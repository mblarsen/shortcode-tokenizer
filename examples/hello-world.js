require('babel-polyfill')
const Tokenizer = require('../dist/shortcode-tokenizer.js').default

const tokenizer = new Tokenizer('[code]Hello World[/code]')
console.log(tokenizer.ast())

try {
  tokenizer.input('[/code]').ast()
  console.log('I guess we\'ll never know')
} catch (err) {
  console.log('Error: ' + err.message)
}
