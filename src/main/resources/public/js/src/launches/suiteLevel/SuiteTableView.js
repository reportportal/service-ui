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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var LaunchSuiteItemView = require('launches/common/LaunchSuiteItemView');
    var LaunchSuiteStepItemsView = require('launches/common/LaunchSuiteStepItemsView');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var StickyHeader = require('core/StickyHeader');

    var SuiteTableView = Epoxy.View.extend({
        template: 'tpl-launch-suite-table',

        events: {
            'click .rp-grid-th[data-sorter]': 'onClickSorter',
            'click .rp-grid-th[data-filter] .rp-icons-filter': 'onClickFilter',
            'change [data-js-select-all]': 'onChangeSelectAll',
        },
        bindings: {
            '.launch-suite-step-items': 'classes: {"exact-driven": updateTimeFormat}'
        },
        computeds: {
            updateTimeFormat: function(){
                var timeFormat = this.userStorage.get('startTimeFormat');
                return timeFormat == 'exact' ? true : false;
            }
        },
        initialize: function(options) {
            this.filterModel = options.filterModel;
            this.userStorage = new SingletonUserStorage();
            this.collectionItems = options.collectionItems
            this.render();

            this.tableItems = new LaunchSuiteStepItemsView({
                collection: this.collectionItems,
                itemView: LaunchSuiteItemView,
                filterModel: this.filterModel,
            });
            $('[data-js-table-container]', this.$el).append(this.tableItems.$el);

            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.onChangeSelectionParameters);
            this.listenTo(this.collectionItems, 'reset change:select', _.debounce(this.onResetCollection, 100));
            this.onChangeSelectionParameters();
            this.setupStickyHeader();
        },
        activateNextId: function(id) {
            this.tableItems.activateNextId(id);
        },
        onResetCollection: function() {
            var notSelectModels = this.collectionItems.where({select: false});
            if(notSelectModels.length) {
                $('[data-js-select-all]', this.$el).prop('checked', false);
            }
        },
        onClickSorter: function(e) {
            var sorter = $(e.currentTarget).data('sorter');
            var filterParams = this.filterModel.getParametersObj();
            if(filterParams.sorting_column == sorter) {
                filterParams.is_asc = !filterParams.is_asc;
            } else {
                filterParams.is_asc = true;
                filterParams.sorting_column = sorter;
            }
            this.filterModel.set({newSelectionParameters: JSON.stringify(filterParams), curPage: 1});
        },
        onClickFilter: function(e) {
            e.stopPropagation();
            var filterId = $(e.currentTarget).closest('.rp-grid-th').data('filter');
            if(this.filterModel.get('id') == 'all') {
                var launchFilterCollection = new SingletonLaunchFilterCollection();
                var tempFilterModel = launchFilterCollection.generateTempModel();
                config.router.navigate(tempFilterModel.get('url'), {trigger: true});
                tempFilterModel.trigger('add_entity', filterId);
            } else {
                this.filterModel.trigger('add_entity', filterId);
            }
        },
        onChangeSelectAll: function(e) {
            var value = false;
            if($(e.currentTarget).is(':checked')) {
                value = true;
            }
            _.each(this.collectionItems.models, function(model) {
                model.set({select: value});
            })
        },
        onChangeSelectionParameters: function() {
            $('[data-sorter]', this.$el).removeClass('sorting-asc sorting-desc');
            var filterParams = this.filterModel.getParametersObj();
            var $element = $('[data-sorter="' + filterParams.sorting_column + '"]', this.$el);
            if($element && $element.length) {
                $element.addClass((filterParams.is_asc) ? 'sorting-asc' : 'sorting-desc');
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        setupStickyHeader: function() {
            this.destroyStickyHeader();
            this.stickyHeader = new StickyHeader({fixedBlock: $('[data-js-fixed-header]', this.$el), topMargin: 0, minWidthWindow: 900});
        },
        destroyStickyHeader: function() {
            this.stickyHeader && this.stickyHeader.destroy();
        },
        destroy: function () {
            this.destroyStickyHeader();
            this.tableItems && this.tableItems.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });


    return SuiteTableView;
});
