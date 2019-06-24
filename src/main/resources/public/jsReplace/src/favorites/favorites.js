/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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

    var FilterListener = require('controlers/filterControler/FilterListener');

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Components = require('core/components');
    var Util = require('util');
    var MainBreadcrumbsComponent = require('components/MainBreadcrumbsComponent');
    var FilterCollection = require('filters/FilterCollection');
    var Localization = require('localization');
    var FavoritesItem = require('favorites/FavoritesItemView');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var FavoritesPage = Epoxy.View.extend({
        template: 'tpl-favorite-page',
        templateHeader: 'tpl-favorites-header',
        events: {
            'keyup [data-js-filter-name]': 'debounceChange',
            'change [data-js-filter-name]': 'onChangeFilterName',
            'click [data-js-link-launch]': 'onClickLinkLaunch',
            'click [data-js-add-filter]': 'onClickAddFilter'
        },
        bindings: {
            '[data-js-filter-name]': 'attr: {disabled: empty}',
            '[data-js-empty-block]': 'classes: {hide: not(empty)}',
            '[data-js-filter-paginate]': 'classes: {hide: any(empty, notFound)}',
            '[data-js-not-found]': 'classes: {hide: not(notFound)}',
            '[data-js-search-value]': 'text: search'
        },
        initialize: function (options) {
            var context = options.context;
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.model = new Backbone.Model({
                search: '',
                empty: false,
                notFound: false
            });
            this.renderViews = [];
            this.collection = new FilterCollection();
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.listenTo(this.collection, 'reset', this.renderCollection);
            this.listenTo(this.collection, 'remove', this.onRemoveFilter);

            this.$header = context.getMainView().$header;
            this.$el = context.getMainView().$body;
            this.debounceChange = _.debounce(function () {
                $('[data-js-filter-name]', this.$el).trigger('change');
            }.bind(this), 800);
            this.listenTo(this.filterListener, this.filterEvents.FILTERS_LOAD_START, this.onStartLoad);
            this.listenTo(this.filterListener, this.filterEvents.FILTERS_LOAD_END, this.onEndLoad);
            this.listenTo(this.filterListener, this.filterEvents.LOAD_FILTERS, this.onSetFilters);
        },

        render: function () {
            var defectTypeCollection = new SingletonDefectTypeCollection();
            this.mainBreadcrumbs = new MainBreadcrumbsComponent({
                data: [{ name: Localization.favorites.title, link: '' }]
            });
            this.$header.html(this.mainBreadcrumbs.$el);
            defectTypeCollection.ready.done(function () {
                var self = this;
                this.$el.html(Util.templates(this.template, {
                    projectName: config.project.projectId
                }));
                this.$filterName = $('[data-js-filter-name]', this.$el);
                this.$filterList = $('[data-js-filter-list]', this.$el);
                this.$filterPaginate = $('[data-js-filter-paginate]', this.$el);
                Util.hintValidator(this.$filterName, [{
                    validator: 'minMaxNotRequired',
                    type: 'filterName',
                    min: 3,
                    max: 128
                }]);
                this.paging = new Components.PagingToolbarSaveUser({
                    el: this.$filterPaginate,
                    model: new Backbone.Model(),
                    pageType: 'filters'
                });
                this.listenTo(this.paging, 'page', this.onPage);
                this.listenTo(this.paging, 'count', this.onPageCount);
                this.paging.ready.done(function () {
                    self.searchString = '';
                    if (self.paging.urlModel.get('filter.cnt.name')) {
                        self.model.set({ search: self.paging.urlModel.get('filter.cnt.name') });
                        self.$filterName.val(self.model.get('search'));
                    }
                    self.listenTo(self.model, 'change:search', self.onChangeModelSearch);
                    self.updateFilters();
                });
                this.applyBindings();
            }.bind(this));
            return this;
        },
        onStartLoad: function () {
            this.collection.reset([]);
            this.paging.$el.html('');
            $('#filter-page', this.$el).addClass('load');
        },
        onEndLoad: function () {
            $('#filter-page', this.$el).removeClass('load');
        },
        onSetFilters: function (data) {
            this.paging.model.set(data.page);
            this.paging.render();
            if (data.content.length) {
                this.model.set({ empty: false, notFound: false });
            } else if (!this.model.get('search')) {
                this.model.set({ empty: true, notFound: false });
            } else {
                this.model.set({ empty: false, notFound: true });
            }
            this.collection.parse(data.content);
        },
        onChangeModelSearch: function () {
            this.paging.trigger('page', 1);
        },
        onChangeFilterName: function () {
            var name;
            if (!$('[data-js-filter-name]', this.$el).data('validate-error')) {
                name = $('[data-js-filter-name]', this.$el).val();
                config.trackingDispatcher.trackEventNumber(240);
                this.paging.urlModel.set({ 'filter.cnt.name': name });
                this.model.set({ search: name });
                this.searchString = name;
            }
        },
        onPage: function () {
            this.changeFilters();
        },
        onPageCount: function () {
            this.changeFilters();
        },
        changeFilters: function () {
            // this.paging.render();
            this.updateFilters();
        },
        onRemoveFilter: function () {
            this.updateFilters();
        },
        updateFilters: function () {
            this.filterListener.trigger(
                this.filterEvents.ON_LOAD_FILTERS,
                this.getQueryString({
                    search: encodeURIComponent(this.model.get('search')),
                    page: this.paging.model.get('number'),
                    size: this.paging.model.get('size')
                })
            );
            // $('#filter-page', this.$el).addClass('load');
            // this.collection.reset([]);
            // this.paging.$el.html('');
            // CoreService.saveFilter(this.getQueryString({
            //     search: encodeURIComponent(this.model.get('search')),
            //     page: this.paging.model.get('number'),
            //     size: this.paging.model.get('size')
            // }))
            //     .always(function () {
            //         $('#filter-page', this.$el).removeClass('load');
            //     }.bind(this))
            //     .done(function (data) {
            //         this.paging.model.set(data.page);
            //         this.paging.render();
            //         if (data.content.length) {
            //             this.model.set({ empty: false, notFound: false });
            //         } else if (!this.model.get('search')) {
            //             this.model.set({ empty: true, notFound: false });
            //         } else {
            //             this.model.set({ empty: false, notFound: true });
            //         }
            //         this.collection.parse(data.content);
            //     }.bind(this));
        },

        update: function () {
            this.updateFilters();
        },

        getQueryString: function (q) {
            var query = q;
            var url;
            if (!query) query = {};
            if (!query.page) query.page = 1;
            if (!query.size) query.size = 10;
            url = '?page.sort=name&page.page=' + query.page + '&page.size=' + query.size;
            if (query.search) {
                url += '&filter.cnt.name=' + query.search;
            }
            return url;
        },
        renderCollection: function () {
            this.$filterList.html('');
            _.each(this.renderViews, function (view) {
                view.destroy();
            });
            this.renderViews = [];
            _.each(this.collection.models, function (model) {
                var filterItem = new FavoritesItem({ model: model, collection: this.collection });
                this.$filterList.append(filterItem.$el);
                this.renderViews.push(filterItem);
            }, this);
        },
        onClickLinkLaunch: function (e) {
            var launchPath;
            e.preventDefault();
            launchPath = appModel.get('projectId') + '/launches/all';
            config.router.navigate(launchPath, { trigger: true });
        },
        onClickAddFilter: function (e) {
            var $target = $(e.currentTarget);
            var newFilter;
            if ($target.closest('[data-js-empty-block]').length) {
                config.trackingDispatcher.trackEventNumber(255);
            } else {
                config.trackingDispatcher.trackEventNumber(241);
            }
            newFilter = this.launchFilterCollection.generateTempModel();
            config.router.navigate(newFilter.get('url'), { trigger: true });
        },
        onDestroy: function () {
            this.$header.empty();
            this.mainBreadcrumbs && this.mainBreadcrumbs.destroy();
            this.collection.destroy(true);
            _.each(this.renderViews, function (view) {
                view.destroy();
            });
        }
    });

    return {
        ContentView: FavoritesPage
    };
});
