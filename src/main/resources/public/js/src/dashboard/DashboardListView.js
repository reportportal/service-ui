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
define(function (require) {
    'use strict';

    var Util = require('util');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var ListView = require('dashboard/ListView');
    var BlockView = require('dashboard/BlockView');
    var SingletonAppStorage = require('storage/SingletonAppStorage');
    var config = App.getInstance();

    var DashboardListView = Epoxy.View.extend({
        className: 'dashboard-list-view',
        template: 'tpl-dashboards',
        events: {
            'validation:success [data-js-filter-name]': 'onChangeDashboardName',
            'click [data-js-add-dashboard]': 'onClickAddDashboard',
            'click [data-js-view-type]': 'changeDashboardsView'
        },
        bindings: {
            ':el': 'classes: {search: any(search)}',
            '[data-js-view-table]': 'classes: {active: isTable}',
            '[data-js-view-list]': 'classes: {active: not(isTable)}'
        },
        computeds: {
            isTable: {
                deps: ['dashboardView'],
                get: function (dashboardView) {
                    if (dashboardView === 'table') {
                        return true;
                    }
                    return false;
                }
            }
        },
        initialize: function () {
            var self = this;
            this.appStorage = new SingletonAppStorage();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    search: '',
                    dashboardView: 'table'
                }
            }));
            if (this.appStorage.get('dashboardView')) {
                this.model.set({ dashboardView: this.appStorage.get('dashboardView') });
            }
            this.render();
            this.collection.ready.done(function () {
                if (!self.collection.models.length) {
                    $('[data-js-filter-name]', self.$el).prop({ disabled: 'disabled' });
                }
                self.listenTo(self.collection, 'change:owner change:name reset', self.changeCollection);
                self.listenTo(self.collection, 'add', self.onAddCollection);
                self.listenTo(self.collection, 'remove', self.onRemoveCollection);
                self.changeCollection();
            });
            this.listenTo(this.model, 'change:search', this.onChangeSearch);
            this.listenTo(this.model, 'change:dashboardView', this.setDashboardView);
        },
        setDashboardView: function () {
            var curVal = this.model.get('dashboardView');
            this.appStorage.set({ dashboardView: curVal });
            this.changeCollection();
        },
        changeDashboardsView: function (event) {
            var $target = $(event.currentTarget);
            var dashboardView = $target.data('js-view-type');
            this.model.set('dashboardView', dashboardView);
        },
        onAddCollection: function () {
            $('[data-js-filter-name]', this.$el).prop({ disabled: null });
            this.changeCollection();
        },
        onRemoveCollection: function (model) {
            this.collection.remove(model);
            if (!this.collection.models.length) {
                this.changeCollection();
            }
        },
        changeCollection: function () {
            var tempCollection = new Backbone.Collection();
            var self = this;
            this.dashboardsView && this.onDestroy();
            _.each(this.collection.models, function (model) {
                if ((self.model.get('search') && ~model.get('name').toLowerCase().indexOf(self.model.get('search').toLowerCase())) || !self.model.get('search')) {
                    tempCollection.push(model);
                }
            });
            if (this.model.get('dashboardView') === 'list') {
                this.dashboardsView = new ListView({
                    collection: tempCollection,
                    search: this.model.get('search')
                });
            } else {
                this.dashboardsView = new BlockView({
                    collection: tempCollection,
                    search: this.model.get('search')
                });
            }
            $('[data-js-list-views]', this.$el).html(this.dashboardsView.$el);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                dashboardName: this.model.get('name'),
                projectName: config.project.projectId
            }));
            Util.hintValidator($('[data-js-filter-name]', this.$el), [{
                validator: 'minMaxNotRequired',
                type: 'dashboardName',
                min: 3,
                max: 128
            }]);
        },
        onClickAddDashboard: function () {
            config.trackingDispatcher.trackEventNumber(346);
            this.collection.createNewDashboard();
        },
        onChangeSearch: function () {
            config.trackingDispatcher.trackEventNumber(261);
        },
        onChangeDashboardName: function (e) {
            $(e.currentTarget).val($(e.currentTarget).val().trim());
            this.model.set({ search: $(e.currentTarget).val().trim() });
            this.changeCollection();
        },
        onDestroy: function () {
            this.dashboardsView.destroy();
        }
    });
    return DashboardListView;
});
