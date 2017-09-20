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
    var Localization = require('localization');

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.uniqueBugsTable,
                img: 'unique-bugs-table.svg',
                description: Localization.widgets.uniqueBugsTableDescription,
                widget_type: 'table', // TODO remove after refactoring,
                hasPreview: false
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'filters',
                    options: {}
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.maxLaunches,
                        min: 1,
                        max: 150,
                        def: 10,
                        numOnly: true,
                        action: 'limit'
                    }
                }
            ]);

            return async.promise();
        }
    };
});
