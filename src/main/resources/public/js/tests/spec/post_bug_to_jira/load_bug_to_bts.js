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
    var DefectEditor = require('defectEditor');
    var App = require('app');
    var Mock = require('fakeData');
    var Service = require('coreService');
    var initialState = require('initialState');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config;

    describe('Load bug to BTS ', function () {
        var sandbox,
            loadBugView,
            renderLoadBug = function (items) {
                loadBugView = new DefectEditor.LoadBug({
                    systems: config.project.configuration.externalSystem,
                    items: items || [{}]
                }).render();
            };


        beforeEach(function () {
            sandbox = $("#sandbox")
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name, options.data) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
            config = App.getInstance();
            config.project = Mock.project();
            config.trackingDispatcher = trackingDispatcher;

            spyOn(Service, 'getCurrentUser').and.callFake(function(){
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            spyOn(Service, 'getUserAssignedProjects').and.callFake(function(){
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });

            initialState.initAuthUser();
            config.userModel.set(Mock.getConfigUser());
        });

        afterEach(function () {
            config = null;
            loadBugView && loadBugView.destroy();
            loadBugView = null;
            sandbox.off().empty();
            //console.log($._data( $("#sandbox")[0], 'events' ));
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });


        it('should render project selector if multiple bts were connected', function () {
            config.project.configuration.externalSystem.push(Mock.getSecondTBSInstance());
            renderLoadBug();
            expect($("#targetProject", sandbox).length).toEqual(1);
        });

        it('should not render project selector if single bts was connected', function () {
            renderLoadBug();
            expect($("#targetProject", sandbox).length).toEqual(0);
        });

        it('should start with enabled submit button', function () {
            renderLoadBug();
            expect($("#actionBtnDialog", sandbox)).not.toHaveClass('disabled');
        });

        it('should NOT call the Service if any error were found', function () {
            var loadCalls = spyOn(Service, 'loadBugs');
            renderLoadBug();
            $("#actionBtnDialog", sandbox).click();
            expect(loadCalls).not.toHaveBeenCalled();
        });

        it('should call the Service with selected project in case of multi-projects', function () {
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.resolve({});
            var loadCalls = spyOn(Service, 'loadBugs').and.returnValue(promise);
            spyOn(Service, 'updateDefect').and.callFake(function(){
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            renderLoadBug([{id: 12345, issue: {issue_type: "TI001", comment: ''}}]);
            $(".issue-id:first", sandbox).val("TEST-123");
            $(".issue-link:first", sandbox).val("https://jira.epam.com/jira");
            $("#actionBtnDialog", sandbox).click();

            var data = loadCalls.calls.mostRecent().args[0];
            expect(data.systemId).toEqual(loadBugView.systems[0].id);
            expect(data.issues[0].ticketId).toEqual("TEST-123");
        });

        it('should render new line for issue if ADD MORE is clicked', function () {
            renderLoadBug([{id: 12345}]);
            $("#addRow", sandbox).click();
            expect($(".issue-row", sandbox).length).toEqual(2);
        });

        it('should enable issue line deletion if multiple lines were detected', function () {
            renderLoadBug([{id: 12345}]);
            $("#addRow", sandbox).click();
            expect($(".multi", sandbox).length).toEqual(1);
        });

        it('should disable line deletion if only one left', function () {
            renderLoadBug([{id: 12345}]);
            $("#addRow", sandbox).click();
            $(".issue-row:first .remove-row", sandbox).click();
            expect($(".multi", sandbox).length).toEqual(0);
        });

    });
});