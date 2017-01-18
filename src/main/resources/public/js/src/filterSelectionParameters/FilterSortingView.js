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
    var Localization = require('localization');
    var FilterSortingItemView = require('filterSelectionParameters/FilterSortingItemView');

    var FilterSortingView = Epoxy.View.extend({
        className: 'filter-sorting-view',
        template: 'filter-sorting-view',

        bindings: {
            '[data-js-sorting-name]': 'text: nameSorting',
            '[data-js-ask-sort]': 'classes: {hide: not(isAskSorting)}',
            '[data-js-desc-sort]': 'classes: {hide: isAskSorting}',
        },

        computeds: {
            nameSorting: {
                deps: ['selection_parameters', 'newSelectionParameters'],
                get: function() {
                    var params = this.model.getParametersObj();
                    var sortModel = this.collection.get(params.sorting_column);
                    if(!sortModel) {return ''}
                    return sortModel.get('name');
                }
            }
        },
        initialize: function() {
            this.render();
            this.collection = new Backbone.Collection([
                {name: Localization.launches.launchName, active: false, id: 'name'},
                {name: Localization.launchesHeaders.start_time, active: false, id: 'start_time'},
                {name: Localization.launchesHeaders.total, active: false, id: 'statistics$executions$total'},
                {name: Localization.launchesHeaders.passed, active: false, id: 'statistics$executions$passed'},
                {name: Localization.launchesHeaders.failed, active: false, id: 'statistics$executions$failed'},
                {name: Localization.launchesHeaders.skipped, active: false, id: 'statistics$executions$skipped'},
                {name: Localization.launchesHeaders.product_bug, active: false, id: 'statistics$defects$product_bug'},
                {name: Localization.launchesHeaders.automation_bug, active: false, id: 'statistics$defects$automation_bug'},
                {name: Localization.launchesHeaders.system_issue, active: false, id: 'statistics$defects$system_issue'},
                {name: Localization.launchesHeaders.to_investigate, active: false, id: 'statistics$defects$to_investigate'},
            ]);
            var self = this;
            _.each(this.collection.models, function(model) {
                var view = new FilterSortingItemView({viewModel: model, model: self.model});
                $('[data-js-sorting-list]', self.$el).append(view.$el);
            })
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        destroy: function () {
            this.undelegateEvents();
            this.unbind();
            this.$el.remove();
        },
    });


    return FilterSortingView;
});
