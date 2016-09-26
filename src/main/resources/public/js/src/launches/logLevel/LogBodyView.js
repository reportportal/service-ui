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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var LogHistoryLine = require('launches/logLevel/LogHistoryLine');
    var LogItemInfoView = require('launches/logLevel/LogItemInfoView')

    var LogBodyView = Epoxy.View.extend({
        template: 'tpl-launch-log-body',

        initialize: function(options) {
            this.collectionItems = options.collectionItems;
            this.launchModel = options.launchModel;
            this.render();
            this.listenTo(this.collectionItems, 'change:log:item', this.onChangeLogItem);
            this.onChangeLogItem();
        },
        onChangeLogItem: function() {
            $('[data-js-log-item-container]',this.$el).addClass('load');
            this.history && this.off(this.history);
            this.historyItem && this.historyItem.destroy();
            this.history = new LogHistoryLine({
                el: $('[data-js-history-line]', this.$el),
                collectionItems: this.collectionItems,
                launchModel: this.launchModel,
            });
            this.listenTo(this.history, 'load:history', this.onLoadHistory);
            this.listenTo(this.history, 'activate:item', this.selectHistoryItem);
        },
        onLoadHistory: function() {
            $('[data-js-log-item-container]',this.$el).removeClass('load');
        },

        selectHistoryItem: function(itemModel) {
            if(this.historyItem) {
                this.historyItem.destroy();
            }
            this.historyItem = new LogItemInfoView({
                el: $('[data-js-item-info]', this.$el),
                itemModel: itemModel
            });
        },

        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },

        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return LogBodyView;

});