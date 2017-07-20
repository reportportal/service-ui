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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var _ = require('underscore');
    var $ = require('jquery');

    var DropdownButton = Epoxy.View.extend({
        className: 'drop-down-button',
        template: 'tpl-dropdown-button',
        events: {
            'click [data-js-select-launch-option] a': 'onClickItem'
        },

        initialize: function (options) {
            // options = {
            //      links:[{name: ''}]
            // }
            this.options = options;
            this.render();
            if(options.defaultValue){
                this.selectOptions(options.defaultValue);
            } else{
                this.selectOptions(options.links[0].value);
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.options));
        },
        onClickItem: function (e) {
            var value;
            e.preventDefault();
            if ($(e.currentTarget).hasClass('selected')) {
                return;
            }
            value = $(e.currentTarget).data('value');
            this.trigger('change', value);
            this.selectOptions(value);
        },
        selectOptions: function (value) {
            var curName = '';
            var curVal = '';
            _.each(this.options.links, function (item) {
                if (item.value === value) {
                    curName = item.name;
                    curVal = item.value;

                    return false;
                }
            });
            $('[data-js-select-value]', this.$el).html(curName);
            $('[data-value]', this.$el).removeClass('selected');
            $('[data-value="' + curVal + '"]', this.$el).addClass('selected');
        }
    });
    return DropdownButton;
});

