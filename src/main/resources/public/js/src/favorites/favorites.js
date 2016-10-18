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

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Components = require('core/components');
    var Util = require('util');
    var CoreService = require('coreService');
    var FilterCollection = require('filters/FilterCollection');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var FilterItem = Epoxy.View.extend({
        className: 'row rp-table-row',
        events: {
            'click [data-js-remove]': 'onClickRemove',
            'click [data-js-filter-edit]': 'onClickEdit',
            'click [data-js-filter-shared]': 'onClickEdit',
        },
        bindings: {
            '[data-js-filter-link]': 'text: name, attr: {href: url}, classes: {hide: not(isLaunch)}',
            '[data-js-filter-name]': 'text: name, classes: {hide: isLaunch}',
            '[data-js-description]': 'text: description',
            '[data-js-filter-options]': 'html: optionsString',
            '[data-js-owner]': 'text: owner',
            '[data-js-filter-shared]': 'classes: {hide: not(isShared)}',
            '[data-js-switch-to-launch]': 'checked: isLaunch',
            '[data-js-switch-to-launch-mobile]': 'checked: isLaunch',
            '[data-js-switch-to-launch-text]': 'text: isLaunchString',
        },
        initialize: function() {
            this.render();
        },
        template: 'tpl-favorite-item',
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function() {
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteFilter,
                bodyText: Util.replaceTemplate(Localization.dialog.deleteFilter, this.model.get('name').escapeHtml()),
                confirmText: 'I am sure I want to delete',
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            });
            modal.show()
                .done(function() {
                    return self.model.remove();
                });
        },
        onClickEdit: function() {
            this.model.editMainInfo();
        },
        destroy: function() {
            this.remove();
        }
    });

    var FilterPage = Epoxy.View.extend({
        initialize: function(options) {
            this.model = new Backbone.Model({
                search: '',
                empty: false,
                notFound: false,
            }),
            this.renderViews = [];
            this.collection = new FilterCollection();
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.listenTo(this.collection, 'reset', this.renderCollection);
            this.listenTo(this.collection, 'remove', this.updateFilters);
            this.context = options.context;
            this.$header = this.context.getMainView().$header;
            this.$el = this.context.getMainView().$body;
        },
        template: 'tpl-favorite-page',
        templateHeader: 'tpl-favorites-header',
        events: {
            'validation::change [data-js-filter-name]': 'onChangeFilterName',
            'click [data-js-link-launch]': 'onClickLinkLaunch',
            'click [data-js-add-filter]': 'onClickAddFilter',
        },
        bindings: {
            '[data-js-filter-name]': 'attr: {disabled: empty}',
            '[data-js-empty-block]': 'classes: {hide: not(empty)}',
            '[data-js-filter-paginate]': 'classes: {hide: any(empty, notFound)}',
            '[data-js-not-found]': 'classes: {hide: not(notFound)}',
            '[data-js-search-value]': 'text: search',
        },
        render: function() {
            var defectTypeCollection = new SingletonDefectTypeCollection();
            defectTypeCollection.ready.done(function() {
                this.$el.html(Util.templates(this.template, {}));
                this.$header.html(Util.templates(this.templateHeader), {});
                this.$filterName = $('[data-js-filter-name]', this.$el);
                this.$filterList = $('[data-js-filter-list]', this.$el);
                this.$filterPaginate = $('[data-js-filter-paginate]', this.$el);
                Util.bootValidator(this.$filterName, [{
                    validator: 'minMaxNotRequired',
                    type: 'memberName',
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
                var self = this;
                this.paging.ready.done(function(){
                    self.searchString = '';
                    if(self.paging.urlModel.get('filter.cnt.name')) {
                        self.model.set({search: self.paging.urlModel.get('filter.cnt.name')});
                        self.$filterName.val(self.model.get('search'));
                    }
                    self.listenTo(self.model, 'change:search', self.onChangeModelSearch);
                    self.updateFilters();
                });
                this.applyBindings();
            }.bind(this));

        },
        onChangeModelSearch: function() {
            this.paging.trigger('page', 1);
        },
        onChangeFilterName: function (e, data) {
            if (data.valid) {
                this.paging.urlModel.set({'filter.cnt.name': data.value});
                this.model.set({search: data.value});
                this.searchString = data.value;
            }
        },
        onPage: function(page) {
            this.changeFilters();
        },
        onPageCount: function(size) {
            this.changeFilters();
        },
        changeFilters: function() {
            // this.paging.render();
            this.updateFilters();
        },
        updateFilters: function() {
            $('#filter-page',this.$el).addClass('load');
            this.collection.reset([]);
            this.paging.$el.html('');
            CoreService.saveFilter(this.getQueryString({
                search: encodeURIComponent(this.model.get('search')),
                page: this.paging.model.get('number'),
                size: this.paging.model.get('size')
            }))
                .always(function() {
                    $('#filter-page',this.$el).removeClass('load');
                }.bind(this))
                .done(function(data) {
                    this.paging.model.set(data.page);
                    this.paging.render();
                    if(data.content.length) {
                        this.model.set({empty: false, notFound: false});
                    } else if(!this.model.get('search')) {
                        this.model.set({empty: true, notFound: false});
                    } else {
                        this.model.set({empty: false, notFound: true});
                    }
                    this.collection.parse(data.content);
                }.bind(this));
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
        renderCollection: function() {
            this.$filterList.html('');
            _.each(this.renderViews, function(view) {
                view.destroy();
            });
            this.renderViews = [];
            _.each(this.collection.models, function(model) {
                var filterItem = new FilterItem({model: model});
                this.$filterList.append(filterItem.$el);
                this.renderViews.push(filterItem);
            }, this);
        },
        onClickLinkLaunch: function(e) {
            e.preventDefault();
            var launchPath = appModel.get('projectId') + '/launches/all';
            config.router.navigate(launchPath, {trigger: true});
        },
        onClickAddFilter: function() {
            var newFilter = this.launchFilterCollection.generateTempModel();
            config.router.navigate(newFilter.get('url'), {trigger: true});
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
        },
    });

    return {
        ContentView: FilterPage,
    }
});