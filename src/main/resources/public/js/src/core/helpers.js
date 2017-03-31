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
    var _ = require('underscore');
    var App = require('app');
    var Util = require('util');
    var Moment = require('moment');
    var Localization = require('localization');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Filters = require('filter/filters');

    var config = App.getInstance();

    var getLastKey = function (keyArray) {
        if (keyArray) {
            keyArray = keyArray.split('$');
            return keyArray.length > 1 ? keyArray[keyArray.length - 1] : keyArray[0];
        }
    };
    var getSmartKey = function(string) {
        var defectTypeCollection = new SingletonDefectTypeCollection();
        var splitKey = string.split('$');
        var locator = splitKey.pop();
        var type = splitKey.shift();
        var defectTypeTotal = splitKey.pop();
        var defectType = defectTypeCollection.findWhere({locator: locator});

        if(!string) { return '' }
        if(Localization.filterNameById[string]) {
            if(type == 'statistics') {

                var searchDefectTypes = defectTypeCollection.where({typeRef: defectTypeTotal.toUpperCase()});
                if(searchDefectTypes.length == 1) {
                    return searchDefectTypes[0].get('longName');
                } else {
                    return Localization.filterNameById[string];
                }
            } else {
                return Localization.filterNameById[string];
            }
        }
        if(defectType) { return defectType.get('longName'); }
        var firstPartKey = type + '$' + splitKey[0] + '$' + defectTypeTotal;
        if(Localization.filterNameById[firstPartKey]) { return false }
        return locator.capitalizeName();
    };
    var getFilterOptions = function (entities, text) {
        if (!entities || !entities.length) {
            return '';
        }
        var clearValue = function (field) {
            var result = field;
            var time = result.split(',');
            var timeDynamic = result.split(';');
            if (time.length === 2) {
                result = getTimeString(time[0], time[1]);
            } else if (timeDynamic.length == 3) {
                var curTime = Moment().startOf('day').unix()*1000;
                result = getTimeString(curTime + parseInt(timeDynamic[0], 10)*60000, curTime+ parseInt(timeDynamic[1], 10)*60000) + ' (dynamic)';
            }
            function getTimeString(startTime, endTime) {
                var result = '';
                var hum = config.dateRangeFullFormat;
                var from = Moment(parseInt(startTime));
                var to = Moment(parseInt(endTime));

                if (from.isValid() && to.isValid()) {
                    result = Localization.ui.from + ' ' + from.format(hum) + ' ' + Localization.ui.to + ' ' + to.format(hum);
                }
                return result;
            }
            return result.escapeHtml();
        };

        if (entities) {
            var mapped = _.map(entities, function (item) {
                if (item.filtering_field === 'start_time' /*&& item.value.split(',').length === 1*/) {
                    item.value = (new Filters.TimerModel(item)).asValue().value;
                    if(~item.value.indexOf(',') || ~item.value.indexOf(';')) {
                        item.condition = '';
                    } else {
                        item.condition = 'eq'
                    }
                }
                var filterName = getSmartKey(item.filtering_field);
                if (!filterName) {
                    return '<span style="color: #ff3222"><b>Invalid</b></span>';
                }
                if(item.value == '') {
                    return '';
                }
                return [filterName, ' ',
                    item.is_negative ? text['not'] : '',
                    text[item.condition] || "", ' ',
                    clearValue(item.value)].join('');
            }, {});
            return mapped.join(text['andb']);
        }
    };

    var applyTypeForBtsFields = function (fields, holder) {
        _.forEach(fields, function (field) {
            var clearId = field.id.replaceAll('.', '');
            if (validForMultiSelect(field)) {
                var values = _.map(field.definedValues, function (option) {
                    var name = option.valueName.trim();
                    return {id: name, text: name}
                }),
                    element = $("#" + field.id, holder);
                Util.setupSelect2WhithScroll(element, { tags: false, data: values });
                element.on('remove', function () {
                        element.select2('destroy');
                        element = null;
                        values = null;
                        $("body > #select2-drop-mask, body > .select2-sizer").remove();
                    });
            } else if (validForDatePicker(field)) {
                $("[data-id=" + clearId + "]")
                    .prop('readonly', true)
                    .datepicker({dateFormat: config.dateTimeFormat})
                    .on('remove', function () {
                        $(this).datepicker("destroy");
                    });
            } else if (validForIntegers(field)) {
                Util.bootValidator($("[data-id=" + clearId + "]", holder), [{
                    validator: 'matchRegex',
                    type: 'onlyIntegersRegex',
                    pattern: config.patterns.onlyIntegers
                }]);
            } else if (validForDropDown(field)) {
                if(field.definedValues && field.definedValues.length > config.dynamicDropDownVisible) {
                    Util.setupSelect2WhithScroll($("[data-id=" + clearId + "]", holder),{
                        allowClear: true
                    });
                    $("[data-id=" + clearId + "]", holder).on('remove', function () {
                        $(this).select2('destroy');
                        $("body > #select2-drop-mask, body > .select2-sizer").remove();
                    });
                }
            } else if (validForDouble(field)) {
                Util.bootValidator($("[data-id=" + clearId + "]", holder), [
                    {validator: 'matchRegex', type: 'doublesRegex', pattern: config.patterns.doubles}
                ]);
            }
        });
    };

    var validForMultiSelect = function (field) {
        return field.fieldType === 'array' && field.definedValues && field.definedValues.length;
    };

    var validForDatePicker = function (field) {
        return field.fieldType === 'date' || field.fieldType.toLowerCase() === 'datetime';
    };

    var validForIntegers = function (field) {
        return field.fieldType === 'Integer' || field.fieldType === 'number';
    };

    var validForDropDown = function (field) {
        return field.definedValues && field.definedValues.length && field.fieldType !== 'array';
    };

    var validForDouble = function (field) {
        return field.fieldType === 'Double';
    };

    return {
        getLastKey: getLastKey,
        getFilterOptions: getFilterOptions,
        applyTypeForBtsFields: applyTypeForBtsFields
    }

});
