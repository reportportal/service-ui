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

    var Backbone = require('backbone');
    var App = require('app');

    var config = App.getInstance();

    var BtsPropertiesModel = Backbone.Model.extend({
        defaults: {
            id: 0,
            url: '',
            project: '',
            systemType: '',
            systemAuth: '',
            username: '',
            password: config.forSettings.defaultPassword,
            accessKey: '',
            fields: [],
            domain: '',

            mode: '',
            modelCache: null,
            restorable: ['url', 'project', 'domain']
        },

        initialize: function (modelData) {
            var params;
            var defaultBts;
            if (!modelData) {
                defaultBts = config.forSettings.btsList[0];
                if (!defaultBts) {
                    // console.log('no bts');
                    return;
                }
                this.set({ systemType: defaultBts.name });
            }
            if (!this.get('systemAuth')) {
                params = config.forSettings['bts' + this.get('systemType')].authorizationType[0].value;
                this.set('systemAuth', params);
            }
        },

        isValid: function () {
            var general = !!this.get('url') && !!this.get('project');
            var credentials;

            if (this.validForBasic()) {
                if (this.get('id')) {
                    credentials = this.hasCredentials();
                } else {
                    credentials = this.hasCredentials() && this.get('password') !== config.forSettings.defaultPassword;
                }
            } else {
                credentials = !!this.get('accessKey');
            }

            if (this.isTFS()) {
                general = general && !!this.get('domain');
            }

            return general && credentials;
        },

        hasCredentials: function () {
            return !!this.get('username') && !!this.get('password');
        },

        shouldClearPassword: function (pass) {
            return !this.get('url') && pass === config.forSettings.defaultPassword;
        },

        isEdit: function () {
            return !!this.get('mode');
        },

        setupEdit: function () {
            this.set('mode', 'edit');
            this.set('modelCache', this.toJSON());
        },

        cancelEdit: function () {
            var cache = this.get('modelCache');
            this.set('modelCache', null);
            this.set(cache);
            this.set('mode', '');
        },

        discardEdit: function () {
            if (this.isEdit()) {
                this.set('modelCache', null);
                this.set('mode', '');
            }
        },

        resetCredentials: function () {
            this.set('username', '');
            this.set('password', '');
            this.set('token', '');
        },

        validForApiKey: function () {
            return this.get('systemAuth') === 'APIKEY';
        },

        validForBasic: function () {
            var type = this.get('systemAuth');
            return type === 'BASIC' || type === 'NTLM';
        },

        isRally: function () {
            return this.get('systemType') === 'RALLY';
        },

        isTFS: function () {
            return this.get('systemType') === 'TFS';
        },

        fieldsWereSelected: function () {
            return this.get('id') && this.get('fields').length;
        },

        toJSON: function () {
            var m = Backbone.Model.prototype.toJSON.call(this);
            if (!this.isTFS()) {
                delete m.domain;
            }
            return m;
        },

        getBtsSettings: function () {
            var model = this.toJSON();
            var clearBasicCredentials = function () {
                delete model.username;
                delete model.password;
            };
            delete model.mode;
            delete model.modelCache;
            delete model.restorable;
            delete model.links;
            delete model.access;
            delete model.text;
            delete model.defaultPassword;
            delete model.hasPassword;
            delete model.projectRef;

            if (model.id && model.password && model.password
                === config.forSettings.defaultPassword) {
                clearBasicCredentials();
            }
            if (this.validForApiKey()) {
                clearBasicCredentials();
            }
            if (this.validForBasic()) {
                delete model.accessKey;
            }
            if (!model.id) {
                delete model.fields;
            }
            return model;
        }
    });

    return BtsPropertiesModel;
});
