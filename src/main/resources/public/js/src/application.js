/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var Backbone = require('backbone');
    var Util = require('util');
    var UserModel = require('model/UserModel');
    var Message = require('message');
    var App = require('app');
    var Router = require('router');
    var TrackingDispatcher = require('dispatchers/TrackingDispatcher');
    var ExternalService = require('externalServices/externalServices');
    var SingletonAnalyticsConnect = require('analytics/SingletonAnalyticsConnect');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var config = App.getInstance();

    require('polyfills/index');
    require('../lib/outdatedbrowser');
    require('cookie');
    require('jquery-ui/widgets/tooltip');
    $.widget.bridge('uitooltip', $.ui.tooltip);
    require('bootstrap');
    require('jaddons');
    require('updateBackbone');


    $('[rel="shortcut icon"]').attr('href', document.location.protocol + '//' + document.location.host + document.location.pathname + 'favicon.ico');
    Util.extendStings();
    Util.extendArrays();

    // init Messages on startup since login uses it
    Util.setupMessagesTracker(new Message.Success({ el: $('div.flash-container') }));

    // setup Ajax tracking and handling
    Util.trackAjaxCalls();

    // Util.setupVisualEffects();
    Util.shimBind();

    Util.addSymbolsValidation();

    Util.checkWidthScroll();

    config.mainScrollElement = Util.setupBaronScroll($('#main_content'));
    config.userModel = new UserModel();
    config.trackingDispatcher = TrackingDispatcher;
    config.router = new Router.Router();

    Util.setupWindowEvents();
    Util.setupBackTop();


    config.userModel.load();
    if ('DEBUG_STATE') {
        window.userModel = config.userModel;
        window.router = config.router;
        window.config = config;
    }
    var registryInfoModel = new SingletonRegistryInfoModel();
    // start app
    registryInfoModel.ready.done(function () {
        if (registryInfoModel.get('isDemo')) {
            $('body').addClass('demo-instance');
        }
        function afterRegistryReady() {
            if (registryInfoModel.get('sendStatistics')) {
                (new SingletonAnalyticsConnect()).init();
            }
            config.forSettings.btsList = _.map(registryInfoModel.get('bugTrackingExtensions'), function (service) {
                return { name: service.toUpperCase(), value: service.toUpperCase() };
            });
            config.userModel.ready.done(function () {
                $('html').removeClass('loading');
                Backbone.history.start();
                config.userModel.checkAuthUrl();
            });
        }
        if (registryInfoModel.get('isEpamInstance')) {
            (new ExternalService())
                .done(function () {
                    afterRegistryReady();
                });
        } else {
            afterRegistryReady();
        }
    });
});
