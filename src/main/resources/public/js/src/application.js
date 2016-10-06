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
    var Util = require('util');
    var UserModel = require('model/UserModel');
    var Message = require('message');
    var App = require('app');
    var Router = require('router');
    var Eqjs = require('elementQuery');
    var TrackingDispatcher = require('dispatchers/TrackingDispatcher');
    var ExternalService = require('externalServices/externalServices');
    var Urls = require('dataUrlResolver');
    var callService = require('callService');

    var call = callService.call;

    require('../lib/outdatedbrowser');
    require('cookie');
    require('bootstrap');
    require('jaddons');
    require('landingDocs');


    $('[rel="shortcut icon"]').attr('href', document.location.protocol + '//' + document.location.host + document.location.pathname + 'favicon.ico');
    Util.extendStings();
    Util.extendArrays();

    // init Messages on startup since login uses it
    Util.setupMessagesTracker(new Message.Success({el: $('div.flash-container')}));

    // setup Ajax tracking and handling
    Util.trackAjaxCalls();

    App.eqjs = Eqjs;
    Util.setupVisualEffects();
    Util.shimBind();

    Util.addSymbolsValidation();

    var config = App.getInstance();

    config.mainScrollElement = Util.setupBaronScroll($('#main_content'));

    config.userModel = new UserModel;
    config.trackingDispatcher = TrackingDispatcher;

    config.router = new Router.Router();

    Util.setupWindowEvents();
    Util.setupBackTop();

    config.userModel.load();

    (new ExternalService())
        .done(function() {
            // start app
            call('GET', Urls.getExternalSystems())
                .done(function(services) {
                    config.forSettings.btsList = _.map(services, function(service) {
                        return {name: service.toUpperCase(), value: service.toUpperCase()}
                    });
                    $('html').removeClass('loading');
                    Backbone.history.start();
                    config.userModel.ready.done(function() {
                        config.userModel.checkAuthUrl();
                    });
                })

        });
});
