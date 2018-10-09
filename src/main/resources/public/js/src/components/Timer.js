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
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var UserModel = require('model/UserModel');
    var SingletonAppStorage = require('storage/SingletonAppStorage');
    var Localization = require('localization');
    var App = require('app');
    var config = App.getInstance();

    var Timer = Epoxy.View.extend({
        template: 'tpl-component-timer',
        bindings: {
            '[data-js-hours]': 'text: hours',
            '[data-js-minutes]': 'text: minutes',
            '[data-js-seconds]': 'text: seconds',
            '[data-js-banner-text]': 'html: bannerText'
        },
        events: {
            'click [data-js-github-auth]': 'onClickGithubAuth'
        },
        computeds: {
            bannerText: function () {
                if (config.userModel.get('account_type') === 'GITHUB') {
                    return Localization.login.demoGithub;
                }
                return Localization.login.publicAccount;
            }
        },

        onClickGithubAuth: function (e) {
            this.userModel.logout();
        },

        startTimer: function () {
            var flushingTime = this.storage.get('flushing_time');
            var self = this;
            this.timer = setInterval(function () {
                flushingTime -= 1000;
                if (flushingTime < 0) {
                    clearInterval(self.timer);
                    self.storage.clear();
                    window.localStorage.clear();
                    self.userModel.logout();
                } else {
                    self.storage.set('flushing_time', flushingTime);
                    var hours = Math.floor(flushingTime / 3600 / 1000);
                    var minutes = Math.floor((flushingTime - hours * 3600 * 1000) / 60 / 1000);
                    var seconds = Math.floor((flushingTime - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000);
                    if (hours === 0) {
                        $('[data-js-hours-container]').addClass('hide');
                    }
                    if (minutes === 0) {
                        $('[data-js-minutes-container]').addClass('hide');
                    }
                    self.model.set('hours', hours);
                    self.model.set('minutes', minutes);
                    self.model.set('seconds', seconds);
                }
            }, 1000);
        },

        initialize: function () {
            this.infoModel = new SingletonRegistryInfoModel();
            this.storage = new SingletonAppStorage();
            this.userModel = new UserModel();
            if (this.infoModel.get('getTriggersIn')) {
                this.storage.set('flushing_time', this.infoModel.get('getTriggersIn'));
                var flushingTime = this.storage.get('flushing_time');
                var hours = Math.floor(flushingTime / 3600 / 1000);
                var minutes = Math.floor((flushingTime - hours * 3600 * 1000) / 60 / 1000);
                var seconds = Math.floor((flushingTime - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000);
                this.model = new (Epoxy.Model.extend({
                    defaults: {
                        hours: hours,
                        minutes: minutes,
                        seconds: seconds
                    }
                }))();
                this.render();
                !this.timer && this.startTimer();
            }
        },


        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },

        destroy: function () {
            clearInterval(this.timer);
            this.storage.set('flushing_time', null);
            this.$el.empty();
        }

    });


    return Timer;
});
