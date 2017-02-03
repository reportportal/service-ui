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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var Storage = require('storageService');
    var SingletonURLParamsModel = require('model/SingletonURLParamsModel');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var Epoxy = require('backbone-epoxy');



    var config = App.getInstance();

    var DestroyRoutine = function (view) {
        view.stopListening();
        view.unbind();
        if (view.model) {
            view.model.unbind('change', view.render, view);
            view.model = null;
        }
        if (view.collection) {
            view.collection.reset();
            view.collection = null;
        }
        if (view.vent) {
            view.vent.off();
            view.vent = null;
        }
        if (view.$tags) {
            view.$tags.select2('destroy');
            view.$tags = null;
            $("body > #select2-drop-mask, body > .select2-sizer").remove();
        }
    };

    // base destroyable view
    var BaseView = Epoxy.View.extend({
        destroy: function () {
            DestroyRoutine(this);
            this.$el && this.$el.off().empty();
            this.$el = null;
            delete this;
        }
    });

    var RemovableView = Backbone.View.extend({
        destroy: function () {
            DestroyRoutine(this);
            this.$el && this.$el.off().empty();
            this.remove();
        }
    });

    var GridsStore = Backbone.Collection.extend({
        parse: function (response) {
            this.page = response.page; //"page":{"size":10,"totalElements":14,"totalPages":2,"number":1}}
            return (response.content) ? response.content : response;
        }
    });

    var RequestParameters = Backbone.Model.extend({

        initialize: function (options) {
            this.objectsType = options && options.objectsType ? options.objectsType : 'objectsOnPage';
            this.clear();
        },

        loadObjectsCount: function (objectsType) {
            var count = Storage.getItemsCount(objectsType);
            if (count) {
                config[objectsType] = count;
            }
        },

        setTab: function (id) {
            if (id) {
                this.get('tab')['tab.id'] = id;
            }
        },

        getTab: function () {
            return this.get('tab')['tab.id'];
        },

        setPage: function (page) {
            this.get('paging')['page.page'] = page;
        },

        getPage: function () {
            return this.get('paging')['page.page'];
        },

        setPageSize: function (size) {
            this.get('pageSize')['page.size'] = parseInt(size);
        },

        getPageSize: function () {
            return this.get('pageSize')['page.size'];
        },

        setSortInfo: function (dataIndex, direction) {
            this.set('sorting', {dataIndex: dataIndex.replace(/\$/g, '.'), direction: direction});
            this.get('sortingParam')['page.sort'] = dataIndex.replace(/\./g, '$') + ',' + direction;
        },

        getSortInfo: function () {
            return this.get('sorting');
        },

        setFilters: function (filters) {
            this.set('filters', filters);
        },

        getFilters: function () {
            return this.get('filters');
        },

        hasDifference: function (filters) {
            if (filters.length !== this.get('filters')) return true;

            for (var i = 0; i < filters.length; i++) {
                var filter = this.get('filters')[i];
                if (filter.id !== filters[i].id || filter.value !== filters[i].value) {
                    return true;
                }
            }
            return false;
        },

        toJSON: function (permanent) {
            permanent = permanent || {};
            var parameters = _.extend({}, this.get('paging'), this.get('sortingParam'), this.get('pageSize'), this.get('tab'), permanent);
            _.each(this.get('filters'), function (filter) {
                var filterValue = (filter.id.indexOf('tags') > -1) ? filter.value.split(', ').join(',') : filter.value;
                parameters[filter.id] = filterValue;
            });
            return parameters;
        },

        toURLSting: function () {
            if (_.isEmpty(this.attributes)) return '';
            var params = [];
            _.each([this.get('paging'), this.get('sortingParam'), this.get('pageSize'), this.get('tab')], function (obj) {
                for (var name in obj) {
                    if (_.has(obj, name) || obj[name]) {
                        params.push(name + '=' + obj[name]);
                    }
                }
            });
            _.forEach(this.get('filters'), function (filter) {
                if (filter) {
                    var filterValue = (filter.id.indexOf('tags') > -1) ? filter.value.split(', ').join(',') : filter.value;
                    params.push(filter.id + '=' + encodeURIComponent(filterValue));
                }
            });
            var result = '';
            _.each(params, function (param, index, all) {
                result += param;
                if (index != all.length - 1) {
                    result += '&';
                }
            });
            return result;
        },

        hasFiltersWithValue: function () {
            var hasValue = false;
            _.forEach(this.get('filters'), function (filter) {
                if (filter.value && filter.value !== 'Any') {
                    hasValue = true;
                    return false;
                }
            });
            return hasValue;
        },

        clear: function (objectsType) {
            if (objectsType) {
                this.objectsType = objectsType;
            }
            this.set('tab', {'tab.id': 'allCases'});

            this.set('paging', {'page.page': 1});
            this.set('pageSize', {'page.size': config[this.objectsType]});

            this.set('sorting', {});
            this.set('sortingParam', {});

            this.set('filters', []);

        },

        apply: function (str) {
            var params = str.split('&');
            this.clear();
            _.each(params, function (param) {
                var pair = param.split('=');

                if (pair[0] == 'page.size') this.setPageSize(pair[1]);
                else if (pair[0] == 'page.page') this.setPage(pair[1]);
                else if (pair[0] == 'page.sort') this.setSortInfo(pair[1].split(',')[0], pair[1].split(',')[1]);
                else if (pair[0] == 'tab.id') this.setTab(pair[1]);
                else {
                    this.get('filters').push({
                        id: pair[0], value: decodeURIComponent(pair[1])
                    });
                }
            }, this);
        }
    });

    var PagingToolbar = RemovableView.extend({

        initialize: function (options) {
            this.model = options.model;
            this.minPaging = options.minMode || false;
            this.showPageCount = 0;
            $(window).on('resize.' + this.cid, this.onResizeWindow.bind(this));
            this.onResizeWindow();
        },

        tpl: "tpl-components-paging",

        // model: {"size":10,"totalElements":14,"totalPages":2,"number":1}}
        render: function () {
            var totalPages = this.model.get('totalPages'),
                currentPage = this.model.get('number'),
                totalElements = this.model.get('totalElements'),
                size = this.model.get('size'),
                model = {
                    from: totalElements === 0 ? 0 : (currentPage - 1) * size + 1,
                    to: totalPages === currentPage ? totalElements : size * currentPage,
                    totalElements: totalElements,
                    totalPages: totalPages,
                    active: currentPage,
                    objectsOnPage: size,
                    minPaging: this.minPaging,
                };
            var halfShowPageCount = parseInt(this.showPageCount/2);
            if (totalPages > 1) {
                var pages;
                // should be 10 page links
                if (totalPages <= this.showPageCount)                   pages = _.range(1, totalPages + 1);
                else if (currentPage <= halfShowPageCount)              pages = _.range(1, this.showPageCount+1);
                else if (currentPage >= totalPages - halfShowPageCount) pages = _.range(totalPages - (this.showPageCount - 1), totalPages + 1);
                else                                    pages = _.range(currentPage - (halfShowPageCount-1), currentPage + halfShowPageCount + 1);

                model = _.extend({
                    showControls: true,
                    pages: pages,
                    hasNext: currentPage !== totalPages,
                    hasPrevious: currentPage !== 1
                }, model);

            } else {
                model = _.extend({
                    showControls: false,
                    pages: [],
                    hasNext: false,
                    hasPrevious: false
                }, model);
            }
            this.$el.html(Util.templates(this.tpl, model));

            this.pageSize = $("[data-js-per-page-input]", this.$el);
            this.pageSizeStatic = $("[data-js-per-page]", this.$el);
            return this;
        },
        onResizeWindow: function() {
            var newShowPageCount = 10;
            if($( window ).width() < 930) {
                newShowPageCount = 5;
            }
            if (newShowPageCount != this.showPageCount) {
                if(!this.showPageCount) {
                    this.showPageCount = newShowPageCount;
                } else {
                    this.showPageCount = newShowPageCount;
                    this.render();
                }
            }
        },

        first: function (e) {
            e.preventDefault();
            if (this.model.get('number') !== 1) {
                this.trigger('page', 1);
            }
        },

        last: function (e) {
            e.preventDefault();
            if (this.model.get('number') !== this.model.get('totalPages')) {
                this.trigger('page', this.model.get('totalPages'));
            }
        },

        previous: function (e) {
            e.preventDefault();
            if (this.model.get('number') !== 1) {
                this.trigger('page', this.model.get('number') - 1);
            }
        },

        next: function (e) {
            e.preventDefault();
            if (this.model.get('number') !== this.model.get('totalPages')) {
                this.trigger('page', this.model.get('number') + 1);
            }
        },

        page: function (e) {
            e.preventDefault();
            var page = Number($(e.currentTarget).text());
            if (this.model.get('number') !== page) {
                this.trigger('page', page);
            }
        },

        events: {
            'click .first': 'first',
            'click .previous': 'previous',
            'click .next': 'next',
            'click .last': 'last',
            'click .page': 'page',
            'click [data-js-per-page]': 'showItemsPerPageControl',
            'keyup [data-js-per-page-input]': 'onKeyUpPageSize',
            'change [data-js-per-page-input]': 'hideItemsPerPageControl'
        },

        scrollToTop: function (ev) {
            config.mainScrollElement.animate({scrollTop: 0}, 100); // scroll to top of the page
        },

        showItemsPerPageControl: function (e) {
            $(e.currentTarget).hide();
            this.pageSize.val('').show().focus();
        },

        hideItemsPerPageControl: function (e) {
            this.pageSize.hide();
            this.pageSizeStatic.show();
            this.applyPaging(true);
        },
        onKeyUpPageSize: function(e) {
            var val = this.pageSize.val(),
                pattern = /[^0-9]/g,
                newVal = val.replace(pattern, '');
            this.pageSize.val(newVal);
            this.trigger('keyUpPageSize', newVal);
            if (e.keyCode === 13) {
                this.pageSize.change();
            }
        },

        applyPaging: function (count) {
            var value = parseInt(this.pageSize.val());
            if (value && value !== this.model.get('size')) {
                this.pageSizeStatic.text(value);
                count && this.trigger('count', value);
            }
            this.pageSize.val("");
        },
        destroy: function() {
            $(window).off('resize.' + this.cid);
            RemovableView.prototype.destroy.call(this);
        }
    });
    
    var PagingToolbarSaveUser = PagingToolbar.extend({
        initialize: function(options){
            this.ready = $.Deferred();
            PagingToolbar.prototype.initialize.call(this, options);
            if(!options.pageType) {
                console.log('PagingToolbarSaveLocal: page type is not defined');
                return;
            }
            this.pageType = options.pageType;
            this.urlModel = new SingletonURLParamsModel();
            this.userSettings = new SingletonUserStorage();
            var self = this;
            this.userSettings.ready.done(function(){
                self.setSettings();
                self.ready.resolve();
            });
            this.listenTo(this, 'page', this.onChangePage);
            this.listenTo(this, 'count', this.onChangeSize);

        },
        onChangePage: function(page){
            this.model.set({number: page});
            this.pagingToSettings();
            this.scrollToTop();
        },
        onChangeSize: function(size){
            if(size > 300) size = 300;
            this.model.set({number: 1, size: size});
            this.pagingToSettings();
            this.scrollToTop();
        },
        setSettings: function(){
            if(this.urlModel.get('page.page') && this.urlModel.get('page.size')){
                this.userSettings.set(this.pageType, {'page.size': this.urlModel.get('page.size')});
                this.model.set({number: this.urlModel.get('page.page'), size: this.urlModel.get('page.size')});
                return;
            }
            var userSettingsData = this.getSettingsStorageData();
            if(userSettingsData){
                this.urlModel.delaySet(userSettingsData);
                this.model.set({number: userSettingsData['page.page'] || 1, size: userSettingsData['page.size']});
                return;
            }
            var settings = {'page.page': 1, 'page.size': 50};
            if(!this.model.get('size')){
                this.model.set('size', settings['page.size']);
            }
            if(!this.model.get('number')){
                this.model.set('number', settings['page.page']);
            }
        },
        getSettingsStorageData: function(){
            return this.userSettings.get(this.pageType)
        },
        pagingToSettings: function(){
            this.urlModel.set({'page.page': this.model.get('number'), 'page.size': this.model.get('size')});
            this.userSettings.set(this.pageType, {'page.size': this.urlModel.get('page.size')});
        }
    });

    var PagingToolbarConfigSave = PagingToolbar.extend({
        initialize: function(options){
            PagingToolbar.prototype.initialize.call(this, options);
            this.pageType = options.pageType;
            this.listenTo(this, 'keyUpPageSize', this.onUserTypes);
            this.listenTo(this, 'count', this.onChangeCount);
        },
        onUserTypes: function(newVal){
            if (newVal && this.pageType == 'objectsOnPage') {
                var filters = config.preferences.filters,
                    url = config.preferences.active;
                if (url) {
                    var urlArr = url.split('?'),
                        param = urlArr[1],
                        paramArr = param.split('&'),
                        inx = _.findIndex(paramArr, function (i) {
                            return i.indexOf('page.size') >= 0
                        }),
                        sizeParam = paramArr[inx].split('='),
                        activeTab;
                    sizeParam[1] = newVal;
                    paramArr[inx] = sizeParam.join('=');
                    urlArr[1] = paramArr.join('&');
                    activeTab = urlArr.join('?');
                    //console.log(urlArr.join('?'));
                    Util.updateLaunchesHref(activeTab);
                    //Service.updateTabsPreferences({filters: filters, active: activeTab});
                }
            }
        },
        onChangeCount: function(count){
            config[this.pageType] = count;
            Storage.setItemsCount(this.pageType, count);
        },
        applyPaging: function (count) {
            var value = parseInt(this.pageSize.val());
            if (value && value !== this.model.get('size')) {
                this.pageSizeStatic.text(value);
                this.trigger('page', 1, value);
                count && this.trigger('count', value);
            }
            this.pageSize.val("");
        },
        onKeyUpPageSize: function(e) {
            var val = this.pageSize.val(),
                pattern = /[^0-9]/g,
                newVal = val.replace(pattern, '');
            this.pageSize.val(newVal);
            this.trigger('keyUpPageSize', newVal);
            if (e.keyCode === 13) {
                this.applyPaging(true);
            }
        }
    });

    var DialogShell = RemovableView.extend({
        tpl: 'tpl-dialog-shell',
        btnTpl: 'tpl-dialog-buttons',
        initialize: function (options) {
            this.size = options.size || 'md';
            this.headerTxt = options.headerTxt || 'launchEditor';
            this.actionTxt = options.actionTxt || '';
            this.dismissTxt = options.dismissTxt || '';
            this.inSubmit = false;

            this.hideDismiss = _.isUndefined(options.hideDismiss) ? false : options.hideDismiss;
            this.actionStatus = _.isUndefined(options.actionStatus) ? false : options.actionStatus;
            if (options.btnTpl) {
                this.btnTpl = options.btnTpl;
            }
            if (options.contentTpl) {
                this.contentTpl = options.contentTpl;
            }
        },
        render: function (data) {
            var options = data || {};

            this.$el = Util.getDialog({
                name: this.tpl,
                data: {
                    size: this.size,
                    headerTxt: this.headerTxt,
                    isBeta: options.isBeta
                }
            });
            $("#buttonsModal", this.$el).html(Util.templates(this.btnTpl, {
                dismissTxt: this.dismissTxt,
                actionTxt: this.actionTxt,
                hideDismiss: this.hideDismiss,
                actionStatus: this.actionStatus
            }));
            this.$actionBtn = $("#actionBtnDialog", this.$el);
            this.$content = $("#contentModal", this.$el);
            this.$loader = $("#dialogShellLoader", this.$el);
            this.$el.modal('show');
            return this;
        },
        events: {
            'hidden.bs.modal': 'destroy',
            'shown.bs.modal': 'shown',
            'click #actionBtnDialog:not(.disabled)': 'submit',
            'keydown input': 'trackForEnter'
        },
        shown: function () {
        },
        done: function () {
            this.$el.modal('hide');
        },
        trackForEnter: function (e) {
            if (e.keyCode === 13 && !this.$actionBtn.hasClass('disabled') && !this.inSubmit) {
                this.submit();
            }
        },
        destroy: function () {
            this.$el.data('modal', null);
            RemovableView.prototype.destroy.call(this);
        }
    });

    var DialogWithCallBack = DialogShell.extend({
        initialize: function (options) {
            DialogShell.prototype.initialize.call(this, options);
            this.contentTpl = options.contentTpl;
            this.data = options.data;
            this.callback = options.callback;
            this.afterRenderCallback = options.afterRenderCallback;
            this.destroyCallback = options.destroyCallback;
            this.shownCallback = options.shownCallback;
        },
        render: function () {
            DialogShell.prototype.render.call(this);
            this.$content.html(Util.templates(this.contentTpl, this.data));
            if (_.isFunction(this.afterRenderCallback)) {
                this.afterRenderCallback();
            }

            this.delegateEvents();
            return this;
        },
        submit: function () {
            this.callback(this.done.bind(this));
        },
        shown: function () {
            _.isFunction(this.shownCallback) && this.shownCallback();
        },
        destroy: function () {
            if (_.isFunction(this.destroyCallback)) {
                this.destroyCallback();
                this.destroyCallback = null;
            }
            if (this.afterRenderCallback) this.afterRenderCallback = null;
            if (this.shownCallback) this.shownCallback = null;
            this.callback = null;
            this.data = null;
            DialogShell.prototype.destroy.call(this);
        }
    });

    return {
        GridsStore: GridsStore,
        RequestParameters: RequestParameters,
        PagingToolbar: PagingToolbar,
        PagingToolbarSaveUser: PagingToolbarSaveUser,
        PagingToolbarConfigSave: PagingToolbarConfigSave,
        BaseView: BaseView,
        RemovableView: RemovableView,
        DialogShell: DialogShell,
        DialogWithCallBack: DialogWithCallBack
    };
});
