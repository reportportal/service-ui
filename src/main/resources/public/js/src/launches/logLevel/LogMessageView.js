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
    var MarkdownViewer = require('components/markdown/MarkdownViewer');

    var LogMessageView = Epoxy.View.extend({
        className: 'log-message-view',

        initialize: function (options) {
            var self = this;
            this.message = options.message;
            this.render();
            if (this.supportMarkdown()) {
                this.markdownViewer = new MarkdownViewer({ text: this.safeMarkdown(this.message) });
                $(this.$el).html(this.markdownViewer.$el);
                this.listenTo(this.markdownViewer, 'load', function () {
                    self.trigger('load');
                });
            } else {
                $(this.$el).addClass('line-log-mode').html(this.safeMessage(this.message));
                this.trigger('load');
            }
        },
        safeMessage: function (message) {
            return message.escapeScript().escapeHtml().replace(/\n */g, function (str) {
                return str.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
            });
        },
        safeMarkdown: function (message) {
            return message.replace(/^!!!MARKDOWN_MODE!!!/, '');
        },
        supportMarkdown: function () {
            return this.message.search(/^!!!MARKDOWN_MODE!!!/) + 1;
        },
        onDestroy: function () {
            this.markdownViewer && this.markdownViewer.destroy();
            this.$el.remove();
        }
    });

    return LogMessageView;
});
