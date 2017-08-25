/** @module ShortcodeTokenizer */

/* tokens */
const TEXT = 'TEXT'
const ERROR = 'ERROR'
const OPEN = 'OPEN'
const CLOSE = 'CLOSE'
const SELF_CLOSING = 'SELF_CLOSING'

/* eslint-disable */

/* matches code name */
const RX_KEY = '[a-zA-Z][a-zA-Z0-9_-]*'

/* matches paramters */
const RX_PARAM =       RX_KEY + '=\\d+\\.\\d+' +    // floats
                 '|' + RX_KEY + '=\\d+' +           // ints
                 '|' + RX_KEY + '="[^\\]"]*"' +     // double-qouted strings
                 '|' + RX_KEY + '=\'[^\\]\']*\'' +  // single-qouted strings
                 '|' + RX_KEY                       // flags
const RX_PARAMS = '(?:(?:' + RX_PARAM + ')(?:(?!\\s+/?\\])\\s|))+'

/* matches all code token types, used for quickly
   finding potentia code tokens */
const RX_ENCLOSURE   = '\\[\\/?[a-zA-Z][^\\]]+\\]'
/* matches opening code tokens [row] */
const RX_OPEN        = '\\[(' + RX_KEY + ')(\\s' + RX_PARAMS + ')?\\]'
/* matches self-closing code tokens [row/] */
const RX_SELFCLOSING = '\\[(' + RX_KEY + ')(\\s' + RX_PARAMS + ')?\\s?\\/\\]'
/* matches close code tokens [/row] */
const RX_CLOSE       = '\\[\\/(' + RX_KEY + ')\\]'

/* case-insensitive regular expressions */
const rxParams      = new RegExp(RX_PARAMS.substring(0, RX_PARAMS.length - 1), 'ig')
const rxEnclosure   = new RegExp(RX_ENCLOSURE, 'i')
const rxOpen        = new RegExp(RX_OPEN, 'i')
const rxClose       = new RegExp(RX_CLOSE, 'i')
const rxSelfclosing = new RegExp(RX_SELFCLOSING, 'i')

/* eslint-enable */

/**
 * Get token type based on token-string.
 *
 * Note: assuming that this is not a TEXT token
 *
 * @param {string} str
 * @returns {string} token type
 */
function getTokenType(str) {
  if (str[1] === '/') {
    return CLOSE
  }
  if (str[str.length - 2] === '/') {
    return SELF_CLOSING
  }
  return OPEN
}

/**
 * Casts input string to native types.
 *
 * @param {string} value
 * @returns {*} mixed value
 */
