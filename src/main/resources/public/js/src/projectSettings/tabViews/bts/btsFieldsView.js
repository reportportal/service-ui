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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Helpers = require('helpers');

    var config = App.getInstance();

    var FieldsView = Epoxy.View.extend({

        fieldsTpl: 'tpl-dynamic-fields',

        events: {
            'click .option-selector': 'handleDropDown'
        },

        initialize: function (options) {
            this.$el = options.holder;
            this.editable = options.editable;
            this.fields = options.fields;
            this.disabled = config.forSettings.btsJIRA.disabledForEdit;
        },

        handleDropDown: function (e) {
            Util.dropDownHandler(e);
        },

        render: function () {
            this.$el.html(Util.templates(this.fieldsTpl, {
                collection: this.fields,
                disabled: this.disabled,
                update: true,
                editable: this.editable,
                access: config.userModel.hasPermissions()
            }));

            this.setupMultiSelect(this.fields);

            return this;
        },

        setupMultiSelect: function (fields) {
            Helpers.applyTypeForBtsFields(fields, this.$el);
        },

        update: function (fields) {
            this.$el.html(Util.templates(this.fieldsTpl, {
                collection: fields,
                update: true,
                disabled: this.disabled,
                access: config.userModel.hasPermissions()
            }));

            this.setupMultiSelect(fields);

            return this;
        },

        updateData: function (fields) {
            this.fields = fields;
            this.render();
        },

        getDefaultValues: function () {
            var result = {};

            _.forEach($(".default-selector:checked", this.$el), function (el) {
                var checkbox = $(el),
                    element, value;

                if (checkbox.data('type') === 'array') {
                    element = checkbox.closest('.rp-form-group').find('input.default-value:first');
                    value = element.val();
                } else {
                    var select = checkbox.closest('.rp-form-group').find('select:first');

                    if (select.length) {
                        element = select;
                    } else {
                        element = checkbox.closest('.rp-form-group').find('.default-value:first');
                    }

                    value = element.is('button')
                        ? element.parent().find('.select-value:first').text()
                        : element.val();
                }

                result[element.attr('id')] = value.trim();
            });

            return result;
        }
    });

    return FieldsView;

});
