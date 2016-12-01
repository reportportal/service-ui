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

/*define(["jquery", "backbone", "util", "project", "app", "fakeData", "coreService"], function ($, Backbone, Util, Project, App, Mock, Service) {
    'use strict';*/
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var coreService = require('coreService');
    var App = require('app');
    var Project = require('project');
    var Mock = require('fakeData');
    var SingletonAppModel = require('model/SingletonAppModel');
    var UserModel = require('model/UserModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var initialState = require('initialState');
    require('jasminejQuery');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config;

    describe('Project settings jira integration', function () {
        var sandbox = $("#sandbox"),
            btsView,
            system1,
            system2,
            appModel;
        Util.extendStings();

        beforeEach(function () {
            config = App.getInstance();
            appModel = new SingletonAppModel();
            appModel.set('projectId', 'default_project');
            config.trackingDispatcher = trackingDispatcher;
            config.project = Mock.project();
            system1 = config.project.configuration.externalSystem[0];
            system2 = Mock.getSecondTBSInstance();

            initialState.initAuthUser();
            config.userModel.set(Mock.getConfigUser());
            config.userModel.ready.resolve();

        });

        afterEach(function () {
            config = null;
            btsView && btsView.destroy();
            sandbox.off().empty();
            system1 = null;
            system2 = null;
            appModel = null;
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });

        it('should render first listed Bts form config if bts is not set in project', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#systemType", sandbox).text().trim()).toEqual('JIRA');
            expect($("#url", sandbox)).toHaveValue('');
            expect($("#project", sandbox)).toHaveValue('');
            expect($("#username", sandbox)).toHaveValue('');

        });

        // it('should render first of the external systems found in project config', function () {
        //     var rally = Mock.getNotMultiTBSInstance();
        //     btsView = new Project.BtsView({
        //         holder: sandbox,
        //         externalSystems: [rally],
        //         settings: config.forSettings,
        //         access: true
        //     }).render();
        //     debugger;
        //     expect($("#systemType", sandbox).text().trim()).toEqual(rally.systemType);
        //     expect($("#url", sandbox)).toHaveValue(rally.url);
        //     expect($("#accessKey", sandbox)).toHaveValue(rally.accessKey);
        // });

        it('should render new configuration setup when user switches bts', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: config.project.configuration.externalSystem,
                settings: config.forSettings,
                access: true
            }).render();

            expect($("#systemType", sandbox).text().trim()).toEqual(system1.systemType);
            expect($("#project", sandbox)).toHaveValue(system1.project);

            $("#systemType", sandbox).parent().find('a:eq(1)').click();

            expect($("#systemType", sandbox).text().trim()).toEqual('RALLY');
            expect($("#project", sandbox)).not.toHaveValue();

        });

        it('should show warning if user switches to different bts system then was configured', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: config.project.configuration.externalSystem,
                settings: config.forSettings,
                access: true
            }).render();
            var showSpy = spyOn($.fn, 'show');
            $("#systemType", sandbox).parent().find('a:eq(1)').click();
            expect($.fn.show).toHaveBeenCalled();

            expect(showSpy.calls.mostRecent().object.selector).toEqual('#sandbox #submitPropertiesBlock');

            spyOn($.fn, 'hide');
            $("#systemType", sandbox).parent().find('a:eq(0)').click();
            expect($.fn.hide).toHaveBeenCalled();
        });

        it('should hide warning if user saves different bts system', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            var hideSpy = spyOn($.fn, 'hide');
            $("#systemType", sandbox).parent().find('a:eq(2)').click();

            btsView.model.set("url", 'http://www.test.com');
            btsView.model.set("project", 'test');
            btsView.model.set("accessKey", '_234523452345');

            spyOn(coreService, 'getBtsFields').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(Mock.jiraDefaultFields());
                return deferred.promise();
            });
            spyOn(coreService, 'createExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({id: 33333});
                return deferred.promise();
            });
            spyOn(coreService, 'clearExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            spyOn(coreService, 'updateExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });

            $("#submitBtsProperties", sandbox).click();

            expect(hideSpy.calls.mostRecent().object.selector).toEqual('#sandbox #tbsChangeWarning');
        });

        it('should override previous bts"s in config if user saves different bts system', function () {
            var systems = config.project.configuration.externalSystem;
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: systems,
                settings: config.forSettings,
                access: true
            }).render();

            $("#systemType", sandbox).parent().find('a:eq(1)').click();
            btsView.model.set("url", 'http://www.test.com');
            btsView.model.set("project", 'test');
            btsView.model.set("accessKey", '_234523452345');

            spyOn(coreService, 'getBtsFields').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(Mock.jiraDefaultFields());
                return deferred.promise();
            });
            spyOn(coreService, 'createExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({id: 33333});
                return deferred.promise();
            });
            spyOn(coreService, 'clearExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });

            expect(systems[0].systemType).toEqual('JIRA');
            $("#submitBtsProperties", sandbox).click();
            expect(systems[0].systemType).toEqual('RALLY');
        });

        it('should render multi-system header if selected bts in config has multiple - true', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: config.project.configuration.externalSystem,
                settings: config.forSettings,
                access: true
            }).render();

            expect(config.forSettings['bts' + system1.systemType].multiple).toBeTruthy();
            expect($("#instanceHead .nav-tabs-bts-instances", sandbox).length).toEqual(1);

            $("#systemType", sandbox).parent().find('a:eq(1)').click();

            expect(config.forSettings['bts' + btsView.model.get("systemType")].multiple).toBeFalsy();
            expect($("#instanceHead .nav-tabs-bts-instances", sandbox).length).toEqual(0);

        });

        it('should render tab with project name for each configured bts instance in multi-system config', function () {
            var btsList = [system1, system2];
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: btsList,
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#instanceHead .bts-instance[id]", sandbox).length).toEqual(btsList.length);
        });

        // it('should not render instance in multi-system header if has configured non multi-system instance', function () {
        //     btsView = new Project.BtsView({
        //         holder: sandbox,
        //         externalSystems: [Mock.getNotMultiTBSInstance()],
        //         settings: config.forSettings,
        //         access: true
        //     }).render();
        //     $("#systemType", sandbox).parent().find('a:eq(0)').click();
        //     expect($("#instanceHead .bts-instance:first", sandbox).text()).toEqual('New Project');
        //     expect(btsView.systems.length).toEqual(1);
        // });

        // it('should re-render tab content according to selected system setup', function () {
        //     btsView = new Project.BtsView({
        //         holder: sandbox,
        //         externalSystems: [system1, system2],
        //         settings: config.forSettings,
        //         access: true
        //     }).render();
        //     expect($("#project", sandbox)).toHaveValue(system1.project);
        //     $("#" + system2.id, sandbox).click();
        //     expect($("#project", sandbox)).toHaveValue(system2.project);
        // });

        it('should render "+" disabled if there are no bts defined yet', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#instanceHead .add-new", sandbox).parent()).toHaveClass('disabled');
        });

        it('should render new bts config fields if "+" is clicked with clickable "x" instead to close new tab', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#project", sandbox)).toHaveValue(system1.project);
            $("#instanceHead .add-new", sandbox).click();
            expect($("#project", sandbox)).not.toHaveValue();
            $("#instanceHead .close-add-action", sandbox).click();
            expect($("#project", sandbox)).toHaveValue(system1.project);
        });

        it('should allow multi-system bts to delete single project setup', function () {
            var btsList = [system1, system2];
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: btsList,
                settings: config.forSettings,
                access: true
            }).render();
            spyOn(Util, "confirmDeletionDialog").and.callFake(function (options) {
                options.callback && options.callback();
            });
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.resolve({});
            spyOn(coreService, "deleteExternalSystem").and.returnValue(promise);
            expect($("#instanceHead .bts-instance[id]", sandbox).length).toEqual(btsList.length);
            $("#deleteInstance", sandbox).click();
            expect($("#instanceHead .bts-instance[id]", sandbox).length).toEqual(btsList.length);
        });

        it('should render bts properties as disabled if system was connected, save/edit buttons are flipped', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();

            expect($("#url", sandbox)).toBeDisabled();
            expect($("#editBtsProperties", sandbox).css('display')).not.toEqual('none');
            expect($("#deleteInstance", sandbox).css('display')).not.toEqual('none');
            expect($("#submitPropertiesBlock", sandbox)).not.toBeVisible();
        });

        it('should render bts field from configured system if any were found', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();

            var propertiesLength = system1.fields.length,
                renderedFieldsLength = $("#dynamicFields > .rp-form-group", sandbox).length;
            expect(propertiesLength).toEqual(renderedFieldsLength);
        });

        it('should call to get default fields set for system if fields property is empty', function () {
            system1.fields = [];
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.resolve([]);
            spyOn(coreService, 'getBtsFields').and.returnValue(promise);
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            expect(coreService.getBtsFields).toHaveBeenCalledWith(system1.id);
        });

        it('should show loader block while default fields are loading', function () {
            system1.fields = [];
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            spyOn(coreService, 'getBtsFields').and.returnValue(promise);
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#fieldsLoader", sandbox).css('display')).toEqual('block');
        });

        it('should hide loader block on success', function () {
            system1.fields = [];
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.resolve([]);
            spyOn(coreService, 'getBtsFields').and.returnValue(promise);
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#fieldsLoader", sandbox)).toHaveAttr('style', 'display: none;');
        });

        it('should hide loader block on error', function () {
            system1.fields = [];
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.reject({});
            spyOn(coreService, 'getBtsFields').and.returnValue(promise);
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#fieldsLoader", sandbox)).toHaveAttr('style', 'display: none;');
        });

        it('should render bts field selector marked as required with selected state and disabled', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            var requiredFieldCheckBox = $("#issuetype", sandbox).closest('.rp-form-group').find('.default-selector:first'),
                notRequiredFieldCheckBox = $("#components", sandbox).closest('.rp-form-group').find('.default-selector:first');
            expect(requiredFieldCheckBox).toBeDisabled();
            expect(notRequiredFieldCheckBox).not.toBeDisabled();
        });

        it('should warn user that default properties for issue form will be reset if user changes bts system link or project name', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();

            var showSpy = spyOn($.fn, 'show'),
                warningBlock = $("#resetFieldsWarning", sandbox);

            $("#editBtsProperties", sandbox).click();
            $("#project", sandbox).val("123").blur();
            expect(showSpy.calls.mostRecent().object.selector).toEqual('#sandbox #resetFieldsWarning');

            $("#cancelBtsProperties", sandbox).click();
            expect(warningBlock).not.toBeVisible();

            $("#editBtsProperties", sandbox).click();
            $("#url", sandbox).val("123").blur();
            expect(showSpy.calls.mostRecent().object.selector).toEqual('#sandbox #resetFieldsWarning');
        });

        it('should render dynamic field as input[type=text] if field has no definedValues and as button otherwise', function () {
            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();
            expect($("#issuetype", sandbox)).toEqual('input');
            expect($("#priority", sandbox)).toEqual('button');
        });

        it('should call Service to get all properties if update has been clicked and preserve already selected values', function () {
            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.resolve(system1.fields);
            spyOn(coreService, 'getBtsFields').and.returnValue(promise);

            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();

            var selectedValue = $("#components", sandbox).val();
            $("#updateFields", sandbox).click();
            var rerenderedValue = $("#components", sandbox).val();

            expect(coreService.getBtsFields).toHaveBeenCalled();
            expect(selectedValue).toEqual(rerenderedValue);
        });

        it('should hide unselected field on submit Default Properties and update local config', function () {
            spyOn(coreService, 'getBtsFields').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(Mock.jiraDefaultFields());
                return deferred.promise();
            });
            spyOn(coreService, 'updateExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });

            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();

            var newValue = 'test value';

            var assigneeField = _.find(system1.fields, {id: 'assignee'}),
                componentsField = _.find(system1.fields, {id: 'components'});

            expect(componentsField).toBeDefined();
            expect(assigneeField).toBeDefined();
            expect(assigneeField.value).toEqual([]);

            expect($("#dynamicFields > .rp-form-group", sandbox).length).toEqual(5);

            $("#components", sandbox).closest('.rp-form-group').find('.default-selector').prop('checked', false);
            $("#assignee", sandbox).val(newValue);

            $("#submitFields", sandbox).click();

            assigneeField = _.find(system1.fields, {id: 'assignee'}),
                componentsField = _.find(system1.fields, {id: 'components'});

            expect(componentsField).not.toBeDefined();
            expect(assigneeField.value).toEqual([newValue]);
            expect($("#dynamicFields > .rp-form-group", sandbox).length).toEqual(4);

        });

        it('should re-render submitted fields if submit was successful and update project settings in local config', function () {

            spyOn(coreService, 'getBtsFields').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(Mock.jiraDefaultFields());
                return deferred.promise();
            });
            spyOn(coreService, 'updateExternalSystem').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });

            btsView = new Project.BtsView({
                holder: sandbox,
                externalSystems: [system1],
                settings: config.forSettings,
                access: true
            }).render();

            $("#updateFields", sandbox).click();

            expect($("#dynamicFields > .rp-form-group", sandbox).length).toEqual(6);
            expect($("#cancelFields", sandbox).css('display')).toEqual('inline-block');

            var attachmentField = $("#attachment", sandbox);
            attachmentField.closest('.rp-form-group').find('.default-selector').prop('checked', true);

            var priorityField = $("#priority", sandbox);
            priorityField.closest('.rp-form-group').find('.default-selector').prop('checked', false);

            $("#submitFields", sandbox).click();

            expect($("#dynamicFields > .rp-form-group", sandbox).length).toEqual(5);
            var newField = _.find(system1.fields, {id: 'attachment'});
            expect(newField).toBeDefined();

        });

    });
});