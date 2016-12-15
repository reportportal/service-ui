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
    var DashboardListView = require('dashboard/DashboardListView');
    var DashboardItemView = require('dashboard/DashboardItemView');
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();

    var DashboardBodyView = Epoxy.View.extend({
        className: 'dashboard-body',
        template: 'tpl-dashboard-body',
        events: {
        },
        initialize: function(options) {
            this.onShowAsync = $.Deferred();
            this.$el.addClass('load');
            this.render();
            this.$container = $('[data-js-dashboard-content]', this.$el);
            this.content = null;
            var self = this;
            this.listenTo(this.collection, 'reset:active', this.activate);
            this.listenTo(this.collection, 'change:active', this.onChangeActive);
            this.collection.ready
                .done(function() {
                    self.$el.removeClass('load');
                    self.activate();
                })
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onShow: function() {
            this.onShowAsync.resolve();
        },
        onChangeActive: function(model, active) {
            if(active) {
                this.activate();
            }
        },
        activate: function() {
            var activeDashboard = this.collection.where({active: true});
            this.content && this.content.destroy();
            if (!activeDashboard.length) {
                this.content = new DashboardListView({
                    collection: this.collection,
                })
            } else {
                this.content = new DashboardItemView({
                    model: activeDashboard[0],
                })
            }
            this.$container.html(this.content.$el);
            var self = this;
            this.onShowAsync.done(function() {
                self.content.onShow && self.content.onShow();
            })
        },

        destroy: function () {
            this.content && this.content.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return DashboardBodyView;
});
