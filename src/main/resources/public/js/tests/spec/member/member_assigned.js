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
    var Member = require('member');
    var DataMock = require('fakeData');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var initialState = require('initialState');
    require('validate');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Assigned Members', function () {

        var sandbox = $("#sandbox"),
            members,
            membersContent,
            membersView,
            config;
        Util.extendStings();

        var renderView = function () {
            membersView = new Member.MembersView({
                container: sandbox,
                projectId: config.project.projectId,
                user: config.userModel,
                isDefaultProject: false,
                roles: config.projectRoles,
                memberAction: 'unAssignMember',
                projectRoleIndex: 5
            }).render();
        };
        var findAdminIndex = function (members) {
            return _.findIndex(members, function (i) {
                return i.userRole == "ADMINISTRATOR"
            });
        };
        var getRole = function (member) {
            var project = member.assigned_projects[config.project.projectId],
                role = project ? project.projectRole : null;
            return role;
        };

        beforeEach(function () {
            config = App.getInstance();
            config.project.projectId = 'default_project';
            config.router = new Backbone.Router({});
            config.trackingDispatcher = trackingDispatcher;

            initialState.initAuthUser();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();

            membersContent = DataMock.getMembers();
            members = membersContent.content;

            spyOn(Member.MembersView.prototype, 'getMembers').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(membersContent);
                return deferred.promise();
            });

        });

        afterEach(function () {
            config = null;
            members = null;
            membersContent = null;
            membersView && membersView.destroy();
            membersView = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should render assigned members list', function () {
            renderView();
            expect(membersView).toBeDefined();
            expect(parseInt($('.rp-members-qty', sandbox).text())).toEqual(members.length);
            expect($('#membersList .rp-table-row', sandbox).length).toEqual(members.length);
        });

        it('should render assigned member info', function () {
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

        it('should render member role dropdown', function () {
            renderView();
            var selectRole = $('.select-role:first', sandbox),
                button = $('.dropdown-toggle', selectRole),
                role = getRole(members[0]);
            expect(selectRole.length).toEqual(1);
            expect(button.data('value')).toEqual(role);
            expect($('.select-value', button).text()).toEqual(role);
        });

        it('should not render "select role dropdown" and "Unassign" button for admin', function () {
            renderView();
            var adminInx = findAdminIndex(members),
                row = $('#membersList .rp-table-row', sandbox).eq(adminInx);
            expect($('.dropdown-toggle', row).length).toEqual(0);
            expect($('.member-action.rp-btn-danger', row).length).toEqual(0);
            expect($('.admin-role', row)).not.toBeEmpty();
        });

        it('should be disabled "select role dropdown" and should not render "Unassign" button, if user dont have permission', function () {
            config.userModel.set('userRole', 'USER');
            renderView();
            var row = $('#membersList .rp-table-row:first', sandbox);
            expect($('.dropdown-toggle', row)).toBeDisabled();
            expect($('.action-info', row)).not.toBeEmpty();
            expect($('.material-icons', row).length).toEqual(1);
            expect($('.member-action.rp-btn-danger', row).length).toEqual(0);
        });

        it('should not be disabled "select role dropdown" and should render "Unassign" button, if user have permission', function () {
            renderView();
            var row = $('#membersList .rp-table-row:first', sandbox);
            expect($('.dropdown-toggle', row)).not.toBeDisabled();
            expect($('.action-info', row).text().trim()).toEqual('');
            expect($('.material-icons', row).length).toEqual(0);
            expect($('.member-action.rp-btn-default', row).length).toEqual(1);
        });

        it('should render "admin" badge for "ADMINISTRATOR"', function () {
            renderView();
            var adminInx = findAdminIndex(members),
                badge = $('.label-danger', $('.user-name', sandbox).eq(adminInx));
            expect(badge.length).toEqual(1);
        });

        it('should render "you" badge for current user', function () {
            renderView();
            var adminInx = findAdminIndex(members),
                badge = $('.label-success', $('.user-name', sandbox).eq(adminInx));
            expect(badge.length).toEqual(1);
        });

        it('should update member project role on change "Project Role DropDown"', function () {
            renderView();
            spyOn(Service, 'updateMember').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            var dd = $('.dropdown-toggle:first', sandbox),
                ddmenu = $('.dropdown-menu:first', sandbox),
                el = $('li .project-roles', ddmenu).eq(1),
                role;
            dd.dropdown('toggle');
            el.click();
            role = el.data('value');
            expect($('.select-value', dd).text().trim()).toEqual(role);
            expect(Service.updateMember).toHaveBeenCalledWith(role, members[0].userId, config.project.projectId);
        });

        it('should unassign member on click button "Unassign"', function () {
            renderView();
            Util.deleteDialog = null;
            spyOn(Util, "getDialog").and.callFake(function (options) {
                return $("<div>" + Util.templates(options.name) + "</div>")
                    .find(".dialog-shell")
                    .unwrap()
                    .appendTo(sandbox);
            });
            spyOn(Service, 'unAssignMember').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            var button = $('.member-action:first', sandbox),
                member = members[0],
                modal;
            button.click();
            modal = $('.modal-dialog', sandbox);
            expect(Util.getDialog).toHaveBeenCalled();
            expect(modal.length).toEqual(1);
            $('.rp-btn-danger', modal).click();
            expect(Service.unAssignMember).toHaveBeenCalledWith(member.userId, config.project.projectId);
        });

    });

});