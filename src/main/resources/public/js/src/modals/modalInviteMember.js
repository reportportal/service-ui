/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Epoxy = require('backbone-epoxy');
    var SingletonAppModel = require('model/SingletonAppModel');
    var App = require('app');
    var config = App.getInstance();
    var Util = require('util');
    var MembersService = require('projectMembers/MembersService');
    var DropDownComponent = require('components/DropDownComponent');
    var UserSearchComponent = require('components/UserSearchComponent');

    var ModalInviteMember = ModalView.extend({
        template: 'tpl-modal-invite-member',
        className: 'modal-invite-member',
        events: {
            'click [data-js-invite]': 'onClickInvite',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'change [data-js-member]': 'validate'
        },
        bindings: {
            '[data-js-member]': 'value: user'
        },
        initialize: function () {
            this.appModel = new SingletonAppModel();
            this.model = new Epoxy.Model({
                user: '',
                projectRole: config.defaultProjectRole
            });
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.setupDropdown();
            this.setupUserSearch();
        },
        setupDropdown: function () {
            var self = this;
            var projectRoleSelector = new DropDownComponent({
                data: _.map(Util.getRolesMap(), function (key, val) {
                    return { name: key, value: val, disabled: !self.canSelectRole.bind(self)(key) };
                }),
                multiple: false,
                defaultValue: this.model.get('projectRole')
            });
            this.dropdownComponents = [];
            $('[data-js-role-selector]', this.$el).html(projectRoleSelector.$el);
            this.listenTo(projectRoleSelector, 'change', this.selectRole);
            this.dropdownComponents.push(projectRoleSelector);
        },
        setupUserSearch: function () {
            UserSearchComponent.setupUserSearch($('[data-js-member]', this.$el));
        },
        canSelectRole: function (role) {
            var user = config.userModel;
            var userRole = user.getRoleForCurrentProject();
            var userRoleIndex = _.indexOf(config.projectRoles, userRole);
            var roleIndex = _.indexOf(config.projectRoles, role);
            var isAdmin = user.get('isAdmin');
            return isAdmin || (user.hasPermissions() && userRoleIndex >= roleIndex);
        },
        validate: function () {
            ($('[data-js-member]', this.$el).val() === '')
            ? $('[data-js-member-field]', this.$el).addClass('not-valid')
            : $('[data-js-member-field]', this.$el).removeClass('not-valid');
        },
        inviteMember: function () {
            var userData = this.getUserData();
            var data;
            if (userData) {
                data = {};
                data[userData.email] = userData.role;
                this.showLoading();
                MembersService.assignMember(data, userData.default_project)
                    .done(function () {
                        Util.ajaxSuccessMessenger('assignMember', userData.email);
                        this.trigger('invite:member');
                        this.successClose();
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'assignMember');
                    })
                    .always(function () {
                        this.hideLoading();
                    }.bind(this));
            }
        },
        getUserData: function () {
            var user = this.model.toJSON();
            return {
                default_project: this.appModel.get('projectId'),
                email: user.user,
                role: user.projectRole
            };
        },
        onKeySuccess: function () {
            $('[data-js-invite]', this.$el).trigger('click');
        },
        onClickInvite: function () {
            config.trackingDispatcher.trackEventNumber(437);
            this.validate();
            if (!$('.not-valid', this.$el).length) {
                this.inviteMember();
            }
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(436);
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(435);
        },
        onDestroy: function () {
            _.each(this.dropdownComponents, function (item) {
                item.destroy();
            });
        }
    });
    return ModalInviteMember;
});
