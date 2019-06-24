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
    var App = require('app');
    var config = App.getInstance();
    var Util = require('util');
    var MembersService = require('projectMembers/MembersService');
    var AdminService = require('adminService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');
    var DropDownComponent = require('components/DropDownComponent');

    var ModalInviteUser = ModalView.extend({
        template: 'tpl-modal-invite-user',
        className: 'modal-invite-user',

        events: {
            'click [data-js-invite]': 'onClickInvite',
            'click [data-js-ok]': 'onClickOk',
            'focus [data-js-invite-link]': 'selectLink',
            'click [data-js-copy-link]': 'copyLink',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'change [data-js-user-project]': 'validate',
            'change [data-js-email]': 'disableHideBackdrop',
        },
        bindings: {
            '[data-js-email]': 'value: email',
            '[data-js-user-project]': 'value: default_project'
        },
        initialize: function () {
            this.appModel = new SingletonAppModel();
            this.model = new Epoxy.Model({
                email: '',
                default_project: '',
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
            this.setupDropDowns();
            this.setupProjectSearch();
            this.setupValidators();
        },
        setupDropDowns: function () {
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
        setupProjectSearch: function () {
            var self = this;
            Util.setupSelect2WhithScroll($('[data-js-user-project]', this.$el), {
                multiple: false,
                min: config.forms.projectNameRange[0],
                minimumInputLength: config.forms.projectNameRange[0],
                maximumInputLength: config.forms.projectNameRange[1],
                placeholder: Localization.admin.enterProjectName,
                allowClear: true,
                initSelection: function (element, callback) {
                    callback({ id: element.val(), text: element.val() });
                },
                query: function (query) {
                    AdminService.getProjects(self.getSearchQuery(query.term))
                        .done(function (response) {
                            var data = { results: [] };
                            _.each(response.content, function (item) {
                                if (item.projectId !== self.model.get('default_project')) {
                                    data.results.push({
                                        id: item.projectId,
                                        text: item.projectId
                                    });
                                }
                            });
                            query.callback(data);
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error);
                        });
                }
            });
        },
        setupValidators: function () {
            Util.hintValidator($('[data-js-email]', this.$el), [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'emailMatchRegex',
                    pattern: config.patterns.email
                },
                {
                    validator: 'remoteEmail',
                    remote: true,
                    message: Localization.validation.registeredEmail,
                    type: 'remoteEmail'
                }
            ]);
            Util.hintValidator($('[data-js-user-project]', this.$el), {
                validator: 'required'
            });
        },
        selectLink: function (e) {
            e.preventDefault();
            $(e.currentTarget).select();
        },
        getSearchQuery: function (query) {
            return '?page.sort=name,asc&page.page=1&page.size=' + config.autocompletePageSize + '&filter.cnt.name=' + query;
        },
        canSelectRole: function (role) {
            var user = config.userModel;
            var userRole = user.getRoleForCurrentProject();
            var userRoleIndex = _.indexOf(config.projectRoles, userRole);
            var roleIndex = _.indexOf(config.projectRoles, role);
            var isAdmin = user.get('isAdmin');
            return isAdmin || (user.hasPermissions() && userRoleIndex >= roleIndex);
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
        selectRole: function (value) {
            this.model.set('projectRole', value);
            this.disableHideBackdrop();
        },
        getUserData: function () {
            return {
                default_project: this.model.get('default_project'),
                email: this.model.get('email'),
                role: this.model.get('projectRole')
            };
        },
        validate: function () {
            $('[data-js-email]', this.$el).trigger('validate');
            $('[data-js-user-project]', this.$el).trigger('validate');
            this.disableHideBackdrop();
        },
        showSuccess: function (data) {
            this.$el.addClass('success-invite');
            $('[data-js-invite-link]', this.$el).val(data.backLink);
            $('[data-js-email-sent]', this.$el).text(this.model.get('email'));
        },
        onClickOk: function () {
            this.successClose();
        },
        onClickInvite: function () {
            config.trackingDispatcher.trackEventNumber(471);
            this.validate();
            if ($('.validate-error', $('[data-js-invite-user-form]', this.$el)).length) {
                return;
            }
            this.inviteUser();
        },
        onKeySuccess: function () {
            if (this.$el.hasClass('success-invite')) {
                $('[data-js-ok]', this.$el).focus().trigger('click');
            } else {
                $('[data-js-invite]', this.$el).focus().trigger('click');
            }
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(469);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(470);
        },
        onDestroy: function () {
            this.projectRoleSelector.destroy();
        }
    });
    return ModalInviteUser;
});
