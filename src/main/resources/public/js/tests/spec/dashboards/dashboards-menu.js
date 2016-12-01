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
    var DataMock = require('fakeData');
    var App = require('app');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    require('jasminejQuery');


    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Dashboards list', function () {

        var sandbox,
            dashboardsList,
            context,
            activeDashboard,
            userDashboards,
            config;
        Util.extendStings();

        var renderDashboardsList = function () {
            dashboardsList = new Dashboard.DashboardsList({
                container: sandbox,
                dashboards: new Backbone.Collection(userDashboards),
                currentDashboard: new Backbone.Model(activeDashboard),
                context: context,
                navigationInfo: new Dashboard.NavigationInfo({current: activeDashboard.id}),
                project: config.project
            }).render();
            dashboardsList.$el.css({display: 'block', height: '10000px'});
        };

        beforeEach(function () {
            sandbox = $("#sandbox");
            config = App.getInstance();
            config.userModel = new Backbone.Model(DataMock.getConfigUser());
            config.router = new Backbone.Router({});
            config.trackingDispatcher = trackingDispatcher;
            userDashboards = DataMock.userDashboards();
            activeDashboard = userDashboards[0];
            context = {};
        });


        afterEach(function () {
            config = null;
            context = null;
            userDashboards = null;
            activeDashboard = null;
            dashboardsList && dashboardsList.destroy();
            dashboardsList = null;
            sandbox.off().empty();
        });

        it('should render dashboards menu', function () {
            renderDashboardsList();
            expect(dashboardsList).toBeDefined();
            expect($('.b-dashboars-list', sandbox).length).toEqual(1);
        });

        it('should render "My dashboards" block and "Favorite dashboards" block', function () {
            renderDashboardsList();
            var my = $('.my-dashboards-list', sandbox),
                fav = $('.shared-dashboards-list', sandbox);
            expect(my.length).toEqual(1);
            expect(fav.length).toEqual(1);
        });

        it('should highlight link on current dashboard as active', function () {
            renderDashboardsList();
            expect($('#' + activeDashboard.id, sandbox).closest('li')).toHaveClass('active');
        });

        it('should not be navigate on click on current dashboard link', function () {
            renderDashboardsList();
            var e = {currentTarget: $('#' + activeDashboard.id, sandbox), preventDefault: jasmine.createSpy()};
            dashboardsList.onOpenDashboard(e);
            expect(e.preventDefault).toHaveBeenCalled();
        });

        it('should open Add dashboard form on click "Add new dashboard" button', function () {
            spyOn(Dashboard.AddDashboard.prototype, 'initialize').and.callThrough();
            spyOn(Dashboard.AddDashboard.prototype, 'render').and.callFake(function () {
            });
            renderDashboardsList();
            $('.add-new-dashboard', sandbox).click();
            expect(Dashboard.AddDashboard.prototype.initialize).toHaveBeenCalled();
            expect(Dashboard.AddDashboard.prototype.render).toHaveBeenCalled();
        });

    });

});