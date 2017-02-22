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
    var Epoxy = require('backbone-epoxy');
    var MainBreadcrumbsComponent = require('components/MainBreadcrumbsComponent');
    var DashboardHeaderListItemView = require('dashboard/DashboardHeaderListItemView');
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();

    var DashboardHeaderView = Epoxy.View.extend({
        className: 'dashboard-header',
        template: 'tpl-dashboard-header',

        events: {
            'click [data-js-add-dashboard]': 'onClickAddDashboard',
        },

        initialize: function(options) {
            this.render();
            this.listenModel = null;
            this.mainBreadcrumbs = new MainBreadcrumbsComponent({
                data: [
                    {name: Localization.dashboard.allDashboards, link: this.collection.defaultPath}
                ]
            });
            $('[data-js-main-breadcrumbs]', this.$el).append(this.mainBreadcrumbs.$el);
            var self = this;
            this.collection.ready.done(function() {
                self.listenTo(self.collection, 'change:active', self.onChangeActive);
                self.listenTo(self.collection, 'reset:active', self.changeActive);
                self.activateDashboardList();
                self.changeActive();
            })
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        activateDashboardList: function() {
            var self = this;
            _.each(this.collection.models, function(model) {
                var view = new DashboardHeaderListItemView({model: model});
                $('[data-js-dashboard-list-mobile]', self.$el).append(view.$el);
            })
        },
        onClickAddDashboard: function(e) {
            this.collection.createNewDashboard();
        },
        onChangeActive: function(model, active) {
            if (active) {
                this.changeActive();
            }
        },
        changeActive: function() {
            var activeDashboard = this.collection.where({active: true});
            var breadcrumbsData = [{name: Localization.dashboard.allDashboards, link: this.collection.defaultPath}];
            this.listenModel && this.stopListening(this.listenModel);
            if(activeDashboard.length) {
                this.listenModel = activeDashboard[0];
                $('[data-js-active-dashboard]', this.$el).text(this.listenModel.get('name'));
                breadcrumbsData.push({name: this.listenModel.get('name'), link: ''});
                var self = this;
                this.listenTo(this.listenModel, 'change:name', function(model, name) {
                    self.mainBreadcrumbs.collection.models[1].set({name: name});
                    $('[data-js-active-dashboard]', self.$el).text(name);
                })
            } else {
                $('[data-js-active-dashboard]', this.$el).text(Localization.dashboard.allDashboards);
            }
            this.mainBreadcrumbs.collection.reset(breadcrumbsData);
        },

        destroy: function () {
            this.mainBreadcrumbs && this.mainBreadcrumbs.destroy();
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return DashboardHeaderView;
});
