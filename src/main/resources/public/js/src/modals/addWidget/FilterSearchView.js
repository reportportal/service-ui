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
    var Util = require('util');
    var $ = require('jquery');
    var WidgetsConfig = require('widget/widgetsConfig');
    var CoreService = require('coreService');
    var FilterModel = require('filters/FilterModel');
    var FilterItem = require('modals/addWidget/FilterSearchItemView');
    var FilterSearchEditView = require('modals/addWidget/FilterSearchEditView');
    var FilterSearchAddView = require('modals/addWidget/FilterSearchAddView');

    var FilterCollection = Backbone.Collection.extend({
        model: FilterModel,
        initialize: function (options) {
            this.mainModel = options.mainModel;
            this.listenTo(this, 'change:active', this.onChangeActive);
        },
        onChangeActive: function (model, active) {
            if (active) {
                _.each(this.models, function (curModel) {
                    if (curModel != model) {
                        curModel.set({active: false});
                    }
                })
            }
        },
        parse: function (data) {
            var self = this;
            return _.map(data, function (itemData) {
                itemData.entities = JSON.stringify(itemData.entities);
                itemData.selection_parameters = JSON.stringify(itemData.selection_parameters);
                itemData.active = !!(itemData.id == self.mainModel.get('filter_id'));
                return itemData;
            })
        }
    });

    var FilterSearchView = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search',
        template: 'tpl-modal-add-widget-filter-search',
        events: {
            'validation:success [data-js-filter-name]': 'onChangeFilterName',
            'click [data-js-add-filter]': 'onClickAddFilter',
        },
        bindings: {
            ':el': 'classes: {hide: not(gadgetIsFilter)}',
            '[data-js-seach-query]': 'text: search'
        },
        initialize: function () {
            this.widgetConfig = WidgetsConfig.getInstance();
            this.firstActivate = true,
                this.collection = new FilterCollection({mainModel: this.model});
            this.renderViews = [];
            this.render();
            this.viewModel = new Epoxy.Model({
                search: '',
                empty: false,
                notFound: false,
                currentPage: 1,
                pageSize: 10,
                totalPage: 1,
            }),
                Util.hintValidator($('[data-js-filter-name]', this.$el), [{
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
            this.$el.html(Util.templates(this.template, {}))
        },
        setFilterModel: function (model) {
            this.selectFilterView && this.selectFilterView.destroy();
            if (model) {
                $('[data-js-select-filter-block]', this.$el).removeClass('empty-state');
                this.selectFilterView = new FilterItem({model: model, searchModel: this.viewModel});
                $('[data-js-select-filter-container]', this.$el).html(this.selectFilterView.$el);
                this.selectedFilterModel = model;
            } else {
                $('[data-js-select-filter-block]', this.$el).addClass('empty-state');
            }

        },
        getSelectedFilterModel: function () {
            return this.selectedFilterModel;
        },
        onSelectFilterCheck: function (model, active) {
            active && this.onSelectFilter(model);
        },
        onSelectFilter: function (filterModel) {
            this.model.set({filter_id: filterModel.get('id')});
            this.setFilterModel(filterModel);
        },
        onClickAddFilter: function (e) {
            e.preventDefault();
            this.$el.addClass('hide-content');
            this.addFilterView && this.stopListening(this.addFilterView) && this.addFilterView.destroy();
            this.addFilterView = new FilterSearchAddView({gadgetModel: this.model});
            this.listenTo(this.addFilterView, 'change:filter', this.onSelectFilter);
            this.addFilterView.activate();
            $('[data-js-filter-add-container]', this.$el).html(this.addFilterView.$el);
            this.trigger('disable:navigation', true);
            var self = this;
            this.addFilterView.getReadyState()
                .always(function () {
                    self.addFilterView.destroy();
                    self.$el.removeClass('hide-content');
                    self.trigger('disable:navigation', false);
                    self.updateFilters();
                })
                .fail(function () {
                    self.model.set({filter_id: ''});
                    self.setFilterModel(null);
                })
        },
        onEditFilter: function (model) {
            this.$el.addClass('hide-content');
            this.editFilterView && this.editFilterView.destroy();
            this.editFilterView = new FilterSearchEditView({model: model, gadgetModel: this.model});
            $('[data-js-filter-edit-container]', this.$el).html(this.editFilterView.$el);
            this.trigger('disable:navigation', true);
            var self = this;
            this.editFilterView.getReadyState()
                .always(function () {
                    self.editFilterView.destroy();
                    self.$el.removeClass('hide-content');
                    self.trigger('disable:navigation', false);
                })
        },
        activate: function () {
            if (!this.firstActivate) {
                return;
            }
            var curWidget = this.widgetConfig.widgetTypes[this.model.get('gadget')];
            if (!curWidget.noFilters) {
                this.firstActivate = false;
                var self = this;
                this.load().always(function () {
                    self.baronScroll = Util.setupBaronScroll($('[data-js-filter-list-scroll]', self.$el));
                    Util.setupBaronScrollSize(self.baronScroll, {maxHeight: 330});
                    self.baronScroll.on('scroll', function (e) {
                        var elem = self.baronScroll.get(0);
                        if (elem.scrollHeight - elem.scrollTop < elem.offsetHeight * 2) {
                            self.addLoadData();
                        }
                    })
                })
            }
        },
        addLoadData: function () {
            if (this.viewModel.get('currentPage') < this.viewModel.get('totalPage') && !this.$el.hasClass('load')) {
                this.viewModel.set('currentPage', this.viewModel.get('currentPage') + 1);
                this.load();
            }
        },
        onChangeFilterName: function (e) {
            this.viewModel.set({search: $(e.currentTarget).val()});
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
            var filterItem = new FilterItem({model: model, searchModel: this.viewModel});
            $('[data-js-filter-list]', this.$el).append(filterItem.$el);
            this.renderViews.push(filterItem);
        },
        updateFilters: function () {
            this.collection.reset([]);
            this.viewModel.set({
                totalPage: 1,
                currentPage: 1,
            });
            var self = this;
            this.load()
                .done(function () {
                    Util.setupBaronScrollSize(self.baronScroll, {maxHeight: 330});
                })
        },
        load: function () {
            this.$el.addClass('load');
            var self = this;
            return CoreService.saveFilter(this.getQueryString({
                    search: encodeURIComponent(this.viewModel.get('search')),
                    page: this.viewModel.get('currentPage'),
                    size: this.viewModel.get('pageSize')
                }))
                .always(function () {
                    self.$el.removeClass('load');
                })
                .done(function (data) {
                    self.viewModel.set({
                        totalPage: data.page.totalPages,
                        currentPage: data.page.number,
                    });
                    if (data.content.length) {
                        self.viewModel.set({empty: false, notFound: false});
                    } else if (!self.model.get('search')) {
                        self.viewModel.set({empty: true, notFound: false});
                    } else {
                        self.viewModel.set({empty: false, notFound: true});
                    }
                    self.collection.add(data.content, {parse: true});
                    if(self.model.get('filter_id')){
                        self.setFilterModel(self.collection.get(self.model.get('filter_id')));
                    }
                    $('[data-js-select-filter-block]', self.$el)[(!data.content.length ? 'add' : 'remove') + 'Class']('hide');
                    $('[data-js-filter-empty]', self.$el)[(data.content.length ? 'add' : 'remove') + 'Class']('hide');
                });
        },
        getQueryString: function (query) {
            if (!query) query = {};
            if (!query.page) query.page = 1;
            if (!query.size) query.size = 10;
            var url = '?page.sort=name&page.page=' + query.page + '&page.size=' + query.size;
            if (query.search) {
                url += '&filter.cnt.name=' + query.search;
            }
            return url;
        },
        onDestroy: function () {
            this.$el.remove();
        }
    });

    return FilterSearchView;
});