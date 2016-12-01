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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var coreService = require('coreService');
    var adminService = require('adminService');
    var Projects = require('projects');
    var adminData = require('adminFakeData');
    var DataMock = require('fakeData');
    var initialState = require('initialState');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config;

    describe('Admin section', function () {
        var sandbox = $("#sandbox"),
            projectView;

        Util.extendStings();

        beforeEach(function () {
            config = App.getInstance();

            initialState.initAuthUser();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();

            spyOn(adminService, 'getProjects').and.callFake(function() {
                var deferred = new $.Deferred();
                deferred.resolve(adminData.projects());
                return deferred.promise();
            });
        });

        afterEach(function () {
            config = null;
            projectView && projectView.destroy();
            projectView = null;
            sandbox.off().empty();
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });

        describe('projects  page', function () {

            it('should call for service getProjects on render', function(){
                projectView = new Projects.List({el: sandbox}).render();
                expect(adminService.getProjects).toHaveBeenCalled();
            });

            it('should render inactive projects collapsed and render projects only if opened', function(){
                projectView = new Projects.List({el: sandbox}).render();
                var inactiveLink = $("#inactiveLink", sandbox),
                    inactiveFound = $("#inactiveFound", inactiveLink),
                    inactivesHolder = $("#collapseInactive", sandbox),
                    accordion = $("#accordion", sandbox);
                expect(inactiveLink).toHaveClass('collapsed');
                expect(inactiveFound.text()).toEqual("1");
                expect(inactivesHolder).toBeEmpty();
                //inactiveLink.click(); --- to slow to test it directly via click
                accordion.trigger('show.bs.collapse');
                expect(inactivesHolder).not.toBeEmpty();
            });

            it('should render project without launches in the not active section if they are more then 7 days old', function(){
                projectView = new Projects.List({el: sandbox}).render();
                //$("#inactiveLink", sandbox).click();
                $("#accordion", sandbox).trigger('show.bs.collapse');
                var project = $("#collapseInactive .project-wrapper:first .assign-to-project", sandbox);
                expect(project.data('project')).toEqual('test-sign');
                var differenceInDays = Util.daysBetween(new Date(projectView.projectsData.inactive[0].creationDate), new Date());
                expect(differenceInDays >= 7).toBeTruthy();
            });

            it('should render project with "New" label if it is less then 7 days old even if it has no launches', function(){
                projectView = new Projects.List({el: sandbox}).render();
                $("#inactiveLink", sandbox).click();

                var projectsHref = $("#activeProjectsList .project-wrapper:first .project_details:last", sandbox).attr('href');
                expect(projectsHref.indexOf('slon-init')).toBeGreaterThan(-1);

                var firstActive = projectView.projectsData.active[0];
                expect(firstActive.launchesQuantity).toEqual(0);
                var differenceInDays = Util.daysBetween(new Date(firstActive.creationDate), new Date());
                expect(differenceInDays <= 7).toBeTruthy();
            });

            it('should render "Assign me" link for project out of user"s projects list', function(){
                projectView = new Projects.List({el: sandbox}).render();
                var ind = _.findIndex(projectView.projectsData.active, function(p){
                    return p.projectId == 'slon-init';
                });
                var projectRow = $("#activeProjectsList .project-item.project-row", sandbox).eq(ind),
                    linkRow = $(".project-link_wrapper", projectRow),
                    assignLink = $(".assign-to-project", projectRow),
                    assignLinkForAssigned = $(".go-to-project", projectRow);
                expect(linkRow).toHaveClass('no-assigned');
                expect(assignLink.length).toEqual(1);
                expect(assignLinkForAssigned).toBeHidden();
            });

            it('should render "Open project" link for project if user assigned to this project', function(){
                projectView = new Projects.List({el: sandbox}).render();
                var ind = _.findIndex(projectView.projectsData.active, function(p){
                    return p.projectId == 'default_project';
                });
                var projectRow = $("#activeProjectsList .project-item.project-row", sandbox).eq(ind),
                    linkRow = $(".project-link_wrapper", projectRow),
                    assignLink = $(".assign-to-project", projectRow),
                    assignLinkForAssigned = $(".go-to-project", projectRow);
                expect(linkRow).not.toHaveClass('no-assigned');
                expect(assignLink.length).toEqual(0);
                expect(assignLinkForAssigned.length).toEqual(1);
            });

        });


    });
});