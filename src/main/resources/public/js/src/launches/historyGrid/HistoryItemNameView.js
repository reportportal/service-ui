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
    var LaunchItemInfoTooltipView = require('tooltips/LaunchItemInfoTooltipView');

    var config = App.getInstance();

    var HistoryItemNameView = Epoxy.View.extend({
        template: 'tpl-launch-history-item',
        className: 'history-grid-row',
        events: {
            'click [data-js-name]': 'onClickName'
        },
        bindings: {
            '[data-js-name]': 'text: name, attr: {href: getUrl}',
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
        initialize: function(options) {
            this.launches = options.launches;
            this.render();
            this.applyBindings();
            this.collectionItems = options.collectionItems;
            var lastLaunchItem = this.collectionItems.get(this.model.get('id'));
            if(lastLaunchItem){
                this.tooltip = new LaunchItemInfoTooltipView({model: lastLaunchItem});
                var self = this;
                Util.appendTooltip(function() {
                    return self.tooltip.$el;
                }, $('[data-js-name]', this.$el), $('[data-js-name-block]', this.$el));
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                item: this.model.toJSON()
            }));
        },
        onClickName: function(e) {
            e.preventDefault();
            var href = $(e.currentTarget).attr('href');
            if(href) {
                config.trackingDispatcher.trackEventNumber(133);
                config.router.navigate(href, {trigger: true});
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

    return HistoryItemNameView;
});
