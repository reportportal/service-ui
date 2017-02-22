/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var DashboardCollection = require('dashboard/DashboardCollection');
    var DashboardModel = require('dashboard/DashboardModel');
    var SelectDashboardItemView = require('modals/addWidget/SelectDashboardItemView');
    var Localization = require('localization');

    var SelectDashboardView = Epoxy.View.extend({
        className: 'modal-add-widget-select-dashboard',
        template: 'tpl-modal-add-widget-select-dashboard',
        events: {
            'click [data-js-dashboard-item]': 'setActiveDashboard',
        },
        initialize: function() {
            this.render();
        },
        render: function() {
            this.destroyItems();
            this.$el.html(Util.templates(this.template, {}));
            var self = this;
            this.$el.addClass('load');
            this.collection = new DashboardCollection({});
            this.collection.ready
                .done(function() {
                    self.$el.removeClass('load');
                    self.activate();
                });
            this.listenTo(this.collection, 'change:active', this.onChangeActive);
        },
        activate: function(){
            $('[data-js-dashboard-items]', this.$el).removeClass('hide');
            if(this.collection.isEmpty()){
                this.collection.add({id: _.uniqueId(), name: Localization.dashboard.firstDashboard, owner: config.userModel.get('name')});
                $('[data-js-auto-created]', this.$el).removeClass('hide');
            }
            var active = this.collection.first();
            active.set('active', true);
            this.renderItems();
        },
        renderItems: function(){
            this.destroyItems();
            _.each(this.collection.models, function(model){
                var item = new SelectDashboardItemView({model: model});
                $('[data-js-dashboard-items]', this.$el).append(item.$el);
                this.renderedItems.push(item);
            }, this);
        },
        destroyItems: function(){
            _.each(this.renderedItems, function(view){
                view && view.destroy();
            });
            this.renderedItems = [];
            $('[data-js-dashboard-items]', this.$el).empty();
        },
        setActiveDashboard: function(e){
            e.preventDefault();
            e.stopPropagation();
            var $el = $(e.currentTarget),
                id = $el.data('dashboardId'),
                model = this.collection.get(id);
            model.set('active', true);
        },
        onChangeActive: function(model){
            if(model.get('active')){
                this.trigger('change::dashboard', model);
            }
        },
        destroy: function() {
            this.destroyItems();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        }
    });

    return SelectDashboardView;
});
