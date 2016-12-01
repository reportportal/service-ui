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


define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Dashboard = require('dashboard');
    var Service = require('coreService');
    var DataMock = require('fakeData');
    var App = require('app');
    var urls = require('dataUrlResolver');
    var Storage = require('storageService');
    var Wizard = require('widgetWizard');
    var Localization = require('localization');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    require('jasminejQuery');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Dashboard page', function () {

        var sandbox,
            dashboardView,
            contextName,
            subContext,
            context,
            appModel,
            config,
            dashboards,
            activeDashboard;
        Util.extendStings();

        var renderDashboard = function () {
            dashboardView = new Dashboard.ContentView({
                context: context,
                project: config.project,
                contextName: contextName,
                subContext: subContext
            }).render();
        };
        var setupGetDashboards = function () {
            spyOn(Service, 'getProjectDashboards').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(dashboards);
                return deferred.promise();
            });
        };

        beforeEach(function () {
            sandbox = $("#sandbox");
            sandbox.append('<div id="contentHeader"></div>');
            sandbox.append('<div id="dynamic-content"></div>');
            config = App.getInstance();
            config.userModel = new Backbone.Model(DataMock.getConfigUser());
            config.router = new Backbone.Router({});
            config.trackingDispatcher = trackingDispatcher;
            appModel = new SingletonAppModel();
            appModel.set('projectId', 'default_project');
            contextName = 'dashboard';
            dashboards = DataMock.userDashboards();
            activeDashboard = dashboards[0]
            subContext = activeDashboard.id;
            context = {
                getMainView: function () {
                    return {
                        $body: $('#dynamic-content', sandbox),
                        $header: $('#contentHeader', sandbox)
                    }
                }
            };

            spyOn(Service, 'getDefectTypes').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.getDefectTypes());
                return deferred.promise();
            });

            spyOn(Dashboard.DashboardBody.prototype, 'checkWidgetsForLoad').and.stub;
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });

        });

        afterEach(function () {
            config = null;
            subContext = null;
            contextName = null;
            context = null;
            dashboards = null;
            appModel = null;
            activeDashboard = null;
            dashboardView && dashboardView.destroy();
            dashboardView = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should call for service getProjectDashboards on render Dashboard', function () {
            setupGetDashboards();
            renderDashboard();
            expect(Service.getProjectDashboards).toHaveBeenCalled();
        });

        it('should navigate to active dashboard from LocalStorage if no subContext (no dashboard id)', function () {
            setupGetDashboards();
            Storage.setActiveDashboard({
                id: activeDashboard.id,
                name: activeDashboard.name,
                owner: activeDashboard.owner
            });
            spyOn(Backbone.Router.prototype, 'navigate').and.callFake(function () {
            });
            spyOn(urls, 'redirectToDashboard').and.callThrough();
            dashboardView = new Dashboard.ContentView({
                context: context,
                project: config.project,
                contextName: contextName
            }).render();
            expect(urls.redirectToDashboard).toHaveBeenCalledWith(activeDashboard.id);
            expect(config.router.navigate).toHaveBeenCalled();
            window.localStorage.removeItem(config.userModel.get('name'));
        });

        it('should navigate to first dashboard from list if no subContext (no dashboard id) and if no active dashboard in LocalStorage', function () {
            setupGetDashboards();
            window.localStorage.removeItem(config.userModel.get('name'));
            spyOn(Backbone.Router.prototype, 'navigate').and.callFake(function () {
            });
            spyOn(Storage, 'setActiveDashboard').and.callThrough();
            spyOn(urls, 'redirectToDashboard').and.callThrough();

            dashboardView = new Dashboard.ContentView({
                context: context,
                project: config.project,
                contextName: contextName
            }).render();
            var first = dashboardView.navigationInfo.collection.at(0);
            var dashboard = {name: first.get('name'), id: first.get('id'), owner: first.get('owner')};
            expect(Storage.setActiveDashboard).toHaveBeenCalledWith(dashboard);
            expect(urls.redirectToDashboard).toHaveBeenCalledWith(first.get('id'));
            expect(config.router.navigate).toHaveBeenCalled();
        });

        it('should render dashboard no found block if failed to load dashboard', function () {
            setupGetDashboards();
            spyOn(Dashboard.DashboardBody.prototype, 'renderNoDashboards').and.callThrough();

            dashboardView = new Dashboard.ContentView({
                context: context,
                project: config.project,
                contextName: contextName,
                subContext: '1111111111111111111111'
            }).render();
            expect($('.no-dashboards', sandbox).length).toEqual(1);
            expect($('.no-dashboards .warning', sandbox).text().trim()).toEqual(Localization.dashboard.dashboardsEmpty);
        });

        it('should render no dashboards block and button "Add new dashboard" if dashboards list is empty', function () {
            spyOn(Service, 'getProjectDashboards').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve([]);
                return deferred.promise();
            });
            spyOn(Dashboard.DashboardBody.prototype, 'renderNoDashboards').and.callThrough();

            dashboardView = new Dashboard.ContentView({
                context: context,
                project: config.project,
                contextName: contextName
            }).render();

            expect(Dashboard.DashboardBody.prototype.renderNoDashboards.calls.mostRecent().args[0].no_dashboards).toBeTruthy();
            expect($('.no-dashboards', sandbox).length).toEqual(1);
            expect($('.no-dashboards .warning', sandbox).text().trim()).toEqual(Localization.dashboard.dashboardsEmpty);
            expect($('.dashboard-title', sandbox).length).toEqual(0);
            expect($('.add-new-dashboard', sandbox).length).toEqual(1);
        });

        it('should render dashboard header with title and buttons', function () {
            spyOn(Dashboard.DashboardHeader.prototype, 'render').and.callThrough();
            setupGetDashboards();
            renderDashboard();
            expect(Dashboard.DashboardHeader.prototype.render).toHaveBeenCalled();
            expect($('.dashboard-title', dashboardView.$header.$el).length).toEqual(1);
            expect($('.edit-dashboard', dashboardView.$header.$el).length).toEqual(1);
            expect($('.fullscreen-dashboard', dashboardView.$header.$el).length).toEqual(1);
            expect($('.remove-dashboard', dashboardView.$header.$el).length).toEqual(1);
            expect($('.add-widget', dashboardView.$header.$el).length).toEqual(1);
            expect($('.edit-dashboard', dashboardView.$header.$el).length).toEqual(1);
            expect($('#addNewWidget', dashboardView.$body.$el).closest('li')).not.toHaveClass('disabled');
            var titleEl = $('.dashboard-title li a', dashboardView.$header.$el);
            $('i', titleEl).remove();
            expect(titleEl.text().trim()).toEqual(activeDashboard.name);
        });

        it('should render dashboard body with container for widgets and button "Click here to add new widget"', function () {
            spyOn(Dashboard.DashboardBody.prototype, 'render').and.callThrough();
            setupGetDashboards();
            renderDashboard();
            expect(Dashboard.DashboardBody.prototype.render).toHaveBeenCalled();
            expect($('.widgets-list', dashboardView.$body.$el).length).toEqual(1);
            expect($('#addNewWidget', dashboardView.$body.$el).length).toEqual(1);
            expect($('#addNewWidget', dashboardView.$body.$el)).not.toHaveClass('disabled');
        });

        it('should disable buttons "Add widget" and "Click here to add new widget, if widgets quantity 20 and more"', function () {
            var widgets = dashboards[0].widgets
            while (widgets.length < 20) {
                widgets.push({widgetId: "559e349fe4b052008d80a9c8", widgetSize: [4, 6], widgetPosition: [0, 81]});
            }
            setupGetDashboards();
            renderDashboard();
            expect($('.add-widget', dashboardView.$header.$el)).toHaveClass('disabled');
            expect($('#addNewWidget', dashboardView.$body.$el)).toHaveClass('disabled');
        });

        it('should be no buttons "Add widget", "Settings", "Click here to add new widget" if user not owner for dashboard', function () {
            setupGetDashboards();
            subContext = dashboards[1].id;
            renderDashboard();

            expect($('.add-widget', sandbox).length).toEqual(0);
            expect($('.edit-dashboard', sandbox).length).toEqual(0);
            expect($('#addNewWidget', sandbox).length).toEqual(0);
        });

        it('should show fullscreen mode on click "Fullscreen" button', function () {
            setupGetDashboards();
            renderDashboard();
            spyOn($('body'), 'off').and.stub();
            spyOn($('.fullscreen-close'), 'off').and.stub();
            spyOn($('.fullscreen-close'), 'on').and.stub();
            spyOn($.fn, 'on').and.callThrough();

            $('.fullscreen-dashboard', sandbox).click();
            expect($.fn.on).toHaveBeenCalledWith('fscreenopen', jasmine.any(Function));
        });

        it('should render WidgetWizard on click "Add widget" button', function () {
            setupGetDashboards();
            spyOn(Dashboard.DashboardHeader.prototype, 'openWidgetWizard').and.callThrough();
            spyOn(Wizard.WidgetWizard.prototype, 'render').and.callFake(function () {
            });
            spyOn(Backbone.View.prototype, 'listenTo').and.stub;
            renderDashboard();

            $('.add-widget', sandbox).click();
            expect(Dashboard.DashboardHeader.prototype.openWidgetWizard).toHaveBeenCalled();
            expect(Wizard.WidgetWizard.prototype.render).toHaveBeenCalled();
        });

        it('should render dashboard settings on click "Settings" button', function () {
            setupGetDashboards();
            spyOn(Dashboard.EditDashboard.prototype, 'render').and.callFake(function () {
            });
            renderDashboard();

            $('.edit-dashboard', sandbox).click();
            expect(Dashboard.EditDashboard.prototype.render).toHaveBeenCalled();
        });

        it('should trigger "Add widget" on click "Click here to add new widget" button', function () {
            setupGetDashboards();
            renderDashboard();
            spyOn(dashboardView.$body.navigationInfo, 'trigger').and.callFake(function () {
            });

            $('#addNewWidget', sandbox).click();
            expect(dashboardView.$body.navigationInfo.trigger).toHaveBeenCalledWith('add::widget');
        });

        it('should render confirmation dialog on click "Remove" button', function () {
            setupGetDashboards();
            renderDashboard();
            spyOn(Util, 'confirmDeletionDialog').and.callFake(function () {
            });

            $('.remove-dashboard', sandbox).click();
            expect(Util.confirmDeletionDialog.calls.mostRecent().args[0].callback).toEqual(jasmine.any(Function));
            expect(Util.confirmDeletionDialog.calls.mostRecent().args[0].format[0]).toEqual(DataMock.userDashboards()[0].name);
        });

        it('should show dashboards list on click dashboard title', function () {
            setupGetDashboards();
            spyOn(Dashboard.DashboardsList.prototype, 'render').and.callFake(function () {
            });

            renderDashboard();
            var menu = $('.dashboard-title a', sandbox);
            menu.click();

            expect(Dashboard.DashboardsList.prototype.render).toHaveBeenCalled();
        });
    });

});