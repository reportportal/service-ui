/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var Context = require('context');
    var App = require('app');
    var TestRoute = require('TestRoute');
    var UserModel = require('model/UserModel');
    var SingletonUserStorage = require('storage/SingletonUserStorage');

    var config = App.getInstance();
    var userStorage = new SingletonUserStorage();
    var testRoute = new TestRoute();

    var Router = Backbone.Router.extend({
        initialize: function () {
            var self = this;
            this.context = Context;
            this.user = new UserModel();

            testRoute.addTest('insidePage', function () {
                var async = $.Deferred();
                self.user.isAuth()
                    .done(function () {
                        // self.landingController.hideLanding();
                        async.resolve();
                        self.user.set({ lastInsideHash: window.location.hash });
                    })
                    .fail(function () {
                        if (window.location.hash.indexOf('registration') >= 0) {
                            self.navigate(window.location.hash, { trigger: true });
                        } else {
                            self.user.set({ lastInsideHash: window.location.hash });
                            self.navigate('login', { trigger: true });
                        }
                    });
                return async.promise();
            });
            testRoute.addTest('outsidePage', function () {
                var async = $.Deferred();
                self.user.isAuth()
                    .done(function () {
                        self.navigate(self.user.get('lastInsideHash'), { trigger: true });
                    })
                    .fail(function () {
                        async.resolve();
                    });
                return async.promise();
            });

            // this.landingController = new LandingController();

            this.user.ready.done(function () {
                self.listenTo(self.user, 'change:auth', self.onChangeUserAuth.bind(self));
            });
        },
        onChangeUserAuth: function (model, auth) {
            if (auth) {
                outdatedBrowser({
                    bgColor: '#f25648;',
                    color: '#ffffff',
                    lowerThan: 'transform',
                    languagePath: ''
                });
                this.navigate(model.get('lastInsideHash'), { trigger: true });
            } else {
                this.navigate('', { trigger: true });
                Context.logout();
            }
        },
        routes: {
            '': 'openLogin',
            login: 'openLogin',
            api: 'openApi',
            'user-profile': 'userProfile',
            'registration?*queryString': 'registerUser',

            'administrate/project-details/:id?*queryString': 'openAdminProjectDetailsQuery',
            'administrate/project-details/:id': 'openAdminProjectDetails',
            'administrate/project-details/:id/:action': 'openAdminProjectDetails',
            'administrate/project-details/:id/:action/:userAction': 'openAdminProjectDetails',
            administrate: 'openAdminPage',
            'administrate/:page': 'openAdminPage',
            'administrate/:page?*queryString': 'openAdminPage',
            'administrate/:page/:action': 'openAdminPageAction',
            'administrate/:page/:action?*queryString': 'openAdminPageAction',

            ':project/filters?*queryString': 'openFilters',
            ':project/filters': 'openFilters',
            ':project/members': 'openMembersDefault',
            ':project/members/:action': 'openMembers',
            ':project/settings': 'openSettings',
            ':project/settings/:tab': 'openSettings',
            ':project/launches/:filterId(/*path)': 'openLaunch',
            ':project/userdebug/:filterId(/*path)': 'openUserDebug',

            ':project/dashboard': 'openDashboard',
            ':project/dashboard/:id': 'openDashboard',
            ':project/dashboard/:id?*queryString': 'openDashboard',

            ':project(/)': 'openDashboard',
            '*invalidRoute': 'show404Page'
        },
        show404Page: function (route) {
            Context.openInvalid(route);
        },
        registerUser: testRoute.checkTest('outsidePage', function (queryString) {
            Context.openRegister(queryString);
        }),
        openLogin: testRoute.checkTest('outsidePage', function () {
            Context.openLogin();
        }),
        openProject: testRoute.checkTest('insidePage', function (project) {
            Context.openRouted(project, 'info', null, null);
        }),
        openUserDebug: testRoute.checkTest('insidePage', function (project) {
            Context.openRouted(project, 'userdebug', arguments);
        }),
        openFilters: testRoute.checkTest('insidePage', function (project, queryString) {
            Context.openRouted(project, 'filters', null, queryString);
        }),
        openApi: testRoute.checkTest('insidePage', function () {
            Context.openRouted(userStorage.get('lastProject'), 'api', null, null);
        }),
        userProfile: testRoute.checkTest('insidePage', function () {
            Context.openRouted(userStorage.get('lastProject'), 'user-profile', null, null);
        }),
        openMembers: testRoute.checkTest('insidePage', function (project, action) {
            Context.openRouted(project, 'members', action, null);
        }),
        openMembersDefault: testRoute.checkTest('insidePage', function (project) {
            Context.openRouted(project, 'members', 'assigned', null);
        }),
        openLaunch: testRoute.checkTest('insidePage', function (project) {
            Context.openRouted(project, 'launches', arguments);
        }),
        openSettings: testRoute.checkTest('insidePage', function (project, tab) {
            Context.openRouted(project, 'settings', tab, null);
        }),
        openDashboard: testRoute.checkTest('insidePage', function (project, id, queryString) {
            Context.openRouted(project, 'dashboard', id, queryString);
        }),
        openAdminPage: testRoute.checkTest('insidePage', function (page, queryString) {
            page = page || 'projects';
            Context.openAdmin(page, null, null, queryString);
        }),
        openAdminPageAction: testRoute.checkTest('insidePage', function (page, action, queryString) {
            Context.openAdmin(page, undefined, action, queryString);
        }),
        openAdminResource: testRoute.checkTest('insidePage', function (page, id, action, query) {
            Context.openAdmin(page, id, action, query);
        }),
        openAdminUsersAction: testRoute.checkTest('insidePage', function (page, id, action, query) {
            Context.openAdmin(page, id, action, query);
        }),
        openAdminProjectDetails: testRoute.checkTest('insidePage', function (id, action, queryString) {
            Context.openAdmin('project-details', id, action, queryString);
        }),
        openAdminProjectDetailsQuery: testRoute.checkTest('insidePage', function (id, queryString) {
            Context.openAdmin('project-details', id, null, queryString);
        })

    });

    return {
        Router: Router
    };
});
