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

    var config = App.getInstance();

    var DashboardListView = Epoxy.View.extend({
        className: 'dashboard-list-view',
        template: 'tpl-dashboard-list',
        events: {
            'validation:success [data-js-filter-name]': 'onChangeDashboardName',
            'click [data-js-add-dashboard]': 'onClickAddDashboard',
        },
        bindings: {
            '[data-js-search-text]': 'text: search',
            ':el': 'classes: {search: any(search)}',
        },
        initialize: function() {
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    search: '',
                }
            }));
            this.render();
            this.myDashboardCollection = new Backbone.Collection();
            this.myDashboardViews = [];
            this.sharedDashboardCollectoin = new Backbone.Collection();
            this.sharedDashboardViews = [];
            var self = this;
            this.listenTo(this.myDashboardCollection, 'reset', this.renderMyDashboards);
            this.listenTo(this.sharedDashboardCollectoin, 'reset', this.renderSharedDashboards);
            this.collection.ready.done(function() {
                if (!self.collection.models.length) {
                    $('[data-js-filter-name]', self.$el).prop({disabled: 'disabled'});
                }
                self.listenTo(self.collection, 'change:owner change:name reset', self.changeCollection);
                self.listenTo(self.collection, 'add', self.onAddCollection);
                self.listenTo(self.collection, 'remove', self.onRemoveCollection);
                self.changeCollection();
            })

        },
        onAddCollection: function() {
            $('[data-js-filter-name]', this.$el).prop({disabled: null});
            this.changeCollection();
        },
        onRemoveCollection: function(model) {
            this.myDashboardCollection.remove(model);
            if(!this.myDashboardCollection.models.length) {
                this.changeCollection();
            }
        },
        changeCollection: function() {
            $('[data-js-dashboard-not-found]', this.$el).removeClass('rp-display-block');
            $('[data-js-shared-dashboard-not-found]', this.$el).removeClass('rp-display-block');
            var myDashboards = [];
            var sharedDashboards = [];
            var self = this;
            _.each(this.collection.models, function(model) {
                if((self.model.get('search') && ~model.get('name').toLowerCase().indexOf(self.model.get('search').toLowerCase())) || !self.model.get('search')) {
                    if (model.get('owner') == config.userModel.get('name')) {
                        myDashboards.push(model);
                    } else {
                        sharedDashboards.push(model);
                    }
                }
            })
            this.myDashboardCollection.reset(myDashboards);
            this.sharedDashboardCollectoin.reset(sharedDashboards);
            if(!myDashboards.length) $('[data-js-dashboard-not-found]', this.$el).addClass('rp-display-block');
            if(!sharedDashboards.length) $('[data-js-shared-dashboard-not-found]', this.$el).addClass('rp-display-block');
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            Util.hintValidator($('[data-js-filter-name]', this.$el), [{
                validator: 'minMaxNotRequired',
                type: 'dashboardName',
                min: 3,
                max: 128
            }]);
        },
        onClickAddDashboard: function() {
            this.collection.createNewDashboard();
        },
        onChangeDashboardName: function (e) {
            $(e.currentTarget).val($(e.currentTarget).val().trim());
            this.model.set({search: $(e.currentTarget).val().trim()});
            this.changeCollection();
        },
        renderMyDashboards: function() {
            _.each(this.myDashboardViews, function(view) { view.destroy(); });
            this.myDashboardViews = [];
            this.myDashboardCollection.models = this.sortDashboardCollectionByASC(this.myDashboardCollection.models);
            var self = this;
            _.each(this.myDashboardCollection.models, function(model) {
                var view = new DashboardListItemView({model: model, viewModel: self.model})
                self.myDashboardViews.push(view);
                $('[data-js-my-dashboards-container]', self.$el).append(view.$el);
            });
        },
        renderSharedDashboards: function() {
            _.each(this.sharedDashboardViews, function(view) { view.destroy(); })
            this.sharedDashboardViews = [];
            this.sharedDashboardCollectoin.models = this.sortDashboardCollectionByASC(this.sharedDashboardCollectoin.models);
            var self = this;
            _.each(this.sharedDashboardCollectoin.models, function(model) {
                var view = new DashboardListItemView({model: model});
                self.sharedDashboardViews.push(view);
                $('[data-js-shared-dashboards-container]', self.$el).append(view.$el);
            })
        },
        sortDashboardCollectionByASC: function (collection) {
            return _.sortBy(collection, function (item) {
                return item.get('name').toUpperCase();
            });
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
