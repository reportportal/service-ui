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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Localization = require('localization');
    var Service = require('coreService');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');

    var StatisticsServerSettingsView = Epoxy.View.extend({

        template: 'tpl-statistics-server-settings',

        events: {
            'click [statistics-list-toggler]': 'toggleList',
            'click [data-js-submit]': 'submit'
        },

        bindings: {
            '[data-js-switcher]': 'attr: {checked: isStatisticsEnabled}',
        },

        computeds: {
            isStatisticsEnabled: {
                get: function() {
                    return this.registryInfoModel.get('analyticsExtensions').google.enabled;
                }
            }
        },

        initialize: function(options) {
            this.registryInfoModel = new SingletonRegistryInfoModel();
            this.render();
        },

        render: function(){
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
        },

        setupAnchors: function () {
            this.$switcher = $('[data-js-switcher]', this.$el);
        },

        toggleList: function () {
            $('.statistics-list', this.$el).toggleClass('list-shown');
        },

        submit: function () {
            var self = this;
            Service.toggleGoogleAnalytics({
                enabled: self.$switcher.prop('checked'),
                type: 'google'
            })
                .done(function (responce) {
                    Util.ajaxSuccessMessenger('updateServerSettings');
                })
                .fail(function (error) {
                    console.log(error.responseText);
                });
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return StatisticsServerSettingsView;

});
