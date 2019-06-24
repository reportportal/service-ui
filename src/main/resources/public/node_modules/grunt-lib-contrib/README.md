# grunt-lib-contrib [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-lib-contrib.png?branch=master)](http://travis-ci.org/gruntjs/grunt-lib-contrib)

**DEPRECATED - DO NOT USE**

> Common functionality shared across grunt-contrib tasks.

### Helper Functions

#### stripPath(path, stripPath)

**Deprecated. Use [strip-path](https://github.com/sindresorhus/strip-path) instead.**

Strip a path from a path. Normalize both paths for best results.

#### minMaxInfo(min, max, report)

**Deprecated. Use [maxmin](https://github.com/sindresorhus/maxmin) instead.**

Helper for logging compressed, uncompressed and gzipped sizes of strings.

##### report
Choices: `false`, `'min'`, `'gzip'`
Default: `false`

Either do not report anything, report only minification result, or report minification and gzip results.

**Important** Including `'gzip'` results can make this task 5-10x slower depending on the size of the file.


```js
var max = grunt.file.read('max.js');
var min = minify(max);
minMaxInfo(min, max, 'gzip');
```

Would print:

```
Original: 495 bytes.
Minified: 396 bytes.
Gzipped: 36 bytes.
```

#### getNamespaceDeclaration(ns)

This helper is used to build JS namespace declarations.

--

*Lib submitted by [Tyler Kellen](https://goingslowly.com/).*
