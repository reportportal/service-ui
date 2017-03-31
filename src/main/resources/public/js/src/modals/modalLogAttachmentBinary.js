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
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');

    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Urls = require('dataUrlResolver');
    var App = require('app');

    var config = App.getInstance();

    var CodeBlockWithHighlightComponent = require('components/CodeBlockWithHighlightComponent');

    var ModalLogAttachmentBinary = ModalView.extend({
        tpl: 'tpl-modal-log-attachment-binary',
        className: 'modal-log-attachment-binary',

        events: {
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel'
        },

        initialize: function(options) {
            var self = this;

            this.supportedLanguages = ['xml', 'javascript', 'json', 'html', 'css', 'php'];
            this.binaryId = options.binaryId;
            this.language = (~this.supportedLanguages.indexOf(options.language)) ? options.language : 'plain';

            this.binarySource = Urls.getFileById(options.binaryId);
            this.loadData().done(function (response) {
                var codeBlock = new CodeBlockWithHighlightComponent({
                    language: self.language,
                    binaryContent: response
                });

                $('[data-js-binary-holder]', self.$el).html(codeBlock.el);
                codeBlock.ready.done(function() {
                    self.$modalWrapper.removeClass('loading');
                })
            });
            this.render();
        },

        render: function() {
            this.$el.html(Util.templates(this.tpl));
        },

        onShow: function () {
            this.$modalWrapper.addClass('loading');
        },
        onClickClose: function(){
            config.trackingDispatcher.trackEventNumber(509);
        },
        onClickCancel: function(){
            config.trackingDispatcher.trackEventNumber(511);
        },
        loadData: function () {
            var async = $.Deferred();
            var self = this;
            $.ajax({
                url: self.binarySource,
                type: "GET",
                dataType: "text",
                async: true,
                success: function (response) {
                    async.resolve(response);
                },
            });
            return async;
        },
    });

    return ModalLogAttachmentBinary;
});
