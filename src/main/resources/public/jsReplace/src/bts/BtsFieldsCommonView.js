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

    var $ = require('jquery');
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var config = App.getInstance();
    var BtsFieldsCommonView;
    require('jquery-ui/widgets/datepicker');

    BtsFieldsCommonView = Epoxy.View.extend({

        template: '',

        events: {
        },

        initialize: function () {
        },
        applyTypeForBtsFields: function (fields, holder) {
            var self = this;
            _.forEach(fields, function (field) {
                var clearId = field.id.replaceAll('.', '');
                var values;
                var element;
                if (self.validForMultiSelect(field)) {
                    values = _.map(field.definedValues, function (option) {
                        var name = option.valueName.trim();
                        return { id: name, text: name };
                    });
                    element = $('#' + field.id, holder);
                    Util.setupSelect2WhithScroll(element, { tags: false, data: values });
                    element.on('remove', function () {
                        element.select2('destroy');
                        element = null;
                        values = null;
                        $('body > #select2-drop-mask, body > .select2-sizer').remove();
                    });
                } else if (self.validForDatePicker(field)) {
                    $('[data-id=' + clearId + ']')
                        .prop('readonly', true)
                        .datepicker({ dateFormat: config.dateTimeFormat })
                        .on('remove', function () {
                            $(this).datepicker('destroy');
                        });
                } else if (self.validForIntegers(field)) {
                    Util.bootValidator($('[data-id=' + clearId + ']', holder), [{
                        validator: 'matchRegex',
                        type: 'onlyIntegersRegex',
                        pattern: config.patterns.onlyIntegers
                    }]);
                } else if (self.validForDropDown(field)) {
                    if (field.definedValues && field.definedValues.length
                        > config.dynamicDropDownVisible) {
                        Util.setupSelect2WhithScroll($('[data-id=' + clearId + ']', holder), {
                            allowClear: true
                        });
                        $('[data-id=' + clearId + ']', holder).on('remove', function () {
                            $(this).select2('destroy');
                            $('body > #select2-drop-mask, body > .select2-sizer').remove();
                        });
                    }
                } else if (self.validForDouble(field)) {
                    Util.bootValidator($('[data-id=' + clearId + ']', holder), [
                        { validator: 'matchRegex', type: 'doublesRegex', pattern: config.patterns.doubles }
                    ]);
                }
            });
        },
        validForMultiSelect: function (field) {
            return field.fieldType === 'array' && field.definedValues && field.definedValues.length;
        },
        validForDatePicker: function (field) {
            return field.fieldType === 'date' || field.fieldType.toLowerCase() === 'datetime';
        },
        validForIntegers: function (field) {
            return field.fieldType === 'Integer' || field.fieldType === 'number';
        },
        validForDropDown: function (field) {
            return field.definedValues && field.definedValues.length && field.fieldType !== 'array';
        },
        validForDouble: function (field) {
            return field.fieldType === 'Double';
        },
        onDestroy: function () {
        }
    });

    return BtsFieldsCommonView;
});
