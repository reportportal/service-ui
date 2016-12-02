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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');

    var cache = {};
    var timers = {};

    var get = function (key) {
        var result = null;
        if (cache[key]) {
            result = $.Deferred();
            result.resolve(cache[key]);
        }
        return result ? result.promise() : null;
    };

    var set = function (data, key, time) {
        cache[key] = data;
        timers[key] = setTimeout(function () {
            clearByKey(key);
        }, time);
    };

    var clearByKey = function (key) {
        delete cache[key];
        delete timers[key];
    };

    return {
        get: get,
        set: set,
        clear: clearByKey
    }
});
