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
    var Storage = require('storageService');
    var SingletonUserStorage = require('storage/SingletonUserStorage');

    var Header = Backbone.View.extend({
        el: "#topHeader",

        events: {
            'click .user-projects a': 'changeProject',
            'click #userNavigator a': 'trackClick',
            'click .mem-set': 'updateMemSet',
            'click #logout': 'onClickLogout',
            'click [data-js-toogle-menu]': 'onClickMenuOpen',
        },

        initialize: function () {
            this.project = options.project;
            this.canDebug = options.canDebug;
            this.currentPage = options.currentPage;
            this.userModel = new UserModel();
        },

        render: function () {
            var ddEl= $("#projectSelector", this.$el);
            var self = this;
            var userAttributes = this.userModel.toJSON();
            this.$el.html(Util.templates(this.tpl, {
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
            $("#projectSelector", self.$el).on('shown.bs.dropdown', function () {
                var height = self.contentProjects.height();
                if (height > 280) {
                    height = 280;
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
            $("#projectSelector", self.$el)
                .on('hide.bs.dropdown', function () {
                        self.scrollerProjects.removeClass('open');
                        self.blockHeightProjects.removeClass('open').height(0);
                    }
                );
            return this;
        },

        onClickLogout: function (e) {
            e.preventDefault();
            this.userModel.logout();
        },

        trackClick: function (e) {
            var $link = $(e.currentTarget);
            if ($link.hasClass('user-id')) {
                config.trackingDispatcher.profilePage();
            } else if ($link.hasClass('admin-section')) {
                config.trackingDispatcher.adminPage();
            }
        },

        updateMemSet: function (e) {
            e.preventDefault();
            var $link = $(e.currentTarget);
            var $linkContainer = $link.parent();
            var linkText = $linkContainer.text().trim();

            if ( (linkText != 'Profile') && ($linkContainer.hasClass('active')) ) {
                return;
            }
            $linkContainer.addClass('active');
            config.router.navigate($link.attr('href'), {trigger: true});
        },

        clearMemSetState: function () {
            $('.rp-header-nav > .active', this.$el).removeClass('active');
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
            config.trackingDispatcher.projectChanged(project);
            config.router.navigate($el.attr('data-href'), {trigger: true});
        },
        onClickMenuOpen: function() {
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
});