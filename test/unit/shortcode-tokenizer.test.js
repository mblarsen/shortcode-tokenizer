import * as lib from '../../src/shortcode-tokenizer'
const Tokenizer = lib.default
const Token = lib.Token

describe('ShortcodeTokenizer', () => {
  describe('RegExps', () => {
    it('should match enclosure tag', function () {
      expect('[code]').to.match(Tokenizer.rxEnclosure)
      expect('[/code]').to.match(Tokenizer.rxEnclosure)
      expect('[code/]').to.match(Tokenizer.rxEnclosure)
      expect('[code /]').to.match(Tokenizer.rxEnclosure)

      // Not many negativ tests since this is just used
      // as an indicator that a code is precent or not
      expect('[ ]').not.to.match(Tokenizer.rxEnclosure)
    })

    it('should match close tag', function () {
      expect('[/code]').to.match(Tokenizer.rxClose)

      expect('[/ code]').not.to.match(Tokenizer.rxClose)
      expect('[/ code ]').not.to.match(Tokenizer.rxClose)
      expect('[ /code]').not.to.match(Tokenizer.rxClose)
      expect('[ / code ]').not.to.match(Tokenizer.rxClose)
    })

    it('should match open tag', function () {
      expect('[code]').to.match(Tokenizer.rxOpen)
      expect('[code a]').to.match(Tokenizer.rxOpen)
      expect('[code a=1]').to.match(Tokenizer.rxOpen)
      expect('[code a=1.1]').to.match(Tokenizer.rxOpen)
      expect('[code a="a"]').to.match(Tokenizer.rxOpen)
      expect('[code ]').not.to.match(Tokenizer.rxOpen)
      expect('[code a ]').not.to.match(Tokenizer.rxOpen)
      expect('[code a=1 ]').not.to.match(Tokenizer.rxOpen)
      expect('[code a=1.]').not.to.match(Tokenizer.rxOpen)
    })

    it('should match open tag, with HTML', function () {
      expect('[code a="Some text with <a href="https://google.com">a link</a>"]').to.match(Tokenizer.rxOpenHtml);
      expect('[code a=\'a\']').to.match(Tokenizer.rxOpenHtml)
      expect("[code a='Some text with <a href=\"https://google.com\"><ul>a <li>link</ul></a>']'").to.match(Tokenizer.rxOpenHtml);
    })

    it('should match self-closing tag', function () {
      expect('[code/]').to.match(Tokenizer.rxSelfclosing)
      expect('[code /]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a/]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a /]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a=1/]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a=1 /]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a=1.1/]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a=1.1 /]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a="a"/]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a="a" /]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a=\'a\'/]').to.match(Tokenizer.rxSelfclosing)
      expect('[code a=\'a\' /]').to.match(Tokenizer.rxSelfclosing)

      expect('[code  /]').not.to.match(Tokenizer.rxSelfclosing)
      expect('[code/ ]').not.to.match(Tokenizer.rxSelfclosing)
      expect('[code / ]').not.to.match(Tokenizer.rxSelfclosing)
      expect('[code a  /]').not.to.match(Tokenizer.rxSelfclosing)
      expect('[code a  / ]').not.to.match(Tokenizer.rxSelfclosing)
      expect('[code a=1./]').not.to.match(Tokenizer.rxSelfclosing)
      expect('[code a=1. /]').not.to.match(Tokenizer.rxSelfclosing)
    })
  })

  describe('Constructor', () => {
    it('Should all option when only passing boolean', () => {
      let tokenizer
      tokenizer = new Tokenizer(null, true)
      expect(tokenizer.options.strict).to.be.true
      expect(tokenizer.options.skipWhiteSpace).to.be.false
      tokenizer = new Tokenizer(null, false)
      expect(tokenizer.options.strict).to.be.false
      expect(tokenizer.options.skipWhiteSpace).to.be.false
    })

    it('Should be able to take options object', () => {
      let tokenizer
      tokenizer = new Tokenizer(null, {})
      expect(tokenizer.options.strict).to.be.true
      expect(tokenizer.options.skipWhiteSpace).to.be.false
      tokenizer = new Tokenizer(null, {strict: false, skipWhiteSpace: true})
      expect(tokenizer.options.strict).to.be.false
      expect(tokenizer.options.skipWhiteSpace).to.be.true
    })

    it('Should be able to take input and reset', () => {
      const tokenizer = new Tokenizer('[code/]', {})
      expect(tokenizer.buf).to.equal('[code/]')
      expect(tokenizer.originalBuf).to.equal('[code/]')
      expect(tokenizer.pos).to.equal(0)

      tokenizer.buf = 'foo'
      tokenizer.pos = 42
      expect(tokenizer.buf).to.equal('foo')
      expect(tokenizer.originalBuf).to.equal('[code/]')
      expect(tokenizer.pos).to.equal(42)
      tokenizer.reset()
      expect(tokenizer.buf).to.equal('[code/]')
      expect(tokenizer.originalBuf).to.equal('[code/]')
      expect(tokenizer.pos).to.equal(0)

    })
  })

  describe('Token creation', () => {
    let tokenizer

    let constructorWrapper = function () {
      let args = arguments
      return function () {
        return new Token(...args)
      }
    }

    beforeEach(() => {
      tokenizer = new Tokenizer()
      sinon.spy(tokenizer, 'tokens')
    })

    it('should create a simple OPEN token', () => {
      let input = '[basket]'
      let basketToken = new Token(Tokenizer.OPEN, input)
      expect(tokenizer.tokens(input)).to.eql([basketToken])
    })

    it('should throw syntax error on invalid input, OPEN', () => {
      // only testing one case since rx is already tested above
      let input = '[row'
      expect(constructorWrapper(Tokenizer.OPEN, input))
        .to.throw('Invalid OPEN token: ' + input)
    })

    it('should throw syntax error on invalid input, SELF_CLOSING', () => {
      // only testing one case since rx is already tested above
      let input = '[row'
      expect(constructorWrapper(Tokenizer.SELF_CLOSING, input))
        .to.throw('Invalid SELF_CLOSING token: ' + input)
    })

    it('should throw syntax error on invalid input, CLOSE', () => {
      // only testing one case since rx is already tested above
      let input = '[row'
      expect(constructorWrapper(Tokenizer.CLOSE, input))
        .to.throw('Invalid CLOSE token: ' + input)
    })

    it('should create an OPEN token with three params', () => {
      let input = '[basket total=32 tax=3.2 checkout-button="Checkout"]'
      const result = tokenizer.tokens(input)
      expect(result[0].name).to.eql('basket')
      expect(result[0].params).to.eql({
        total: 32,
        tax: 3.2,
        'checkout-button': 'Checkout'
      })
    })

    it('should return token as string', () => {
      let input = '[basket total=32 tax=3.2 checkout-button="Checkout" on=yes]'
      const result = tokenizer.tokens(input)

      expect(result.toString()).to.equal('[basket total=32 tax=3.2 checkout-button="Checkout" on=true][/basket]')
    })

    it('change params should affect in building string', () => {
      let input = '[basket total=32]'
      const result = tokenizer.tokens(input)
      result[0].params.tax = 3.2

      expect(result.toString()).to.equal('[basket total=32 tax=3.2][/basket]')
    })
  })

  describe('Tokenize function', () => {
    let tokenizer

    beforeEach(() => {
      tokenizer = new Tokenizer()
      sinon.spy(tokenizer, 'tokens')
    })

    it('should throw an error when not passing a string', () => {
      expect(tokenizer.tokens.bind(tokenizer)).to.throw('Invalid input')
      expect(tokenizer.tokens.bind(tokenizer, {})).to.throw('Invalid input')
      expect(tokenizer.tokens.bind(tokenizer, 1)).to.throw('Invalid input')
      expect(tokenizer.tokens).to.have.been.callCount(3)
    })

    it('should return a single element array when passed a string with no matches', () => {
      expect(tokenizer.input('').tokens()).to.be.an.instanceof(Array)
      expect(tokenizer.input('').tokens()).to.be.empty
      expect(tokenizer.input(' ').tokens()).to.eql([new Token(Tokenizer.TEXT, ' ')])
    })

    it('should reset internal position when re-running', () => {
      expect(tokenizer.input('').tokens()).to.be.an.instanceof(Array)
      expect(tokenizer.input('').tokens()).to.be.empty
      expect(tokenizer.input(' ').tokens()).to.eql([new Token(Tokenizer.TEXT, ' ')])
      expect(tokenizer.input(' ').tokens()).to.eql([new Token(Tokenizer.TEXT, ' ', 0)])
    })

    it('should return a single element array when passed a string with no matches, more cases', () => {
      expect(tokenizer.input('Hello').tokens()).to.eql([new Token(Tokenizer.TEXT, 'Hello')])
      expect(tokenizer.input('[Hello').tokens()).to.eql([new Token(Tokenizer.TEXT, '[Hello')])
      expect(tokenizer.input(']Hello').tokens()).to.eql([new Token(Tokenizer.TEXT, ']Hello')])
      expect(tokenizer.input(']Hello[').tokens()).to.eql([new Token(Tokenizer.TEXT, ']Hello[')])
      expect(tokenizer.input('][Hello').tokens()).to.eql([new Token(Tokenizer.TEXT, '][Hello')])
      expect(tokenizer.input('[]Hello').tokens()).to.eql([new Token(Tokenizer.TEXT, '[]Hello')])
      expect(tokenizer.input('Hello[]').tokens()).to.eql([new Token(Tokenizer.TEXT, 'Hello[]')])
      expect(tokenizer.input('Hello[ ]').tokens()).to.eql([new Token(Tokenizer.TEXT, 'Hello[ ]')])
      expect(tokenizer.input('Hel[ ]lo').tokens()).to.eql([new Token(Tokenizer.TEXT, 'Hel[ ]lo')])
    })

    it('should parse a flag-type param', () => {
      let input = '[basket keep-alive]'
      let basketToken = new Token(Tokenizer.OPEN, input)
      expect(tokenizer.input(input).tokens()).to.eql([basketToken])
    })

    it('should parse map booleans', () => {
      expect(tokenizer.input('[widget on="true"/]').tokens()[0].params).to.eql({on: 'true'})
      expect(tokenizer.input('[widget on=true/]').tokens()[0].params).to.eql({on: true})
      expect(tokenizer.input('[widget on="yes"/]').tokens()[0].params).to.eql({on: 'yes'})
      expect(tokenizer.input('[widget on=yes/]').tokens()[0].params).to.eql({on: true})
      expect(tokenizer.input('[widget on="false"/]').tokens()[0].params).to.eql({on: 'false'})
      expect(tokenizer.input('[widget on=false/]').tokens()[0].params).to.eql({on: false})
      expect(tokenizer.input('[widget on="no"/]').tokens()[0].params).to.eql({on: 'no'})
    })

    it('should make destinction between numbers and strings', () => {
      expect(tokenizer.input('[widget num=42/]').tokens()[0].params).to.eql({num: 42})
      expect(tokenizer.input('[widget str="42"/]').tokens()[0].params).to.eql({str: '42'})
    })

    it('should thow on unknown type', () => {
      let newUp

      newUp = () => (new Token())
      expect(newUp).to.throw(Error, 'Unknown token')
      newUp = () => (new Token('foo'))
      expect(newUp).to.throw(Error, 'Unknown token')
    })
  })

  describe('AST function', () => {
    let tokenizer

    beforeEach(() => {
      tokenizer = new Tokenizer()
    })

    it('should return empty array on empty input', () => {
      expect(tokenizer.input('').ast()).to.be.empty
    })

    it('should return an AST with only one text node', () => {
      expect(tokenizer.input('Hello').ast()).to.eql([new Token('TEXT', 'Hello')])
    })

    it('should throw exception if dangling CLOSE is encountered', () => {
      expect(tokenizer.input('[/code]').ast.bind(tokenizer)).to.throw('Unmatched close token: [/code]')
      expect(tokenizer.input('[foo][/bar]').ast.bind(tokenizer)).to.throw('Unmatched close token: [/bar]')
    })

    it('should convert dangling CLOSE if not strict', () => {
      tokenizer.options.strict = false
      expect(tokenizer.input('[/code]').ast()).to.eql([new Token('ERROR', '[/code]')])
    })

    it('should throw exception if orfant OPEN', () => {
      expect(tokenizer.input('[code]').ast.bind(tokenizer)).to.throw('Unmatched open token: [code]')
    })

    it('should add error token when strict mode is disabled and is unmatched open token', () => {
      tokenizer.options.strict = false
      const token = tokenizer.input('[row]').ast()
      expect(token[1].type).to.be.equal(Tokenizer.ERROR)
    })

    it('should throw exception if orfant OPEN', () => {
      expect(tokenizer.input('[code]').ast.bind(tokenizer)).to.throw('Unmatched open token: [code]')
    })

    it('should return a single non-text node AST', () => {
      const match = new Token(Tokenizer.OPEN, '[code]', 0)
      match.isClosed = true

      const ast = tokenizer.input('[code][/code]').ast().pop()
      expect(ast).to.eql(ast)
      expect(ast.children).to.be.empty
    })

    it('should return a single non-text node AST (self-closing)', () => {
      const match = new Token(Tokenizer.SELF_CLOSING, '[code/]', 0)
      match.isClosed = true

      const ast = tokenizer.input('[code/]').ast().pop()
      expect(ast).to.eql(ast)
      expect(ast.children).to.be.empty
    })

    it('should return a single non-text node AST with a text child', () => {
      const openNode = new Token(Tokenizer.OPEN, '[code]', 0)
      openNode.isClosed = true
      openNode.children.push(new Token(Tokenizer.TEXT, 'dance dance', 6))

      const ast = tokenizer.input('[code]dance dance[/code]').ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql([openNode])
    })

    it('should return a single non-text node AST with a self-closing child', () => {
      const openNode = new Token(Tokenizer.OPEN, '[code]', 0)
      openNode.isClosed = true
      openNode.children.push(new Token(Tokenizer.SELF_CLOSING, '[foo/]', 6))

      const ast = tokenizer.input('[code][foo/][/code]').ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql([openNode])
    })

    it('should return a single non-text node AST with a text child (multiline)', () => {
      const dance = `
        dance dance
        `
      const openNode = new Token(Tokenizer.OPEN, '[code]', 0)
      openNode.isClosed = true
      openNode.children.push(new Token(Tokenizer.TEXT, dance, 6))

      const ast = tokenizer.input(`[code]${dance}[/code]`).ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql([openNode])
    })

    it('should return a non-text node AST with a text child + a single text node', () => {
      const openNode = new Token(Tokenizer.OPEN, '[code]', 0)
      openNode.isClosed = true
      openNode.children.push(new Token(Tokenizer.TEXT, 'dance dance', 6))
      const astMatch = [
        openNode,
        new Token(Tokenizer.TEXT, 'now', 24)
      ]

      const ast = tokenizer.input('[code]dance dance[/code]now').ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql(astMatch)
    })

    it('should return a nested AST', () => {
      const openNode = new Token(Tokenizer.OPEN, '[code]', 0)
      openNode.isClosed = true
      const openNode2 = new Token(Tokenizer.OPEN, '[code]', 6)
      openNode2.isClosed = true
      openNode.children.push(openNode2)
      const astMatch = [openNode]

      const ast = tokenizer.input('[code][code][/code][/code]').ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql(astMatch)
    })

    it('should return multiple root nodes and children', () => {
      const row1 = new Token(Tokenizer.OPEN, '[row]', 0)
      row1.isClosed = true
      const col1 = new Token(Tokenizer.OPEN, '[col]', 5)
      col1.isClosed = true
      col1.children.push(new Token(Tokenizer.TEXT, 'Hello', 10))
      row1.children.push(col1)
      const col2 = new Token(Tokenizer.OPEN, '[col]', 21)
      col2.isClosed = true
      col2.children.push(new Token(Tokenizer.TEXT, 'World', 26))
      row1.children.push(col2)

      const row2 = new Token(Tokenizer.OPEN, '[row]', 43)
      row2.isClosed = true
      const col3 = new Token(Tokenizer.OPEN, '[col]', 48)
      col3.isClosed = true
      col3.children.push(new Token(Tokenizer.TEXT, 'Foo', 53))
      row2.children.push(col3)
      const col4 = new Token(Tokenizer.OPEN, '[col]', 62)
      col4.isClosed = true
      col4.children.push(new Token(Tokenizer.TEXT, 'Bar', 67))
      row2.children.push(col4)

      const astMatch = [row1, row2]

      const ast = tokenizer.input('[row][col]Hello[/col][col]World[/col][/row][row][col]Foo[/col][col]Bar[/col][/row]').ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql(astMatch)
    })

    it('should throw error on nested dangling close', () => {
      const astMethod = tokenizer.input('[row][col]Hello[/col][col]World[/col][/row][row][col]Foo[/col][/col]Bar[/col][/row]').ast
      expect(astMethod.bind(tokenizer)).to.throw('Unmatched close token: [/col]')
    })

    it('should add error token when strict mode is disabled and is unmatched close token', () => {
      tokenizer.options.strict = false
      const token = tokenizer.input('[row][/col][/col][/row]').ast()[0]
      expect(token.children[0].type).to.be.equal(Tokenizer.ERROR)
    })

    it('should skip empty text nodes', () => {
      const openNode = new Token(Tokenizer.OPEN, '[code]', 0)
      openNode.isClosed = true
      openNode.children.push(new Token(Tokenizer.SELF_CLOSING, '[foo/]', 15))
      tokenizer.options.skipWhiteSpace = true
      const ast = tokenizer.input(`[code]
        [foo/]
      [/code]`).ast()
      expect(ast).to.be.an.instanceof(Array)
      expect(ast).to.eql([openNode])
    })
  })

  describe('Build template function', () => {
    let tokenizer
    const makeToken = (value) => tokenizer.input(value).ast()[0]

    beforeEach(() => {
      tokenizer = new Tokenizer()
    })

    it('should return empty string on empty input', () => {
      expect(tokenizer.buildTemplate(null)).to.be.empty
    })

    it('should throw syntax error on array input', () => {
      const ast = tokenizer.input('[code][/code]').ast()

      expect(tokenizer.buildTemplate.bind(null, ast)).to.throw('Expected Token instance.')
    })

    it('should return empty string when is unknown token type', () => {
      tokenizer.options.strict = false
      const token = tokenizer.input('[row][/cell][/cell][/row]').ast()[0]

      expect(tokenizer.buildTemplate(token)).to.equal('[row][/row]')
    })

    it('should return base node', () => {
      const code = '[code][/code]'
      const token = makeToken(code)

      expect(tokenizer.buildTemplate(token)).to.equal(code)
    })

    it('should return base node with text', () => {
      const code = '[code]Lorem ipsum[/code]'
      const token = makeToken(code)

      expect(tokenizer.buildTemplate(token)).to.equal(code)
    })

    it('should return node with children', () => {
      const code = `[code]
        [row]Lorem ipsum[/row]
        [row][cell][spacer/][/cell][/row]
        [row][cell]Lorem ispum[spacer/][/cell][/row]
      [/code]`

      const token = makeToken(code)
      expect(tokenizer.buildTemplate(token)).to.equal(code)
    })

    it('should return node with children and parameters', () => {
      const code = `[code]
        [cell size="10"]Lorem ipsum[/cell]
        [cell size="10"][spacer show="true"/][/cell]
      [/code]`

      const token = makeToken(code)
      expect(tokenizer.buildTemplate(token)).to.equal(code)
    })

    it('should return node with overwritten params', () => {
      const token = makeToken('[code foo="bar"][/code]')

      expect(tokenizer.buildTemplate(token, {})).to.equal('[code][/code]')
    })

    it('should return self closing node with overwritten params', () => {
      const token = makeToken('[spacer /]')

      expect(tokenizer.buildTemplate(token, { width: '20px' }))
        .to.equal('[spacer width="20px"/]')
    })

    it('should return self closing node with overwritten params by string', () => {
      const token = makeToken('[spacer height="50px"/]')

      expect(tokenizer.buildTemplate(token, 'height="5px"'))
        .to.equal('[spacer height="5px"/]')
    })
  })

  describe('HTML content', () => {
    let tokenizer

    beforeEach(() => {
      tokenizer = new Tokenizer(null, {html: true})
    })

    it('Token.withHtml should be set', function () {
      expect(Token.withHtml).to.be.equal(true)
    })

    it('create a single token with html in param', function () {
      const paramValue = `Some text with <a href="https://google.com">a link</a>`
      const input = `[code a="${paramValue}" /]`
      const [token] = tokenizer.input(input).ast()
      expect(token.type).to.be.equal(Tokenizer.SELF_CLOSING)
      expect(token.children.length).to.be.equal(0)
      console.log(token.params)
      expect(token.params).to.be.equal({
        a: paramValue
      })
    })
  })

})
