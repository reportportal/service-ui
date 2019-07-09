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
    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var Urls = require('dataUrlResolver');
    var App = require('app');
    var perfcascade = require('PerfCascade');
    var Localization = require('localization');
    var config = App.getInstance();

    var ModalLogAttachmentBinaryHar = ModalView.extend({
        tpl: 'tpl-modal-log-attachment-binary-har',
        className: 'modal-log-attachment-binary-har',

        events: {
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel'
        },

        initialize: function (options) {
            this.binarySource = Urls.getFileById(options.binaryId);
            if (!this.isEdge()) {
                this.loadData().done(function (response) {
                    $('[data-js-load-file]', this.$el).removeClass('load');
                    try {
                        var perfCascadeSvg = perfcascade.fromHar(JSON.parse(response));
                        $('[data-js-binary-holder]', this.$el).append(perfCascadeSvg);
                    } catch (err) {
                        $('[data-js-error-block]', this.$el).show();
                    }
                });
            }
            this.render();
        },
        isEdge: function () {
            return navigator.userAgent.search(/Edge/) > 0;
        },
        onShow: function () {
            if (this.isEdge()) {
                $('[data-js-error-block]', this.$el).show();
            } else {
                $('[data-js-load-file]', this.$el).addClass('load');
            }
        },
        loadData: function () {
            var async = $.Deferred();
            $.ajax({
                url: this.binarySource,
                type: 'GET',
                dataType: 'text',
                async: true,
                success: function (response) {
                    async.resolve(response);
                }
            });
            return async;
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl, {
                link: Util.replaceTemplate(Localization.logs.harFileError, this.binarySource)
            }));
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(509);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(511);
        }
    });

    return ModalLogAttachmentBinaryHar;
});
