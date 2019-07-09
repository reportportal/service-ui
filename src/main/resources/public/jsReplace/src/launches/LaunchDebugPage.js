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
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var LaunchBodyView = require('launches/LaunchBodyView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var config = App.getInstance();


    var LaunchDebugPage = Epoxy.View.extend({
        initialize: function(options) {
            this.contextName = options.contextName; // for context check
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.context = options.context;
            this.body = new LaunchBodyView({
                el: this.context.getMainView().$body,
                context: this.contextName
            });
            this.listenTo(this.body, 'change:level', this.onChangeLevel);
            this.update({subContext: options.subContext});
        },
        render: function() {
            return this;
        },

        update: function(options) {
            var pathPart = ['all'];
            this.launchFilterCollection.activateFilter('all');
            var query = options.subContext[3];
            if(options.subContext[2]) {
                pathPart =  pathPart.concat(options.subContext[2].split('/'));
            }
            this.body.update(pathPart, query);
        },

        destroy: function () {
            this.body.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return {
        ContentView: LaunchDebugPage,
    }
});
