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

        describe('Edit dashboard', function () {

            var sandbox,
                dialog,
                activeDashboard,
                userDashboards,
                navigationInfo,
                context,
                config;
            Util.extendStings();

            var renderDialog = function(){
                dialog = new Dashboard.EditDashboard({
                    context: context,
                    model: new Dashboard.Model(activeDashboard),
                    project: config.project,
                    navigationInfo: navigationInfo,
                    mydash: _.filter(userDashboards, function(dash){ return dash.owner == config.userModel.get('name')})
                }).render();
            };

            beforeEach(function () {
                sandbox = $("#sandbox");
                config = App.getInstance();
                config.userModel = new Backbone.Model(DataMock.getConfigUser());
                config.trackingDispatcher = trackingDispatcher;
                userDashboards = DataMock.userDashboards();
                activeDashboard = userDashboards[0];
                navigationInfo = new Dashboard.NavigationInfo(activeDashboard);
                navigationInfo.collection = new Backbone.Collection(userDashboards);
                context = {};

                spyOn(Util, "getDialog").and.callFake(function (options) {
                    return $("<div>" + Util.templates(options.name) + "</div>")
                        .find(".dialog-shell")
                        .unwrap()
                        .appendTo(sandbox);
                });

            });

            afterEach(function () {
                config = null;
                userDashboards = null;
                activeDashboard = null;
                navigationInfo = null;
                dialog = null;
                $('.modal-backdrop, .dialog-shell').remove();
                sandbox.off().empty();
            });

            it('should render edit dashboard dialog', function(){
                renderDialog();
                expect($('.dialog-shell', sandbox).length).toEqual(1);
            });

            it('should show dashboard settings and disabled "Submit" button on render dialog', function(){
                renderDialog();
                expect($('#dashboardName', sandbox).val()).toEqual(activeDashboard.name);
                expect($('input.js-switch', sandbox).is(':checked')).toEqual(activeDashboard.isShared);
                expect($('#actionBtnDialog', sandbox)).toHaveClass('disabled');
            });

            it('should enable "Submit" button on change settings', function(){
                renderDialog();
                $('#dashboardName', sandbox).val('dfsdfsdsfsfsf');
                dialog.validate();
                expect($('#actionBtnDialog', sandbox)).not.toHaveClass('disabled');
            });

            it('should update dashboard settings on click "Submit" button', function(){
                spyOn(Dashboard.Model.prototype, 'updateName').and.callFake(function(){});
                renderDialog();
                var dash  = {name: 'new', share: true};
                $('#dashboardName', sandbox).val(dash.name);
                $('input.js-switch', sandbox).prop('checked', dash.share);
                dialog.validate();
                $('#actionBtnDialog', sandbox).click();
                expect(Dashboard.Model.prototype.updateName.calls.mostRecent().args[0]).toEqual(dash);
                expect(Dashboard.Model.prototype.updateName.calls.mostRecent().args[1]).toEqual(jasmine.any(Function));
            });

        });

    });