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

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var WidgetService = require('newWidgets/WidgetService');
    var CoreService = require('coreService');
    var FilterModel = require('filters/FilterModel');
    var FilterItem = require('modals/addWidget/FilterSearchItemView');
    var FilterSearchEditView = require('modals/addWidget/FilterSearchEditView');
    var FilterSearchAddView = require('modals/addWidget/FilterSearchAddView');
    var App = require('app');

    var config = App.getInstance();

    var FilterCollection = Backbone.Collection.extend({
        model: FilterModel,
        initialize: function (data, options) {
            this.mainModel = options.mainModel;
            this.listenTo(this, 'change:active', this.onChangeActive);
        },
        onChangeActive: function (model, active) {
            if (active) {
                _.each(this.models, function (curModel) {
                    if (curModel !== model) {
                        curModel.set({ active: false });
                    }
                });
            }
        },
        parse: function (data) {
            var self = this;
            return _.map(data, function (itemData) {
                var item = itemData;
                item.entities = JSON.stringify(item.entities);
                item.selection_parameters = JSON.stringify(item.selection_parameters);
                item.active = !!(item.id === self.mainModel.get('filter_id'));
                return item;
            });
        }
    });

    var FilterSearchView = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search',
        template: 'tpl-modal-add-widget-filter-search',
        events: {
            'validation:success [data-js-filter-name-search]': 'onChangeFilterName',
            'click [data-js-add-filter]': 'onClickAddFilter'
        },
        bindings: {
            ':el': 'classes: {hide: not(gadgetIsFilter)}',
            '[data-js-search-query]': 'text: search',
            '[data-js-filter-none]': 'classes: {hide:    not(empty)}',
            '[data-js-filter-empty]': 'classes: { hide:  not(notFound)  }',
            '[data-js-filter-name-search]': 'attr: {disabled: empty}'

        },
        bindingFilters: {
            filtersAvailability: function (search, empty) {
                if (!search && empty) {
                    return false;
                }
                return true;
            }
        },
        initialize: function (options) {
            this.modalType = options.modalType;
            this.firstActivate = true;
            this.collection = new FilterCollection([], { mainModel: this.model });
            this.renderViews = [];
            this.render();
            this.viewModel = new Epoxy.Model({
                search: '',
                empty: false,
                notFound: false,
                currentPage: 1,
                pageSize: 10,
                totalPage: 1
            });
            Util.hintValidator($('[data-js-filter-name-search]', this.$el), [{
                validator: 'minMaxNotRequired',
                type: 'filterName',
                min: 3,
                max: 128
            }]);

            this.listenTo(this.viewModel, 'change:search', _.debounce(this.updateFilters, 500));
            this.listenTo(this.collection, 'add', this.onAddCollectionItems);
            this.listenTo(this.collection, 'reset', this.onResetCollectionItems);
            this.listenTo(this.collection, 'change:active', this.onSelectFilterCheck);
            this.listenTo(this.collection, 'edit', this.onEditFilter);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        setFilterModel: function (model) {
            this.selectFilterView && this.selectFilterView.destroy();
            if (model) {
                $('[data-js-select-filter-block]', this.$el).removeClass('empty-state');
                this.selectFilterView = new FilterItem({
                    model: model, searchTerm: this.viewModel.get('search')
                });
                $('[data-js-select-filter-container]', this.$el).html(this.selectFilterView.$el);
                this.selectedFilterModel = model;
                this.selectFilterView.$el.on('mouseenter', function () {
                    config.trackingDispatcher.trackEventNumber(296);
                });
            } else {
                $('[data-js-select-filter-block]', this.$el).addClass('empty-state');
            }
        },
        getSelectedFilterModel: function () {
            if (!this.selectedFilterModel && this.model.get('filter_id')) {
                this.launchFilterCollection = new SingletonLaunchFilterCollection();
                this.setFilterModel(this.launchFilterCollection.get(this.model.get('filter_id')));
            }
            return this.selectedFilterModel;
        },
        onSelectFilterCheck: function (model, active) {
            active && this.onSelectFilter(model);
        },
        onSelectFilter: function (filterModel) {
            this.model.set({ filter_id: filterModel.get('id') });
            this.setFilterModel(filterModel);
        },
        onClickAddFilter: function (e) {
            var self = this;
            if (this.modalType === 'edit') {
                config.trackingDispatcher.trackEventNumber(328);
            } else {
                config.trackingDispatcher.trackEventNumber(295);
            }
            e.preventDefault();
            this.$el.addClass('hide-content');
            this.addFilterView && this.stopListening(this.addFilterView) &&
                this.addFilterView.destroy();
            this.addFilterView = new FilterSearchAddView({
                gadgetModel: this.model,
                modalType: this.modalType
            });
            this.listenTo(this.addFilterView, 'change:filter', this.onSelectFilter);
            this.addFilterView.activate();
            $('[data-js-filter-add-container]', this.$el).html(this.addFilterView.$el);
            this.trigger('disable:navigation', true);
            this.addFilterView.getReadyState()
                .always(function () {
                    self.addFilterView.destroy();
                    self.$el.removeClass('hide-content');
                    self.trigger('disable:navigation', false);
                    self.updateFilters();
                })
                .fail(function () {
                    self.model.set({ filter_id: '' });
                    self.setFilterModel(null);
                });
        },
        onEditFilter: function (model) {
            var self = this;
            this.$el.addClass('hide-content');
            this.editFilterView && this.editFilterView.destroy();
            this.editFilterView = new FilterSearchEditView({
                model: model,
                gadgetModel: this.model,
                modalType: this.modalType
            });
            $('[data-js-filter-edit-container]', this.$el).html(this.editFilterView.$el);
            this.trigger('disable:navigation', true);
            this.editFilterView.getReadyState()
                .always(function () {
                    self.editFilterView.destroy();
                    self.$el.removeClass('hide-content');
                    self.trigger('disable:navigation', false);
                });
        },
        activate: function () {
            var curWidget = WidgetService.getWidgetConfig(this.model.get('gadget'));
            var self = this;
            if (!this.firstActivate) {
                return;
            }
            if (!curWidget.noFilters) {
                this.firstActivate = false;
                this.load().always(function () {
                    self.baronScroll = Util.setupBaronScroll($('[data-js-filter-list-scroll]', self.$el));
                    Util.setupBaronScrollSize(self.baronScroll, { maxHeight: 330 });
                    self.baronScroll.on('scroll', function () {
                        var elem = self.baronScroll.get(0);
                        if (elem.scrollHeight - elem.scrollTop < elem.offsetHeight * 2) {
                            self.addLoadData();
                        }
                    });
                });
            }
        },
        addLoadData: function () {
            if (this.viewModel.get('currentPage') < this.viewModel.get('totalPage') && !this.$el.hasClass('load')) {
                this.viewModel.set('currentPage', this.viewModel.get('currentPage') + 1);
                this.load();
            }
        },
        onChangeFilterName: function (e) {
            var value = $(e.currentTarget).val();
            if (value) {
                if (this.modalType === 'edit') {
                    config.trackingDispatcher.trackEventNumber(327);
                } else {
                    config.trackingDispatcher.trackEventNumber(294);
                }
            }
            this.viewModel.set({ search: value });
        },
        onAddCollectionItems: function (model) {
            this.renderFilter(model);
        },
        onResetCollectionItems: function () {
            _.each(this.renderViews, function (view) {
                view.destroy();
            });
            this.renderViews = [];
            _.each(this.collection.models, function (model) {
                this.renderFilter(model);
            }, this);
        },
        renderFilter: function (model) {
            var filterItem = new FilterItem({
                model: model,
                searchTerm: this.viewModel.get('search'),
                modalType: this.modalType
            });
            $('[data-js-filter-list]', this.$el).append(filterItem.$el);
            this.renderViews.push(filterItem);
        },
        updateFilters: function () {
            var self = this;
            this.collection.destroyModels();
            this.collection.reset([]);
            this.viewModel.set({
                totalPage: 1,
                currentPage: 1
            });
            this.load()
                .done(function () {
                    Util.setupBaronScrollSize(self.baronScroll, { maxHeight: 330 });
                });
        },
        load: function () {
            var self = this;
            this.$el.addClass('load');
            self.viewModel.set({ empty: false, notFound: false });
            return CoreService.saveFilter(this.getQueryString({
                search: encodeURIComponent(this.viewModel.get('search')),
                page: this.viewModel.get('currentPage'),
                size: this.viewModel.get('pageSize')
            }))
                .always(function () {
                    self.$el.removeClass('load');
                })
                .done(function (data) {
                    var launchFilterCollection;
                    self.viewModel.set({
                        totalPage: data.page.totalPages,
                        currentPage: data.page.number
                    });
                    if (data.content.length) {
                        self.viewModel.set({ empty: false, notFound: false });
                    } else if (!self.viewModel.get('search')) {
                        self.viewModel.set({ empty: true, notFound: false });
                    } else {
                        self.viewModel.set({ empty: false, notFound: true });
                    }
                    self.collection.add(data.content, { parse: true });
                    if (self.model.get('filter_id')) {
                        if (self.collection.get(self.model.get('filter_id'))) {
                            self.setFilterModel(self.collection.get(self.model.get('filter_id')));
                        } else {
                            launchFilterCollection = new SingletonLaunchFilterCollection();
                            launchFilterCollection.ready.done(function () {
                                self.setFilterModel(launchFilterCollection.get(self.model.get('filter_id')));
                            });
                        }
                    }
                    $('[data-js-select-filter-block]', self.$el)[(!data.content.length ? 'add' : 'remove') + 'Class']('hide');
                });
        },
        getQueryString: function (query) {
            var url;
            var Query = query;
            if (!Query) Query = {};
            if (!Query.page) Query.page = 1;
            if (!Query.size) Query.size = 10;
            url = '?page.sort=name&page.page=' + Query.page + '&page.size=' + Query.size;
            if (Query.search) {
                url += '&filter.cnt.name=' + Query.search;
            }
            return url;
        },
        onDestroy: function () {
            this.collection.destroy(true);
            this.$el.remove();
        }
    });

    return FilterSearchView;
});
