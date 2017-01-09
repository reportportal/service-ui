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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Context = require('context');
    var App = require('app');
    var LandingController = require('landing/LandingController');
    var TestRoute = require('TestRoute');
    var UserModel = require('model/UserModel');

    var config = App.getInstance();

    var testRoute = new TestRoute();

    var Router = Backbone.Router.extend({
        initialize: function () {
            var self = this;
            this.context = Context;
            this.user = new UserModel();

            testRoute.addTest('insidePage', function(){
                var async = $.Deferred();
                self.user.isAuth()
                    .done(function(){
                        self.landingController.hideLanding();
                        async.resolve();
                        self.user.set({lastInsideHash: window.location.hash});
                    })
                    .fail(function(){
                        self.user.set({lastInsideHash: window.location.hash});
                        self.navigate('login', {trigger: true});
                    });
                return async.promise();
            });

            this.landingController = new LandingController();

            this.user.ready.done(function(){
                self.listenTo(self.user, 'change:auth', self.onChangeUserAuth.bind(self));
            });
            this.route(/^(.*)\/oldlaunches\/all(.*)$/, "openLaunches");
            this.route(/^(.*)\/userdebug\/all(.*)$/, "openUserDebug");
        },
        onChangeUserAuth: function(model, auth){
            if(auth){
                outdatedBrowser({
                    bgColor: '#f25648;',
                    color: '#ffffff',
                    lowerThan: 'transform',
                    languagePath: ''
                });
                this.navigate(model.get('lastInsideHash'), {trigger: true});
            }else {
                this.navigate('', {trigger: true});
                Context.destroyViews();
            }
        },
        routes: {
            '': 'openParallax',
            'login': 'openParallaxLogin',
            'documentation': 'openDocumentation',
            'documentation/:id': 'openDocumentation',
            'user-profile': 'userProfile',
            'registration?*queryString': 'registerUser',
            'administrate/:page/:id?*queryString': 'openAdminResource',
            'administrate/:page/:id': 'openAdminResource',
            'administrate/:page/:id/:action?*queryString': 'openAdminResource',
            'administrate/:page/:id/:action': 'openAdminResource',
            'administrate/:page/:id/:action/:userAction': 'openAdminUsersAction',
            'administrate': 'openAdminPage',
            'administrate/:page': 'openAdminPage',
            'administrate/:page?*queryString': 'openAdminPage',
            'administrate/:page/:action': 'openAdminPageAction',
            ':project/filters?*queryString': 'openFilters',
            ':project/filters': 'openFilters',
            ':project/members': 'openMembersDefault',
            ':project/members/:action': 'openMembers',
            ':project/settings': 'openSettings',
            ':project/settings/:tab': 'openSettings',
            ':project/dashboard': 'openDashboard',
            ':project/dashboard/:id': 'openDashboard',
            ':project/dashboard/:id?*queryString': 'openDashboard',
            ':project/launches/:filterId(/*path)': 'openLaunch',

            ':project/newdashboard': 'openNewDashboard',
            ':project/newdashboard/:id': 'openNewDashboard',
            ':project/newdashboard/:id?*queryString': 'openNewDashboard',

            ':project(/)': 'openDashboard',
            '*invalidRoute': "show404Page"
        },
        show404Page: function(route){
            // make sure it is not a value for dynamic .route
            // if(route && route.indexOf('launches/all') === -1 && route.indexOf('userdebug/all') === -1) {
            //     Context.openInvalid(route);
            // }
            Context.openInvalid(route);
        },
        openParallax: function() {
            this.landingController.showParallax();
            Context.destroyViews();
        },
        openParallaxLogin: function(){
            this.landingController.showParallax();
            this.landingController.openLogin();
            Context.destroyViews();
        },
        openDocumentation: function(id) {
            this.landingController.showDocumentation(id);
            Context.destroyViews();
        },
        openProject: testRoute.checkTest('insidePage', function(project) {
            Context.openRouted(project, 'info', null, null);
        }),
        openLaunches: testRoute.checkTest('insidePage', function(project, path){
            Context.openRouted(project, 'launches', 'all', path);
        }),
        openUserDebug: testRoute.checkTest('insidePage', function(project, path){
            Context.openRouted(project, 'userdebug', 'all', path);
        }),
        openFilters: testRoute.checkTest('insidePage', function(project, queryString){
            Context.openRouted(project, 'filters', null, queryString);
        }),
        userProfile: testRoute.checkTest('insidePage', function(){
            Context.openRouted(config.project.projectId, 'user-profile', null, null);
        }),
        openMembers: testRoute.checkTest('insidePage', function(project, action){
            Context.openRouted(project, 'members', action, null);
        }),
        openMembersDefault: testRoute.checkTest('insidePage', function(project){
            Context.openRouted(project, 'members', 'assigned', null);
        }),
        openLaunch: testRoute.checkTest('insidePage', function(project) {
            Context.openRouted(project, 'newlaunches', arguments);
        }),
        registerUser: function(queryString){
            Context.openRegister(queryString);
        },
        openSettings: testRoute.checkTest('insidePage', function(project, tab){
            Context.openRouted(project, 'settings', tab, null);
        }),
        openDashboard: testRoute.checkTest('insidePage', function(project, id, queryString){
            Context.openRouted(project, 'dashboard', id, queryString);
        }),
        openNewDashboard: testRoute.checkTest('insidePage', function(project, id, queryString){
            Context.openRouted(project, 'newdashboard', id, queryString);
        }),
        openAdminPage: testRoute.checkTest('insidePage', function (page, queryString) {
            page = page || 'projects';
            Context.openAdmin(page, null, null, queryString);
        }),
        openAdminPageAction: testRoute.checkTest('insidePage', function (page, action) {
            Context.openAdmin(page, undefined, action);
        }),
        openAdminResource: testRoute.checkTest('insidePage', function (page, id, action, query) {
            Context.openAdmin(page, id, action, query);
        }),
        openAdminUsersAction: testRoute.checkTest('insidePage', function(page, id, action, query){
            Context.openAdmin(page, id, action, query);
        }),
        /*openAdminPageDetails: testRoute.checkTest('insidePage', function (id, queryString) {
            Context.openAdmin("project-details", id, null, queryString);
        }),*/
    });

    return {
        Router: Router
    };
});
