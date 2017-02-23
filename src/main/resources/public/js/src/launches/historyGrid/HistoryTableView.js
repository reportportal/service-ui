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
    var HistoryItemView = require('launches/historyGrid/HistoryItemView');
    var App = require('app');
    require('baron');

    var config = App.getInstance();

    var HistoryTableView = Epoxy.View.extend({
        template: 'tpl-launch-history-table',
        events: { },
        initialize: function(options) {
            this.filterModel = options.filterModel;
            this.launches = options.launches;
            this.items = options.items;
            this.renderedItems = [];
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                launches: this.launches.toJSON()
            }));
            this.renderItems();
            $('[data-js-history-scroll]', this.$el).baron({direction: 'h'});
        },
        renderItems: function() {
            var $itemsContainer = $('[data-js-history-content]', this.$el);
            _.each(this.items.models, function(model) {
                var item = new HistoryItemView({model: model, launches: this.launches});
                $itemsContainer.append(item.$el);
                this.renderedItems.push(item);
            }, this);
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
        },
    });

    return HistoryTableView;
});
