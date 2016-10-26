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

    // Main modules
    var Dashboard = require('dashboard');
    var Favorites = require('favorites');
    var Launch = require('launch');
    var LaunchPage = require('launches/LaunchPage');
    var Project = require('project');
    var ProjectInfo = require('projectinfo');
    var Member = require('member');
    var Profile = require('profile');

    //Administrate modules
    var Projects = require('projects');
    var Users = require('users');
    var Settings = require('settings');

    var Content = Backbone.View.extend({

        initialize: function (options) {
            this.isAdminPage = options.isAdminPage;
            if (this.isAdminPage) {
                this.$el = options.el;
                this.queryString = options.queryString;
            } else {
                this.container = options.container;
            }
        },

        tpl: 'tpl-container',
        adminTpl: 'tpl-admin-body',

        events: {
            'click #btt': 'scrollTop'
        },

        render: function (options) {
            if (this.isAdminPage) {
                this.$el.html(Util.templates(this.adminTpl));
                this.$container = $("#dynamicContent", this.$el);
            } else {
                this.container.append(this.$el.html(Util.templates(this.tpl)));
            }

            this.setupPageView(options);
            return this;
        },

        update: function (options) {
            if(this.page !== options.contextName || this.action !== options.action) {
                this.pageView.destroy();
                if (this.isAdminPage) {
                    this.page = options.page;
                    this.action = options.action;
                }
                this.setupPageView(options);
            } else {
                this.pageView.update(options);
            }
        },

        setupPageView: function (options) {
            if (this.isAdminPage) {
                this.page = options.page;
                var pageView = this.getViewForAdministratePage(options);
                options['el'] = this.$container;
                this.pageView = new pageView(options).render();
            } else {
                this.page = options.contextName;
                var PageView = this.getViewForPage(options.contextName);
                this.$header = $('#contentHeader', this.$el);
                this.$body = $('#dynamic-content', this.$el);
                var self = this;

                this.pageView = new PageView.ContentView({
                    contextName: options.contextName,
                    context: this.getAppProp(self),
                    subContext: options.subContext,
                    queryString: options.queryString
                });
                this.pageView.render();
            }
        },

        getAppProp: function (context) {
            var mainView = context;
            return {
                getMainView: function () {
                    return mainView;
                }
            }
        },

        getViewForPage: function (name) {
            switch (name) {
                case "dashboard":
                    return Dashboard;
                    break;
                case "filters":
                    return Favorites;
                    break;
                case "launches":
                case "userdebug":
                    return Launch;
                    break;
                case "newlaunches":
                    return LaunchPage;
                    break;
                case "members":
                    return Member;
                    break;
                case "settings":
                    return Project;
                    break;
                case "user-profile":
                    return Profile;
                    break;
                case "info":
                    return ProjectInfo;
                    break;
                default:
                    break;
            }
        },

        getViewForAdministratePage: function (options) {
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

        scrollTop: function () {
            $('body,html').animate({
                scrollTop: 0
            }, 100);
            return false;
        },

        destroy: function () {
            this.pageView.destroy();
            this.$el.off().empty();
        }
    });

    return Content;
});