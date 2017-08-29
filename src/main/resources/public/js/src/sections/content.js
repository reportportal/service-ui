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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');

    // Main modules
    var Favorites = require('favorites/favorites');
    var LaunchPage = require('launches/LaunchPage');
    var LaunchDebugPage = require('launches/LaunchDebugPage');
    var DashboardPage = require('dashboard/DashboardPage');
    var ApiPage = require('apiPage/ApiPage');
    var ProjectSettingsPage = require('projectSettings/projectSettingsPage');
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
                this.$container = $('#dynamic-content', this.$el);
            }
            this.setupPageView(options);
            if (this.pageView.contextName === 'settings' || this.pageView.contextName === 'members' || this.isAdminPage) {
                this.$el.find('.rp-main-panel').addClass('mobile-without-content-header');
            }
            return this;
        },

        update: function (options) {
            if (this.page !== options.contextName || this.action !== options.action) {
                this.pageView.destroy();
                if (this.isAdminPage) {
                    this.page = options.page;
                    this.action = options.action;
                }
                this.setupPageView(options);
            } else {
                this.pageView.update(options);
            }
            if (this.isAdminPage || this.pageView.contextName === 'settings' || this.pageView.contextName === 'members') {
                this.$el.find('.rp-main-panel').addClass('mobile-without-content-header');
            } else {
                this.$el.find('.rp-main-panel').removeClass('mobile-without-content-header');
            }
        },

        setupPageView: function (opts) {
            var PageView;
            var self = this;
            var options = opts;
            if (this.isAdminPage) {
                this.page = options.page;
                PageView = this.getViewForAdministratePage(options);
                options.el = this.$container;
                options.header = $('#contentHeader', this.$el);
                this.pageView = new PageView(options).render();
            } else {
                this.page = options.contextName;
                PageView = this.getViewForPage(options.contextName);
                this.$header = $('#contentHeader', this.$el);
                this.$body = $('#dynamic-content', this.$el);
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
            };
        },

        getViewForPage: function (name) {
            switch (name) {
            case 'dashboard':
                return DashboardPage;
            case 'filters':
                return Favorites;
            case 'userdebug':
                return LaunchDebugPage;
            case 'launches':
                return LaunchPage;
            case 'members':
                return Member;
            case 'settings':
                return ProjectSettingsPage;
            case 'user-profile':
                return Profile;
            case 'info':
                return ProjectInfo;
            case 'api':
                return ApiPage;
            default:
                break;
            }
        },

        getViewForAdministratePage: function (options) {
            switch (options.page) {
            case 'users':
                return Users.ContentView;
            case 'settings':
                return Settings.ContentView;
            default:
                return Projects.ContentView;
            }
        },

        onDestroy: function () {
            this.pageView.destroy();
            this.$el.off().empty();
        }
    });

    return Content;
});
