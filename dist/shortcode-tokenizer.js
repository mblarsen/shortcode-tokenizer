(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["shortcodeTokenizer"] = factory();
	else
		root["shortcodeTokenizer"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/* tokens */
	var TEXT = exports.TEXT = 'TEXT';
	var ERROR = exports.ERROR = 'ERROR';
	var OPEN = exports.OPEN = 'OPEN';
	var CLOSE = exports.CLOSE = 'CLOSE';
	var SELF_CLOSING = exports.SELF_CLOSING = 'SELF_CLOSING';
	
	/* eslint-disable */
	
	/* matches code name */
	var RX_KEY = '[a-zA-Z][a-zA-Z0-9_-]*';
	
	/* matches paramters */
	var RX_PARAM = RX_KEY + '=\\d+\\.\\d+' + // floats
	'|' + RX_KEY + '=\\d+' + // ints
	'|' + RX_KEY + '="[^\\]"]*"' + // double-qouted strings
	'|' + RX_KEY + '=\'[^\\]\']*\'' + // single-qouted strings
	'|' + RX_KEY; // flag
	var RX_PARAMS = '(?:(?:' + RX_PARAM + ')(?:(?!\\s+/?\\])\\s|))+';
	
	/* matches all code token types, used for quickly
	   finding potentia code tokens */
	var RX_ENCLOSURE = '\\[\\/?[a-zA-Z][^\\]]+\\]';
	/* matches opening code tokens [row] */
	var RX_OPEN = '\\[(' + RX_KEY + ')(\\s' + RX_PARAMS + ')?\\]';
	/* matches self-closing code tokens [row/] */
	var RX_SELFCLOSING = '\\[(' + RX_KEY + ')(\\s' + RX_PARAMS + ')?\\s?\\/\\]';
	/* matches close code tokens [row/] */
	var RX_CLOSE = '\\[\\/(' + RX_KEY + ')\\]';
	
	/* case-insensitive regular expressions */
	var rxParams = new RegExp(RX_PARAMS.substring(0, RX_PARAMS.length - 1), 'ig');
	var rxEnclosure = new RegExp(RX_ENCLOSURE, 'i');
	var rxOpen = new RegExp(RX_OPEN, 'i');
	var rxClose = new RegExp(RX_CLOSE, 'i');
	var rxSelfclosing = new RegExp(RX_SELFCLOSING, 'i');
	
	/* eslint-enable */
	
	/**
	 * Get token type based on token-string.
	 *
	 * Note: assuming that this is not a TEXT token
	 *
	 * @returns {string} token type
	 */
	function getTokenType(str) {
	  if (str[1] === '/') {
	    return CLOSE;
	  }
	  if (str[str.length - 2] === '/') {
	    return SELF_CLOSING;
	  }
	  return OPEN;
	}
	
	/**
	 * Casts input string to native types.
	 *
	 * @returns {mixed} mixed value
	 */
	function castValue(value) {
	  value = value.replace(/(^['"]|['"]$)/g, '');
	  if (/^\d+$/.test(value)) return +value;
	  if (/^\d+.\d+$/.test(value)) return parseFloat(value);
	  if (/^(true|false|yes|no)$/i.test(value)) {
	    value = value.toLowerCase();
	    return value === 'true' || value === 'yes';
	  }
	  if (value === 'undefined') return typeof thisIsNotDefined === 'undefined' ? 'undefined' : _typeof(thisIsNotDefined);
	  if (value === 'null') return null;
	  return value;
	}
	
	/**
	 * Token class is used both as a token during tokenization/lexing
	 * and as a node in the resulting AST.
	 *
	 * @private
	 */
	
	var Token = exports.Token = function () {
	  function Token(type, body) {
	    var pos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	
	    _classCallCheck(this, Token);
	
	    this.name = null;
	    this.type = type;
	    this.body = body;
	    this.pos = pos;
	    this.children = [];
	    this.params = {};
	    this.isClosed = type === SELF_CLOSING;
	    this.init();
	  }
	
	  /**
	   * @private
	   */
	
	
	  _createClass(Token, [{
	    key: 'init',
	    value: function init() {
	      if (this.type !== TEXT && this.type !== ERROR) {
	        var match = this.matchBody();
	        this.initName(match);
	        if (match[2]) {
	          this.initParams(match[2]);
	        }
	      }
	    }
	
	    /**
	     * @private
	     */
	
	  }, {
	    key: 'initName',
	    value: function initName(match) {
	      this.name = match[1];
	    }
	
	    /**
	     * @private
	     */
	
	  }, {
	    key: 'initParams',
	    value: function initParams(paramStr) {
	      var match = paramStr.match(rxParams);
	      this.params = match.reduce(function (params, paramToken) {
	        paramToken = paramToken.trim();
	        var equal = paramToken.indexOf('=');
	        if (!~equal) {
	          params[paramToken] = true;
	        } else {
	          params[paramToken.substring(0, equal)] = castValue(paramToken.substring(equal + 1));
	        }
	        return params;
	      }, {});
	    }
	
	    /**
	     * @private
	     */
	
	  }, {
	    key: 'matchBody',
	    value: function matchBody() {
	      var rx = void 0;
	      if (this.type === CLOSE) {
	        rx = rxClose;
	      } else if (this.type === OPEN) {
	        rx = rxOpen;
	      } else if (this.type === SELF_CLOSING) {
	        rx = rxSelfclosing;
	      } else {
	        throw new SyntaxError('Unknown token: ' + this.type);
	      }
	
	      var match = this.body.match(rx);
	      if (match === null) {
	        throw new SyntaxError('Invalid ' + this.type + ' token: ' + this.body);
	      }
	      return match;
	    }
	
	    /**
	     * Determines if this token can close the param token.
	     *
	     * @public
	     * @returns {boolean}
	     */
	
	  }, {
	    key: 'canClose',
	    value: function canClose(token) {
	      return this.name === token.name;
	    }
	  }]);
	
	  return Token;
	}();
	
	var ShortcodeTokenizer = function () {
	
	  /**
	   * Creates a new tokenizer.
	   *
	   * Pass in input as first param or later using `input()`
	   *
	   * @param {string} Optional input to tokenize
	   * @param {boolean} Strict mode default on
	   */
	  function ShortcodeTokenizer() {
	    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	    _classCallCheck(this, ShortcodeTokenizer);
	
	    this.strict = strict;
	    this.buf = null;
	    this.originalBuf = null;
	    this.pos = 0;
	    if (input) {
	      this.input(input);
	    }
	  }
	
	  /**
	   * Sets input buffer with a new input string.
	   *
	   * @throws {Error} Invalid input
	   * @returns {this} returns this for chaining
	   */
	
	
	  _createClass(ShortcodeTokenizer, [{
	    key: 'input',
	    value: function input(_input) {
	      if (typeof _input !== 'string') {
	        throw new Error('Invalid input');
	      }
	
	      this.buf = this.originalBuf = _input;
	      this.pos = 0;
	      return this;
	    }
	
	    /**
	     * Resets input buffer and position to their origial values.
	     *
	     * @returns {this} returns this for chaining
	     */
	
	  }, {
	    key: 'reset',
	    value: function reset() {
	      this.buf = this.originalBuf;
	      this.pos = 0;
	      return this;
	    }
	
	    /**
	     * Creates a token generator.
	     *
	     * @throws {Error} Invalid input
	     * @returns {*function} token generator
	     */
	
	  }, {
	    key: 'tokens',
	    value: regeneratorRuntime.mark(function tokens() {
	      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	      var tokens, token, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step;
	
	      return regeneratorRuntime.wrap(function tokens$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              if (input) {
	                this.input(input);
	              }
	
	              if (!(typeof this.buf !== 'string')) {
	                _context.next = 3;
	                break;
	              }
	
	              throw new Error('Invalid input');
	
	            case 3:
	              tokens = [];
	              token = void 0;
	
	            case 5:
	              if (!((tokens = this._next()) !== null)) {
	                _context.next = 35;
	                break;
	              }
	
	              tokens = Array.isArray(tokens) ? tokens : [tokens];
	              _iteratorNormalCompletion = true;
	              _didIteratorError = false;
	              _iteratorError = undefined;
	              _context.prev = 10;
	              _iterator = tokens[Symbol.iterator]();
	
	            case 12:
	              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
	                _context.next = 19;
	                break;
	              }
	
	              token = _step.value;
	              _context.next = 16;
	              return token;
	
	            case 16:
	              _iteratorNormalCompletion = true;
	              _context.next = 12;
	              break;
	
	            case 19:
	              _context.next = 25;
	              break;
	
	            case 21:
	              _context.prev = 21;
	              _context.t0 = _context['catch'](10);
	              _didIteratorError = true;
	              _iteratorError = _context.t0;
	
	            case 25:
	              _context.prev = 25;
	              _context.prev = 26;
	
	              if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	              }
	
	            case 28:
	              _context.prev = 28;
	
	              if (!_didIteratorError) {
	                _context.next = 31;
	                break;
	              }
	
	              throw _iteratorError;
	
	            case 31:
	              return _context.finish(28);
	
	            case 32:
	              return _context.finish(25);
	
	            case 33:
	              _context.next = 5;
	              break;
	
	            case 35:
	            case 'end':
	              return _context.stop();
	          }
	        }
	      }, tokens, this, [[10, 21, 25, 33], [26,, 28, 32]]);
	    })
	
	    /**
	     * Convenience function for getting all tokens.
	     *
	     * @see tokens
	     * @returns {array} an array of tokens
	     */
	
	  }, {
	    key: 'getTokens',
	    value: function getTokens() {
	      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	      return Array.from(this.tokens(input));
	    }
	
	    /**
	     * Uses the tokens generator to build an AST from the tokens.
	     *
	     * @see tokens
	     * @returns {array} an array of AST roots
	     */
	
	  }, {
	    key: 'ast',
	    value: function ast() {
	      var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	      var tokens = this.tokens(input);
	      var stack = [];
	      var ast = [];
	      var parent = null;
	      var token = void 0;
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = tokens[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          token = _step2.value;
	
	          if (token.type === TEXT) {
	            if (!parent) {
	              ast.push(token);
	            } else {
	              parent.children.push(token);
	            }
	          } else if (token.type === OPEN) {
	            if (!parent) {
	              parent = token;
	              ast.push(parent);
	            } else {
	              parent.children.push(token);
	              stack.push(parent);
	              parent = token;
	            }
	          } else if (token.type === CLOSE) {
	            if (!parent || !token.canClose(parent)) {
	              if (this.strict) {
	                throw new SyntaxError('Unmatched close token: ' + token.body);
	              } else {
	                var err = new Token(ERROR, token.body);
	                if (!parent) {
	                  ast.push(err);
	                } else {
	                  parent.children.push(err);
	                }
	              }
	            } else {
	              parent.isClosed = true;
	              parent = stack.pop();
	            }
	          } else if (token.type === SELF_CLOSING) {
	            if (!parent) {
	              ast.push(token);
	            } else {
	              parent.children.push(token);
	            }
	          } else {
	            throw new SyntaxError('Unknown token: ' + token.type);
	          }
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      if (parent) {
	        if (this.strict) {
	          throw new SyntaxError('Unmatched open token: ' + parent.body);
	        } else {
	          ast.push(new Token(ERROR, token.body));
	        }
	      }
	      return ast;
	    }
	
	    /**
	     * Internal function used to retrieve the next token from the current
	     * position in the input buffer.
	     *
	     * @private
	     * @returns {Token} returns the next Token from the input buffer
	     */
	
	  }, {
	    key: '_next',
	    value: function _next() {
	      if (!this.buf) {
	        return null;
	      }
	
	      var match = this.buf.match(rxEnclosure);
	
	      // all text
	      if (match === null) {
	        var token = new Token(TEXT, this.buf, this.pos);
	        this.pos += this.buf.length;
	        this.buf = null;
	        return token;
	      }
	
	      var tokens = [];
	
	      // first part is text
	      if (match.index !== 0) {
	        tokens.push(new Token(TEXT, this.buf.substring(0, match.index), this.pos));
	      }
	
	      // matching token
	      tokens.push(new Token(getTokenType(match[0]), match[0], this.pos + match.index));
	
	      // shorten buffer
	      this.buf = this.buf.substring(match.index + match[0].length);
	      this.pos += match.index + match[0].length;
	      if (this.buf.length === 0) {
	        this.buf = null;
	      }
	      return tokens;
	    }
	  }]);
	
	  return ShortcodeTokenizer;
	}();
	
	exports.default = ShortcodeTokenizer;
	
	
	Object.assign(ShortcodeTokenizer, {
	  TEXT: TEXT,
	  ERROR: ERROR,
	  OPEN: OPEN,
	  CLOSE: CLOSE,
	  SELF_CLOSING: SELF_CLOSING,
	  rxParams: rxParams,
	  rxEnclosure: rxEnclosure,
	  rxOpen: rxOpen,
	  rxClose: rxClose,
	  rxSelfclosing: rxSelfclosing
	});

/***/ }
/******/ ])
});
;
//# sourceMappingURL=shortcode-tokenizer.js.map