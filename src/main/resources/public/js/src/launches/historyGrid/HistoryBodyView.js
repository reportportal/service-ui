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
    var Localization = require('localization');
    var Service = require('coreService');
    var HistoryTableView = require('launches/historyGrid/HistoryTableView');
    //var SingletonUserStorage = require('storage/SingletonUserStorage');
    var App = require('app');
    //var StickyHeader = require('core/StickyHeader');

    var config = App.getInstance();

    var HistoryBodyView = Epoxy.View.extend({
        template: 'tpl-launch-history-body',

        events: {
            'click [data-js-load-more]': 'onLoadMore',
        },
        bindings: {
        },
        computeds: {
        },
        initialize: function(options) {
            this.filterModel = options.filterModel;
            this.collectionItems = options.collectionItems;
            this.conrol = options.control;
            this.depth = 5;
            this.qty = config.historyItemsToLoad;
            this.ids = _.map(this.collectionItems.models, function(i){ return i.get('id');});
            this.resetGrid();
            this.listenTo(this.conrol, 'refresh::history', this.onRefreshGrid);
            //this.listenTo(this.conrol, 'change::depth', this.onRefreshGrid);
            this.render();
            this.load();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        updateHistory: function(){
            this.table = new HistoryTableView({
                el: $('[data-js-history-table]', this.$el),
                launches: this.launches,
                items: this.items
            });
        },
        load: function(){
            //this.validateForLoad();
            this.table && this.table.destroy();
            this.toggleIsLoad('show');
            Service.getHistoryData(this.getItemsForLoad(), this.depth)
                .done(function (response) {
                    this.parseHistoryItems(response);
                    this.loaded += this.toLoadIds.length;
                    this.updateHistory();
                    this.toggleIsLoad('hide');
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'loadHistory');
                });
        },
        parseHistoryItems: function(data){
            var launches = [],
                items = [];
            _.forEach(data, function (launch) {
                var key = launch.launchNumber;
                _.forEach(launch.resources, function(item){
                    var newItem = {
                        name: item.name, description: item.description, tags: item.tags, launches: {}
                    };
                    newItem.launches[key] = [item];
                    if (_.isEmpty(items)) {
                        items.push(newItem);
                    } else {
                        var oneName = _.find(items, function (obj) {
                            var name = obj.name === item.name,
                                description = obj.description === item.description,
                                tags = _.size(obj.tags) === _.size(item.tags) && _.every(obj.tags, function(i){return _.contains(item.tags, i)});
                            return (name && description && tags);
                        });
                        if (!oneName) {
                            items.push(newItem);
                        } else {
                            if (oneName.launches[key]) {
                                oneName.launches[key].push(item);
                            } else {
                                oneName.launches[key] = [item];
                            }
                        }
                    }
                });
                delete launch.resources
                launches.push(launch);
            });
            this.launches.add(launches, {merge: true});
            this.items.add(items, {merge: true});
        },
        onLoadMore: function(e){
            if(!$(e.currentTarget).hasClass('disabled')){
                e.preventDefault();
                this.load();
            }
        },
        resetGrid: function(){
            this.launches = new Backbone.Collection();
            this.items = new Backbone.Collection();
            this.loaded = 0;
            this.toLoadIds = [];
        },
        onRefreshGrid: function(){
            this.resetGrid();
            this.load();
        },
        getItemsForLoad: function(){
            this.toLoadIds = this.ids.slice(this.loaded, this.loaded + this.qty);
            return this.toLoadIds;
        },
        toggleIsLoad: function(action){
            var $loadBtn = $('[data-js-load-more]', this.$el),
                loader = $('[data-js-history-loader]', this.$el);
            $loadBtn[(action == 'hide' ? 'remove' : 'add') + 'Class']('disabled');
            loader[action]();
            if(this.loaded >= this.ids.length){
                $loadBtn.hide();
            }
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return HistoryBodyView;
});
