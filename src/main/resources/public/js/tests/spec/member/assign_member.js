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
    var Service = require('memberService');
    var coreService = require('coreService');
    var DataMock = require('fakeData');
    var Member = require('member');
    var SingletonAppModel = require('model/SingletonAppModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var initialState = require('initialState');

        $('body > #sandbox').remove();
        $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

        describe('Assign Users', function () {

            var sandbox = $("#sandbox"),
                members,
                membersContent,
                membersView,
                appModel,
                config;
            Util.extendStings();

            var renderView = function(){
                membersView = new Member.MembersViewAssign({
                    container: sandbox,
                    projectId: appModel.get('projectId'),
                    user: config.userModel.toJSON(),
                    isDefaultProject: false,
                    roles: config.projectRoles,
                    memberAction: 'assignMember',
                    projectRoleIndex: 5
                }).render();
            };
            var findAdminIndex = function(members){
                 return _.findIndex(members, function(i){ return i.userRole == "ADMINISTRATOR"});
            };

            beforeEach(function () {
                config = App.getInstance();
                appModel = new SingletonAppModel();
                appModel.set('projectId', 'default_project');
                config.project.projectId = 'default_project';
                config.router = new Backbone.Router({});
                config.trackingDispatcher = trackingDispatcher;

                initialState.initAuthUser();
                config.userModel.set(DataMock.getConfigUser());
                config.userModel.ready.resolve();

                membersContent = DataMock.getUsersList();
                members = membersContent.content;

                spyOn(Member.MembersViewAssign.prototype, 'getMembers').and.callFake(function () {
                    var deferred = new $.Deferred();
                    deferred.resolve(membersContent);
                    return deferred.promise();
                });

            });

            afterEach(function () {
                config = null;
                members = null;
                membersContent = null;
                appModel = null;
                membersView && membersView.destroy();
                membersView = null;
                $('.dialog-shell').modal('hide');
                $('.modal-backdrop, .dialog-shell').remove();
                sandbox.off().empty();
            });

            it('should be defined assign member view', function(){
                renderView();
                expect(membersView).toBeDefined();
            });

            it('should render user list', function(){
                renderView();
                expect(parseInt($('.rp-members-qty', sandbox).text())).toEqual(members.length);
                expect($('#membersList .rp-table-row', sandbox).length).toEqual(members.length);
            });

            it('should render member info', function(){
                renderView();
                var avatar = $('.rp-member-avatar:first', sandbox),
                    nameBlock = $('.user-name:first', sandbox),
                    timeBlock = $('.show-time:first', sandbox);
                expect(avatar.length).toEqual(1);
                expect(avatar.attr('src').indexOf(members[0].userId)).toBeGreaterThan(0);
                expect(nameBlock.length).toEqual(1);
                expect(nameBlock).not.toBeEmpty();
                expect(timeBlock.length).toEqual(1);
                expect(timeBlock).not.toBeEmpty();
            });

            it('should render select member role dropdown and "Assign" button', function(){
                renderView();
                var selectRole = $('.select-role:first', sandbox),
                    button = $('.dropdown-toggle', selectRole),
                    role = config.defaultProjectRole;

                expect(selectRole.length).toEqual(1);
                expect(button.data('value')).toEqual(role);
                expect($('.select-value', button).text()).toEqual(role);
                expect($('.member-action.rp-btn-default:first', sandbox).length).toEqual(1);
            });

            it('should render admin label and not render "select role dropdown" for admin', function(){
                renderView();
                var adminInx = findAdminIndex(members),
                    row = $('#membersList .rp-table-row', sandbox).eq(adminInx),
                    badge = $('.label-danger', row);
                expect(badge.length).toEqual(1);
                expect($('.dropdown-toggle', row).length).toEqual(0);
                expect($('.member-action.rp-btn-default', row).length).toEqual(1);
                expect($('.admin-role', row)).not.toBeEmpty();
            });

            it('should assign user to project on click "Assign" button', function(){
                spyOn(Service, 'assignMember').and.callFake(function(){
                    var deferred = new $.Deferred();
                    deferred.resolve({msg: ''});
                    return deferred.promise();
                });
                renderView();
                var index = 0,
                    size = members.length,
                    row = $('#membersList .rp-table-row', sandbox).eq(index),
                    assign = $('.member-action.rp-btn-default', row),
                    role = $('.dropdown-toggle', row).data('value'),
                    name = members[index].userId,
                    member = {};
                member[name] = role;
                assign.click();
                expect(Service.assignMember).toHaveBeenCalledWith(member, config.project.projectId);
                expect(membersView.members.length).toEqual(size-1);
            });

        });

    });