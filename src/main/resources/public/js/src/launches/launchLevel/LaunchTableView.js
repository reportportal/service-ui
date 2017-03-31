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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var LaunchSuiteStepItemsView = require('launches/common/LaunchSuiteStepItemsView');
    var LaunchSuiteItemView = require('launches/common/LaunchSuiteItemView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var FilterModel = require('filters/FilterModel');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var StickyHeader = require('core/StickyHeader');
    var Localization = require('localization');

    var config = App.getInstance();

    var LaunchTableView = Epoxy.View.extend({
        template: 'tpl-launch-launch-table',
        events: {
            'click .rp-grid-th[data-sorter]': 'onClickSorter',
            'click .rp-grid-th[data-filter] .rp-icons-filter': 'onClickFilter',
            'change [data-js-select-all]': 'onChangeSelectAll',
            'mouseenter [data-js-launch-table-title]': 'onHoverTitle'
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
            this.userDebugMode = options.userDebugMode;
            this.render();
            this.userStorage = new SingletonUserStorage();
            this.collectionItems = options.collectionItems;
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
        onShow: function() {
            this.tableItems.onShow && this.tableItems.onShow();
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
        setupStickyHeader: function() {
            this.destroyStickyHeader();
            this.stickyHeader = new StickyHeader({fixedBlock: $('[data-js-fixed-header]', this.$el), topMargin: 0, minWidthWindow: 900});
        },
        destroyStickyHeader: function() {
            this.stickyHeader && this.stickyHeader.destroy();
        },
        onHoverTitle: function(e){
            var filterId = $(e.currentTarget).closest('.rp-grid-th').data('filter');
            switch (filterId) {
                case 'name':
                    config.trackingDispatcher.trackEventNumber(33);
                    break;
                case 'start_time':
                    config.trackingDispatcher.trackEventNumber(35);
                    break;
                case 'statistics$executions$total':
                    config.trackingDispatcher.trackEventNumber(37);
                    break;
                case 'statistics$executions$passed':
                    config.trackingDispatcher.trackEventNumber(39);
                    break;
                case 'statistics$executions$failed':
                    config.trackingDispatcher.trackEventNumber(41);
                    break;
                case 'statistics$executions$skipped':
                    config.trackingDispatcher.trackEventNumber(43);
                    break;
                case 'statistics$defects$product_bug$total':
                    config.trackingDispatcher.trackEventNumber(45);
                    break;
                case 'statistics$defects$automation_bug$total':
                    config.trackingDispatcher.trackEventNumber(47);
                    break;
                case 'statistics$defects$system_issue$total':
                    config.trackingDispatcher.trackEventNumber(49);
                    break;
                case 'statistics$defects$to_investigate$total':
                    config.trackingDispatcher.trackEventNumber(51);
                    break;
                default:
                    break;
            }
        },
        onChangeSelectAll: function(e) {
            var value = false;
            config.trackingDispatcher.trackEventNumber(61.1);
            if($(e.currentTarget).is(':checked')) {
                value = true;
            }
            _.each(this.collectionItems.models, function(model) {
                model.set({select: value});
            })
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
            switch (filterId) {
                case 'name':
                    config.trackingDispatcher.trackEventNumber(34);
                    break;
                case 'start_time':
                    config.trackingDispatcher.trackEventNumber(36);
                    break;
                case 'statistics$executions$total':
                    config.trackingDispatcher.trackEventNumber(38);
                    break;
                case 'statistics$executions$passed':
                    config.trackingDispatcher.trackEventNumber(40);
                    break;
                case 'statistics$executions$failed':
                    config.trackingDispatcher.trackEventNumber(42);
                    break;
                case 'statistics$executions$skipped':
                    config.trackingDispatcher.trackEventNumber(44);
                    break;
                case 'statistics$defects$product_bug$total':
                    config.trackingDispatcher.trackEventNumber(46);
                    break;
                case 'statistics$defects$automation_bug$total':
                    config.trackingDispatcher.trackEventNumber(48);
                    break;
                case 'statistics$defects$system_issue$total':
                    config.trackingDispatcher.trackEventNumber(50);
                    break;
                case 'statistics$defects$to_investigate$total':
                    config.trackingDispatcher.trackEventNumber(52);
                    break;
                default:
                    break;
            }
            if(this.filterModel.get('id') == 'all' && !this.userDebugMode) {
                var launchFilterCollection = new SingletonLaunchFilterCollection();
                var tempFilterModel = launchFilterCollection.generateTempModel();
                config.router.navigate(tempFilterModel.get('url'), {trigger: true});
                tempFilterModel.trigger('add_entity', filterId);
            } else {
                this.filterModel.trigger('add_entity', filterId);
            }
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


    return LaunchTableView;
});
