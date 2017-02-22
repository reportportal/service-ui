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
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var storageService = require('storageService');

    var DataMock = require('fakeData');
    var initialState = require('initialState');
    var SingletonAppModel = require('model/SingletonAppModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');

    // Main modules
    var Dashboard = require('dashboard');
    var Favorites = require('favorites');
    var Launch = require('launch');
    var LaunchPage = require('launches/LaunchPage');
    var Project = require('project');
    var ProjectInfo = require('projectinfo');
    var Member = require('member');
    var Profile = require('userProfile/UserProfilePage');

    // Administrate modules
    var Projects = require('projects');
    var Users = require('users');
    var Settings = require('settings');

    var Content = require('sections/content');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox"></div>');

    describe('content section tests', function () {

        var sandbox,
            contentView,
            config,
            appModel,
            activeHash = 'default_project/settings',
            project = "default_project",
            currentPage = "settings";

        Util.extendStings();

        var renderContent = function() {
            contentView = new Content({
                isAdminPage: false,
                el: $('#sandbox #mainContainer'),
            }).render({
                contextName: currentPage,
                projectId: project,
            });
        };

        beforeEach(function () {
            sandbox = $("#sandbox");
            sandbox.append('<div id="mainContainer"></div>');

            config = App.getInstance();
            appModel = new SingletonAppModel();
            appModel.set('projectId', project);
            config.router = new Backbone.Router({});
            config.preferences = DataMock.getUserPreferences();
            config.trackingDispatcher = trackingDispatcher;

            initialState.initAuthUser();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();
        });

        afterEach(function () {
            contentView && contentView.destroy();
            contentView = null;
            config = null;
            appModel = null;
            sandbox.off().empty();
        });

        it('should render content view', function () {
            renderContent();
            expect($('#mainContainer', sandbox).length).toEqual(1);
        });

        it('should render content header', function () {
            renderContent();
            expect($('#contentHeader', sandbox).length).toEqual(1);
        });

        it('should render dynamic content', function () {
            renderContent();
            expect($('#dynamic-content', sandbox).length).toEqual(1);
        });

        it('should destroy content view', function () {
            renderContent();
            contentView.destroy();
            expect($('#mainContainer', sandbox).html()).toEqual('');
        });

        it('should get view for administrate page', function () {
            spyOn(Content.prototype, "getViewForAdministratePage").and.callThrough();
            renderContent();
            expect(contentView.getViewForAdministratePage({page: 'users'})).toEqual(Users.ContentView);
            expect(contentView.getViewForAdministratePage({page: 'project-details'})).toEqual(Projects.ProjectDetails);
            expect(contentView.getViewForAdministratePage({page: 'settings'})).toEqual(Settings.ContentView);
            expect(contentView.getViewForAdministratePage({page: 'projects', action: 'add'})).toEqual(Projects.Project);
            expect(contentView.getViewForAdministratePage({page: 'invalid', action: 'value'})).toEqual(Projects.List);
        });

        it('should get view for common page', function () {
            spyOn(Content.prototype, "getViewForPage").and.callThrough();
            renderContent();
            expect(contentView.getViewForPage('dashboard')).toEqual(Dashboard);
            expect(contentView.getViewForPage('filters')).toEqual(Favorites);
            expect(contentView.getViewForPage('newlaunches')).toEqual(LaunchPage);
            expect(contentView.getViewForPage('settings')).toEqual(Project);
            expect(contentView.getViewForPage('info')).toEqual(ProjectInfo);
        });
    });
});
