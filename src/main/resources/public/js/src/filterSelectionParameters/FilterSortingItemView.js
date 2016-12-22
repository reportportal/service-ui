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

    var Epoxy = require('backbone-epoxy');
    var Backbone = require('backbone');
    var Util = require('util');
    var _ = require('underscore');

    var FilterSortingView = Epoxy.View.extend({
        tagName: 'li',
        className: 'filter-sorting-item-view',
        template: 'filter-sorting-item-view',
        events: {
            'click': 'onClick',
        },
        bindings: {
            '[data-js-name]': 'text: name',
            ':el': 'classes: {selected: isActive}',
            '[data-js-ask-icon]': 'classes: {hide: not(isAskSorting)}',
            '[data-js-desc-icon]': 'classes: {hide: isAskSorting}',
        },
        computeds: {
            isActive: {
                deps: ['sortingColumn'],
                get: function(sortingColumn) {
                    return sortingColumn == this.viewModel.get('id');
                }
            }
        },
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClick: function() {
            var params = this.model.getParametersObj();
            if(this.getBinding('isActive')) {
                params.is_asc = !params.is_asc
            } else {
                params.is_asc = false;
                params.sorting_column = this.viewModel.get('id');
            }
            this.model.set({newSelectionParameters: JSON.stringify(params)});
        },
        destroy: function () {
            this.undelegateEvents();
            this.unbind();
            this.$el.remove();
        },
    });


    return FilterSortingView;
});
