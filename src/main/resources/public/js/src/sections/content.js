/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
    "use strict";
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Projects = require('projects');
    var Users = require('users');
    var Settings = require('settings');

    var Content = Backbone.View.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.queryString = options.queryString;
        },

        shellTpl: 'tpl-admin-body',
        buttonsTpl: 'tpl-admin-menu',

        render: function (options) {
            this.$el.html(Util.templates(this.shellTpl));
            this.$container = $("#dynamicContent", this.$el);
            this.setupPageView(options);
            return this;
        },

        update: function (options) {
            if(this.page !== options.page || this.action !== options.action) {
                this.pageView.destroy();
                this.page = options.page;
                this.action = options.action;
                this.setupPageView(options);
            } else {
                this.pageView.update(options);
            }
        },

        setupPageView: function (options) {
            this.page = options.page;
            var pageView = this.getViewForPage(options);

            options['el'] = this.$container;
            this.pageView = new pageView(options).render();
        },

        getViewForPage: function (options) {
            if (options.page === 'users') {
                return Users.ContentView;
            } else if (options.page === 'project-details') {
                return Projects.ProjectDetails;
            } else if (options.page === 'settings') {
                return Settings.ContentView;
            } else {
                var key = options.page + '-' + options.action;
                switch (key) {
                    case "projects-add":
                    case "projects-settings":
                    case "projects-members":
                        return Projects.Project;
                        break;
                    default:
                        return Projects.List;
                        break;
                }
            }
        },

        destroy: function () {
            this.pageView.destroy();
            this.$el.off().empty();
        }
    });

    return Content;
});