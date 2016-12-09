/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';


    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Service = require('coreService');

    var config = App.getInstance();

    var DashboardModel = Epoxy.Model.extend({
        defaults: {
            isShared: false,
            name: '',
            owner: '',
            widgets: '[]',

            activate: false,
        },
        getWidgets: function () {
            try {
                return JSON.parse(this.get('widgets'));
            } catch (err) {
                return [];
            }
        },
        setWidgets: function (widgets) {
            this.set({issue: JSON.stringify(widgets)});
        },

    });


    return DashboardModel;
});
