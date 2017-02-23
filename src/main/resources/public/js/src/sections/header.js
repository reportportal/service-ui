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
    var UserModel = require('model/UserModel');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var SingletonAppModel = require('model/SingletonAppModel');
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();



    var Header = Backbone.View.extend({
        el: "#topHeader",

        events: {
            'click .user-projects a': 'changeProject',
            'click #logout': 'onClickLogout',
            'click [data-js-toogle-menu]': 'onClickMenuOpen',
            'click [data-js-administrate-page-link]': 'onClickAdminLink',
            'click [data-js-members-icon]': 'onClickMembersIcon',
            'click [data-js-settings-icon]': 'onClickSettingsIcon',
            'click [data-js-user-dropdown]': 'onClickUserDropdown',
            'click [data-js-profile-page-link]': 'onClickProfileLink',
            'click [data-js-project-dropdown]': 'onClickProjectDropdown'
        },

        initialize: function (options) {
            this.tpl = options.tpl;
            this.lastURL = options.lastURL;
            this.currentPage = options.currentPage;
            this.isAdminPage = options.isAdminPage;
            this.appModel = new SingletonAppModel();
            this.project = this.appModel.attributes;
            this.canDebug = Util.isAdmin() || !Util.isCustomer();
            this.userModel = new UserModel();
            this.userStorage = new SingletonUserStorage();

            this.listenTo(config.router, "route", this.updateActiveLink);
        },

        update: function (options) {
            if(this.currentPage !== options.contextName) {
                if (options.contextName === 'project-details') {
                    this.$el.find('[data-js-admin-header-crumb]').html(' / ' + this.getCrumbPart('projects'));
                    return;
                }
                this.$el.find('[data-js-admin-header-crumb]').html(' / ' + this.getCrumbPart(options.contextName));
                this.currentPage = options.contextName;
            }
        },

        getCrumbPart: function (page) {
            switch (page) {
                case 'projects':
                    return Localization.admin.titleAllProjects;
                    break;
                case 'users':
                    return Localization.admin.users;
                case 'settings':
                    return Localization.admin.serverSettings;
                    break;
            }
        },

        render: function () {
            var self = this;
            var userAttributes = this.userModel.toJSON();
            this.$el.html(Util.templates(this.tpl, {
                lastURL: this.lastURL,
                project: this.project,
                currentPage: this.currentPage,
                projects: _.keys(this.userModel.get('projects')).sort(),
                user: userAttributes,
                isAdmin: Util.isAdmin(userAttributes),
                canDebug: this.canDebug,
                util: Util,
            })).show();
            this.contentProjects = $('.user-projects', this.$el);
            this.scrollerProjects = Util.setupBaronScroll(this.contentProjects);
            this.blockHeightProjects = this.scrollerProjects.parent('.baron__root');
            this.$el.find('#projectSelector a[data-href="' + this.project.projectId + '"]').parent().addClass('active'); // highlightes selected project in dropdown-list
            this.updateActiveLink();

            $("#projectSelector", self.$el).on('shown.bs.dropdown', function () {
                var height = self.contentProjects.height();
                if (height > 607) {
                    height = 607;
                    self.blockHeightProjects.addClass('_scrollbar');
                }
                self.blockHeightProjects.height(height)
                    .width(self.contentProjects.width())
                    .addClass('open');
                self.scrollerProjects.addClass('open');

                var currentProject = $('#project-' + self.project.projectId);
                if (currentProject.length) {
                    self.scrollerProjects.scrollTop(currentProject.position().top - 40);
                }
            });

            $("#projectSelector", self.$el).on('hide.bs.dropdown', function () {
                self.scrollerProjects.removeClass('open');
                self.blockHeightProjects.removeClass('open').height(0);
            });

            if (this.isAdminPage) {
                if (this.currentPage === 'project-details') {
                    this.$el.find('[data-js-admin-header-crumb]').html(' / ' + this.getCrumbPart('projects'));
                } else {
                    this.$el.find('[data-js-admin-header-crumb]').html(' / ' + this.getCrumbPart(this.currentPage));
                }
            }

            return this;
        },

        setLastActivePage: function () {
            var page = Backbone.history.getFragment();
            (page == "user-profile") ? this.userStorage.set('lastActiveURL', this.project.projectId) : this.userStorage.set('lastActiveURL', page);
        },

        onClickLogout: function (e) {
            config.trackingDispatcher.trackEventNumber(9);
            e.preventDefault();
            e.stopPropagation();
            this.userModel.logout();
        },
        onClickMembersIcon: function() {
            config.trackingDispatcher.trackEventNumber(4);
        },
        onClickSettingsIcon: function() {
            config.trackingDispatcher.trackEventNumber(5);
        },
        onClickUserDropdown: function() {
            config.trackingDispatcher.trackEventNumber(6);
        },
        onClickProfileLink: function() {
            config.trackingDispatcher.trackEventNumber(7);
        },
        onClickAdminLink: function() {
            config.trackingDispatcher.trackEventNumber(8);
            this.setLastActivePage();
        },
        onClickProjectDropdown: function() {
            config.trackingDispatcher.trackEventNumber(10);
        },

        updateActiveLink: function () {
            this.clearActives();
            this.currentHash = "#" + Backbone.history.getFragment().split('?')[0].split('/', 2).join('/');
            if (this.currentHash === "#" + this.project.projectId) {
                this.currentHash += "/dashboard";
            }
            if (this.currentHash === "#" + this.project.projectId + "/") {
                this.currentHash += "dashboard";
            }
            if (this.currentHash === "#administrate") {
                this.currentHash += "/projects";
            }
            this.$el.find('a[href^="' + this.currentHash + '"]', this.$el).addClass('active');
            this.$el.find('#projectSelector a[data-href="' + this.project.projectId + '"]').parent().addClass('active'); // highlightes selected project in dropdown-list
        },

        clearActives: function () {
            $("a.active", this.$el).removeClass('active');
        },

        openTopMenuItem: function (e) {
            e.preventDefault();

            var $el = $(e.currentTarget);
            config.router.navigate($el.attr('href'), {trigger: true});
        },

        changeProject: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            var project = $el.attr('data-href');
            if ($el.parent().hasClass('active')) {
                return;
            }
            config.userModel.updateDefaultProject(project);
            config.userModel.set('bts', null);
            config.trackingDispatcher.trackEventNumber(11);
            config.router.navigate($el.attr('data-href'), {trigger: true});
        },

        onClickMenuOpen: function () {
            $('body').toggleClass('menu-open');
        },

        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    return Header;
});
