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

    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Service = require('coreService');

    var AppModel = Epoxy.Model.extend({
        defaults: {
            projectId: null,
            type: '',
            externalSystem: '[]'
        },
        computeds: {
            isBtsAdded: {
                deps: ['externalSystem'],
                get: function () {
                    var externalSystems = this.getArr('externalSystem');
                    if (externalSystems && !externalSystems.length) {
                        return false;
                    }
                    return true;
                }
            },
            isBtsConfigure: {
                deps: ['isBtsAdded', 'externalSystem'],
                get: function (isBtsAdded) {
                    var externalSystems;
                    if (!isBtsAdded) {
                        return false;
                    }
                    externalSystems = this.getArr('externalSystem');
                    if (!_.any(externalSystems, function (bts) {
                        return bts.fields && bts.fields.length;
                    })) {
                        return false;
                    }
                    return true;
                }
            }
        },
        initialize: function () {

        },
        isPersonalProject: function () {
            if (!this.get('configuration')) {
                return null;
            }
            return this.get('configuration').entryType === 'PERSONAL';
        },
        isInternalProject: function () {
            if (!this.get('configuration')) {
                return null;
            }
            return this.get('configuration').entryType === 'INTERNAL';
        },
        update: function () {
            var self = this;
            return Service.getProject().done(function (data) {
                self.parse(data);
            });
        },
        parse: function (data) {
            data.externalSystem = '';
            if (data.configuration && data.configuration.externalSystem) {
                data.externalSystem = JSON.stringify(data.configuration.externalSystem);
            }
            this.set(data);
        },
        getArr: function (field) {
            var string = this.get(field);
            try {
                return JSON.parse(string);
            } catch (err) {
                return [];
            }
        },
        setArr: function (field, array) {
            this.set(field, JSON.stringify(array));
        }
    });

    return AppModel;
});
