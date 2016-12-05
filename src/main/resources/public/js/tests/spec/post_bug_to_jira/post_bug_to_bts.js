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

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config,
        styleBlock = 'display: block;';

    describe('Post bug to Jira form', function () {
        var sandbox = $("#sandbox"),
            postBugView,
            renderPostBug = function () {
                postBugView = new DefectEditor.PostBug({
                    settings: config.forSettings,
                    user: config.user,
                    systems: config.project.configuration.externalSystem,
                    selected: 1,
                    items: [{}]
                }).render();
            };

        Util.extendStings();

        beforeEach(function () {

            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name, options.data) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
            config = App.getInstance();
            config.project = Mock.project();
            initialState.initAuthUser();
            config.userModel.set(Mock.getConfigUser());
            config.userModel.ready.resolve();
            config.user = {};
        });

        afterEach(function () {
            config = null;
            postBugView && postBugView.destroy();
            postBugView = null;
            sandbox.off().empty();
            //console.log($._data( $("#sandbox")[0], 'events' ));
            $('.modal-backdrop, .dialog-shell, .select2-hidden-accessible').remove();
        });


        it('should render dynamic fields from options.fields and make matched with options.disabled not editable', function () {
            renderPostBug();
            var configFieldsLength = config.project.configuration.externalSystem[0].fields.length,
                renderedFieldsLength = $("#dynamicContent > .rp-form-group", sandbox).length,
                disabledId = config.forSettings.btsJIRA.disabledForEdit[0],
                possiblyDisabledElement = $("#" + disabledId, sandbox);
            expect(configFieldsLength).toEqual(renderedFieldsLength);
            expect(configFieldsLength).toEqual(renderedFieldsLength);
            expect(possiblyDisabledElement).toBeDisabled();
        });

        it('should render required fields marked with "required-value" class', function () {
            renderPostBug();
            var configRequiredFieldsLength = 0,
                renderedRequiredFieldsLength = $("#dynamicContent .required-value", sandbox).length;
            _.forEach(config.project.configuration.externalSystem[0].fields, function (field) {
                if (field.required) {
                    configRequiredFieldsLength += 1;
                }
            });
            expect(configRequiredFieldsLength).toEqual(renderedRequiredFieldsLength);
        });

        it('should render includes block if "selected" property is set 1', function () {
            renderPostBug();
            var includesBlock = $("#includesBlock", sandbox);
            expect(includesBlock.length).toEqual(1);
        });

        it('should not render includes block if "selected" property in set to more then 1', function () {
            postBugView = new DefectEditor.PostBug({
                settings: config.forSettings,
                user: config.user,
                systems: config.project.configuration.externalSystem,
                selected: 3,
                items: [{}]
            }).render();
            var includesBlock = $("#includesBlock", sandbox);
            expect(includesBlock.length).toEqual(0);
        });

        it('should render bts credentials block with authentication type selector', function () {
            renderPostBug();
            expect($("#systemAuth", sandbox).length).toEqual(1);
        });

        it('should render bts credentials filled with default password if session credentials were found', function () {
            var id = config.project.configuration.externalSystem[0].id,
                hash = {};
            hash[id] = {
                username: 'tester',
                password: 'secret',
                submits: 2,
            };
            config.user.bts = {
                hash: hash,
                current: config.project.configuration.externalSystem[0]
            };

            renderPostBug();
            expect($("#username", sandbox).val()).toEqual('tester');
            expect($("#password", sandbox).val()).toEqual(config.forSettings.defaultPassword);
        });

        it('should render bts credentials block collapsed if credentials are empty and at least one successful submit passed', function () {
           var hash = {},
               id =  config.project.configuration.externalSystem[0].id;
            hash[id] = { submits: 2 };
           config.user.bts = {
                hash: hash,
                current: config.project.configuration.externalSystem[0]
            };

            renderPostBug();
            expect($("#username", sandbox)).not.toHaveValue();
            expect($("#credentialsLink", sandbox)).toHaveClass('collapsed');
            expect($("#collapseCredentials", sandbox)).not.toHaveClass('in');
        });

        // it('should not show "fields" error message if required fields were empty on submit', function () {
        //     renderPostBug();
        //     $("#actionBtnDialog", sandbox).click();
        //     expect($("#requiredFields", sandbox)).toHaveAttr('style', styleBlock);
        //     expect($("#summary", sandbox).closest('.rp-form-group')).toHaveClass('has-error');
        // });

        // it('should not show "credentials" error and hide soft warning if server response has been parsed with "authentication" error', function () {
        //     renderPostBug();
        //     spyOn(Service, 'postBugToBts').and.callFake(function () {
        //         var deferred = new $.Deferred();
        //         deferred.reject({
        //             readyState: 4,
        //             responseText: "{\"error_code\":5000,\"message\":\"Unauthorized (401)\"}",
        //             status: 500
        //         });
        //         return deferred.promise();
        //     });
        //     $("#summary", sandbox).val('test');
        //     $("#actionBtnDialog", sandbox).click();
        //     expect($("#credentialsWrong", sandbox)).toHaveAttr('style', styleBlock);
        //     expect($("#credentialsSoft", sandbox)).not.toHaveAttr('style', styleBlock);
        // });

        it('should display general error message in case when authorization pattern was not found', function () {
            renderPostBug();
            var response = {"error_code":5000,message:"Fake error omg =("};
            spyOn(Service, 'postBugToBts').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.reject({
                    readyState: 4,
                    responseText: JSON.stringify(response),
                    status: 500
                });
                return deferred.promise();
            });

            var errorHolder = $("#credentialsWrong", sandbox),
                fieldsError = errorHolder.data('general') + JSON.stringify(response);

            $("#summary", sandbox).val('test');
            $("#username", sandbox).val('tester');
            $("#password", sandbox).val('dfggfdgdfgfgdf');
            $("#actionBtnDialog", sandbox).click();
            expect($("#credentialsWrong", sandbox)).toHaveAttr('style', styleBlock);
            expect(errorHolder.text()).toEqual(fieldsError);
        });

        it('should render project selector if more then 1 bts configurations were found', function () {
            config.project.configuration.externalSystem.push(Mock.getSecondTBSInstance());
            renderPostBug();
            expect($("#targetProject", sandbox).length).toEqual(1);
        });

        it('should re-render fields if different project was selected', function () {
            config.project.configuration.externalSystem.push(Mock.getSecondTBSInstance());
            renderPostBug();
            expect($("#dynamicContent .rp-form-group", sandbox).length).not.toEqual(1);
            $(".project-name:eq(1)", sandbox).click();
            expect($("#dynamicContent .rp-form-group", sandbox).length).toEqual(1);
        });

        it('should re-render authentication fields with cached values and de-collapse their block if different project was selected', function () {
            config.project.configuration.externalSystem.push(Mock.getSecondTBSInstance());
            var id = config.project.configuration.externalSystem[0].id,
                id2 = config.project.configuration.externalSystem[1].id,
                hash = {};
            hash[id] = {
                username: 'tester',
                password: 'secret',
                submits: 2,
            };
            hash[id2] = {
                username: 'owner'
            };
            config.user.bts = {
                hash: hash,
                current: config.project.configuration.externalSystem[0]
            };
            renderPostBug();
            expect($("#credentialsLink", sandbox)).toHaveClass('collapsed');
            $(".project-name:eq(1)", sandbox).click();
            expect($("#credentialsLink", sandbox)).not.toHaveClass('collapsed');
            expect($("#username", sandbox).val()).toEqual(hash[id2].username);
        });

        it('should render warning message in place of fields if they were not configured and disable submit', function () {
            var system = Mock.getSecondTBSInstance();
            system.fields = null;
            config.project.configuration.externalSystem.push(system);
            renderPostBug();

            $(".project-name:eq(1)", sandbox).click();
            expect($("#dynamicContent .alert.alert-warning", sandbox).length).toEqual(1);
            expect($("#actionBtnDialog", sandbox).prop('disabled')).toBeTruthy();
        });

        it('should not render credentials soft warning if system can not use RP credentials', function () {
            var system = Mock.getNotMultiTBSInstance();
            config.project.configuration.externalSystem = [system];
            renderPostBug();
            expect(config.forSettings['bts' + system.systemType].canUseRPAuthorization).toBeFalsy();
            expect($("#credentialsSoft", sandbox).length).toEqual(0);
        });

    });
});