/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    require('spectrum');

    var ColorPicker = Backbone.View.extend({
        className: 'colorpicker-spectrum',
        template: 'tpl-component-colorpicker',

        initialize: function (options) {
            this.initColor = options.initColor || '#000000';
            this.render()
        },

        render: function() {
            this.$el.html(Util.templates(this.template));

            this.colorPicker = $('[data-js-colorpicker-holder]', this.$el).spectrum(this.config());
        },

        config: function () {
            var self = this;
            return {
                color: self.initColor,
                showInput: true,
                allowEmpty: false,
                showPalette: true,
                showSelectionPalette: false,
                clickoutFiresChange: true,
                showInitial: false,
                showButtons: false,
                preferredFormat: "hex",
                appendTo: self.el,

                palette: [
                    ['#f48fb1', '#cc92d6', '#b39ddb', '#81d4fa', '#8de1ec', '#80cbc4', '#c5e1a5', '#e6ee9c', '#ffcc80', '#ffab91'],
                    ['#f50057', '#d500f9', '#651fff', '#00b0ff', '#00e5ff', '#1de9b6', '#76ff03', '#c6ff00', '#ffc400', '#ff3d00'],
                    ['#ad1457', '#6a1b9a', '#4527a0', '#0277bd', '#00838f', '#00695c', '#558b2f', '#9e9d24', '#ff8f00', '#d84315']
                ],

                show: function (color) {
                    self.colorPicker.spectrum('set', self.initColor);
                },

                hide: function (color) {
                    self.trigger('change:color', color.toHexString());
                }
            };
        },

        getColor: function () {
            return this.colorPicker.spectrum('get').toHexString();
        },

        setColor: function (color) {
            this.colorPicker.spectrum('set', color);
        }
    });

    return ColorPicker;
});
