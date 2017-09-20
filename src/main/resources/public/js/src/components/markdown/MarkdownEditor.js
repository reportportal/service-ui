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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var SimpleMDE = require('simplemde');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var Util = require('util');
    var Localization = require('localization');

    var MainBreadcrumbsComponent = Epoxy.View.extend({
        className: 'markdown-editor',
        template: 'tpl-markdown-editor',
        events: {
        },

        initialize: function (initOptions) {
            var options = initOptions || {};
            var self = this;
            this.render();
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
                        title: Localization.ui.markdownBigHeading
                    },
                    {
                        name: 'heading-2',
                        action: SimpleMDE.toggleHeading2,
                        className: 'icon-header-2',
                        title: Localization.ui.markdownMediumHeading
                    },
                    {
                        name: 'heading-3',
                        action: SimpleMDE.toggleHeading3,
                        className: 'icon-header-3',
                        title: Localization.ui.markdownSmallHeading
                    },
                    {
                        name: 'clean-block',
                        action: SimpleMDE.cleanBlock,
                        className: 'icon-clean-block',
                        title: Localization.ui.markdownClean
                    },
                    '|',
                    {
                        name: 'bold',
                        action: SimpleMDE.toggleBold,
                        className: 'icon-bold',
                        title: Localization.ui.markdownBold
                    },
                    {
                        name: 'italic',
                        action: SimpleMDE.toggleItalic,
                        className: 'icon-italic',
                        title: Localization.ui.markdownItalic
                    },
                    {
                        name: 'strikethrough',
                        action: SimpleMDE.toggleStrikethrough,
                        className: 'icon-strikethrough',
                        title: Localization.ui.markdownStrikethrough
                    },
                    '|',
                    {
                        name: 'unordered-list',
                        action: SimpleMDE.toggleUnorderedList,
                        className: 'icon-unordered-list',
                        title: Localization.ui.markdownGeneric
                    },
                    {
                        name: 'ordered-list',
                        action: SimpleMDE.toggleOrderedList,
                        className: 'icon-ordered-list',
                        title: Localization.ui.markdownNumbered
                    },
                    '|',
                    {
                        name: 'image',
                        action: SimpleMDE.drawImage,
                        className: 'icon-image',
                        title: Localization.ui.markdownImage
                    },
                    {
                        name: 'link',
                        action: SimpleMDE.drawLink,
                        className: 'icon-link',
                        title: Localization.ui.markdownLink
                    },
                    '|',
                    {
                        name: 'quote',
                        action: SimpleMDE.toggleBlockquote,
                        className: 'icon-quote',
                        title: Localization.ui.markdownQuote
                    },
                    {
                        name: 'code',
                        action: SimpleMDE.toggleCodeBlock,
                        className: 'icon-code',
                        title: Localization.ui.markdownCode
                    },
                    '|',
                    {
                        name: 'preview',
                        action: SimpleMDE.togglePreview,
                        className: 'icon-preview no-disable',
                        title: Localization.ui.markdownPreview
                    }
                ],
                placeholder: options.placeholder || '',
                spellChecker: false,
                blockStyles: {
                    bold: '**',
                    italic: '*',
                    code: '`'
                },
                previewRender: function (plainText) {
                    var view = new MarkdownViewer({ text: plainText });
                    var html = view.$el.html();
                    view.destroy();
                    return html;
                }
                // insertTexts: {
                //     link: ['[](', ')']
                // }
            });

            this.simplemde.codemirror.on('change', function () {
                self.trigger('change', self.simplemde.value());
            });
            this.simplemde.codemirror.on('focus', function () {
                self.$el.addClass('focused');
            });
            this.simplemde.codemirror.on('blur', function () {
                self.$el.removeClass('focused');
            });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        update: function () { // for rerender
            this.setValue(this.getValue());
        },
        getValue: function () {
            return this.simplemde.value();
        },
        setValue: function (value) {
            this.simplemde.value(value);
        }
    });


    return MainBreadcrumbsComponent;
});
