export class Token {
  constructor(type, body, pos = 0) {
    this.type = type
    this.body = body
    this.pos = pos
    this.isSelfClosing = false
    this.children = []
    this.params = []
  }

  addChild(child) {
    this.children.push(child)
  }

  addParam(param) {
    this.params.push(param)
  }
}

export const TEXT = 'TEXT'
export const CODE = 'CODE'

/* eslint-disable */
const RX_KEY         = '[a-zA-Z0-9_]+'
const RX_PARAM       = RX_KEY +
                       '|' + RX_KEY + '=\d+\.\d+' +
                       '|' + RX_KEY + '=\d+' + '|' +
                       '|' + RX_KEY + '="[^\]"]+"' +
                       '|' + RX_KEY + '=\'[^\]\']+\''
const RX_PARAMS      = '(' + RX_PARAM + '\s?)*'

const RX_ENCLOSURE   = '\\[[^\]]+\\]'
const RX_OPEN        = '\\[(' + RX_KEY + ') ' + RX_PARAMS + '\\]'
const RX_SELFCLOSING = '\\[(' + RX_KEY + ')\\s?\\/\\]'
const RX_CLOSE       = '\\[\\/(' + RX_KEY + ')\\]'

const rxEnclosure   = new RegExp(RX_ENCLOSURE)
const rxOpen        = new RegExp(RX_OPEN, 'i')
const rxClose       = new RegExp(RX_CLOSE, 'i')
const rxSelfclosing = new RegExp(RX_SELFCLOSING, 'i')
/* eslint-enable */

export default class ShortcodeTokenizer {

  constructor() {
    this.buf = null
    this.pos = 0
  }

  /**
   * Returns an array of one or more AST roots
   *
   * @returns {undefined}
   */
  tokenize(input) {
    if (typeof input !== 'string') {
      throw new Error('Invalid input')
    }

    console.log(`Input: "${input}"`)

    this.buf = this.originalBuf = input

    // Get tokens
    let tokens = []
    let token
    while ((token = this._token()) !== null) {
      if (Array.isArray(token)) {
        tokens = [...tokens, ...token]
      } else {
        tokens.push(token)
      }
    }
    console.log('Tokens', tokens)

    // Build AST
    return tokens
  }

  _token() {
    if (!this.buf) {
      console.log('Empty buffer')
      return null
    }

    let match = this.buf.match(rxEnclosure)
    console.log('Match', match)

    // all text
    if (match === null) {
      console.log('No match')
      let token = new Token(TEXT, this.buf, this.pos)
      this.pos += this.buf.length
      this.buf = null
      return token
    }

    let tokens = []

    // first part is text
    if (match.index !== 0) {
      tokens.push(new Token(
        TEXT,
        this.buf.substring(0, match.index),
        this.pos
      ))
    }

    // matching token
    tokens.push(new Token(
      CODE,
      this.buf.substring(match.index, match[0].length),
      this.pos + match.index
    ))

    // shorten buffer
    this.buf = this.buf.substring(match[0].length)
    this.pos += match.index + match[0].length
    if (this.buf.length === 0) {
      this.buf = null
    }
    return tokens
  }
    // on each match match again against the three types of tokens: open, close,
    // selfclosing
}

Object.assign(ShortcodeTokenizer, {
  TEXT,
  CODE,
  rxEnclosure,
  rxOpen,
  rxClose,
  rxSelfclosing
})

