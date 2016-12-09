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
    var Localization = require('localization');
    var DashboardListItemView = require('dashboard/DashboardListItemView');
    var DashboardShareCollection

    var config = App.getInstance();

    var DashboardListView = Epoxy.View.extend({
        className: 'dashboard-list-view',
        template: 'tpl-dashboard-list',
        initialize: function(options) {
            this.render();
            this.myDashboardCollection = new Backbone.Collection();
            this.myDashboardViews = [];
            this.sharedDashboardCollectoin = new Backbone.Collection();
            this.sharedDashboardViews = [];
            var self = this;
            this.listenTo(this.myDashboardCollection, 'reset', this.renderMyDashboards);
            this.listenTo(this.sharedDashboardCollectoin, 'reset', this.renderSharedDashboards);
            this.collection.ready.done(function() {
                self.listenTo(self.collection, 'change:owner', self.changeCollection);
                self.changeCollection();
            })

        },
        changeCollection: function() {
            var myDashboards = [];
            var sharedDashboards = [];
            _.each(this.collection.models, function(model) {
                if (model.get('owner') == config.userModel.get('name')) {
                    myDashboards.push(model);
                } else {
                    sharedDashboards.push(model);
                }
            })
            this.myDashboardCollection.reset(myDashboards);
            this.sharedDashboardCollectoin.reset(sharedDashboards);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        renderMyDashboards: function() {
            _.each(this.myDashboardViews, function(view) { view.destroy(); })
            this.myDashboardViews = [];
            var self = this;
            _.each(this.myDashboardCollection.models, function(model) {
                var view = new DashboardListItemView({model: model})
                self.myDashboardViews.push(view);
                $('[data-js-my-dashboards-container]', self.$el).append(view.$el);
            })
        },
        renderSharedDashboards: function() {
            _.each(this.sharedDashboardViews, function(view) { view.destroy(); })
            this.sharedDashboardViews = [];
            var self = this;
            _.each(this.sharedDashboardCollectoin.models, function(model) {
                var view = new DashboardListItemView({model: model})
                self.sharedDashboardViews.push(view);
                $('[data-js-shared-dashboards-container]', self.$el).append(view.$el);
            })
        },

        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return DashboardListView;
});
