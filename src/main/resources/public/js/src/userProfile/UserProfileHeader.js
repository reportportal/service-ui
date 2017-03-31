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
    var Components = require('core/components');
    var Util = require('util');

    var UserProfileHeader = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.header;
            this.vent = options.vent;
            this.context = options.context;
        },

        tpl: 'tpl-user-page-header',

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            return this;
        },

        clearActives: function () {
            $("#main_content #topHeader").find(".active").removeClass('active');
        },

        destroy: function () {
            this.$el.empty();
            this.clearActives();
            this.undelegateEvents();
            this.unbind();
            delete this;
        }
    });

    return UserProfileHeader;
});
