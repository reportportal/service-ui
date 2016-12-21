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
    var CoreService = require('coreService');
    var FilterModel = require('filters/FilterModel');
    var FilterItem = require('modals/addWidget/FilterSearchItemView');

    var FilterCollection = Backbone.Collection.extend({
        model: FilterModel,
        parse: function(data) {
            return _.map(data, function(itemData) {
                itemData.entities = JSON.stringify(itemData.entities);
                itemData.selection_parameters = JSON.stringify(itemData.selection_parameters);
                return itemData;
            })
        }
    });

    var FilterSearchView = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search',
        template: 'tpl-modal-add-widget-filter-search',
        events: {
            'validation::change [data-js-filter-name]': 'onChangeFilterName',
            'click [data-js-add-filter]': 'onClickAddFilter',
        },
        bindings: {
            ':el': 'classes: {hide: not(gadgetIsFilter)}'
        },
        initialize: function() {
            this.firstActivate = true,
            this.collection = new FilterCollection();
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
            Util.bootValidator($('[data-js-filter-name]', this.$el), [{
                validator: 'minMaxNotRequired',
                type: 'filterName',
                min: 3,
                max: 128
            }]);

            this.listenTo(this.viewModel, 'change:search', _.debounce(this.updateFilters, 500));
            this.listenTo(this.collection, 'add', this.onAddCollectionItems);
            this.listenTo(this.collection, 'reset', this.onResetCollectionItems);
            this.baronScroll = Util.setupBaronScroll($('[data-js-filter-list]', this.$el));
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
        activate: function() {
            if(!this.firstActivate) { return; }
            this.firstActivate = false;
            var self = this;
            this.load().always(function() {
                Util.setupBaronScrollSize(self.baronScroll, {maxHeight: 300});
            })
        },
        onChangeFilterName: function (e, data) {
            if (data.valid) {
                this.viewModel.set({search: data.value});
            }
        },
        onAddCollectionItems: function(model) {
            this.renderFilter(model);
        },
        onResetCollectionItems: function() {
            _.each(this.renderViews, function(view) {
                view.destroy();
            })
            this.renderViews = [];
            _.each(this.collection.models, function(model) {
                this.renderFilter(model);
            }, this)
        },
        renderFilter: function(model) {
            var filterItem = new FilterItem({model: model});
            $('[data-js-filter-list]', this.$el).append(filterItem.$el);
            this.renderViews.push(filterItem);
        },
        updateFilters: function() {
            this.collection.reset([]);
            this.load();
        },
        load: function() {
            this.$el.addClass('load');
            var self = this;
            return CoreService.saveFilter(this.getQueryString({
                search: encodeURIComponent(this.viewModel.get('search')),
                page: this.viewModel.get('currentPage'),
                size: this.viewModel.get('pageSize')
            }))
                .always(function() {
                    self.$el.removeClass('load');
                })
                .done(function(data) {
                    self.viewModel.set({
                        totalPage: data.page.totalPages,
                        currentPage: data.page.number,
                    });
                    if(data.content.length) {
                        self.viewModel.set({empty: false, notFound: false});
                    } else if(!self.model.get('search')) {
                        self.viewModel.set({empty: true, notFound: false});
                    } else {
                        self.viewModel.set({empty: false, notFound: true});
                    }
                    self.collection.add(data.content, {parse: true});
                });
        },
        getQueryString: function(query){
            if(!query) query = {};
            if(!query.page) query.page = 1;
            if(!query.size) query.size = 10;
            var url = '?page.sort=name&page.page=' + query.page + '&page.size=' + query.size;
            if(query.search) {
                url += '&filter.cnt.name=' + query.search;
            }
            return url;
        },
    });

    return FilterSearchView;
});