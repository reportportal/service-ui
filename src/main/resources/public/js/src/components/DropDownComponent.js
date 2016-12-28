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
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
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

        initialize: function(options) {
            // options = {
            //     data: [{name: '', value: ''}],
            //     placeholder: 'default text',
            //     multiple: false,
            //     defaultValue: ''
            // }
            this.options = options
            if(!this.options.data) {
                console.log('DropDownComponent: data not found');
                return;
            }
            this.render();
            if(options.defaultValue) {
                !options.multiple && this.activateItem(options.defaultValue);
                options.multiple && this.setDefaultState(options.defaultValue);
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, this.options));
        },
        onClickLabel: function(e) {
            e.stopPropagation();
        },
        onClickItem: function(e) { // simple select
            e.preventDefault();
            var value = $(e.currentTarget).data('value');
            this.trigger('change', value);
            this.activateItem(value);
        },
        activateItem: function(value) {  // simple select
            this.$el.removeClass('dropdown-error-state');
            var curName = '';
            _.each(this.options.data, function(item) {
                if(item.value == value) {
                    curName = item.name;
                    return false;
                }
            })
            $('[data-js-select-value]', this.$el).html(curName);
            this.$el.addClass('selected');
        },
        setDefaultState: function(items) {
            var self = this;
            _.each(items, function(item) {
                $('[data-value="'+item+'"]', self.$el).prop({checked: 'checked'});
            });
            this.onChangeInput();
        },
        onChangeInput: function() {  // multiple select
            this.$el.removeClass('dropdown-error-state');
            var curValue = [];
            var curName = [];
            _.each($('input:checked', this.$el), function(item) {
                curValue.push($(item).data('value'));
                curName.push($(item).data('name'))
            })
            this.trigger('change', curValue);
            if(curName.length){
                this.$el.addClass('selected');
                $('[data-js-select-value]', this.$el).html(curName.join(', '));
            } else {
                this.$el.removeClass('selected');
                $('[data-js-select-value]', this.$el).html(this.options.placeholder);
            }
        },
        setErrorState: function(message) {
            this.$el.addClass('dropdown-error-state');
            $('[data-js-hint-message]', this.$el).html(message);
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });


    return DropDownComponent;
});
