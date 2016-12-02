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


define(["jquery", "backbone", "util", "projectinfo", "app", "fakeData", "coreService", 'adminService'], function ($, Backbone, Util, ProjectInfo, App, Mock, Service, AdminService) {
    'use strict';

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config;

    describe('Project info', function () {
        var sandbox = $("#sandbox"),
            view = null,
            projectInfoData = null,
            context = {};
        Util.extendStings();

        var renderInfo = function(){
                view = new ProjectInfo.Body({
                    context: context,
                    body: sandbox,
                    tab: 'info'
                }).render();
            },
            stopLoadProjectInfo = function(){
                spyOn(ProjectInfo.Body.prototype, 'loadProjectInfo').and.stub;
            },
            stopLoadWidgets = function(){
                spyOn(ProjectInfo.Body.prototype, 'loadWidgets').and.stub;
            };

        beforeEach(function () {
            config = App.getInstance();
            config.project = Mock.project();
            projectInfoData = Mock.projectInfoData();
        });

        afterEach(function () {
            config = null;
            view = null;
            projectInfoData = null;
            context = null;
            sandbox.off().empty();
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });

        it('should render project info page', function () {
            stopLoadWidgets();
            stopLoadProjectInfo();
            renderInfo();
            var proj = $('#ProjectInfo', sandbox);
            expect(view).toBeDefined();
            expect(proj).not.toBeEmpty();
            expect(proj.length).toEqual(1);
        });

        /*it('should render "General info" and "Launches owners" widgets', function () {
            var loadData = spyOn(AdminService, 'loadProjectInfo').and.callFake(function(){
                    var deferred = new $.Deferred();
                    deferred.resolve(projectInfoData);
                    return deferred.promise();
                }),
                renderInfo = spyOn(ProjectInfo.Body.prototype, 'renderGeneralInfo').and.callThrough(),
                renderOwners = spyOn(ProjectInfo.Body.prototype, 'renderLaunchesOwners').and.callThrough();
            stopLoadWidgets();
            renderInfo();
            expect(loadData).toHaveBeenCalled();
            expect(renderInfo).toHaveBeenCalled();
            expect(renderOwners).toHaveBeenCalled();
        });*/

    });
});