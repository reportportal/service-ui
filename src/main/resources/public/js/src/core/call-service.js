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
    var App = require('app');

    var config = App.getInstance();

    var call = function (type, url, data, dataInHeader, cancelProtected) {
        var Util = require('util');
        var data = dataInHeader
            ? data
            : data ? JSON.stringify(data) : {};

        var settings = {
            type: type,
            url: url,
            data: data,
        };

        if(cancelProtected) {
            settings.beforeSend = function(req) {
                req.persistant = true;
                Util.ajaxBeforeSend(req);
            }
        }

        return $.ajax(settings);
    };

    return {
        call: call
    }
});
