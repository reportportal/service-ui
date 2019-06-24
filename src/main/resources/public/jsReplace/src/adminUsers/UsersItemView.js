/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');
    var ModalConfirm = require('modals/modalConfirm');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var UserProjectsView = require('adminUsers/UserProjectsView');

    var config = App.getInstance();

    var UsersItemView = Epoxy.View.extend({
        tpl: 'tpl-users-item',
        className: 'row rp-table-row user-row',

        bindings: {
            '[data-js-time-from-now]': 'text: lastLoginFromNow',
            '[data-js-time-exact]': 'text: lastLoginFormat',
            '[data-js-user-avatar]': 'attr: {src: imagePath}',
            '[data-js-user-name]': 'html: getFullName',
            '[data-js-user-login]': 'html: getLogin',
            '[data-js-user-email]': 'html: getEmail, attr: {href: getEmailLink}',
            '[data-js-user-you]': 'classes: {hide: not(isYou)}',
            '[data-js-delete-user]': 'classes: {you: isYou}',
            '[data-js-user-admin]': 'classes: {hide: not(isAdmin), notlink: isYou}',
            '[data-js-make-admin]': 'classes: {hide: hideMakeAdmin}',
            '[data-js-user-projects-mobile]': 'getUserProjects: assigned_projects'
        },

        computeds: {
            getFullName: {
                deps: ['full_name'],
                get: function (fullName) {
                    return this.wrapSearchResult(fullName);
                }
            },
            getLogin: {
                deps: ['userId'],
                get: function (userId) {
                    return this.wrapSearchResult(userId);
                }
            },
            getEmail: {
                deps: ['email'],
                get: function (email) {
                    return this.wrapSearchResult(email);
                }
            },
            getEmailLink: {
                deps: ['email'],
                get: function (email) {
                    return 'mailto: ' + email;
                }
            },
            canDelete: {
                deps: ['isAdmin'],
                get: function () {
                    return '';
                }
            },
            hideMakeAdmin: {
                deps: ['isAdmin', 'isYou'],
                get: function (isAdmin, isYou) {
                    return isAdmin || isYou;
                }
            }
        },

        bindingHandlers: {
            getUserProjects: {
                set: function ($el) {
                    var projects = this.view.model.getAssignedProjects();
                    _.each(projects, function (val, project) {
                        $el.append('<p><span>' + Localization.admin.projectName + ':</span><strong>' + project + '</strong><br> <span>' + Localization.admin.projectRole + ':</span>' + val.projectRole + '</p>');
                    });
                }
            }
        },

        events: {
            'click [data-js-login-time]': 'toggleTimeView',
            'click [data-js-view-projects]': 'showUserProjects',
            'click [data-js-delete-user]': 'deleteUser',
            'click [data-js-user-admin]': 'confirmChangeRole',
            'click [data-js-make-admin]': 'confirmChangeRole'
        },

        initialize: function (options) {
            this.table = options.table;
            this.searchString = options.searchString || '';
            this.appModel = new SingletonAppModel();
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, { isYou: this.model.get('isYou') }));
        },

        showUserProjects: function (e) {
            var $el = $(e.currentTarget);
            e.preventDefault();
            _.each(this.table.renderViews, function (view) {
                var itemView = view;
                if (itemView.userProjectsView && (itemView.model.get('userId') !== this.model.get('userId'))) {
                    $('[data-js-view-projects]', itemView.$el).removeClass('active');
                    itemView.userProjectsView.destroy();
                    itemView.userProjectsView = null;
                }
            }, this);
            if (!this.userProjectsView) {
                config.trackingDispatcher.trackEventNumber(464);
                $el.addClass('active');
                this.userProjectsView = new UserProjectsView({
                    model: this.model
                });
                $('[data-js-user-projects]', this.$el).html(this.userProjectsView.$el);
            } else {
                $el.removeClass('active');
                this.userProjectsView.destroy();
                this.userProjectsView = null;
            }
        },

        wrapSearchResult: function (str) {
            return this.searchString ? Util.textWrapper(str, this.searchString) : str;
        },

        confirmChangeRole: function (e) {
            var modal;
            e.preventDefault();
            if (!this.model.get('isYou')) {
                config.trackingDispatcher.trackEventNumber(463);
                modal = new ModalConfirm({
                    headerText: Localization.dialogHeader.changeRole,
                    bodyText: Util.replaceTemplate(Localization.dialog.changeRole, this.model.get('full_name') || this.model.get('userId')),
                    cancelButtonText: Localization.ui.cancel,
                    okButtonDanger: true,
                    okButtonText: Localization.dialog.changeRoleBtn,
                    confirmFunction: this.changeRole.bind(this)
                });
                $('[data-js-close]', modal.$el).on('click', function () {
                    config.trackingDispatcher.trackEventNumber(472);
                });
                $('[data-js-cancel]', modal.$el).on('click', function () {
                    config.trackingDispatcher.trackEventNumber(473);
                });
                modal.show();
            }
        },

        changeRole: function () {
            var userId = this.model.get('userId');
            var fullName = this.model.get('full_name');
            var newRole = this.model.get('userRole') === config.accountRolesEnum.user ? config.accountRolesEnum.administrator : config.accountRolesEnum.user;
            config.trackingDispatcher.trackEventNumber(474);
            return CallService.call('PUT', Urls.modifyUserUrl(userId), { role: newRole })
                .done(function () {
                    this.model.set('userRole', newRole);
                    Util.ajaxSuccessMessenger('changeRole', fullName || userId);
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'changeRole', fullName || userId);
                });
        },

        deleteUser: function (e) {
            var modal;
            config.trackingDispatcher.trackEventNumber(468);
            e.preventDefault();

            if (config.userModel.get('user_login') !== this.model.get('userId')) {
                modal = new ModalConfirm({
                    headerText: Localization.dialogHeader.deleteUser,
                    bodyText: Util.replaceTemplate(Localization.dialog.deleteUser, this.model.get('full_name') || this.model.get('userId')),
                    cancelButtonText: Localization.ui.cancel,
                    okButtonDanger: true,
                    okButtonText: Localization.ui.delete,
                    confirmFunction: function () {
                        config.trackingDispatcher.trackEventNumber(477);
                        return this.model.delete();
                    }.bind(this),
                    safeRemoval: true
                });
                $('[data-js-close]', modal.$el).on('click', function () {
                    config.trackingDispatcher.trackEventNumber(475);
                });
                $('[data-js-cancel]', modal.$el).on('click', function () {
                    config.trackingDispatcher.trackEventNumber(476);
                });
                modal.show();
            }
        },

        toggleTimeView: function (e) {
            var $el = $(e.currentTarget);
            e.preventDefault();
            $el.closest('[data-js-users-table]').toggleClass('show-from-now');
        },

        destroy: function () {
            this.userProjectsView && this.userProjectsView.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return UsersItemView;
});
