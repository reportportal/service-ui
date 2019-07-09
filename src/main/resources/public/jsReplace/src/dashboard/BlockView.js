/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var Util = require('util');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var DashboardListItemView = require('dashboard/DashboardListItemView');

    var config = App.getInstance();

    var BlockView = Epoxy.View.extend({
        className: 'dashboard-list-view-table',
        template: 'tpl-dashboards-table',
        initialize: function (options) {
            this.search = options.search;
            this.render();
            this.myDashboardCollection = new Backbone.Collection();
            this.myDashboardViews = [];
            this.sharedDashboardCollectoin = new Backbone.Collection();
            this.sharedDashboardViews = [];
            this.listenTo(this.myDashboardCollection, 'reset', this.renderMyDashboards);
            this.listenTo(this.sharedDashboardCollectoin, 'reset', this.renderSharedDashboards);
            $('[data-js-dashboard-not-found]', this.$el).removeClass('rp-display-block');
            $('[data-js-shared-dashboard-not-found]', this.$el).removeClass('rp-display-block');
            var myDashboards = [];
            var sharedDashboards = [];
            var self = this;
            _.each(this.collection.models, function (model) {
                if (model.get('owner') == config.userModel.get('name')) {
                    myDashboards.push(model);
                } else {
                    sharedDashboards.push(model);
                }
            });
            this.myDashboardCollection.reset(myDashboards);
            this.sharedDashboardCollectoin.reset(sharedDashboards);
            if (!myDashboards.length) $('[data-js-dashboard-not-found]', this.$el).addClass('rp-display-block');
            if (!sharedDashboards.length) $('[data-js-shared-dashboard-not-found]', this.$el).addClass('rp-display-block');
        },
        render: function () {
            this.$el.html(Util.templates(this.template, { search: this.search }));
        },
        renderMyDashboards: function () {
            _.each(this.myDashboardViews, function (view) { view.destroy(); });
            this.myDashboardViews = [];
            this.myDashboardCollection.models = this.sortDashboardCollectionByASC(this.myDashboardCollection.models);
            var self = this;
            _.each(this.myDashboardCollection.models, function (model) {
                var view = new DashboardListItemView({ model: model, blockTemplate: true });
                self.myDashboardViews.push(view);
                $('[data-js-my-dashboards-container]', self.$el).append(view.$el);
            });
        },
        renderSharedDashboards: function () {
            _.each(this.sharedDashboardViews, function (view) { view.destroy(); });
            this.sharedDashboardViews = [];
            this.sharedDashboardCollectoin.models = this.sortDashboardCollectionByASC(this.sharedDashboardCollectoin.models);
            var self = this;
            _.each(this.sharedDashboardCollectoin.models, function (model) {
                var view = new DashboardListItemView({ model: model, blockTemplate: true });
                self.sharedDashboardViews.push(view);
                $('[data-js-shared-dashboards-container]', self.$el).append(view.$el);
            });
        },
        sortDashboardCollectionByASC: function (collection) {
            return _.sortBy(collection, function (item) {
                return item.get('name').toUpperCase();
            });
        },

        onDestroy: function () {
            _.each(this.myDashboardViews, function (view) {
                view.destroy();
            });
            _.each(this.sharedDashboardViews, function (view) {
                view.destroy();
            });
        }
    });


    return BlockView;
});
