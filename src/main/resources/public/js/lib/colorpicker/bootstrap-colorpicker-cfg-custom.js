define(function(require, exports, module) {
  'use strict';

  var defaults = {
    horizontal: false,
    inline: false,
    color: false,
    format: false,
    input: 'input',
    container: true,
    component: '.add-on, .input-group-addon',
    sliders: {
      saturation: {
        maxLeft: 110,
        maxTop: 110,
        callLeft: 'setSaturation',
        callTop: 'setBrightness'
      },
      hue: {
        maxLeft: 0,
        maxTop: 110,
        callLeft: false,
        callTop: 'setHue'
      },
      alpha: {
        maxLeft: 0,
        maxTop: 110,
        callLeft: false,
        callTop: 'setAlpha'
      }
    },
    slidersHorz: {
      saturation: {
        maxLeft: 110,
        maxTop: 110,
        callLeft: 'setSaturation',
        callTop: 'setBrightness'
      },
      hue: {
        maxLeft: 110,
        maxTop: 0,
        callLeft: 'setHue',
        callTop: false
      },
      alpha: {
        maxLeft: 110,
        maxTop: 0,
        callLeft: 'setAlpha',
        callTop: false
      }
    },
    template: '<div class="colorpicker dropdown-menu">' +
      '<div class="colorpicker-selectors-wrap">' +
        '<p class="colorpicker-title">Pick a swatch:</p>' +
        '<div class="colorpicker-selectors"></div>' +
      '</div>' +
      '<div class="colorpicker-saturation-wrap">' +
        '<p class="colorpicker-title">Select your colors:</p>' +
        '<div class="colorpicker-saturation"><i><b></b></i></div>' +
      '</div>' +
      '<div class="colorpicker-hue"><i></i></div>' +
      '<div class="colorpicker-current-color">' +
        '<span></span>' +
      '</div>' +
    '</div>',
    align: 'left',
    customClass: null,
    colorSelectors: {
      '#f48fb1': '#f48fb1',
      '#cc92d6': '#cc92d6',
      '#b39ddb': '#b39ddb',
      '#81d4fa': '#81d4fa',
      '#8de1ec': '#8de1ec',
      '#80cbc4': '#80cbc4',
      '#c5e1a5': '#c5e1a5',
      '#e6ee9c': '#e6ee9c',
      '#ffcc80': '#ffcc80',
      '#ffab91': '#ffab91',

      '#f50057': '#f50057',
      '#d500f9': '#d500f9',
      '#651fff': '#651fff',
      '#00b0ff': '#00b0ff',
      '#00e5ff': '#00e5ff',
      '#1de9b6': '#1de9b6',
      '#76ff03': '#76ff03',
      '#c6ff00': '#c6ff00',
      '#ffc400': '#ffc400',
      '#ff3d00': '#ff3d00',

      '#ad1457': '#ad1457',
      '#6a1b9a': '#6a1b9a',
      '#4527a0': '#4527a0',
      '#0277bd': '#0277bd',
      '#00838f': '#00838f',
      '#00695c': '#00695c',
      '#558b2f': '#558b2f',
      '#9e9d24': '#9e9d24',
      '#ff8f00': '#ff8f00',
      '#d84315': '#d84315'
    }
  };

  return defaults;

});
