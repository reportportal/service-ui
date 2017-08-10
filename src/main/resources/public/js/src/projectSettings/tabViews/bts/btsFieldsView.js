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
    var Util = require('util');
    var App = require('app');
    var DropDownComponent = require('components/DropDownComponent');
    var config = App.getInstance();
    var BtsFieldsCommonView = require('bts/BtsFieldsCommonView');

    var FieldsView = BtsFieldsCommonView.extend({

        fieldsTpl: 'tpl-dynamic-fields',

        events: {
        },

        initialize: function (options) {
            this.$el = options.holder;
            this.editable = options.editable;
            this.fields = options.fields;
            this.disabled = config.forSettings.btsJIRA.disabledForEdit;
            this.dropdownComponents = [];
        },

        render: function () {
            this.$el.html(Util.templates(this.fieldsTpl, {
                collection: this.fields,
                disabled: this.disabled,
                update: true,
                editable: this.editable,
                access: config.userModel.hasPermissions()
            }));
            this.setupDropdowns(this.fields);
            this.setupMultiSelect(this.fields);

            return this;
        },

        setupMultiSelect: function (fields) {
            this.applyTypeForBtsFields(fields, this.$el);
        },

        setupDropdowns: function (fields) {
            var self = this;
            $('[data-js-field-with-dropdown]', this.$el).each(function (i, elem) {
                var field = _.find(fields, function (item) {
                    return $(elem).attr('data-js-field-with-dropdown') === item.id;
                });
                var fieldWithDropdown = new DropDownComponent({
                    data: _.map(field.definedValues, function (val) {
                        return { name: val.valueName, value: (val.valueId || val.valueName), disabled: false };
                    }),
                    multiple: false,
                    defaultValue: (field.value) ? (function () {
                      var defaultValue = _.find(field.definedValues, function (item) {
                        return (field.value[0] === item.valueId) || (field.value[0] === item.valueName);
                      });
                      if (!defaultValue) {
                          return '';
                      }
                      return defaultValue.valueId || defaultValue.valueName;
                    })() : (field.definedValues[0].valueId || field.definedValues[0].valueName || '')
                });
                $(this).html(fieldWithDropdown.$el);
                $('[data-js-dropdown]', $(this)).attr('id', $(this).attr('data-js-field-with-dropdown')).addClass('default-value');
                if (!config.userModel.hasPermissions()
                    || (config.forSettings.btsJIRA.disabledForEdit.indexOf(field.id) !== -1)) {
                    $('[data-js-dropdown]', $(this)).attr('disabled', 'disabled');
                }
                if (field.required) {
                    $('[data-js-dropdown]', $(this)).addClass('required-value');
                }
                self.dropdownComponents.push(fieldWithDropdown);
            });
        },

        update: function (fields) {
            this.$el.html(Util.templates(this.fieldsTpl, {
                collection: fields,
                update: true,
                disabled: this.disabled,
                access: config.userModel.hasPermissions()
            }));
            this.setupDropdowns(fields);
            this.setupMultiSelect(fields);

            return this;
        },

        updateData: function (fields) {
            this.fields = fields;
            this.render();
        },

        getDefaultValues: function () {
            var result = {};

            _.forEach($('.default-selector:checked', this.$el), function (el) {
                var checkbox = $(el);
                var element;
                var value;
                var select;

                if (checkbox.data('type') === 'array') {
                    element = checkbox.closest('.rp-form-group').find('input.default-value:first');
                    value = element.val();
                } else {
                    select = checkbox.closest('.rp-form-group').find('select:first');

                    if (select.length) {
                        element = select;
                    } else {
                        element = checkbox.closest('.rp-form-group').find('.default-value:first');
                    }
                    value = element.is('button')
                        ? (element.parent().find('ul.dropdown-menu > li > a.selected').data('value') || element.parent().find('.select-value:first').text())
                        : element.val();
                }
                result[element.attr('id')] = ('' + value).trim();
            });

            return result;
        },
        onDestroy: function () {
            _.each(this.dropdownComponents, function (item) {
                item.destroy();
            });
            this.$el.html('');
        }
    });

    return FieldsView;
});
