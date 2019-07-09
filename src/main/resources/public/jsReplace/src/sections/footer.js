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
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Moment = require('moment');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var App = require('app');

    var config = App.getInstance();

    var Footer = Backbone.View.extend({
        el: '#pageFooter',
        tpl: 'tpl-footer',

        initialize: function () {
            this.viewModel = new SingletonRegistryInfoModel();
        },

        events: {
            'click [data-js-fork-us]': 'onClickForkUs',
            'click [data-js-chat-slack]': 'onClickChatSlack',
            'click [data-js-contact-us]': 'onClickContactUs',
            'click [data-js-epam]': 'onClickEpamLink',
            'click [data-js-docs]': 'onClickDocs',
            'click [data-js-api]': 'onClickApi'
        },

        render: function () {
            var self = this;

            this.$el.html(Util.templates(this.tpl, { moment: Moment, util: Util })).show();
            this.viewModel.ready
                .done(function () {
                    $('#buildVersion', self.$el).text(self.viewModel.get('uiBuildVersion'));
                });
            Util.setupBaronScroll($('#ComponentsModal .modal-dialog', this.$el));
            return this;
        },
        onClickForkUs: function (e) {
            config.trackingDispatcher.trackEventNumber(351);
        },
        onClickChatSlack: function () {
            config.trackingDispatcher.trackEventNumber(352);
        },
        onClickContactUs: function () {
            config.trackingDispatcher.trackEventNumber(353);
        },
        onClickEpamLink: function () {
            config.trackingDispatcher.trackEventNumber(354);
        },
        onClickDocs: function () {
            config.trackingDispatcher.trackEventNumber(355);
        },
        onClickApi: function () {
            config.trackingDispatcher.trackEventNumber(356);
        },
        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    return Footer;
});
