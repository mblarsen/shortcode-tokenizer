# Shortcode Tokenizer and AST

[![build status](http://img.shields.io/travis/mblarsen/shortcode-tokenizer.svg)](http://travis-ci.org/mblarsen/shortcode-tokenizer) [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/mblarsen/shortcode-tokenizer.svg)](http://isitmaintained.com/project/mblarsen/shortcode-tokenizer "Average time to resolve an issue") [![NPM version](http://img.shields.io/npm/v/shortcode-tokenizer.svg)](https://www.npmjs.com/package/shortcode-tokenizer/) [![](https://img.shields.io/npm/dm/shortcode-tokenizer.svg)](https://www.npmjs.com/package/shortcode-tokenizer/)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/mblarsen)  

[![Beerpay](https://beerpay.io/mblarsen/shortcode-tokenizer/badge.svg?style=beer)](https://beerpay.io/mblarsen/shortcode-tokenizer) [![Beerpay](https://beerpay.io/mblarsen/shortcode-tokenizer/make-wish.svg?style=flat)](https://beerpay.io/mblarsen/shortcode-tokenizer)  

Tokenizes a string containing shortcodes (re-popularized by WordPress) and outputs
it as an AST that can be used for further parsing.

If you are only looking for simple transformations from a shortcode to a string
I suggest that you give these libs a try:

* https://github.com/mendezcode/shortcode-parser
* https://www.npmjs.com/package/meta-shortcodes (handles nested shortcodes)

If you need more control this is the lib for you.

# Install

```
npm install shortcode-tokenizer
```

# Usage

```
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

```
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

### `strict`

By default strict-mode is enabled and syntax errors will be thrown. Setting
strict-mode to false will convert all errors into ERROR nodes.

### constructor and `input()`

You can pass input in the constructor you can set it later using `input()`.

Examples: 

```
let t = new ShortcodeTokenizer('[code][/code]')
t.ast()

t.input('[code][/code]')
t.ast()

t.ast('[code][/code]')
```

### `tokens()`

Returns a generator for all the tokens.

### `getTokens()`

Returns all tokens as an array. Basically just: `Array.from(t.tokens())`

### `ast()`

Returns an AST created from the input.

# Changelog

See [CHANGELOG.md](https://github.com/mblarsen/shortcode-tokenizer/blob/master/CHANGELOG.md)
