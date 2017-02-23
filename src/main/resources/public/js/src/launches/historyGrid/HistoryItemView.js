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
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var HistoryItemCellView = require('launches/historyGrid/HistoryItemCellView');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');

    var config = App.getInstance();


    var HistoryItemView = Epoxy.View.extend({
        template: 'tpl-launch-history-item',
        className: 'history-grid-row',
        events: {
            'click [data-js-name]': 'onClickName'
        },
        bindings: {
            '[data-js-name]': 'text: name, attr: {href: getUrl}',
            '[data-js-tags-container]': 'getTags: tags'
        },
        computeds: {
            getUrl: {
                deps: ['launches'],
                get: function(launches) {
                    var hash = window.location.hash,
                        link = hash.split('?')[0],
                        lastLaunch = _.last(this.launches.models),
                        items = launches[lastLaunch.get('launchNumber')],
                        lastItem = !_.isEmpty(items) ? items[0] : null;
                    if(!lastItem || lastItem.status === config.launchStatus.reseted) {
                        $('[data-js-name]', this.$el).addClass('not-link');
                        return '';
                    }
                    return link + (!lastItem.has_childs ? '?log.item=' : '/') + lastItem.id;
                }
            }
        },
        bindingHandlers: {
            getTags: {
                set: function($element) {
                    var tags = this.view.model.get('tags'),
                        action = tags && tags.length ? 'remove' : 'add',
                        $tagsBlock = $('[data-js-tags]', $element);

                    $element[action + 'Class']('hide');
                    $tagsBlock.html('');
                    _.each(tags, function(tag) {
                        $tagsBlock.append(' <span data-tag="'+tag+'">'+tag+'</span>');
                    });
                }
            },
        },
        initialize: function(options) {
            this.launches = options.launches;
            this.renderedItems = [];
            this.render();
            this.applyBindings();
            var markdownViewer = new MarkdownViewer({text: this.model.get('description')});
            $('[data-js-description]', this.$el).html(markdownViewer.$el);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                nameWidth: this.getNameCellWidth(),
                item: this.model.toJSON()
            }));
            this.renderItems();
        },
        getNameCellWidth: function(){
            var launchesSize = this.launches.length;
            if(launchesSize > 10){
                return 8;
            }
            else if (launchesSize > 5){
                return 20;
            }
            else if (launchesSize >= 3 && launchesSize <= 5){
                return 35;
            }
            else if(launchesSize <= 2){
                return 50;
            }
        },
        renderItems: function(){
            var items = this.model.get('launches');
            _.each(this.launches.models, function(launch){
                var launchNumber = launch.get('launchNumber'),
                    oneItem = {launchNumber: launchNumber, parent_launch_status: launch.get('launchStatus')},
                    itemsInLaunch = items[launchNumber];
                if(itemsInLaunch) {
                    if(itemsInLaunch.length == 1){
                        oneItem = _.extend(oneItem, this.updateDataForModel(itemsInLaunch[0]));
                    }
                    else {
                        oneItem.status = 'MANY';
                    }
                } else {
                    oneItem.status = 'NOT_FOUND';
                }
                var item = new HistoryItemCellView({
                    launchesSize: this.launches.length,
                    container: this.$el,
                    cellWidth: (100-this.getNameCellWidth())/(this.launches.length || 1),
                    model: new LaunchSuiteStepItemModel(oneItem)
                });
                this.renderedItems.push(item);
            }, this);
        },
        updateDataForModel: function(data) {
            if(data.issue) {
                data.issue = JSON.stringify(data.issue);
            }
            if(data.tags) {
                data.tags = JSON.stringify(data.tags);
            }
            return data;
        },
        onClickName: function(e) {
            e.preventDefault();
            var href = $(e.currentTarget).attr('href');
            if(href) {
                config.router.navigate(href, {trigger: true});
            }
        },
        destroy: function () {
            while(this.renderedItems.length) {
                this.renderedItems.pop().destroy();
            }
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return HistoryItemView;
});
