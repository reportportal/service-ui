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


/*define(['jquery',
        'underscore',
        'backbone',
        'util',
        'components',
        'dataUrlResolver',
        'app',
        'memberService',
        'scrollable',
        'localization',
        'member',
        'fakeData',
        'validate'],
    function ($, _, Backbone, Util, Components, urls, App, Service, Scrollable, Localization, Member, DataMock) {
        'use strict';*/

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var Service = require('memberService');
    var coreService = require('coreService');
    var DataMock = require('fakeData');
    var Member = require('member');

        $('body > #sandbox').remove();
        $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

        describe('Invite User', function () {

            var sandbox = $("#sandbox"),
                inviteView,
                data,
                config;
            Util.extendStings();

            var renderView = function(){
                inviteView = new Member.MembersInvite({
                    container: sandbox,
                    isDefaultProject: false
                }).render();
            };

            beforeEach(function () {
                config = App.getInstance();
                config.userModel = new Backbone.Model(DataMock.getConfigUser());
                data = {
                    backLink: "https://localhost:8443/reportportal-ws/#registration?uuid=fb2250e7-49fd-40a7-b359-c56848c3680e",
                    bid: "fb2250e7-49fd-40a7-b359-c56848c3680e",
                    msg: ''
                };
            });

            afterEach(function () {
                config = null;
                inviteView && inviteView.destroy();
                inviteView = null;
                data = null;
                $('.dialog-shell').modal('hide');
                $('.modal-backdrop, .dialog-shell').remove();
                sandbox.off().empty();
            });

            it('should render invite user form', function(){
                renderView();
                expect(inviteView).toBeDefined();
                expect($('#inviteForm', sandbox).length).toEqual(1);
            });

            it('should send invite on submit form', function(){
                spyOn(Service, 'inviteMember').and.callFake(function(){
                    var deferred = new $.Deferred();
                    deferred.resolve(data);
                    return deferred.promise();
                });
                renderView();
                var form = $('#inviteForm', sandbox),
                    email = $('#email', form),
                    role = $('.dropdown-toggle', form).data('value');
                spyOn(form, 'submit').and.stub;
                email.val('sfdsffd@sdfsdf.by');
                form.validate().form();
                inviteView.onSubmit('inviteMember');
                expect(Service.inviteMember).toHaveBeenCalledWith({default_project: config.project.projectId, email: email.val(), role: role});
            });

            it('should hide form "onSuccess" invite and show invite link', function(){
                renderView();
                var form = $('#inviteForm', sandbox),
                    linkForm = $('#linkForm', sandbox),
                    em = 'sfdsffd@sdfsdf.by',
                    email = $('#email', form);
                email.val(em);
                inviteView.showSuccess(data);
                expect(form.css('display')).toEqual('none');
                expect(linkForm.css('display')).toEqual('block');
                expect($('#inviteLink', linkForm).val()).toEqual(data.backLink);
                expect($('#inviteEmail', linkForm).text().trim()).toEqual(em);
            });

            it('should show invite form and hide invite link form onclick "Back to Form" button', function(){
                renderView();
                var form = $('#inviteForm', sandbox),
                    linkForm = $('#linkForm', sandbox),
                    em = 'sfdsffd@sdfsdf.by',
                    email = $('#email', form),
                    button = $('#cancelInvite', linkForm);
                email.val(em);
                inviteView.showSuccess(data);
                button.click();
                expect(linkForm.css('display')).toEqual('none');
                expect(form.css('display')).toEqual('block');
                expect(email.val()).toEqual('');
                expect($('.dropdown-toggle', form).data('value')).toEqual(config.defaultProjectRole);
            });

        });

    });