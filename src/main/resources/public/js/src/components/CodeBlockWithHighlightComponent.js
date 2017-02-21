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

    var CodeBlockWithHighlightComponent = Backbone.View.extend ({
        className: 'code-highlighter',
        template: 'tpl-component-code-highlighter',

        initialize: function (options) {
            var self = this;

            this.language = options.language;
            this.binaryContent = options.binaryContent;

            this.loadHighlightJS().done(function () {
                self.loadLanguage(self.language).done(function () {
                    hljs.registerLanguage(self.language, window['hljs_' + self.language]);
                    self.render({binaryContent: self.binaryContent});
                });
            });
        },

        render: function (options) {
            this.$el.html(Util.templates(this.template, {binaryContent: options.binaryContent}));
            $('[data-js-code]', this.$el).addClass(this.language);
            hljs.highlightBlock($('[data-js-code]', this.$el)[0]);
        },

        loadHighlightJS: function(){
            var async = $.Deferred();
            if (typeof hljs !== 'undefined') {
                async.resolve();
                return async;
            }
            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.async = true;
            script.src = 'js/lib/highlightJS/highlight.min.js';
            script.onload = function(){
                async.resolve();
            };
            script.onerror = function(e) {
                async.resolve();
            };

            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);

            return async;
        },

        loadLanguage: function(language){
            var async = $.Deferred();
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'js/lib/highlightJS/languages/' + language +'.js';
            script.onload = function(){
                async.resolve();
            };
            script.onerror = function(e) {
                async.resolve();
            };

            var lastScript = document.getElementsByTagName('script')[0];
            lastScript.parentNode.insertBefore(script, lastScript);

            return async;
        }
    });

    return CodeBlockWithHighlightComponent;
});
