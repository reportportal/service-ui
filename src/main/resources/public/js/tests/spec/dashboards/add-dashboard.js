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
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    require('jasminejQuery');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Add dashboard', function () {

        var sandbox,
            dialog,
            activeDashboard,
            userDashboards,
            navigationInfo,
            context,
            config;
        Util.extendStings();

        var renderDialog = function () {
            dialog = new Dashboard.AddDashboard({
                context: context,
                model: new Dashboard.Model(activeDashboard),
                project: config.project,
                navigationInfo: navigationInfo,
                mydash: _.filter(userDashboards, function (dash) {
                    return dash.owner == config.userModel.get('name');
                })
            }).render();
        };

        beforeEach(function () {
            sandbox = $("#sandbox");
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name, options.data) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });

            spyOn(Service, 'getSharedDashboards').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.getSharedDashboards());
                return deferred.promise();
            });

            config = App.getInstance();
            config.userModel = new Backbone.Model(DataMock.getConfigUser());
            config.trackingDispatcher = trackingDispatcher;
            userDashboards = DataMock.userDashboards();
            activeDashboard = userDashboards[0];
            navigationInfo = new Dashboard.NavigationInfo(activeDashboard);
            navigationInfo.collection = new Backbone.Collection(userDashboards);
            context = {};
        });

        afterEach(function () {
            config = null;
            userDashboards = null;
            activeDashboard = null;
            navigationInfo = null;
            dialog && dialog.destroy();
            dialog = null;
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should render add dashboard dialog', function () {
            renderDialog();
            expect(dialog).toBeDefined();
            expect($('.dialog-shell', sandbox).length).toEqual(1);
        });

        it('should show "Create New Dashboard" tab and "Create" button by default', function () {
            renderDialog();
            var button = $('#actionBtnDialog', sandbox);
            expect($('a[aria-controls="createNewDashboard"]', sandbox).closest('li')).toHaveClass('active');
            expect($('#createNewDashboard', sandbox)).toHaveClass('active');
            expect(button).toHaveClass('disabled');
        });

        it('should add shared dashboard on click on shared dashboard link', function () {
            spyOn(Service, 'addSharedDashboard').and.callFake(function (id) {
                var deferred = new $.Deferred();
                deferred.resolve({isShared: true, id: id});
                return deferred.promise();
            });
            spyOn(Dashboard.AddDashboard.prototype, 'createNewDashboard').and.callFake(function () {
            });
            renderDialog();

            var link = $('a.shared-dashboard:first', sandbox);
            var id = link.data('dashboardId');
            link.click();
            expect(Service.addSharedDashboard).toHaveBeenCalledWith(id);
            expect(Dashboard.AddDashboard.prototype.createNewDashboard).toHaveBeenCalled();
        });

        it('should show "Create" button on tab "Create Dashboard"', function () {
            renderDialog();
            var showSpy = spyOn($.fn, 'show'),
                tab = $('a[aria-controls="createNewDashboard"]', sandbox),
                tab2 = $('a[aria-controls="shareDashboard"]', sandbox);
            tab2.tab('show');
            tab.tab('show');
            expect(showSpy.calls.mostRecent().object.selector).toEqual('#actionBtnDialog');
        });

        it('should hide "Create" button on tab "Shared Dashboard"', function () {
            renderDialog();
            var hideSpy = spyOn($.fn, 'hide'),
                tab2 = $('a[aria-controls="shareDashboard"]', sandbox);
            tab2.tab('show');
            expect(hideSpy.calls.mostRecent().object.selector).toEqual('#actionBtnDialog');
        });

        it('should show error message block if dashboard name lesser than', function () {
            renderDialog();
            var tab = $('[aria-controls="createNewDashboard"]', sandbox),
                $name = $('#dashboardName', sandbox);
            tab.tab('show');
            $name.val('aa');
            dialog.validate();
            expect($name.closest('.rp-form-group')).toHaveClass('has-error');
            expect($('.help-inline', $name.closest('.rp-form-group'))).not.toBeEmpty();
            expect($('#actionBtnDialog', sandbox)).toHaveClass('disabled');
        });

        it('should show error message block if dashboard name more than', function () {
            renderDialog();
            var tab = $('[aria-controls="createNewDashboard"]', sandbox),
                $name = $('#dashboardName', sandbox);
            tab.tab('show');
            $name.val('fghfgfhfghfghgfhfghgfghfghgfhgfhfhghfhfhgfghgfhfhghghjjdgdfgdddfgdfgdfgdfgfgdfghjhgdfgdgdfgdfgdfgdfgdgdfgdfdfgfdfgdfgdfgfdgdfgfdgdfggf');
            dialog.validate();
            expect($name.closest('.rp-form-group')).toHaveClass('has-error');
            expect($('.help-inline', $name.closest('.rp-form-group'))).not.toBeEmpty();
            expect($('#actionBtnDialog', sandbox)).toHaveClass('disabled');
        });

        it('should enable "Submit" button if dashboard name is valid', function () {
            renderDialog();
            var tab = $('[aria-controls="createNewDashboard"]', sandbox),
                $name = $('#dashboardName', sandbox);
            tab.tab('show');
            $name.val('ettyytee');
            dialog.validate();
            expect($name.closest('.rp-form-group')).not.toHaveClass('has-error');
            expect($('.help-inline', $name.closest('.rp-form-group'))).toBeEmpty();
            expect($('#actionBtnDialog', sandbox)).not.toHaveClass('disabled');
        });

        it('should create new dashboard on submit', function () {
            spyOn(Service, 'addOwnDashboard').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({id: "55c4b17afc22e15eca3f7bf4"});
                return deferred.promise();
            });
            spyOn(Dashboard.AddDashboard.prototype, 'createNewDashboard').and.callFake(function () {
            });
            renderDialog();
            var tab = $('[aria-controls="createNewDashboard"]', sandbox),
                $name = $('#dashboardName', sandbox),
                name = 'ettyytee';
            tab.tab('show');

            $name.val(name);
            dialog.validate();
            $('#actionBtnDialog', sandbox).click();
            expect(Service.addOwnDashboard).toHaveBeenCalledWith({name: name, share: false});
            expect(Dashboard.AddDashboard.prototype.createNewDashboard).toHaveBeenCalled();
        });

    });

});