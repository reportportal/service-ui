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
    var Components = require('core/components');

    var config = App.getInstance();

    var LaunchSuiteTestItemsView = Epoxy.View.extend({
        template: 'tpl-launch-suite-step-items',

        initialize: function(options) {
            this.itemView = options.itemView;
            this.filterModel = options.filterModel;
            this.listenTo(this.collection, 'reset', this.renderItems);
            this.listenTo(this.collection, 'loading', this.onLoadingCollection);
            this.render();
            this.renderedItems = [];
            this.pagingModel = new Backbone.Model();

            this.paging = new Components.PagingToolbar({
                el: $('[data-js-paginate-container]', this.$el),
                model: this.pagingModel,
            });
            this.renderItems();

            this.listenTo(this.paging, 'page', this.onChangePage);
            this.listenTo(this.paging, 'count', this.onChangePageCount);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onLoadingCollection: function(state) {
            if(state) {
                $('[data-js-preloader]',self.$el).addClass('rp-display-block');
                this.paging.$el.addClass('hide');
                return;
            }
            $('[data-js-preloader]',self.$el).removeClass('rp-display-block');
            this.paging.$el.removeClass('hide');
        },
        onChangePage: function(page) {
            this.collection.setPaging(page);
        },
        onChangePageCount: function(count) {
            this.collection.setPaging(1, count);
        },
        renderItems: function() {
            var $itemsContainer = $('[data-js-launches-container]', this.$el);
            $itemsContainer.html('');
            var self = this;
            _.each(self.collection.models, function(model) {
                var item = new self.itemView({model: model})
                $itemsContainer.append(item.$el);
                self.renderedItems.push(item);
            });
            this.pagingModel.set(this.collection.pagingData);
            this.paging.render();
        },
        destroy: function () {
            while(this.renderedItems.length) {
                this.renderedItems.pop().destroy();
            }
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        },
    });


    return LaunchSuiteTestItemsView;
});
