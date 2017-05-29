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
    var EventListener = require('controlers/_eventListener');
    var FilterReducer = require('controlers/filterControler/FilterReducer');
    var instance = null;
    var FilterEventDispatcher = EventListener.extend({
        events: {
            ON_LOAD_FILTERS: 1,
            FILTERS_LOAD_START: 2,
            FILTERS_LOAD_END: 3,
            LOAD_FILTERS: 4,
            ON_REMOVE_FILTER: 5,
            REMOVE_FILTER: 6,
            FILTER_LOAD_START: 7,
            FILTER_LOAD_END: 8,
            ON_SET_FILTER: 9,
            SET_FILTER: 10,
            ON_ADD_FILTER: 11,
            ADD_FILTER: 12,
            ON_CHANGE_IS_LAUNCH: 13,
            CHANGE_IS_LAUNCH: 14,
            ON_LOAD_FILTER: 15
        },
        initialize: function () {
            this.reducer = new FilterReducer(this);
        }
    });
    var getInstance = function () {
        if (!instance) {
            instance = new FilterEventDispatcher();
        }
        return instance;
    };

    return getInstance;
});
