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
    var Localization = require('localization');
    var App = require('app');
    var Service = require('coreService');
    var LoginView = require('landing/LoginView');
    var UserModel = require('model/UserModel');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Login', function () {

        var sandbox,
            view,
            user,
            config;
        Util.extendStings();

        var renderForm = function () {
            spyOn(Service, 'validateRestorationKey').and.stub;
            view = new LoginView();
        };

        var spyLogin = function () {
            spyOn(user, 'login').and.callFake(function (login, pass) {});
        };
        var spyLoginFail = function(code) {
            spyOn(user, 'login').and.callFake(function (login, pass) {
                var async = $.Deferred();
                async.reject({status: code});
                return async.promise();
            });
        };
        var spyLoginSuccess = function() {
            spyOn(user, 'login').and.callFake(function (login, pass) {
                var async = $.Deferred();
                async.resolve();
                return async.promise();
            });
        };

        beforeEach(function () {
            sandbox = $("#sandbox");
            config = App.getInstance();
            sandbox.append('<div class="block-login"></div>');
            spyOn(Backbone.View.prototype, 'listenTo').and.stub;
            spyOn(Util, 'hideMessage').and.stub;
            spyOn(Service, 'getRegistryInfo').and.callFake(function(){
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
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
            user = new UserModel();
        });

        afterEach(function () {
            config = null;
            user = null;
            view.destroy();
            view = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should render Login form', function () {
            renderForm();
            expect(view).toBeDefined();
            expect($('#login-form', view.$el).length).toEqual(1);
        });

        it('should show error message if login field is empty', function () {
            renderForm();
            spyLogin();
            $('#submit_user', view.$el).click();
            expect($('.js-loginerror', sandbox)).toBeVisible();
            expect($('#errorText', sandbox).text().trim()).toEqual(Localization.ui.wrongcharacters);
        });

        it('should show error message if login more than 128', function () {
            renderForm();
            spyLogin();
            var login = '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111';
            $('#user_login', sandbox).val(login);
            $('#submit_user', sandbox).click();
            expect($('.js-loginerror', sandbox)).toBeVisible();
            expect($('#errorText', sandbox).text().trim()).toEqual(Localization.ui.wronglength);
        });

        it('should show error message if password field is empty', function () {
            renderForm();
            spyLogin();
            $('#user_login', sandbox).val('11111');
            $('#submit_user', sandbox).click();
            expect($('.js-loginerror', sandbox)).toBeVisible();
            expect($('#errorText', sandbox).text().trim()).toEqual(Localization.forms.passwordEmpty);
        });

        it('should show error message if password lesser than 4', function () {
            renderForm();
            spyLogin();
            $('#user_login', sandbox).val('11111');
            $('#user_password', sandbox).val('11');
            $('#submit_user', sandbox).click();
            expect($('.js-loginerror', sandbox)).toBeVisible();
            expect($('#errorText', sandbox).text().trim()).toEqual(Localization.forms.passwordSize);
        });

        it('should submit user if login and password is valid', function () {
            renderForm();
            spyLoginSuccess();
            var login = $('#user_login', sandbox);
            var pass = $('#user_password', sandbox);
            var lg = '111111';
            var ps = '111111';
            login.val(lg);
            pass.val(ps);
            $('#submit_user', sandbox).click();
            expect($('#errorText', view.$el)).toBeEmpty();
            expect(user.login).toHaveBeenCalledWith(lg, ps);
        });

        it('should block form if user submit invalid data 5 times', function () {
            renderForm();
            spyLoginFail(403);
            spyOn(LoginView.prototype, 'showBlockMessage').and.callThrough();
            var login = $('#user_login', sandbox),
                pass = $('#user_password', sandbox),
                submitBtn = $('#submit_user', sandbox),
                lg = '111111',
                ps = '111111';
            login.val(lg);
            pass.val(ps);
            submitBtn.click();
            expect(LoginView.prototype.showBlockMessage).toHaveBeenCalled();
            expect(login.attr('disabled')).toEqual('disabled');
            expect(pass.attr('disabled')).toEqual('disabled');
            expect(submitBtn.attr('disabled')).toEqual('disabled');
        });

        it('should show Forgot password form on click "Forgot your password?"', function () {
            renderForm();
            var loginForm = $('#login-form', sandbox),
                forgotBtn = $('#forgotPass', sandbox);
            forgotBtn.click();
            var restoreForm = $('#restore-form', sandbox);
            expect(loginForm.css('display')).toEqual('none');
            expect(restoreForm.length).toEqual(1);
            expect(restoreForm.css('display')).toEqual('block');
        });

        it('should submit restore password click button "Restore password"', function () {
            renderForm();
            spyOn(Service, 'initializePassChange').and.callFake(function (email) {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            spyOn(_, 'delay').and.stub;
            var loginForm = $('#login-form', sandbox),
                forgotBtn = $('#forgotPass', sandbox);
            forgotBtn.click();
            var submit = $('#submit_restore', sandbox),
                email = $('#restore_email', sandbox),
                eml = 'qwerty@qwerty.com';
            email.val(eml);
            email.trigger('validation::change', {valid: true, value: eml});
            submit.removeAttr('disabled').removeClass('disabled').trigger('click');
            expect(Service.initializePassChange).toHaveBeenCalledWith(eml);
        });


        it('should show Login form and hide Forgot password form on click button "Cancel"', function () {
            renderForm();
            var loginForm = $('#login-form', sandbox),
                forgotBtn = $('#forgotPass', sandbox);
            forgotBtn.click();
            var cancel = $('#cancel_restore', sandbox);
            cancel.click();
            expect(loginForm.css('display')).toEqual('block');
            expect($('#restore-form', sandbox).length).toEqual(0);
        });

    });

});