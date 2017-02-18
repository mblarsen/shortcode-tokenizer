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
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Token = exports.Token = function () {
	  function Token(type, body) {
	    var pos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	
	    _classCallCheck(this, Token);
	
	    this.type = type;
	    this.body = body;
	    this.pos = pos;
	    this.children = [];
	    this.params = [];
	    this.isClosed = type === SELF_CLOSING;
	
	    switch (this.type) {
	      case CLOSE:
	        this.name = this.body.substring(2, this.body.length - 1);
	        break;
	      case OPEN:
	      case SELF_CLOSING:
	        var match = this.body.match(this.type === OPEN ? rxOpen : rxSelfclosing);
	        if (match === null) {
	          throw new SyntaxError('Invalid ' + this.type + ' token: ' + this.body);
	        }
	        this.name = match[1];
	        break;
	      default:
	        break;
	    }
	  }
	
	  _createClass(Token, [{
	    key: 'canClose',
	    value: function canClose(token) {
	      return this.name === token.name;
	    }
	  }]);
	
	  return Token;
	}();
	
	var TEXT = exports.TEXT = 'TEXT';
	var OPEN = exports.OPEN = 'OPEN';
	var CLOSE = exports.CLOSE = 'CLOSE';
	var SELF_CLOSING = exports.SELF_CLOSING = 'SELF_CLOSING';
	
	/* eslint-disable */
	var RX_KEY = '[a-zA-Z0-9_]+';
	
	var RX_PARAM = RX_KEY + // flags
	'|' + RX_KEY + '=\\d+\\.\\d+' + // floats
	'|' + RX_KEY + '=\\d+' + // ints
	'|' + RX_KEY + '="[^\\]"]*"' + // double-qouted strings
	'|' + RX_KEY + '=\'[^\\]\']*\''; // single-qouted strings
	
	var RX_PARAMS = '(\\s((' + RX_PARAM + ')((?!\\s+/?\\])\\s|))+)?';
	
	var RX_ENCLOSURE = '\\[\\/?[a-zA-Z][^\\]]+\\]';
	var RX_OPEN = '\\[(' + RX_KEY + ')' + RX_PARAMS + '\\]';
	var RX_SELFCLOSING = '\\[(' + RX_KEY + ')' + RX_PARAMS + '\\s?\\/\\]';
	var RX_CLOSE = '\\[\\/(' + RX_KEY + ')\\]';
	
	var rxEnclosure = new RegExp(RX_ENCLOSURE);
	var rxOpen = new RegExp(RX_OPEN, 'i');
	var rxClose = new RegExp(RX_CLOSE, 'i');
	var rxSelfclosing = new RegExp(RX_SELFCLOSING, 'i');
	/* eslint-enable */
	
	var ShortcodeTokenizer = function () {
	  function ShortcodeTokenizer() {
	    _classCallCheck(this, ShortcodeTokenizer);
	
	    this.buf = null;
	    this.pos = 0;
	    this.tokens = [];
	    this.strict = true;
	  }
	
	  _createClass(ShortcodeTokenizer, [{
	    key: 'tokenize',
	    value: function tokenize(input) {
	      if (typeof input !== 'string') {
	        throw new Error('Invalid input');
	      }
	
	      this.buf = this.originalBuf = input;
	      this.pos = 0;
	      this.tokens = [];
	
	      // Get tokens
	      var token = void 0;
	      while ((token = this._token()) !== null) {
	        if (Array.isArray(token)) {
	          this.tokens = [].concat(_toConsumableArray(this.tokens), _toConsumableArray(token));
	        } else {
	          this.tokens.push(token);
	        }
	      }
	      return this;
	    }
	  }, {
	    key: 'getTokens',
	    value: function getTokens() {
	      return this.tokens;
	    }
	  }, {
	    key: 'ast',
	    value: function ast() {
	      var stack = [];
	      var ast = [];
	      var tokens = [].concat(_toConsumableArray(this.tokens));
	      var parent = null;
	      var token = void 0;
	      while (token = tokens.shift()) {
	        if (token.type === TEXT) {
	          if (!parent) {
	            ast.push(token);
	          } else {
	            parent.children.push(token);
	          }
	        } else if (token.type === OPEN) {
	          if (parent === null) {
	            parent = token;
	            ast.push(parent);
	          } else {
	            parent.children.push(token);
	            stack.push(parent);
	            parent = token;
	          }
	        } else if (token.type === CLOSE) {
	          if (parent === null || !token.canClose(parent)) {
	            if (this.strict) {
	              throw new SyntaxError('Unmatched close token: ' + token.body);
	            } else {
	              // convert to text
	              tokens.unshift(new Token(TEXT, token.body));
	            }
	          } else {
	            parent.isClosed = true;
	            parent = stack.pop();
	          }
	        } else if (token.type === SELF_CLOSING) {
	          ast.push(token);
	        } else {
	          throw new SyntaxError('Unknown token: ' + token.type);
	        }
	      }
	      return ast;
	    }
	  }, {
	    key: '_token',
	    value: function _token() {
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
	      tokens.push(new Token(this._getNotTextType(match[0]), match[0], this.pos + match.index));
	
	      // shorten buffer
	      this.buf = this.buf.substring(match.index + match[0].length);
	      this.pos += match.index + match[0].length;
	      if (this.buf.length === 0) {
	        this.buf = null;
	      }
	      return tokens;
	    }
	  }, {
	    key: '_getNotTextType',
	    value: function _getNotTextType(str) {
	      if (str[1] === '/') {
	        return CLOSE;
	      }
	      if (str[str.length - 2] === '/') {
	        return SELF_CLOSING;
	      }
	      return OPEN;
	    }
	  }]);
	
	  return ShortcodeTokenizer;
	}();
	
	exports.default = ShortcodeTokenizer;
	
	
	Object.assign(ShortcodeTokenizer, {
	  TEXT: TEXT,
	  OPEN: OPEN,
	  CLOSE: CLOSE,
	  SELF_CLOSING: SELF_CLOSING,
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