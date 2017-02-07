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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');

    var config = App.getInstance();

    var EmailServerSettingsModel = Epoxy.Model.extend({
        defaults: {
            enableEmailServer: false,
            authEnabled: false,
            host: '',
            port: '',
            from: '',
            protocol: config.forAdminSettings.defaultProtocol,
            sslEnabled: false,
            starTlsEnabled: false,
            username: '',
            password: ''
        },

        getEmailServerSettings: function() {
            var data = {
                authEnabled: this.get('authEnabled'),
                starTlsEnabled: this.get('starTlsEnabled'),
                sslEnabled: this.get('sslEnabled'),
                host: $.trim(this.get('host')),
                password: this.get('authEnabled') ? this.get('password'): '',
                port: $.trim(this.get('port')),
                from: $.trim(this.get('from')),
                protocol: this.get('protocol'),
                username: this.get('authEnabled') ? this.get('username') : ''
            };
            return this.get('enableEmailServer') ? data : {};
        }
    });

    return EmailServerSettingsModel;

});
