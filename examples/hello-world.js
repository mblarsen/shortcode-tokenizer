require('babel-polyfill')

const Tokenizer = require('../dist/shortcode-tokenizer.js').default
const tokenizer = new Tokenizer('[code]Hello World[/code]')

const ast = tokenizer.ast();
console.log(ast);

// Reverse AST
const template = tokenizer.buildTemplate(ast[0]);
console.log(template);

try {
  tokenizer.input('[/code]').ast()
  console.log('I guess we\'ll never know')
} catch (err) {
  console.log('Error: ' + err.message)
}
