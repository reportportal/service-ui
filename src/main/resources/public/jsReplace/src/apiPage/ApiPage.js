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

    var Epoxy = require('backbone-epoxy');
    var ApiHeaderView = require('apiPage/ApiHeaderView');
    var ApiBodyView = require('apiPage/ApiBodyView');

    var ApiPage = Epoxy.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName; // for context check
            this.context = options.context;
            this.header = new ApiHeaderView();
            this.body = new ApiBodyView();
            this.context.getMainView().$header.html(this.header.$el);
            this.context.getMainView().$body.html(this.body.$el);
        },
        update: function () {},
        render: function () {
            return this;
        },
        onDestroy: function () {
            this.header.destroy();
            this.body.destroy();
            this.$el.html('');
        }
    });


    return {
        ContentView: ApiPage
    };
});
