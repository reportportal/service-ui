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

    var Localization = require('localization');
    var Urls = require('dataUrlResolver');
    var CallService = require('callService');

    var regexes = {};

    var noDuplications = function (val, options) {
        var condition;
        if (options.isCaseSensitive) {
            condition = options.source.indexOf(val) !== -1;
        } else {
            condition = options.source.indexOf(val.toLowerCase()) !== -1
        }
        if (condition) {
            return Localization.validation[options.type + "Duplication"];
        }
    };

    var required = function (val, options) {
        var length = val.length;
        if (length === 0) {
            return Localization.validation[options.type + "Required"] || Localization.validation["requiredDefault"];
        }
        return null;
    };

    var matchRegex = function (val, options) {
        if (!regexes[options.type]) {
            regexes[options.type] = (options.pattern instanceof RegExp)
                ? options.pattern
                : new RegExp(options.pattern, options.arg);
        }
        if (!regexes[options.type].test(''+val)) {
            return options.message || Localization.validation[options.type];
        }
        return null;
    };
    var minMaxRequired = function (val, options, Util) {
        var length = val.length;
        if (length === 0 || validateForMinMax(length, options)) {
            return Util.replaceTemplate(Localization.validation[options.type + "Length"], options.min, options.max);
        }
        return null;
    };
    var maxRequired = function (val, options, Util) {
        var length = val.length;
        if (validateForMax(length, options)) {
            return Util.replaceTemplate(Localization.validation[options.type + "MaxLength"], options.max);
        }
        return null;
    };

    var minMaxNumberRequired = function (val, options, Util) {
        var integerVal = isInt(val),
            intVal = parseInt(val);
        if (!val.length || !integerVal || (intVal < options.min || intVal > options.max)) {
            return Util.replaceTemplate(Localization.validation[options.type + "Length"], options.min, options.max);
        }
        return null;
    };

    var isInt =function (n) {
        return Number(n) == n && n % 1 === 0;
    };

    var minMaxNotRequired = function (val, options, Util) {
        var length = val.length;
        if (length === 0) {
            return null;
        }
        if (validateForMinMax(length, options)) {
            return Util.replaceTemplate(Localization.validation[options.type + "Length"], options.min, options.max);
        }
        return null;
    };

    var validateForMinMax = function (length, options) {
        return length < options.min || length > options.max;
    };
    var validateForMax = function(length, options) {
        return length > options.max;
    };

    var remoteEmail = function (val, options) {
        var dfd = $.Deferred();
        CallService.call('GET', Urls.userInfoValidation() + '?email=' + val)
            .done(function (data) {
                var valid = {valid: !data.is};
                dfd.resolve(valid);
            })
            .fail(function (error) {
                dfd.resolve({valid: false});
            });
        return dfd.promise();
    };

    return {
        minMaxNumberRequired: minMaxNumberRequired,
        noDuplications: noDuplications,
        required: required,
        matchRegex: matchRegex,
        minMaxRequired: minMaxRequired,
        minMaxNotRequired: minMaxNotRequired,
        remoteEmail: remoteEmail
    };
});
