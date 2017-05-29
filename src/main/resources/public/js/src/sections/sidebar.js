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
    var Storage = require('storageService');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var App = require('app');

    var config = App.getInstance();

    var SideBar = Backbone.View.extend({
        el: '#pageSidebar',

        events: {
            'click .main-menu a': 'onClickSidebarLink',
            'click .user-menu a': 'closeMenu',
            'click [data-js-sidebar-close]': 'closeMenu',
            'click [data-js-administrate-page-link]': 'setLastActivePage',
            'click [data-js-logout]': 'onClickLogout',
            'click [global-back-top]': 'onClickToTop'
        },

        initialize: function (options) {
            this.tpl = options.tpl;
            this.lastURL = options.lastURL;
            this.projectUrl = options.projectUrl;
            this.currentPage = options.currentPage;
            this.canDebug = Util.isAdmin() || !Util.isCustomer();
            this.currentHash = '#' + Backbone.history.getFragment().split('?')[0].split('/', 2).join('/');
            this.listenTo(config.router, 'route', this.updateActiveLink);

            this.userStorage = new SingletonUserStorage();
        },

        setupAnchors: function () {
            this.$bodyElement = $('body');
        },

        render: function () {
            var self = this;
            var param = {
                projectUrl: this.projectUrl,
                userLogin: Storage.getDebugUser() || config.userModel.get('name'),
                canDebug: this.canDebug,
                isAdmin: Util.isAdmin(config.userModel.toJSON()),
                lastActive: this.getLastActive(),
                lastURL: this.lastURL
            };
            this.$el.html(Util.templates(this.tpl, param)).show();
            this.setupAnchors();
            this.updateActiveLink();
            Util.setupBaronScroll(this.$el.find('[data-js-scroll-container]'));
            $(window)
                .off('resize.sidebar')
                .on('resize.sidebar', function () {
                    if (window.innerWidth >= 768 && self.$bodyElement.hasClass('menu-open')) {
                        self.closeMenu();
                    }
                });
            return this;
        },
        onClickToTop: function () {
            config.trackingDispatcher.trackEventNumber(350);
        },
        setLastActivePage: function () {
            var page = Backbone.history.getFragment();
            (page === 'user-profile') ? this.userStorage.set('lastActiveURL', this.projectUrl) : this.userStorage.set('lastActiveURL', page);
        },

        updateActiveLink: function () {
            this.clearActives();
            this.currentHash = '#' + Backbone.history.getFragment().split('?')[0].split('/', 2).join('/');
            if (this.currentHash === '#' + this.projectUrl) {
                this.currentHash += '/dashboard';
            }
            if (this.currentHash === '#' + this.projectUrl + '/') {
                this.currentHash += 'dashboard';
            }
            if (this.currentHash === '#administrate') {
                this.currentHash += '/projects';
            }
            if (this.currentHash === '#administrate/project-details') {
                this.currentHash = '#administrate/projects';
            }
            this.$el.find('a[href^="' + this.currentHash + '"]', this.$el).addClass('active');
        },

        getLastActive: function () {
            var lastActive = '';
            var lastActiveFromStorage = this.userStorage.get('lastActiveURL');
            if (lastActiveFromStorage) {
                lastActive = lastActiveFromStorage;
            }
            return lastActive;
        },
        onClickSidebarLink: function (e) {
            e.preventDefault();
            switch ($(e.currentTarget).attr('id')) {
            case 'dashboard': {
                config.trackingDispatcher.trackEventNumber(1);
                break;
            }
            case 'filters': {
                config.trackingDispatcher.trackEventNumber(2);
                break;
            }
            case 'userdebug': {
                config.trackingDispatcher.trackEventNumber(3);
                break;
            }
            case 'projectsSection': {
                config.trackingDispatcher.trackEventNumber(502);
                break;
            }
            case 'usersSection': {
                config.trackingDispatcher.trackEventNumber(503);
                break;
            }
            case 'settingsSection': {
                config.trackingDispatcher.trackEventNumber(504);
                break;
            }
            default: {
                break;
            }
            }

            this.closeMenu();
            config.router.navigate($(e.currentTarget).attr('href'), { trigger: true });
        },
        closeMenu: function () {
            this.$bodyElement.removeClass('menu-open');
        },

        clearActives: function () {
            $('a.active', this.$el).removeClass('active');
        },
        onClickLogout: function (e) {
            e.preventDefault();
            e.stopPropagation();
            config.userModel.logout();
        },

        onDestroy: function () {
            $(window).off('resize.sidebar');
            this.$el.html('');
            delete this;
        }
    });

    return SideBar;
});
