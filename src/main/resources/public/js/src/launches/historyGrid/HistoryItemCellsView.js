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

    var Epoxy = require('backbone-epoxy');
    var _ = require('underscore');
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var HistoryItemCellView = require('launches/historyGrid/HistoryItemCellView');

    var HistoryItemCellsView = Epoxy.View.extend({
        // template: 'tpl-launch-history-item-cells',
        className: 'history-grid-row',
        initialize: function (options) {
            this.launches = options.launches;
            this.collectionItems = options.collectionItems;
            this.renderedItems = [];
            this.render();
        },
        render: function () {
            // this.$el.html(Util.templates(this.template, {}));
            this.renderItems();
        },
        getNameCellWidth: function () {
            var launchesSize = this.launches.length;
            if (launchesSize > 10) {
                return 8;
            } else if (launchesSize > 5) {
                return 20;
            } else if (launchesSize >= 3 && launchesSize <= 5) {
                return 35;
            } else if (launchesSize <= 2) {
                return 50;
            }
        },
        renderItems: function () {
            var items = this.model.get('launches');
            _.each(this.launches.models, function (launch) {
                var item;
                var launchNumber = launch.get('launchNumber');
                var oneItem = { launchNumber: launchNumber, parent_launch_status: launch.get('launchStatus') };
                var itemsInLaunch = items[launchNumber];
                if (itemsInLaunch) {
                    if (itemsInLaunch.length === 1) {
                        oneItem = _.extend(oneItem, this.updateDataForModel(itemsInLaunch[0]));
                    } else {
                        oneItem.status = 'MANY';
                    }
                } else {
                    oneItem.status = 'NOT_FOUND';
                }
                item = new HistoryItemCellView({
                    launchesSize: this.launches.length,
                    container: this.$el,
                    cellWidth: 100 / (this.launches.length || 1),
                    model: new LaunchSuiteStepItemModel(oneItem)
                });
                this.renderedItems.push(item);
            }, this);
        },
        updateDataForModel: function (data) {
            if (data.issue) {
                if (data.issue instanceof Object) {
                    data.issue = JSON.stringify(data.issue);
                }
            }
            if (data.tags) {
                data.tags = JSON.stringify(data.tags);
            }
            return data;
        },
        destroy: function () {
            while (this.renderedItems.length) {
                this.renderedItems.pop().destroy();
            }
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return HistoryItemCellsView;
});
