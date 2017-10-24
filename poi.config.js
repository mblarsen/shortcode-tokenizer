module.exports = {
  entry: './src/shortcode-tokenizer.js',
  filename: {js: 'shortcode-tokenizer.js'},
  vendor: false,
  sourceMap: true,
  html: false,
  presets: [
    require('poi-preset-karma')({
      coverage: true,
      headless: true,
      frameworks: ['sinon-chai', 'mocha'],
    })
  ],
}
