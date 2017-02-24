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
    var Util = require('util');
    var App = require('app');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var ModalLogAttachmentImage = require('modals/modalLogAttachmentImage');
    var ModalLogAttachmentBinary = require('modals/modalLogAttachmentBinary');

    var config = App.getInstance();

    var LogItemLogsItem = Epoxy.View.extend({
        className: 'rp-table-row',
        template: 'tpl-launch-log-item-logs-item',

        events: {
            'click [data-js-toggle-open]': 'onClickOpen',
            'click [data-js-image]': 'onClickImg'
        },

        bindings: {
            // '[data-js-message]': 'html: safeMessage',
            '[data-js-time]': 'text: timeString',
            '[data-js-image]': 'attr: {src: imagePath}, classes: {hide: not(binary_content)}',
            ':el': 'levelClass: level'
        },

        bindingHandlers: {
            levelClass: {
                set: function($element, value) {
                    if(!value) { return; }
                    $element.addClass('level-' + value);
                }
            }
        },

        onClickOpen: function() {
            this.$el.toggleClass('open');
        },

        initialize: function() {
            this.render();
            this.listenTo(this.model, 'scrollTo', this.scrollTo);
            var markdownViewer = new MarkdownViewer({text: this.model.get('message')});
            $('[data-js-message]', this.$el).html(markdownViewer.$el);
        },

        resize: function() {
            this.activateAccordion();
        },
        scrollTo: function() {
            config.mainScrollElement.animate({ scrollTop: this.$el.offset().top}, 500);
        },

        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickImg: function() {
            var modal,
                contentType = this.model.get('binary_content').content_type,
                binaryId = this.model.get('binary_content').id;

            //this.model.trigger('click:attachment', this.model); // open's image in gallery.
            if (~contentType.indexOf('image/')) {
                modal = new ModalLogAttachmentImage({
                    imageId: binaryId,
                });
                modal.show();
            } else {
                var language = contentType.split('/')[1];
                modal = new ModalLogAttachmentBinary({
                    binaryId: binaryId,
                    language: language
                });
                modal.show();
            }
        },

        activateAccordion: function() {
            if (this.$el.innerHeight() > 128) {
                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        }
    });

    return LogItemLogsItem;
});
