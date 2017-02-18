import * as lib from '../../src/shortcode-tokenizer'
const Tokenizer = lib.default
const Token = lib.Token

describe('ShortcodeTokenizer', () => {
  describe('RegExps', () => {
    it('should match enclosure tag', function () {
      expect('[code]').to.match(Tokenizer.rxEnclosure)
    })
  })

  describe('Tokenize function', () => {
    let tokenizer

    beforeEach(() => {
      tokenizer = new Tokenizer()
      spy(tokenizer, 'tokenize')
    })

    it('should throw an error when not passing a string', () => {
      expect(tokenizer.tokenize).to.throw('Invalid input')
      expect(tokenizer.tokenize.bind(tokenizer, {})).to.throw('Invalid input')
      expect(tokenizer.tokenize.bind(tokenizer, 1)).to.throw('Invalid input')
      expect(tokenizer.tokenize).to.have.been.callCount(3)
    })

    // it('should return an empty array when passed an empty string', () => {
    //   expect(tokenizer.tokenize('')).to.be.an.instanceof(Array)
    //   expect(tokenizer.tokenize('')).to.be.empty
    // })

    // it('should return a single element array when passed a space-char', () => {
    //   expect(tokenizer.tokenize(' ')).to.eql([new Token(Tokenizer.TEXT, ' ')])
    // })

    it('should return a single element array when passed a simple code', () => {
      const input = '[code][/code]'
      expect(tokenizer.tokenize(input)).to.eql([new Token(Tokenizer.CODE, input)])
    })
    //
    // it('should return a single element array when there are no codes', () => {
    //   const input1 = ' '
    //   expect(tokenizer.tokenize(' ')).to.eql([new Token(Tokenizer.TEXT, input1)])
    //   // const input2 = 'Hello World'
    //   // expect(tokenizer.tokenize(' ')).to.eql([new Token(Tokenizer.TEXT, input2)])
    // })
    // it('should have been run once', () => {
    //   expect(shortcodeTokenizer.greet).to.have.been.calledOnce
    // })
    //
    // it('should have always returned hello', () => {
    //   expect(shortcodeTokenizer.greet).to.have.always.returned('hello')
    // })
  })
})
