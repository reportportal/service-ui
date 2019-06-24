karma-jasmine-jquery
====================

Jasmine-jquery plugin for Jasmine in Karma.

It karma adapter for
+ https://github.com/velesin/jasmine-jquery

## Installation

Install the plugin from npm:

```sh
$ npm install karma-jasmine-jquery
```

## Attention
karma-jasmine-jquery has a dependency on jasmine, so you should use `karma-jasmine` as well before `karma-jasmine-jquery`. Please note the followings.
+ https://github.com/karma-runner/karma-jasmine

This plugin will only work for version karma-jasmine 2.0 and above.

## Usage
karma will autoload all plugins, whose name start with `karma-`, you can import karma-jasmine-jquery plugins manually. Please refer to http://karma-runner.github.io/0.12/config/plugins.htmt for more details. 

```js
// karma.conf.js
module.exports = function(config) {
  config.set({

      frameworks: ['jasmine-jquery','jasmine']
      //...
   })
}
```

The order('jasmine-jquery','jasmine') is important since it affects the order in which the files will be included to karma. Right order - reverse as karma works on the principle of LIFO stack. 

## Information
This plugin already includes jquery version 2.1.1, it is used for the plugin. 
However, in the project, you can use a version of jquery (it can be both below and above) and they will not interfere with each other. 
When writing tests using jquery $ for the project, and to use jquery 2.1.1, use a global variable $j (it makes sense when you want to use when writing test jquery 2 opportunities that are not available in the current version of jquery used in your project, as I). 
Example of use:

```js
// karma.conf.js
module.exports = function(config) {
  config.set({

      frameworks: ['jquery-1.3.2', 'jasmine-jquery', 'jasmine'],
      //...
   })
}

// Jasmine test example

it('test1', function() {
    $().destroyWin('window'); // jquery 1.3.2
    expect($j('#window')).not.toBeInDOM(); // $j = jquery 2.1.1
  });

```



