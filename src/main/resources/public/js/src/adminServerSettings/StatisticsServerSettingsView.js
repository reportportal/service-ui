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
    var Util = require('util');
    var Service = require('coreService');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var SingletonAnalyticsConnect = require('analytics/SingletonAnalyticsConnect');
    var App = require('app');

    var config = App.getInstance();

    var StatisticsServerSettingsView = Epoxy.View.extend({

        className: 'rp-statistics-server-settings',
        template: 'tpl-statistics-server-settings',

        events: {
            'click [statistics-list-toggler]': 'toggleList',
            'click [data-js-submit]': 'submit',
            'change [data-js-switcher]': 'onChangeSwitcher'
        },

        bindings: {
            '[data-js-switcher]': 'attr: {checked: sendStatistics}'
        },


        initialize: function () {
            this.model = new SingletonRegistryInfoModel();
            this.analyticsConnect = new SingletonAnalyticsConnect();
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
        },

        setupAnchors: function () {
            this.$switcher = $('[data-js-switcher]', this.$el);
        },

        toggleList: function () {
            $('.statistics-list', this.$el).toggleClass('list-shown');
        },
        onChangeSwitcher: function () {
            config.trackingDispatcher.trackEventNumber(512);
        },
        submit: function () {
            var self = this;
            var enabled = self.$switcher.prop('checked');
            config.trackingDispatcher.trackEventNumber(513);
            Service.toggleAnalytics({
                enabled: enabled,
                type: 'all'
            })
                .done(function () {
                    self.model.update();
                    if (enabled) {
                        self.analyticsConnect.destroy();
                        self.analyticsConnect.init();
                    } else {
                        self.analyticsConnect.destroy();
                    }
                    Util.ajaxSuccessMessenger('updateServerSettings');
                })
                .fail(function (error) {
                    Util.ajaxInfoMessenger(error, 'updateServerSettings');
                });
        },

        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return StatisticsServerSettingsView;
});
