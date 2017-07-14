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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Urls = require('dataUrlResolver');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');

    var config = App.getInstance();

    var LogItemLogsItem = Epoxy.View.extend({
        className: 'rp-table-row',
        template: 'tpl-launch-log-item-logs-item',

        events: {
            'click [data-js-toggle-open]': 'onClickOpen',
            'click [data-js-link]': 'onClickImg'
        },

        bindings: {
            '[data-js-time]': 'text: timeString',
            '[data-js-image]': 'attr: {src: imagePath}',
            '[data-js-link]': 'attr: {href: getBinaryDataUrl}, classes: {hide: not(binary_content)}',
            ':el': 'levelClass: level'
        },

        computeds: {
            getBinaryDataUrl: {
                deps: ['binary_content'],
                get: function (binaryContent) {
                    return binaryContent ? Urls.getFileById(binaryContent.id) : '';
                }
            }
        },

        bindingHandlers: {
            levelClass: {
                set: function ($element, value) {
                    if (!value) {
                        return;
                    }
                    $element.addClass('level-' + value);
                }
            }
        },

        onClickOpen: function () {
            config.trackingDispatcher.trackEventNumber(213);
            this.$el.toggleClass('open');
        },

        initialize: function () {
            this.render();
            this.listenTo(this.model, 'scrollTo', this.scrollTo);
            this.markdownViewer = new MarkdownViewer({ text: this.model.get('message') });
            $('[data-js-message]', this.$el).html(this.markdownViewer.$el);
            this.listenTo(this.markdownViewer, 'load', this.activateAccordion);
        },

        resize: function () {
            this.activateAccordion();
        },
        scrollTo: function () {
            var self = this;
            this.$el.removeClass('hide-highlight');
            if (!$('.highlight', this.$el).length) {
                this.$el.prepend('<div class="highlight"></div>');
            }
            config.mainScrollElement.animate({ scrollTop: this.el.offsetTop }, 500, function () {
                self.$el.addClass('hide-highlight');
            });
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickImg: function (e) {
            e.preventDefault();
            config.trackingDispatcher.trackEventNumber(212);
            this.model.trigger('click:attachment', this.model);
        },

        activateAccordion: function () {
            var minHeight = 148;
            if (this.model.get('level') === 'ERROR') {
                minHeight = 238;
            }
            if (this.$el.innerHeight() > minHeight) {
                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        },
        onDestroy: function () {
            this.markdownViewer && this.markdownViewer.destroy();
        }
    });

    return LogItemLogsItem;
});
