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
    var Dashboard = require('dashboard/dashboard-view');
    var Favorites = require('favorites/favorites');
    var Launch = require('launch');
    var LaunchPage = require('launches/LaunchPage');
    var LaunchDebugPage = require('launches/LaunchDebugPage');
    var DashboardPage = require('dashboard/DashboardPage');
    var Project = require('project');
    var ProjectInfo = require('projectinfo');
    var Member = require('projectMembers/MembersPageView');
    var Profile = require('userProfile/UserProfilePage');

    // Administrate modules
    var Projects = require('adminProjects/ProjectsPageView');
    var Users = require('adminUsers/UsersPageView');
    var Settings = require('adminServerSettings/ServerSettingsPageView');

    var Content = Backbone.View.extend({

        initialize: function (options) {
            this.isAdminPage = options.isAdminPage;
            this.$el = options.el;
            if (this.isAdminPage) {
                this.queryString = options.queryString;
            }
        },

        tpl: 'tpl-container',

        render: function (options) {
            this.$el.html(Util.templates(this.tpl));
            if (this.isAdminPage) {
                this.$container = $("#dynamic-content", this.$el);
            }
            this.setupPageView(options);
            if (this.pageView.contextName === 'settings' || this.isAdminPage) {
                this.$el.find('.rp-main-panel').addClass('mobile-without-content-header');
            }
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

            (this.isAdminPage || this.pageView.contextName === 'settings') ?
                this.$el.find('.rp-main-panel').addClass('mobile-without-content-header') :
                this.$el.find('.rp-main-panel').removeClass('mobile-without-content-header');
        },

        setupPageView: function (options) {
            if (this.isAdminPage) {
                this.page = options.page;
                var PageView = this.getViewForAdministratePage(options);
                options['el'] = this.$container;
                options['header'] = $('#contentHeader', this.$el);
                this.pageView = new PageView(options).render();
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
                case "newdashboard":
                    return DashboardPage;
                    break;
                case "filters":
                    return Favorites;
                    break;
                case "launches":
                case "userdebug":
                    return LaunchDebugPage;
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
            } else if (options.page === 'settings') {
                return Settings.ContentView;
            } else {
                return Projects.ContentView;
            }
        },

        destroy: function () {
            this.pageView.destroy();
            this.$el.off().empty();
            this.undelegateEvents();
            this.stopListening();
        }
    });

    return Content;
});
