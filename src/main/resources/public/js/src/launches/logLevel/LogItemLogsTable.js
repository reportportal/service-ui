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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var FilterModel = require('filters/FilterModel');
    var FilterEntities = require('filterEntities/FilterEntities');
    var LogItemCollection = require('launches/logLevel/LogItemCollection');
    var Components = require('core/components');
    var StickyHeader = require('core/StickyHeader');
    var LogItemLogsItem = require('launches/logLevel/LogItemLogsItem');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var LogItemNextErrorView = require('launches/logLevel/LogItemNextError/LogItemNextErrorView')

    var config = App.getInstance();

    var LogItemLogsTable = Epoxy.View.extend({
        template: 'tpl-launch-log-item-logs-table',

        events: {
            'change [data-js-attachments-filter]': 'onChangeAttachments',
            'click .rp-grid-th[data-sorter]': 'onClickSorter'
        },

        initialize: function(options) {
            this.itemModel = options.itemModel;
            this.mainPath = options.mainPath;
            this.collectionItems = options.collectionItems;
            this.userStorage = new SingletonUserStorage();
            var startOptions = options.options;
            var isAscSort = 'true';
            if (startOptions['page.sort'] && ~startOptions['page.sort'].indexOf('DESC')) {
                isAscSort = 'false';
            }
            this.filterModel = new FilterModel({
                temp: true,
                selection_parameters: '{"is_asc": '+ isAscSort +', "sorting_column": "time"}',
            });
            this.pagingModel = new Backbone.Model();
            this.selectModel = new FilterEntities.EntitySelectModel({
                id: 'level',
                condition: 'in',
                values: [
                    {name: 'All', value: 'All'},
                    {name:'Trace', value: 'TRACE'},
                    {name: 'Debug', value: 'DEBUG'},
                    {name: 'Info', value: 'INFO'},
                    {name: 'Warn', value: 'WARN'},
                    {name: 'Error', value: 'ERROR'},
                ],
                value: (startOptions['filter.in.level'] && decodeURIComponent(startOptions['filter.in.level'])) || 'All',
            });
            this.nameModel = new FilterEntities.EntityInputModel({
                id: 'message',
                condition: 'cnt',
                valueMinLength: 3,
                valueMaxLength: 55,
                valueOnlyDigits: false,
                value: startOptions['filter.cnt.message'] || '',
            });


            this.render();
            if (startOptions['filter.ex.binary_content'] && startOptions['filter.ex.binary_content'] == 'true') {
                $('[data-js-attachments-filter]', this.$el).prop( "checked", true );
            }
            this.onChangeFilter();
            this.collection = new LogItemCollection({
                filterModel: this.filterModel,
                itemModel: this.itemModel,
                pagingPage: (startOptions['page.page'] && parseInt(startOptions['page.page'])),
                pagingSize: (startOptions['page.size'] && parseInt(startOptions['page.size'])) || this.userStorage.get('launchLogPageCount'),
            });
            this.nextErrorView = new LogItemNextErrorView({
                filterModel: this.filterModel,
                itemModel: this.itemModel,
                collectionLogs: this.collection,
                pagingModel: this.pagingModel,
            });
            $('[data-js-next-error-container]', this.$el).html(this.nextErrorView.$el);
            this.listenTo(this.collection, 'change:paging', this.onChangePaging);
            this.listenTo(this.collection, 'loading:true', this.onStartLoading);
            this.listenTo(this.collection, 'loading:false', this.onStopLoading);
            this.listenTo(this.collection, 'change:options', this.onChangeOptionsFilter);
            // this.listenTo(this.collection, 'click:attachment', this.onClickAttachments);
            this.collection.load();
            this.listenTo(this.collection, 'reset', this.onResetCollection);
            this.listenTo(this.selectModel, 'change:condition change:value', this.onChangeSelect);
            this.listenTo(this.nameModel, 'change:value', this.onChangeName);
            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.onChangeSelectionParameters);
            this.onChangeSelectionParameters();
            this.listenTo(this.paging, 'page', this.onChangePage);
            this.listenTo(this.minPaging, 'page', this.onChangePage);
            this.listenTo(this.paging, 'count', this.onChangePageCount);
            this.setupStickyHeader();
            $('[data-js-select-filter] [data-toggle="dropdown"]', this.$el).on('click', function(){
                config.trackingDispatcher.trackEventNumber(204);
            });
            var self = this;
            $(window)
                .off('resize.logItems')
                .on('resize.logItems', _.debounce(self.resize.bind(self), 100))
        },
        resetFilters: function() {
            this.nameModel.set({value: ''});
            this.selectModel.set({value: ''});
            $('[data-js-attachments-filter]', this.$el).prop( "checked", false );
            this.selectModel.trigger('changeState');
        },
        setupStickyHeader: function() {
            this.destroyStickyHeader();
            this.stickyHeader = new StickyHeader({fixedBlock: $('[data-js-fixed-header]', this.$el), topMargin: 0, minWidthWindow: 720});
        },
        destroyStickyHeader: function() {
            this.stickyHeader && this.stickyHeader.destroy();
        },
        resize: function() {
            _.each(this.items, function(item) {
                item.resize();
            })
        },
        render: function() {
            this.$el.html(Util.templates(this.template), {});
            $('[data-js-select-filter]', this.$el).html((new this.selectModel.view({model: this.selectModel})).$el);
            $('[data-js-name-filter]', this.$el).html((new this.nameModel.view({model: this.nameModel})).$el);
            this.paging = new Components.PagingToolbar({
                el: $('[data-js-paginate-container]', this.$el),
                model: this.pagingModel,
            });
            this.minPaging = new Components.PagingToolbar({
                el: $('[data-js-paginate-min-container]', this.$el),
                model: this.pagingModel,
                minMode: true,
            });
            $('[data-js-paginate-min-container]', this.$el).on('click', function(e){
                var next = $(e.target).closest('.next'),
                    prev = $(e.target).closest('.previous');
                if(next.length && !next.hasClass('disabled')){
                    config.trackingDispatcher.trackEventNumber(209);
                }
                else if(prev.length && !prev.hasClass('disabled')) {
                    config.trackingDispatcher.trackEventNumber(208);
                }
            });
        },
        onChangeSelect: function(){
            config.trackingDispatcher.trackEventNumber(205);
            this.onChangeFilter();
        },
        onChangeAttachments: function(){
            config.trackingDispatcher.trackEventNumber(206);
            this.onChangeFilter();
        },
        onChangeName: function(model){
            if(model.get('value')){
                config.trackingDispatcher.trackEventNumber(210);
            }
            this.onChangeFilter();
        },
        onChangeOptionsFilter: function(newParams) {
            config.router.navigate(this.mainPath + '&' + newParams.join('&'), {trigger: false});
            var newLogOption = {}
            _.each(newParams, function(param) {
                param = param.replace('log.', '');
                var splitParam = param.split('=');
                newLogOption[splitParam[0]] = splitParam[1];
            })
            newLogOption.item = this.collectionItems.getInfoLog().item;
            newLogOption.history = this.collectionItems.getInfoLog().history;
            this.collectionItems.setInfoLog(newLogOption);
        },
        onStartLoading: function() {
            $('[data-js-logs-wrapper]', this.$el).addClass('load');
        },
        onStopLoading: function() {
            $('[data-js-logs-wrapper]', this.$el).removeClass('load');
            _.each(this.items, function(item) {
                var level = item.model.get('level');
                if (level == 'ERROR' || level == 'TRACE' || level == 'DEBUG') {
                    item.activateAccordion();
                }
            })
        },
        onChangePage: function(page) {
            return this.collection.setPaging(page);
        },
        onChangePageCount: function(count) {
            this.collection.setPaging(1, count);
            this.userStorage.set({launchLogPageCount: count});
        },
        onChangePaging: function(pageData) {
            this.pagingModel.set(pageData);
            this.paging.render();
            this.minPaging.render();
            $('[data-js-next-error]', this.$el).removeClass('hide');
        },
        onChangeFilter: function() {
            var newEntities = [];
            newEntities.push(this.selectModel.getInfo());
            newEntities.push(this.nameModel.getInfo());
            if($('[data-js-attachments-filter]', this.$el).is(':checked')) {
                newEntities.push({
                    condition: 'ex',
                    filtering_field: 'binary_content',
                    value: 'true',
                });
            }
            this.filterModel.set({newEntities: JSON.stringify(newEntities)});
        },
        onClickSorter: function(e) {
            var sorter = $(e.currentTarget).data('sorter');
            var filterParams = this.filterModel.getParametersObj();
            switch (sorter){
                case 'time':
                    config.trackingDispatcher.trackEventNumber(211);
                    break;
            }
            if(filterParams.sorting_column == sorter) {
                filterParams.is_asc = !filterParams.is_asc;
            } else {
                filterParams.is_asc = true;
                filterParams.sorting_column = sorter;
            }
            this.filterModel.set({newSelectionParameters: JSON.stringify(filterParams), curPage: 1});
        },
        onChangeSelectionParameters: function() {
            $('[data-sorter]', this.$el).removeClass('sorting-asc sorting-desc');
            var filterParams = this.filterModel.getParametersObj();
            var $element = $('[data-sorter="' + filterParams.sorting_column + '"]', this.$el);
            if($element && $element.length) {
                $element.addClass((filterParams.is_asc) ? 'sorting-asc' : 'sorting-desc');
            }
        },

        onResetCollection: function() {
            var $container = $('[data-js-table-container]', this.$el);
            var self = this;
            $container.html('');
            if(!this.collection.models.length) {
                $('[data-js-logs-wrapper]', this.$el).addClass('not-found');
            } else {
                $('[data-js-logs-wrapper]', this.$el).removeClass('not-found');
            }
            this.items = [];
            _.each(this.collection.models, function(model) {
                var item = new LogItemLogsItem({model: model});
                $container.append(item.$el);
                self.items.push(item);
            })
        },
        // onClickAttachments: function(model) {
        //     this.trigger('goToAttachment', model.get('id'))
        // },
        goToLog: function(logId) {
            if (this.collection.get(logId)) {
                this.collection.get(logId).trigger('scrollTo');
                this.trigger('goToLog:end');
            } else {
                var self = this;
                this.collection.findLogPage(logId, true)
                    .done(function(number) {
                        self.resetFilters();
                        self.onChangeFilter();
                        self.onChangePage(number);
                        self.listenToOnce(self.collection, 'loading:false', function() {
                            self.collection.get(logId) && self.collection.get(logId).trigger('scrollTo');
                            self.trigger('goToLog:end');
                        });
                    })
            }
        },

        onDestroy: function() {
            $(window).off('resize.logItems');
            _.each(this.items, function(view) {
                view.destroy();
            })
            this.items = null;
            this.$el.html('');
        }
    })

    return LogItemLogsTable;
});
