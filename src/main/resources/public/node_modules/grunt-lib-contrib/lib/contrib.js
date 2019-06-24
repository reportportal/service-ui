/*
 * grunt-lib-contrib
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

exports.init = function(grunt) {
  'use strict';

  var exports = {};

  var path = require('path');
  var maxmin = require('maxmin');

  exports.getNamespaceDeclaration = function(ns) {
    var output = [];
    var curPath = 'this';
    if (ns !== 'this') {
      var nsParts = ns.split('.');
      nsParts.forEach(function(curPart, index) {
        if (curPart !== 'this') {
          curPath += '[' + JSON.stringify(curPart) + ']';
          output.push(curPath + ' = ' + curPath + ' || {};');
        }
      });
    }

    return {
      namespace: curPath,
      declaration: output.join('\n')
    };
  };

  // Strip a path from a path. normalize both paths for best results.
  exports.stripPath = require('strip-path');

  // Log min and max info
  exports.minMaxInfo = function(min, max, report) {
    if (report === 'min' || report === 'gzip') {
      grunt.log.writeln(maxmin(max, min, report === 'gzip'))
    }
  };

  return exports;
};
