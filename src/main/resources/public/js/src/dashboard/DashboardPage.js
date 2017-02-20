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


    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var DashboardHeaderView = require('dashboard/DashboardHeaderView');
    var DashboardBodyView = require('dashboard/DashboardBodyView');
    var DashboardCollection = require('dashboard/DashboardCollection');

    var config = App.getInstance();

    var DashboardPage = Epoxy.View.extend({
        initialize: function(options) {
            this.contextName = options.contextName; // for context check
            this.context = options.context;
            this.collection = new DashboardCollection({startId: options.subContext});
            this.header = new DashboardHeaderView({
                collection: this.collection,
            });
            this.body = new DashboardBodyView({
                collection: this.collection,
            });
            this.context.getMainView().$header.html(this.header.$el);
            this.context.getMainView().$body.html(this.body.$el);
            this.body.onShow && this.body.onShow();
        },
        update: function(options) {
            this.collection.resetActive();
            if (options.subContext) {
                if (this.collection.get(options.subContext)) {
                    this.collection.get(options.subContext).set({active: true});
                } else {
                    console.log('dashboard not found');
                }
            }
        },
        render: function() {
            return this;
        },
        destroy: function () {
            this.header.destroy();
            this.body.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return {
        ContentView: DashboardPage,
    }
});
