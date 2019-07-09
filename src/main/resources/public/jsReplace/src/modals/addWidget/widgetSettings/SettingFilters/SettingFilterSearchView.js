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
    var CoreService = require('coreService');
    var FilterModel = require('filters/FilterModel');
    var FilterItemView = require('modals/addWidget/widgetSettings/SettingFilters/SettingFilterSearchItemView');
    var FilterSearchEditView = require('modals/addWidget/widgetSettings/SettingFilters/SettingFilterSearchEditView');
    var FilterSearchAddView = require('modals/addWidget/widgetSettings/SettingFilters/SettingFilterSearchAddView');

    var SettingView = require('modals/addWidget/widgetSettings/_settingView');

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

    var SettingFilterSearchView = SettingView.extend({
        className: 'setting-filter-search',
        template: 'tpl-modal-add-widget-setting-filter-search',
        events: {
            'validation:success [data-js-filter-name-search]': 'onChangeFilterName',
            'click [data-js-add-filter]': 'onClickAddFilter',
            'click [data-js-submit-filter]': 'onClickSubmitFilter',
            'click [data-js-cancel-filter]': 'onClickCancelFilter'
        },
        bindings: {
            ':el': 'classes: {hide: not(gadgetIsFilter)}',
            '[data-js-search-query]': 'text: search',
            '[data-js-filter-none]': 'classes: {hide: not(empty)}',
            '[data-js-filter-empty]': 'classes: { hide: not(notFound)  }',
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
            this.model = options.gadgetModel;
            this.currentFilterId = this.model.get('filter_id');
            this.modalType = options.modalType;
            this.firstActivate = true;
            this.collection = new FilterCollection([], { mainModel: this.model });
            this.renderedFilterItems = [];
            this.viewModel = new Epoxy.Model({
                search: '',
                empty: false,
                notFound: false,
                currentPage: 1,
                pageSize: 10,
                totalPage: 1
            });
            this.render();
            this.listenTo(this.viewModel, 'change:search', _.debounce(this.updateFilters, 500));
            this.listenTo(this.collection, 'add', this.onAddCollectionItems);
            this.listenTo(this.collection, 'reset', this.onResetCollectionItems);
            this.listenTo(this.collection, 'change:active', this.onSelectFilterCheck);
            this.listenTo(this.collection, 'edit', this.onEditFilter);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.applyBindings();
            this.setupValidators();
        },
        setupValidators: function () {
            Util.hintValidator($('[data-js-filter-name-search]', this.$el), [{
                validator: 'minMaxNotRequired',
                type: 'filterName',
                min: 3,
                max: 128
            }]);
        },
        setFilterModel: function (model) {
            if (this.filterItemView) {
                this.stopListening(this.filterItemView);
                this.filterItemView.destroy();
            }
            $('[data-js-select-filter-block]', this.$el).removeClass('error-state');
            if (model) {
                $('[data-js-select-filter-block]', this.$el).removeClass('empty-state');
                this.filterItemView = new FilterItemView({
                    model: model, searchTerm: this.viewModel.get('search')
                });
                $('[data-js-select-filter-container]', this.$el).html(this.filterItemView.$el);
                this.listenTo(this.filterItemView, 'send:event', this.sendEvent);
                this.selectedFilterModel = model;
            } else {
                $('[data-js-select-filter-block]', this.$el).addClass('empty-state');
            }
        },
        sendEvent: function (eventOptions) {
            if (eventOptions.view === 'filter' && (eventOptions.action === 'ok edit filter' || eventOptions.action === 'ok add click')) {
                this.viewModel.set('search', '');
                $('[data-js-filter-name-search]', this.$el).val('');
            }
            this.trigger('send:event', eventOptions);
        },
        onSelectFilterCheck: function (model, active) {
            active && this.onSelectFilter(model);
        },
        onSelectFilter: function (filterModel) {
            this.model.set({ filter_id: filterModel.get('id') });
            var curOptions = this.model.getWidgetOptions();
            curOptions.filterName = [filterModel.get('name')];
            this.model.setWidgetOptions(curOptions);
            this.setFilterModel(filterModel);
            this.trigger('send:event', {
                view: 'filter',
                action: 'select filter'
            });
        },
        onClickAddFilter: function (e) {
            var self = this;
            this.trigger('addFilterMode');
            this.trigger('send:event', {
                view: 'filter',
                action: 'add filter'
            });
            e.preventDefault();
            this.$el.addClass('hide-content');
            this.addFilterView && this.stopListening(this.addFilterView) &&
                this.addFilterView.destroy();
            this.addFilterView = new FilterSearchAddView();
            this.listenTo(this.addFilterView, 'change:filter', this.onSelectFilter);
            this.listenTo(this.addFilterView, 'send:event', this.sendEvent);
            this.listenTo(this.addFilterView, 'returnToFiltersList', function () {
                this.trigger('returnToFiltersList');
            });
            this.addFilterView.activate();
            $('[data-js-filter-add-container]', this.$el).html(this.addFilterView.$el);
            this.addFilterView.getReadyState()
                .always(function () {
                    self.addFilterView.destroy();
                    self.$el.removeClass('hide-content');
                    self.updateFilters();
                });
        },
        onClickSubmitFilter: function () {
            this.trigger('send:event', {
                view: 'filter',
                action: 'submit filter'
            });
            this.trigger('submitFilter');
        },
        onClickCancelFilter: function () {
            this.trigger('send:event', {
                view: 'filter',
                action: 'cancel filter'
            });
            this.model.set('filter_id', this.currentFilterId);
            this.trigger('cancelFilter');
        },
        onEditFilter: function (model) {
            var self = this;
            this.trigger('editFilterMode');
            this.$el.addClass('hide-content');
            if (this.editFilterView) {
                this.stopListening(this.editFilterView);
                this.editFilterView.destroy();
            }
            this.editFilterView = new FilterSearchEditView({
                model: model
            });
            this.listenTo(this.editFilterView, 'send:event', this.sendEvent);
            this.listenTo(this.editFilterView, 'returnToFiltersList', function () {
                this.trigger('returnToFiltersList');
            });
            $('[data-js-filter-edit-container]', this.$el).html(this.editFilterView.$el);
            this.editFilterView.getReadyState()
                .always(function () {
                    self.editFilterView.destroy();
                    self.$el.removeClass('hide-content');
                });
        },
        activate: function () {
            var self = this;
            if (!this.firstActivate) {
                return;
            }
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
                this.trigger('send:event', {
                    view: 'filter',
                    action: 'change filter name'
                });
            }
            this.viewModel.set({ search: value });
        },
        onAddCollectionItems: function (model) {
            this.renderFilter(model);
        },
        onResetCollectionItems: function () {
            var self = this;
            _.each(this.renderedFilterItems, function (view) {
                self.stopListening(view);
                view.destroy();
            });
            this.renderedFilterItems = [];
            _.each(this.collection.models, function (model) {
                this.renderFilter(model);
            }, this);
        },
        renderFilter: function (model) {
            var filterItemView = new FilterItemView({
                model: model,
                searchTerm: this.viewModel.get('search')
            });
            this.listenTo(filterItemView, 'send:event', this.sendEvent);
            $('[data-js-filter-list]', this.$el).append(filterItemView.$el);
            this.renderedFilterItems.push(filterItemView);
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
                    var curOptions = self.model.getWidgetOptions();
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
                            curOptions.filterName = [self.collection.get(self.model.get('filter_id')).get('name')];
                            self.model.setWidgetOptions(curOptions);
                            self.setFilterModel(self.collection.get(self.model.get('filter_id')));
                        } else {
                            launchFilterCollection = new SingletonLaunchFilterCollection();
                            launchFilterCollection.ready.done(function () {
                                var filterModel = launchFilterCollection.get(self.model.get('filter_id'));
                                if (filterModel) {
                                    curOptions.filterName = [filterModel.get('name')];
                                    self.model.setWidgetOptions(curOptions);
                                    self.setFilterModel(launchFilterCollection.get(self.model.get('filter_id')));
                                }
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
        validate: function (options) {
            if (this.selectedFilterModel) {
                return true;
            }
            if (options && options.silent) {
                return false;
            }
            $('[data-js-select-filter-block]', this.$el).addClass('error-state');
            return false;
        },
        onDestroy: function () {
            this.collection.destroy(true);
            this.$el.remove();
        }
    });

    return SettingFilterSearchView;
});
