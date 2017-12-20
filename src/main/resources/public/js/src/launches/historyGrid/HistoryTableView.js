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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var HistoryItemNameView = require('launches/historyGrid/HistoryItemNameView');
    var HistoryItemCellsView = require('launches/historyGrid/HistoryItemCellsView');
    var App = require('app');
    require('baron');

    var config = App.getInstance();

    var HistoryTableView = Epoxy.View.extend({
        template: 'tpl-launch-history-table',
        events: {},
        initialize: function (options) {
            this.filterModel = options.filterModel;
            this.collectionItems = options.collectionItems;
            this.launches = options.launches;
            this.items = options.items;
            this.renderedItems = [];
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                launches: this.launches.toJSON(),
                nameWidth: this.getNameCellWidth()
            }));
            this.renderItems();
            var scroll = Util.setupBaronScroll($('[data-js-history-items-cells]', this.$el), null, { direction: 'h' });
            Util.setupBaronScrollSize(scroll, {});
            $(window).resize();
        },
        getNameCellWidth: function () {
            var launchesSize = this.launches.length;
            if (launchesSize > 10) {
                return 15;
            } else if (launchesSize > 5) {
                return 20;
            } else if (launchesSize >= 3 && launchesSize <= 5) {
                return 35;
            } else if (launchesSize <= 2) {
                return 50;
            }
        },
        renderItems: function () {
            var $nameContainer = $('[data-js-history-names]', this.$el),
                $cellsContainer = $('[data-js-history-items-cells]', this.$el);
            _.each(this.items.models, function (model) {
                var name = new HistoryItemNameView({ model: model, launches: this.launches, collectionItems: this.collectionItems }),
                    cells = new HistoryItemCellsView({ model: model, launches: this.launches, collectionItems: this.collectionItems });
                $nameContainer.append(name.$el);
                $cellsContainer.append(cells.$el);
                var cellsHeight = cells.$el.height(),
                    nameHeight = name.$el.height(),
                    height = nameHeight >= cellsHeight ? nameHeight : cellsHeight;

                $('[data-js-name-block]', name.$el).height(height);
                $('[data-js-history-cell]', cells.$el).height(height);

                this.renderedItems.push(name);
                this.renderedItems.push(cells);
            }, this);
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

    return HistoryTableView;
});
