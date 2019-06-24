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
    var App = require('app');

    var config = App.getInstance();

    var SuiteTableView = Epoxy.View.extend({
        template: 'tpl-launch-suite-table',

        events: {
            'click .rp-grid-th[data-sorter]': 'onClickSorter',
            'click .rp-grid-th[data-filter] .rp-icons-filter': 'onClickFilter',
            'change [data-js-select-all]': 'onChangeSelectAll'
        },
        bindings: {
            '.launch-suite-step-items': 'classes: {"exact-driven": updateTimeFormat}',
            '[data-js-select-all]': 'attr: {disabled: validateIsProcessing}'
        },
        computeds: {
            updateTimeFormat: function () {
                var timeFormat = this.userStorage.get('startTimeFormat');
                return timeFormat == 'exact';
            },
            validateIsProcessing: function () {
                return this.getBinding('isProcessing');
            }
        },
        initialize: function (options) {
            this.filterModel = options.filterModel;
            this.userStorage = new SingletonUserStorage();
            this.collectionItems = options.collectionItems;
            this.render();

            this.tableItems = new LaunchSuiteStepItemsView({
                collection: this.collectionItems,
                itemView: LaunchSuiteItemView,
                filterModel: this.filterModel
            });
            $('[data-js-table-container]', this.$el).append(this.tableItems.$el);

            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.onChangeSelectionParameters);
            this.listenTo(this.collectionItems, 'reset change:select', _.debounce(this.onResetCollection, 100));
            this.onChangeSelectionParameters();
            this.setupStickyHeader();
        },
        activateNextId: function (id) {
            this.tableItems.activateNextId(id);
        },
        onResetCollection: function () {
            var notSelectModels = this.collectionItems.where({ select: false });
            if (notSelectModels.length) {
                $('[data-js-select-all]', this.$el).prop('checked', false);
            }
        },
        onShow: function () {
            this.tableItems.onShow && this.tableItems.onShow();
        },
        onClickSorter: function (e) {
            var sorter = $(e.currentTarget).data('sorter');
            var filterParams = this.filterModel.getParametersObj();
            switch (sorter) {
            case 'name':
                config.trackingDispatcher.trackEventNumber(106);
                break;
            case 'start_time':
                config.trackingDispatcher.trackEventNumber(108);
                break;
            case 'statistics$executions$total':
                config.trackingDispatcher.trackEventNumber(110);
                break;
            case 'statistics$executions$passed':
                config.trackingDispatcher.trackEventNumber(112);
                break;
            case 'statistics$executions$failed':
                config.trackingDispatcher.trackEventNumber(114);
                break;
            case 'statistics$executions$skipped':
                config.trackingDispatcher.trackEventNumber(116);
                break;
            case 'statistics$defects$product_bug$total':
                config.trackingDispatcher.trackEventNumber(118);
                break;
            case 'statistics$defects$automation_bug$total':
                config.trackingDispatcher.trackEventNumber(120);
                break;
            case 'statistics$defects$system_issue$total':
                config.trackingDispatcher.trackEventNumber(122);
                break;
            case 'statistics$defects$to_investigate$total':
                config.trackingDispatcher.trackEventNumber(124);
                break;
            }
            if (filterParams.sorting_column == sorter) {
                filterParams.is_asc = !filterParams.is_asc;
            } else {
                filterParams.is_asc = true;
                filterParams.sorting_column = sorter;
            }
            this.filterModel.set({ newSelectionParameters: JSON.stringify(filterParams), curPage: 1 });
        },
        onClickFilter: function (e) {
            var filterId = $(e.currentTarget).closest('.rp-grid-th').data('filter');
            e.stopPropagation();
            switch (filterId) {
            case 'name':
                config.trackingDispatcher.trackEventNumber(105);
                break;
            case 'start_time':
                config.trackingDispatcher.trackEventNumber(107);
                break;
            case 'statistics$executions$total':
                config.trackingDispatcher.trackEventNumber(109);
                break;
            case 'statistics$executions$passed':
                config.trackingDispatcher.trackEventNumber(111);
                break;
            case 'statistics$executions$failed':
                config.trackingDispatcher.trackEventNumber(113);
                break;
            case 'statistics$executions$skipped':
                config.trackingDispatcher.trackEventNumber(115);
                break;
            case 'statistics$defects$product_bug$total':
                config.trackingDispatcher.trackEventNumber(117);
                break;
            case 'statistics$defects$automation_bug$total':
                config.trackingDispatcher.trackEventNumber(119);
                break;
            case 'statistics$defects$system_issue$total':
                config.trackingDispatcher.trackEventNumber(121);
                break;
            case 'statistics$defects$to_investigate$total':
                config.trackingDispatcher.trackEventNumber(123);
                break;
            }
            this.filterModel.trigger('add_entity', filterId);
        },
        onChangeSelectAll: function (e) {
            var value = false;
            if ($(e.currentTarget).is(':checked')) {
                value = true;
            }
            _.each(this.collectionItems.models, function (model) {
                model.set({ select: value });
            });
        },
        onChangeSelectionParameters: function () {
            $('[data-sorter]', this.$el).removeClass('sorting-asc sorting-desc');
            var filterParams = this.filterModel.getParametersObj();
            var $element = $('[data-sorter="' + filterParams.sorting_column + '"]', this.$el);
            if ($element && $element.length) {
                $element.addClass((filterParams.is_asc) ? 'sorting-asc' : 'sorting-desc');
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        setupStickyHeader: function () {
            this.destroyStickyHeader();
            this.stickyHeader = new StickyHeader({ fixedBlock: $('[data-js-fixed-header]', this.$el), topMargin: 0, minWidthWindow: 900 });
        },
        destroyStickyHeader: function () {
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
        }
    });


    return SuiteTableView;
});
