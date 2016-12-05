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
    var Widget = require('widgets');
    var Dashboard = require('dashboard');
    var Service = require('coreService');
    var DataMock = require('fakeData');
    var App = require('app');
    var Localization = require('localization');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    require('jasminejQuery');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Widgets', function () {

        var sandbox,
            context,
            dashboard,
            widget,
            widgetId,
            widgetData,
            config;
        Util.extendStings();

        var renderWidget = function () {
                widget = new Widget.WidgetView({
                    container: sandbox,
                    id: widgetId,
                    navigationInfo: new Dashboard.NavigationInfo(dashboard),
                    width: 12,
                    height: 7,
                    top: 0,
                    left: 0,
                    context: context
                }).render();
            },
            loadWidget = function () {
                spyOn(Service, 'loadWidget').and.callFake(function () {
                    var deferred = new $.Deferred();
                    deferred.resolve(widgetData);
                    return deferred.promise();
                });
            },
            loadWidgetError = function () {
                spyOn(Service, 'loadWidget').and.callFake(function () {
                    var deferred = new $.Deferred();
                    deferred.reject({
                        readyState: 4,
                        responseText: "{\"error_code\":4047,\"message\":\"Widget with ID '559e3992e4b052008d80a9e6ghjhj' not found. Did you use correct Widget ID?\"}",
                        status: 404
                    });
                    return deferred.promise();
                });
            };

        beforeEach(function () {
            sandbox = $("#sandbox");
            config = App.getInstance();
            config.userModel = new Backbone.Model(DataMock.getConfigUser());
            config.router = new Backbone.Router({});
            config.trackingDispatcher = trackingDispatcher;
            context = {widgets: []};
            dashboard = DataMock.userDashboards()[0];
            widgetId = dashboard.widgets[0].widgetId;
            widgetData = {
                owner: "default",
                isShared: false,
                id: widgetId,
                name: "ghjjgh",
                content_parameters: {
                    type: "statistics_panel",
                    gadget: "overall_statistics",
                    metadata_fields: ["name", "number", "start_time"],
                    content_fields: ["statistics$executions$total", "statistics$executions$passed",
                        "statistics$executions$failed", "statistics$executions$skipped",
                        "statistics$defects$product_bugs", "statistics$defects$test_bugs",
                        "statistics$defects$system_issue", "statistics$defects$to_investigate"]
                },
                filter_id: "55926830e4b0eeaae6629a2c",
                content: {
                    productBugs: {y_axis: [{value: 33}]},
                    total: {y_axis: [{value: 59}]},
                    toInvestigate: {y_axis: [{value: 4}]},
                    systemIssues: {y_axis: [{value: 1}]},
                    passed: {y_axis: [{value: 18}]},
                    failed: {y_axis: [{value: 38}]},
                    testBugs: {y_axis: [{value: 1}]},
                    skipped: {y_axis: [{value: 3}]}
                }
            };

            spyOn(Dashboard.NavigationInfo.prototype, 'getCurrentDashboard').and.returnValue(new Backbone.Model(dashboard));
            // spyOn(Util, 'setupNiceScroll').and.stub;
        });

        afterEach(function () {
            config = null;
            context = null;
            dashboard = null;
            widgetId = null;
            widgetData = null;
            widget && widget.destroy();
            widget = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should render widget container', function () {
            renderWidget();
            var widgetElem = $('#' + widgetId, sandbox);
            expect(widgetElem.length).toEqual(1);
        });

        it('should call load widget service and show loader', function () {
            spyOn(Service, 'loadWidget').and.returnValue(new jQuery.Deferred());
            renderWidget();
            var widgetElem = $('#' + widgetId, sandbox);
            widget.loadWidget();
            expect($('.loader', widgetElem).css('display')).toEqual('block');
            expect(Service.loadWidget).toHaveBeenCalled();
            expect(Service.loadWidget.calls.mostRecent().args[0].indexOf(widgetId)).toBeGreaterThan(0);
        });

        it('should render widget header with name and widget type', function () {
            loadWidget();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox);
            expect($('.panel-heading', widgetElem).length).toEqual(1);
            expect($('.rp-top-links.navbar-right', widgetElem).length).toEqual(1);
            expect($('.panel-heading strong:first', widgetElem).text()).toEqual(widgetData.name);
            expect($('.widget-type-name', widgetElem).length).toEqual(1);
            expect($('.widget-type-name', widgetElem).text().length).toBeGreaterThan(0);
        });

        it('should show action buttons on render widget header', function () {
            loadWidget();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox);
            expect($('.rp-top-links.navbar-right', widgetElem).length).toEqual(1);
            expect($('.remove', widgetElem).length).toEqual(1);
            expect($('.refresh', widgetElem).length).toEqual(1);
            expect($('.settings', widgetElem).length).toEqual(1);
        });

        it('should show "shared by" badge for shared widget', function () {
            widgetData.isShared = true;
            loadWidget();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox),
                badge = $('.panel-heading .badge.badge', widgetElem);
            expect(badge.length).toEqual(1);
            expect($('.shared-text', badge).text().length).toBeGreaterThan(0);
        });

        it('should update widget data and rerender widget on click "Refresh" button', function () {
            loadWidget();
            spyOn(Widget.WidgetView.prototype, 'renderWidget').and.callThrough();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox),
                button = $('.refresh', widgetElem);
            button.click();
            expect(Service.loadWidget.calls.count()).toEqual(2);
            expect(Widget.WidgetView.prototype.renderWidget.calls.count()).toEqual(2);
        });

        it('should show confirmation dialog on click "Remove" button', function () {
            loadWidget();
            spyOn(Util, 'getDialog').and.callThrough();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox),
                button = $('.remove', widgetElem);
            button.click();
            expect(Util.getDialog).toHaveBeenCalled();
            expect(Util.getDialog.calls.mostRecent().args[0].name).toEqual('tpl-delete-dialog');
        });

        it('should trigger "Edit Widget" on click "Settings" button', function () {
            loadWidget();
            renderWidget();
            spyOn(widget.navigationInfo, 'trigger').and.callFake(function () {
            });
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox),
                button = $('.settings', widgetElem);
            button.click();
            expect(widget.navigationInfo.trigger).toHaveBeenCalled();
            expect(widget.navigationInfo.trigger.calls.mostRecent().args[0]).toEqual('edit::widget');
            expect(widget.navigationInfo.trigger.calls.mostRecent().args[1]).toEqual(widgetData);
        });

        it('should be no button "Settings" if user not owner for widget', function () {
            widgetData.owner = 'rteteter';
            loadWidget();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox),
                button = $('.settings', widgetElem);
            expect(button.length).toEqual(0);
        });

        it('should show "Unable to load data" message if load widget data returned error', function () {
            loadWidgetError();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox),
                noData = $('.no-data-error', widgetElem);
            expect(noData.length).toEqual(1);
            expect(noData.text().trim()).toEqual(Localization.widgets.widgetNotFound);
        });

        it('should show "Remove" and "Refresh" buttons if load widget data returned error', function () {
            loadWidgetError();
            renderWidget();
            widget.loadWidget();
            var widgetElem = $('#' + widgetId, sandbox);
            expect($('.remove', widgetElem).length).toEqual(1);
            expect($('.refresh', widgetElem).length).toEqual(1);
            expect($('.settings', widgetElem).length).toEqual(0);
            expect($('.save', widgetElem).length).toEqual(0);
            expect($('.rp-top-links.navbar-right', widgetElem).children().length).toEqual(2);
        });

    });

});