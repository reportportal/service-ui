/**
 * A simple Chartist plugin to put labels on top of bar charts.
 *
 * Copyright (c) 2015 Yorkshire Interactive (yorkshireinteractive.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function(window, document, Chartist) {
  'use strict';
  var defaultOptions = {
    // The class name so you can style the text
    labelClass: 'ct-bar-label',

    // Use this to get the text of the data and you can return your own
    // formatted text. For example, for a percentage: 
    // {
    //  labelInterpolationFnc: function (text) { return text + '%' }
    // }
    labelInterpolationFnc: Chartist.noop,

    // Depending on your font size you may need to tweak these
    labelOffset: {
      x: 0,
      y: 0
    },

    // If labelOffset doesn't work for you and you need more custom positioning
    // you can use this. You can set position.x and position.y to functions and
    // instead of centering + labelOffset. This will _completely_ override the
    // built in positioning so labelOffset will no longer do anything. It will
    // pass the bar `data` back as the first param.
    //
    // Example:
    // Chartist.plugins.ctBarLabels({
    //   position: {
    //     x: function (data) {
    //       return data.x1 + 50; // align left with 50px of padding
    //     }
    //   }
    // });
    position: {
      x: null,
      y: null
    }
  };

  Chartist.plugins = Chartist.plugins || {};
  Chartist.plugins.ctBarLabels = function(options) {

    options = Chartist.extend({}, defaultOptions, options);
    
    var positionX = options.position.x || function (data) {
      return ((data.x1 + data.x2) / 2) + options.labelOffset.x;
    };

    var positionY = options.position.y || function (data) {
      return ((data.y1 + data.y2) / 2) + options.labelOffset.y;
    };

    return function ctBarLabels(chart) {
      // Since it's specific to bars, verify its a bar chart
      if(chart instanceof Chartist.Bar) {
        chart.on('draw', function(data) {
          // If the data we're drawing is the actual bar, let's add the text
          // inside of it
          if(data.type === 'bar') {
            data.group.elem('text', {
              // This gets the middle point of the bars and then adds the
              // optional offset to them
              x: positionX(data),
              y: positionY(data),
              style: 'text-anchor: middle'
            }, options.labelClass)
              .text(
              options.labelInterpolationFnc(
                // If there's not x (horizontal bars) there must be a y
                data.value.x || data.value.y
              )
            );
          }
        });
      }
    };
  };

}(window, document, Chartist));
