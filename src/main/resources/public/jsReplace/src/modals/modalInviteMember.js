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
    var Localization = require('localization');
    var DropDownComponent = require('components/DropDownComponent');
    var UserSearchComponent = require('components/UserSearchComponent');

    var ModalInviteMember = ModalView.extend({
        template: 'tpl-modal-invite-member',
        className: 'modal-invite-member',
        events: {
            'click [data-js-invite]': 'onClickInvite',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'click [data-js-ok]': 'onClickOk',
            'focus [data-js-invite-link]': 'selectLink',
            'click [data-js-copy-link]': 'copyLink',
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
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel button-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.admin.invite,
                    btnClass: 'rp-btn-submit button-invite',
                    label: 'data-js-invite'
                },
                {
                    btnText: Localization.ui.ok,
                    btnClass: 'rp-btn-submit button-ok',
                    label: 'data-js-ok'
                }
            ];
            this.$el.html(Util.templates(this.template, {footerButtons: footerButtons}));
            this.setupDropdown();
            this.setupUserSearch();
        },
        setupDropdown: function () {
            var self = this;
            this.projectRoleSelector = new DropDownComponent({
                data: _.map(Util.getRolesMap(), function (key, val) {
                    return { name: key, value: val, disabled: !self.canSelectRole.bind(self)(key) };
                }),
                multiple: false,
                defaultValue: this.model.get('projectRole')
            });
            $('[data-js-role-selector]', this.$el).html(this.projectRoleSelector.$el);
            this.listenTo(this.projectRoleSelector, 'change', this.selectRole);
        },
        setupUserSearch: function () {
            UserSearchComponent.setupUserSearch($('[data-js-member]', this.$el));
        },
        selectRole: function (role) {
            this.model.set('projectRole', role);
            this.disableHideBackdrop();
        },
        selectLink: function (e) {
            e.preventDefault();
            $(e.currentTarget).select();
        },
        copyLink: function (e) {
            e.preventDefault();
            $('[data-js-invite-link]', this.$el).select();
            try {
                document.execCommand('copy');
            } catch (error) {
                console.log(error);
            }
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
            if (!$('[data-js-member]', this.$el).val()) {
                $('[data-js-invite-form]', this.$el).addClass('not-valid');
                return;
            }
            $('[data-js-invite-form]', this.$el).removeClass('not-valid');
            this.disableHideBackdrop();
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
        inviteUser: function () {
            var userData = this.getUserData();
            if (userData) {
                this.showLoading();
                MembersService.inviteMember(userData)
                    .done(function (data) {
                        this.showSuccess(data);
                        Util.ajaxSuccessMessenger('inviteMember');
                    }.bind(this))
                    .fail(function (response) {
                        var error;
                        if (response) {
                            try {
                                error = JSON.parse(response.responseText);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        if (error) {
                            Util.addMessage({ clazz: 'alert', message: error.message });
                        } else {
                            Util.ajaxFailMessenger(response, 'inviteMember');
                        }
                    })
                    .always(function () {
                        this.hideLoading();
                    }.bind(this));
            }
        },
        showSuccess: function (data) {
            this.$el.addClass('success-invite');
            $('[data-js-invite-link]', this.$el).val(data.backLink);
            $('[data-js-email-sent]', this.$el).text(this.model.get('user'));
        },
        getUserData: function () {
            return {
                default_project: this.appModel.get('projectId'),
                email: this.model.get('user'),
                role: this.model.get('projectRole')
            };
        },
        onKeySuccess: function () {
            if (this.$el.hasClass('success-invite')) {
                $('[data-js-ok]', this.$el).focus().trigger('click');
            } else {
                $('[data-js-invite]', this.$el).focus().trigger('click');
            }
        },
        onClickInvite: function () {
            config.trackingDispatcher.trackEventNumber(437);
            this.validate();
            if (!$('[data-js-invite-form]', this.$el).hasClass('not-valid')) {
                if (Util.validateEmail(this.model.get('user'))) {
                    this.inviteUser();
                } else {
                    this.inviteMember();
                }
            }
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(436);
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(435);
        },
        onClickOk: function () {
            this.successClose();
        },
        onDestroy: function () {
            this.projectRoleSelector.destroy();
        }
    });
    return ModalInviteMember;
});
