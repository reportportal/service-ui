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
    "use strict";
    var $ = require('jquery');
    var Backbone = require('backbone');

    var NotificationsSettingsModel = Backbone.Model.extend({

        defaults: {
            emailEnabled: false,
            fromAddress: 'reportportal@epam.com',
            emailCases: []
        },

        getProjectSettings: function (deletedRules) {
            var emailCases = JSON.parse(JSON.stringify(this.get('emailCases')));
            emailCases = $.grep(emailCases, function (value) {
                return $.inArray(value.id, deletedRules) == -1;
            });
            _.each(emailCases, function (elem) {
                delete elem.id;
            });

            var data = {
                emailEnabled: this.get('emailEnabled'),
                fromAddress: this.get('fromAddress'),
                emailCases: emailCases
            };

            return {
                configuration: data
            };
        }
    });

    return NotificationsSettingsModel;
});
