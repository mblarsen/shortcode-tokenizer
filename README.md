# Shortcode Tokenizer and AST

[![build status](http://img.shields.io/travis/mblarsen/shortcode-tokenizer.svg)](http://travis-ci.org/mblarsen/shortcode-tokenizer)
[![Coverage Status](https://coveralls.io/repos/github/mblarsen/shortcode-tokenizer/badge.svg?branch=master)](https://coveralls.io/github/mblarsen/shortcode-tokenizer?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/mblarsen/shortcode-tokenizer/badge.svg)](https://snyk.io/test/github/mblarsen/shortcode-tokenizer)
[![NPM version](http://img.shields.io/npm/v/shortcode-tokenizer.svg)](https://www.npmjs.com/package/shortcode-tokenizer/) [![](https://img.shields.io/npm/dm/shortcode-tokenizer.svg)](https://www.npmjs.com/package/shortcode-tokenizer/)

Tokenizes a string containing shortcodes (re-popularized by WordPress) and outputs
it as an AST that can be used for further parsing.

If you are only looking for simple transformations from a shortcode to a string
I suggest that you give these libs a try:

* https://github.com/mendezcode/shortcode-parser
* https://www.npmjs.com/package/meta-shortcodes (handles nested shortcodes)

If you need more control this is the lib for you.

# Install

```javascript
npm install shortcode-tokenizer
```

# Usage

```javascript
import ShortcodeTokenizer from 'shortcode-tokenizer'

const input = `
<h1>Cool Shop</h1>
[row]
  [col width=6 class="featured"]
    [product-list list="featured" /]
  [/col]
  [col width=6 class="featured"]
    <div>Ad: Buy more, Buy often!</div>
  [/col]
[/row]
`

const tokenizer = new ShortcodeTokenizer(input)
tokenizer.ast()
```

The AST outputted is at root level an array of two nodes, a text node and a
code-node:

```javascript
[
    {
        type: 'TEXT',
        body: "<h1>Cool Shop</h1>"
        pos: 0
    },
    {
        type: 'OPEN',
        name: 'row',
        pos: 19,
        body: '[row]',
        isClosed: true,
        params: {},
        children: [
            ... a whitespace TEXT token ...,
            {
                type: 'OPEN',
                name: 'col',
                pos: 27,
                body: '[col width=6 class="featured"]',
                isClosed: true,
                params: {
                    width: 6,
                    class: 'featured'
                },
                children: [ ... and so on ... ]
             }
        ]
    }
]
```

(Note: the same data-structure is used to represent tokens from the lexing and
nodes in the AST, see CLOSE, below)

There are 5 token types:

* TEXT: plain text. `body` contains the content.
* OPEN: an open token, e.g. `[row]`.
* SELF_CLOSING: a self-closing token `[post id=1/]`.
* CLOSE: a close token, e.g. `[/row]`. You will only see the left-over of these
    tokens in the AST as OPEN tokens that have their `isClosed` value set to
    true.
* ERROR: when in non-strict mode offending tokens are converted to ERROR tokens
    and which behaves like TEXT nodes.

# API

### Property `options.strict`

By default strict-mode is enabled and syntax errors will be thrown. Setting
strict-mode to false will convert all errors into ERROR nodes.

### Property `options.skipWhiteSpace`

By default skipWhiteSpace is off. When turned on all whitespace is trimmed and
if there is nothing left the TEXT node is skippid.

### constructor and `input()`

You can pass input in the constructor you can set it later using `input()`.

Examples:

```javascript
let t = new ShortcodeTokenizer('[code][/code]')
t.ast()

t.input('[code][/code]')
t.ast()

t.ast('[code][/code]')
```

### `tokens()`

Returns all tokens.

### `ast([input])`

Returns an AST created from the input.

### `buildTemplate([Token token], [object|string|null params=null], [bool deep=false])`

Builds template on given token. You can overwrite params in root param by `params` and also in all nested setting `deep="true"` param.

# Changelog

See [CHANGELOG.md](https://github.com/mblarsen/shortcode-tokenizer/blob/master/CHANGELOG.md)
