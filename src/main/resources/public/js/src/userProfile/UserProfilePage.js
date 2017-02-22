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
    var App = require('app');
    var Components = require('core/components');
    var UserProfileHeader = require('userProfile/UserProfileHeader');
    var UserProfileView = require('userProfile/UserProfileView');

    var config = App.getInstance();

    var UserProfilePage = Components.BaseView.extend({
        initialize: function(options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.vent = _.extend({}, Backbone.Events);
        },
        render: function() {
            this.createHeader();
            this.createBody();
            return this;
        },
        createHeader: function (model) {
            if (this.$header) {
                this.$header.destroy();
            }
            this.$header = new UserProfileHeader({
                header: this.context.getMainView().$header,
                vent: this.vent,
                context: this.context
            }).render();
        },

        createBody: function (model) {
            if (this.$body) {
                this.$body.destroy();
            }
            this.$body = new UserProfileView({
                body: this.context.getMainView().$body,
                vent: this.vent,
                context: this.context
            });
        },
        destroy: function () {
            this.$header.destroy();
            this.$body.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    return {
        ContentView: UserProfilePage
    };
});