function castValue(value) {
  value = value.replace(/(^['"]|['"]$)/g, '')
  if (/^\d+$/.test(value)) return +value
  if (/^\d+.\d+$/.test(value)) return parseFloat(value)
  if (/^['"]?(true|false|yes|no)['"]?$/i.test(value)) {
    value = value
      .replace(/(^['"]|['"]$)/g, '')
      .toLowerCase()
    return value === 'true' || value === 'yes'
  }
  if (value === 'undefined') return typeof thisIsNotDefined
  if (value === 'null') return null
  return value
}

/**
 * Token class is used both as a token during tokenization/lexing
 * and as a node in the resulting AST.
 *
 * @access private
 */
export class Token {
  constructor(type, body, pos = 0) {
    this.name = null
    this.type = type
    this.body = body
    this.pos = pos
    this.children = []
    this.params = {}
    this.isClosed = type === SELF_CLOSING
    this.init()
  }

  /**
   * @access private
   */
  init() {
    if (this.type !== TEXT && this.type !== ERROR) {
      const match = this.matchBody()
      this.initName(match)
      if (match[2]) {
        this.initParams(match[2])
      }
    }
  }

  /**
   * @access private
   */
  initName(match) {
    this.name = match[1]
  }

  /**
   * @access private
   */
  initParams(paramStr) {
    const match = paramStr.match(rxParams)
    this.params = match.reduce((params, paramToken) => {
      paramToken = paramToken.trim()
      let equal = paramToken.indexOf('=')
      if (!~equal) {
        params[paramToken] = true
      } else {
        params[paramToken.substring(0, equal)] = castValue(paramToken.substring(equal + 1))
      }
      return params
    }, {})
  }

  /**
   * @access private
   */
  matchBody() {
    let rx
    if (this.type === CLOSE) {
      rx = rxClose
    } else if (this.type === OPEN) {
      rx = rxOpen
    } else if (this.type === SELF_CLOSING) {
      rx = rxSelfclosing
    } else {
      throw new SyntaxError('Unknown token: ' + this.type)
    }

    let match = this.body.match(rx)
    if (match === null) {
      throw new SyntaxError('Invalid ' + this.type + ' token: ' + this.body)
    }
    return match
  }

  /**
   * Determines if this token can close the param token.
   *
   * @access public
   * @param {Token} token another token
   * @returns {boolean}
   */
  canClose(token) {
    return this.name === token.name
  }
}

/**
 * Creates a new tokenizer.
 *
 * Pass in input as first param or later using `input()`
 *
 * @param {string} [input=null] Optional input to tokenize
 * @param {Object} [options] options object
 * @param {boolean} [options.strict=true] strict mode
 * @param {boolean} [options.skipWhiteSpace=false] will ignore tokens containing only white space (basically all \s)
 */
export default class ShortcodeTokenizer {

  constructor(input = null, options = {strict: true, skipWhiteSpace: false}) {
    if (typeof options === 'boolean') {
      options = {strict: options, skipWhiteSpace: false}
    }
    this.options = options
    this.buf = null
    this.originalBuf = null
    this.pos = 0
    if (input) {
      this.input(input)
    }
  }

  /**
   * @deprecated use options.strict
   */
  get strict() {
    console.warn(`Deprecated: use options.strict instead`)
    return this.options.strict
  }

  /**
   * @deprecated use options.strict
   */
  set strict(value) {
    console.warn(`Deprecated: use options.strict = ${value} instead`)
    this.options.strict = value
  }

  /**
   * Sets input buffer with a new input string.
   *
   * @param {string} input template string
   * @throws {Error} Invalid input
   * @returns {this} returns this for chaining
   */
  input(input) {
    if (typeof input !== 'string') {
      throw new Error('Invalid input')
    }

    this.buf = this.originalBuf = input
    this.pos = 0
    return this
  }

  /**
   * Resets input buffer and position to their origial values.
   *
   * @returns {this} returns this for chaining
   */
  reset() {
    this.buf = this.originalBuf
    this.pos = 0
    return this
  }

  /**
   * Creates a token generator.
   *
   * @throws {Error} Invalid input
   * @returns {Token[]} An array of Token instances
   */
  tokens(input = null) {
    if (input) {
      this.input(input)
    }

    if (typeof this.buf !== 'string') {
      throw new Error('Invalid input')
    }

    let tokens = []
    let allTokens = []
    while ((tokens = this._next()) !== null) {
      tokens = Array.isArray(tokens) ? tokens : [tokens]
      allTokens.push(...tokens)
    }
    return allTokens
  }

  /**
   * Uses the tokens generator to build an AST from the tokens.
   *
   * @see tokens
   * @returns {array} an array of AST roots
   */
  ast(input = null) {
    let tokens = this.tokens(input)
    let stack = []
    let ast = []
    let parent = null
    let token
    for (token of tokens) {
      if (token.type === TEXT) {
        if (this.options.skipWhiteSpace && token.body.replace(/\s+/g, '').length === 0) {
          continue
        }
        if (!parent) {
          ast.push(token)
        } else {
          parent.children.push(token)
        }
      } else if (token.type === OPEN) {
        if (!parent) {
          parent = token
          ast.push(parent)
        } else {
          parent.children.push(token)
          stack.push(parent)
          parent = token
        }
      } else if (token.type === CLOSE) {
        if (!parent || !token.canClose(parent)) {
          if (this.options.strict) {
            throw new SyntaxError('Unmatched close token: ' + token.body)
          } else {
            let err = new Token(ERROR, token.body)
            if (!parent) {
              ast.push(err)
            } else {
              parent.children.push(err)
            }
          }
        } else {
          parent.isClosed = true
          parent = stack.pop()
        }
      } else if (token.type === SELF_CLOSING) {
        if (!parent) {
          ast.push(token)
        } else {
          parent.children.push(token)
        }
      } else {
        throw new SyntaxError('Unknown token: ' + token.type)
      }
    }
    if (parent) {
      if (this.options.strict) {
        throw new SyntaxError('Unmatched open token: ' + parent.body)
      } else {
        ast.push(new Token(ERROR, token.body))
      }
    }
    return ast
  }

  /**
   * Internal function used to retrieve the next token from the current
   * position in the input buffer.
   *
   * @private
   * @returns {Token} returns the next Token from the input buffer
   */
  _next() {
    if (!this.buf) {
      return null
    }

    let match = this.buf.match(rxEnclosure)

    // all text
    if (match === null) {
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
      getTokenType(match[0]),
      match[0],
      this.pos + match.index
    ))

    // shorten buffer
    this.buf = this.buf.substring(match.index + match[0].length)
    this.pos += match.index + match[0].length
    if (this.buf.length === 0) {
      this.buf = null
    }
    return tokens
  }
}

Object.assign(ShortcodeTokenizer, {
  TEXT,
  ERROR,
  OPEN,
  CLOSE,
  SELF_CLOSING,
  rxParams,
  rxEnclosure,
  rxOpen,
  rxClose,
  rxSelfclosing
})
