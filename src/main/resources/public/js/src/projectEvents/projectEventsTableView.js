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
    var ProjectEventsItemView = require('projectEvents/projectEventsItemView');
    var ProjectEventsCollection = require('projectEvents/projectEventsCollection');
    var Components = require('core/components');
    var SingletonUserStorage = require('storage/SingletonUserStorage');

    var ProjectEventsTableView = Epoxy.View.extend({

        className: 'project-events-table',

        template: 'tpl-project-events-table',

        events: {
            'click .rp-grid-th[data-sorter]': 'onClickSorter',
            'click .rp-grid-th[data-filter] .rp-icons-filter': 'onClickFilter'
        },
        initialize: function (options) {
            this.userStorage = new SingletonUserStorage();
            this.filterModel = options.filterModel;

            this.pagingModel = new Epoxy.Model({
                number: options.pagingPage || 1,
                totalPages: 1,
                size: options.pagingSize || this.userStorage.get('ProjectEventsPageSize') || 50
            });
            this.eventsCollection = new ProjectEventsCollection({
                filterModel: this.filterModel,
                pagingModel: this.pagingModel
            });
            this.itemViews = [];
            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.onChangeSelectionParameters);
            this.listenTo(this.eventsCollection, 'loading', this.eventsLoadingHandler);
            this.listenTo(this.eventsCollection, 'change:time:format', this.onChangeTimeFormat);
            this.render();
            this.setupPaging();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            if (this.userStorage.get('startTimeFormat') === 'exact') {
                this.$el.addClass('exact-driven');
            }
            this.eventsCollection.load();
        },
        renderItems: function (models) {
            if (!models.length) {
                $('[data-js-no-results]', this.$el).show();
            } else {
                $('[data-js-no-results]', this.$el).hide();
                _.each(models, function (eventModel) {
                    var itemView = new ProjectEventsItemView({ eventModel: eventModel });
                    $('[data-js-items-container]', this.$el).append(itemView.el);
                    this.itemViews.push(itemView);
                }.bind(this));
            }
        },
        update: function () {
            _.each(this.itemViews, function (itemView) {
                itemView.destroy();
            });
            this.itemViews = [];
            this.eventsCollection.load();
        },
        setupPaging: function () {
            this.paging = new Components.PagingToolbar({
                el: $('[data-js-paginate-container]', this.$el),
                model: this.pagingModel
            });
            this.listenTo(this.paging, 'page', this.changePagingPage);
            this.listenTo(this.paging, 'count', this.changePagingCount);
        },
        changePagingCount: function (newVal) {
            this.userStorage.set('ProjectEventsPageSize', newVal);
            this.pagingModel.set('size', newVal);
            this.changePaging();
        },
        changePagingPage: function (newVal) {
            this.pagingModel.set('number', newVal);
            this.changePaging();
        },
        changePaging: function () {
            this.trigger('changePaging');
            this.paging.render();
            this.update();
        },
        onChangeTimeFormat: function (silent) {
            var timeFormat = this.userStorage.get('startTimeFormat');
            if (!silent) {
                if (timeFormat === 'exact') {
                    timeFormat = '';
                } else {
                    timeFormat = 'exact';
                }
                this.userStorage.set('startTimeFormat', timeFormat);
            }
            if (timeFormat) {
                this.$el.addClass('exact-driven');
            } else {
                this.$el.removeClass('exact-driven');
            }
        },
        eventsLoadingHandler: function (isLoading) {
            if (!isLoading) {
                $('[data-js-preloader]', this.$el).hide();
                this.renderItems(this.eventsCollection.models);
                this.paging.render();
            } else {
                $('[data-js-preloader]', this.$el).show();
                _.each(this.itemViews, function (itemView) {
                    itemView.destroy();
                });
                this.itemViews = [];
                $('[data-js-items-container]', this.$el).html('');
            }
        },
        onChangeSelectionParameters: function () {
            var filterParams = this.filterModel.getParametersObj();
            var $element = $('[data-sorter="' + filterParams.sorting_column + '"]', this.$el);
            $('[data-sorter]', this.$el).removeClass('sorting-asc sorting-desc');
            if ($element && $element.length) {
                $element.addClass((filterParams.is_asc) ? 'sorting-asc' : 'sorting-desc');
            }
        },
        onClickSorter: function (e) {
            var sorter = $(e.currentTarget).data('sorter');
            var filterParams = this.filterModel.getParametersObj();
            if (filterParams.sorting_column === sorter) {
                filterParams.is_asc = !filterParams.is_asc;
            } else {
                filterParams.is_asc = true;
                filterParams.sorting_column = sorter;
            }
            this.filterModel.set({ newSelectionParameters: JSON.stringify(filterParams) });
        },
        onClickFilter: function (e) {
            e.stopPropagation();
            this.filterModel.trigger('add_entity', $(e.currentTarget).closest('.rp-grid-th').data('filter'));
        },
        onDestroy: function () {
            _.each(this.itemViews, function (itemView) {
                itemView.destroy();
            });
        }
    });
    return ProjectEventsTableView;
});
