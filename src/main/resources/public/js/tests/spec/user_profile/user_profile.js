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
    var Profile = require('profile');
    var Service = require('coreService');
    var DataMock = require('fakeData');
    var App = require('app');
    var SingletonAppModel = require('model/SingletonAppModel');
    var UserModel = require('model/UserModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var initialState = require('initialState');
    require('mode-properties');
    require('bootstrap');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('User profile', function () {

        var sandbox = $("#sandbox"),
            context,
            userInfo,
            appModel,
            profileView,
            config;
        Util.extendStings();

        beforeEach(function () {
            userInfo = DataMock.getUserInfo();
            config = App.getInstance();
            appModel = new SingletonAppModel();
            appModel.set('projectId', 'default_project');
            config.router = new Backbone.Router({});
            config.trackingDispatcher = trackingDispatcher;

            context = {
                getMainView: function () {
                    return {
                        $body: $('#dynamic-content', sandbox),
                        $header: $('#contentHeader', sandbox)
                    }
                }
            };

            initialState.initAuthUser();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();

            spyOn(Profile.UserPageView.prototype, 'initEditor').and.stub();

            spyOn(Service, 'getApiToken').and.callFake(function(){
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.getToken());
                return deferred.promise();
            });

            profileView = new Profile.UserPageView({
                body: sandbox,
                vent: _.extend({}, Backbone.Events),
                context: this.context,
                navigationInfo: this.navigationInfo
            });

        });

        afterEach(function () {
            config = null;
            context = null;
            userInfo = null;
            appModel = null;
            profileView && profileView.destroy();
            profileView = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should render user profile view', function () {
            expect(profileView).toBeDefined();
            expect($('.pr-user-profile', sandbox).length).toEqual(1);
        });

        it('should render user projects list', function () {
            var pr = $('#projects', sandbox);
            expect(pr.length).toEqual(1);
            expect($('.project', pr).length).toEqual(_.size(config.userModel.get('projects')));
        });

        it('should render code editor', function () {
            var editor = $('.code_editor', sandbox);
            expect(editor.length).toEqual(1);
        });

        it('should render user info', function () {
            var info = $('#staticInfo', sandbox);
            expect(info.length).toEqual(1);
            expect($('.profile_name', info).text()).toEqual(config.userModel.get('user_login'));
            expect($.trim($('.profile_full_name', info).text())).toEqual(config.userModel.get('fullName'));
            expect($.trim($('.profile_mail', info).text())).toEqual(config.userModel.get('email'));
        });

        it('should render user profile photo', function () {
            var photo = $('#userProfileAvatar', sandbox);
            expect(photo.length).toEqual(1);
            expect(photo.attr('src')).toEqual(Util.updateImagePath(config.userModel.get('image')));
        });

        it('should render edit profile buttons for "INTERNAL" user', function () {
            var buttons = $('#updateButtons', sandbox);
            expect(buttons.length).toEqual(1);
            expect($('#editInfo', sandbox).length).toEqual(1);
            expect($('#changePassword', sandbox).length).toEqual(1);
            expect($('#imgSelector', sandbox).length).toEqual(1);
            expect($('#remove-image', sandbox).length).toEqual(1);
        });

        it('not should be block "Force Update" for "INTERNAL" user', function () {
            expect($('.forse-update-label', sandbox).length).toEqual(0);
            expect($('#force-update', sandbox).length).toEqual(0);
        });

        it('should show edit user info form on click "Edit personal info" button', function () {
            var hideSpy = spyOn($.fn, 'hide'),
                editInfo = $('#editInfo', sandbox),
                changePassword = $('#changePassword', sandbox);
            editInfo.click();
            expect(hideSpy.calls.mostRecent().object.selector).toEqual('#sandbox #staticInfo');
            expect($('#infoEditor', sandbox).length).toEqual(1);
            expect(editInfo).toHaveClass('disabled');
            expect(changePassword).toHaveClass('disabled');
        });

        it('should update user info, on submit edit form', function () {
            var editInfo = $('#editInfo', sandbox),
                name = 'User Full Name',
                email = 'useremail@email.com';
            spyOn(Service, 'submitProfileInfo').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({fullName: name, email: email});
                return deferred.promise();
            });
            editInfo.click();
            $('#fullName', sandbox).val(name);
            $('#email', sandbox).val(email);
            profileView.validateInfo();
            $('#submit_info', sandbox).click();
            expect(Service.submitProfileInfo).toHaveBeenCalled();
            expect(Service.submitProfileInfo.calls.mostRecent().args[0].full_name).toEqual(name);
            expect(Service.submitProfileInfo.calls.mostRecent().args[0].email).toEqual(email);
        });

        it('should hide edit user info form on click "Cancel" button', function () {
            var staticInfo = $('#staticInfo', sandbox),
                editInfo = $('#editInfo', sandbox),
                changePassword = $('#changePassword', sandbox),
                cancel;
            editInfo.click();
            cancel = $('#cancel_info', sandbox);
            cancel.click();
            expect($('#infoEditor', sandbox).length).toEqual(0);
            expect(staticInfo.css('display')).toEqual('block');
            expect(editInfo).not.toHaveClass('disabled');
            expect(changePassword).not.toHaveClass('disabled');
        });


        it('should show change password form on click "Change Password" button', function () {
            var hideSpy = spyOn($.fn, 'hide'),
                editInfo = $('#editInfo', sandbox),
                changePassword = $('#changePassword', sandbox);
            changePassword.click();
            expect(hideSpy.calls.mostRecent().object.selector).toEqual('#sandbox #staticInfo');
            expect($('#changePass', sandbox).length).toEqual(1);
            expect(editInfo).toHaveClass('disabled');
            expect(changePassword).toHaveClass('disabled');
        });

        it('should update user password, on submit change password form', function () {
            var changePassword = $('#changePassword', sandbox),
                oldPass = '1q2w3e',
                newPass = '654321';
            spyOn(Service, 'submitPassChange').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            changePassword.click();
            $('#originalPass', sandbox).val(oldPass).data('valid', true);
            $('#newPass', sandbox).val(newPass);
            $('#newPassComfirm', sandbox).val(newPass);
            profileView.validatePass({}, {valid: true, value: "654321"});
            $('#submit_change', sandbox).click();
            expect(Service.submitPassChange).toHaveBeenCalled();
            expect(Service.submitPassChange.calls.mostRecent().args[0].oldPassword).toEqual(oldPass);
            expect(Service.submitPassChange.calls.mostRecent().args[0].newPassword).toEqual(newPass);
        });

        it('should hide change password form on click "Cancel" button', function () {
            var staticInfo = $('#staticInfo', sandbox),
                editInfo = $('#editInfo', sandbox),
                changePassword = $('#changePassword', sandbox),
                cancel;
            changePassword.click();
            cancel = $('#cancel_change', sandbox);
            cancel.click();
            expect(staticInfo.css('display')).toEqual('block');
            expect($('#changePass', sandbox).length).toEqual(0);
            expect(editInfo).not.toHaveClass('disabled');
            expect(changePassword).not.toHaveClass('disabled');
        });

        it('should delete user photo on click button "Remove avatar"', function () {
            var remove = $('#remove-image', sandbox);
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
            spyOn(Service, 'deletePhoto').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            remove.click();
            var modal = $('.modal-dialog', sandbox);
            expect(Util.getDialog).toHaveBeenCalled();
            expect(modal.length).toEqual(1);
            $('.rp-btn-danger', modal).click();
            expect(Service.deletePhoto).toHaveBeenCalled();

        });

        it('should update UUID on click button "Update UUID"', function () {
            var update = $('#update-uuid', sandbox);
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
            spyOn(Service, 'generateApiToken').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            update.click();
            var modal = $('.modal-dialog', sandbox);
            expect(Util.getDialog).toHaveBeenCalled();
            expect(modal.length).toEqual(1);
            $('#actionBtnDialog', modal).click();
            expect(Service.generateApiToken).toHaveBeenCalled();
        });

    });

});