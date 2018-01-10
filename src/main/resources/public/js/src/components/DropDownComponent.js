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

    var DropDownComponent = Epoxy.View.extend({
        className: 'drop-down-component',
        template: 'tpl-drop-down-component',
        events: {
            'click ul li a': 'onClickItem',
            'click [data-js-label]': 'onClickLabel',
            'change input': 'onChangeInput'
        },

        initialize: function (options) {
            // options = {
            //     data: [{name: '', value: '', disabled: false}],
            //     placeholder: 'default text',
            //     multiple: false,
            //     defaultValue: '',
            //      isShowAll: false
            // }
            this.options = options;
            if (!this.options.data) {
                console.log('DropDownComponent: data not found');
                return;
            }
            this.render();
            if (options.defaultValue) {
                !options.multiple && this.activateItem(options.defaultValue);
                options.multiple && this.setDefaultState(options.defaultValue);
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.options));
        },
        onClickLabel: function (e) {
            e.stopPropagation();
        },
        onClickItem: function (e) { // simple select
            var curValueOriginal;
            e.preventDefault();
            if ($(e.currentTarget).hasClass('selected') || $(e.currentTarget).hasClass('not-active')) {
                return;
            }
            curValueOriginal = this.activateItem($(e.currentTarget).data('value')); // type key mistakes
            this.trigger('change', curValueOriginal, e);
        },
        activateItem: function (value) {  // simple select
            var curName = '';
            var curVal = '';
            this.$el.removeClass('dropdown-error-state');
            this.$el.addClass('selected');
            _.each(this.options.data, function (item) {
                if (item.value == value) { // Comparison with conversion
                    curName = item.shortName ? item.shortName : item.name;
                    curVal = item.value;
                    return false;
                }
            });
            this.currentValue = curVal;
            $('[data-js-select-value]', this.$el).html(curName);
            $('[data-value]', this.$el).removeClass('selected');
            $('[data-value="' + curVal + '"]', this.$el).addClass('selected');
            return curVal;
        },
        setDefaultState: function (items) {
            var self = this;
            _.each(items, function (item) {
                $('[data-value="' + item + '"]', self.$el).prop({ checked: 'checked' });
            });
            this.onChangeInput();
        },
        onSelectAll: function () {
            var allChecked = true;
            var checkboxMas = $('input[data-value]', this.$el);
            checkboxMas.each(function () {
                if (!$(this).is(':checked')) { allChecked = false; }
            });
            checkboxMas.prop('checked', !allChecked);
        },
        onChangeInput: function (e) {  // multiple select
            var curValue = [];
            var curName = [];
            if (e && e.target.value === 'all') {
                this.onSelectAll();
            }
            this.$el.removeClass('dropdown-error-state');
            _.each($('input:checked', this.$el), function (item) {
                if (item.value !== 'all') {
                    curValue.push($(item).data('value'));
                    curName.push($(item).data('name'));
                }
            });
            this.currentValue = curValue;
            this.trigger('change', curValue);
            if (curName.length) {
                this.$el.addClass('selected');
                $('[data-js-select-value]', this.$el).html(curName.join(', '));
            } else {
                this.$el.removeClass('selected');
                $('[data-js-select-value]', this.$el).html(this.options.placeholder);
            }
        },
        getValue: function () {
            return this.currentValue;
        },
        setErrorState: function (message) {
            this.$el.addClass('dropdown-error-state');
            $('[data-js-hint-message]', this.$el).html(message);
        },
        disabled: function () {
            $('[data-js-dropdown]', this.$el).attr('disabled', 'disabled');
        },
        enabled: function () {
            $('[data-js-dropdown]', this.$el).removeAttr('disabled');
        },
        onDestroy: function () {
            this.$el.html('');
            delete this;
        }
    });


    return DropDownComponent;
});
