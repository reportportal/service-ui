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
    var Epoxy = require('backbone-epoxy');
    var SimpleMDE = require('simplemde');
    var Util = require('util');


    var MainBreadcrumbsComponent = Epoxy.View.extend({
        className: 'markdown-editor',
        template: 'tpl-markdown-editor',
        events: {
        },

        initialize: function(options) {
            var options = options || {};
            this.render();
            var self = this;
            options.value && $('[data-js-text-area]', this.$el).val(options.value);
            this.simplemde = new SimpleMDE({
                element: $('[data-js-text-area]', this.$el).get(0),
                status: false,
                autoDownloadFontAwesome: false,
                toolbar: [
                    {
                        name: 'heading-1',
                        action: SimpleMDE.toggleHeading1,
                        className: 'icon-header-1',
                        title: 'Big Heading'
                    },
                    {
                        name: 'heading-2',
                        action: SimpleMDE.toggleHeading2,
                        className: 'icon-header-2',
                        title: 'Medium Heading'
                    },
                    {
                        name: 'heading-3',
                        action: SimpleMDE.toggleHeading3,
                        className: 'icon-header-3',
                        title: 'Small Heading'
                    },
                    {
                        name: 'clean-block',
                        action: SimpleMDE.cleanBlock,
                        className: 'icon-clean-block',
                        title: 'Clean block'
                    },
                    '|',
                    {
                        name: 'bold',
                        action: SimpleMDE.toggleBold,
                        className: 'icon-bold',
                        title: 'Bold'
                    },
                    {
                        name: 'italic',
                        action: SimpleMDE.toggleItalic,
                        className: 'icon-italic',
                        title: 'Italic'
                    },
                    {
                        name: 'strikethrough',
                        action: SimpleMDE.toggleStrikethrough,
                        className: 'icon-strikethrough',
                        title: 'Strikethrough'
                    },
                    '|',
                    {
                        name: 'unordered-list',
                        action: SimpleMDE.toggleUnorderedList,
                        className: 'icon-unordered-list',
                        title: 'Generic List'
                    },
                    {
                        name: 'ordered-list',
                        action: SimpleMDE.toggleOrderedList,
                        className: 'icon-ordered-list',
                        title: 'Numbered List'
                    },
                    '|',
                    {
                        name: 'image',
                        action: SimpleMDE.drawImage,
                        className: 'icon-image',
                        title: 'Insert Image'
                    },
                    {
                        name: 'link',
                        action: SimpleMDE.drawLink,
                        className: 'icon-link',
                        title: 'Create Link'
                    },
                    '|',
                    {
                        name: 'quote',
                        action: SimpleMDE.toggleBlockquote,
                        className: 'icon-quote',
                        title: 'Quote'
                    },
                    {
                        name: 'code',
                        action: SimpleMDE.toggleCodeBlock,
                        className: 'icon-code',
                        title: 'Code'
                    },
                    '|',
                    {
                        name: 'preview',
                        action: SimpleMDE.togglePreview,
                        className: 'icon-preview no-disable',
                        title: 'Toggle Preview'
                    },
                ],
                placeholder: options.placeholder || '',
                spellChecker: false,
                // insertTexts: {
                //     link: ['[](', ')']
                // }
            });

            this.simplemde.codemirror.on("change", function(){
                self.trigger('change', self.simplemde.value());
            });
            this.simplemde.codemirror.on("focus", function(){
                self.$el.addClass('focused');
            });
            this.simplemde.codemirror.on("blur", function(){
                self.$el.removeClass('focused');
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        update: function() { // for rerender
            this.setValue(this.getValue());
        },
        getValue: function() {
            return this.simplemde.value();
        },
        setValue: function(value) {
            this.simplemde.value(value);
        }
    });


    return MainBreadcrumbsComponent;
});
