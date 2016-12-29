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
    var App = require('app');
    var AdminService = require('adminService');
    var AuthServerSettingsModel = require('adminServerSettings/AuthServerSettingsModel');

    var config = App.getInstance();

    var AuthServerSettingsView = Epoxy.View.extend({

        bindings: {
            //'[data-js-guest-enable]': 'checked: enableGuestAccount',
            '[data-js-github-enable]': 'checked: gitHubAuthEnabled',
            '[data-js-github-config]': 'classes: {hide: not(gitHubAuthEnabled)}'
        },

        template: 'tpl-auth-server-settings',

        initialize: function(options){
            this.model = new AuthServerSettingsModel();
            this.getAuthSettings();
        },

        render: function(){
            //console.log('render GitHubServerSettingsView');
            this.$el.html(Util.templates(this.template, {}));
            //this.bindValidators();
        },

        getAuthSettings: function (callback) {
            //console.log('getAuthSettings');
            AdminService.getAuthSettings()
                .done(function (data) {
                    console.log('getAuthSettings: ', data);
                    this.settings = data;
                    this.model.set(data.authSettings);
                    this.render(data);
                }.bind(this));
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return AuthServerSettingsView;

});