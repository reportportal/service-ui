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
    var App = require('app');
    var Util = require('util');
    var AdminService = require('adminService');
    var Localization = require('localization');

    var config = App.getInstance();

    var ModalAddProject = ModalView.extend({

        template: 'tpl-modal-add-project',
        className: 'modal-add-project',
        events: {
            'click [data-js-add]': 'addProject',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
            'change [data-js-project-name]': 'disableHideBackdrop'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.ui.add,
                    btnClass: 'rp-btn-submit',
                    label: 'data-js-add'
                }
            ];
            this.$el.html(Util.templates(this.template, {footerButtons: footerButtons}));
            this.setupAnchors();
        },
        onShow: function () {
            var self = this;
            this.showLoading();
            AdminService.getProjectNames()
                .done(function (data) {
                    self.allNames = _.map(data, function (name) {
                        return name.toLowerCase();
                    });
                })
                .always(function () {
                    self.bindValidators();
                    self.hideLoading();
                });
        },
        setupAnchors: function () {
            this.$project = $('[data-js-project-name]', this.$el);
        },
        bindValidators: function () {
            Util.hintValidator(this.$project, [
                { validator: 'required', type: 'projectName', noTrim: true },
                { validator: 'minMaxNotRequired', type: 'addProjectName', min: 3, max: 256, noTrim: true },
                { validator: 'matchRegex', type: 'projectNameRegex', pattern: '^[a-zA-Z0-9_-]*$', arg: 'i', noTrim: true },
                { validator: 'noDuplications', type: 'projectName', source: this.allNames || [] }
            ]);
        },
        getProjectUrl: function (id, action) {
            var url = '#administrate/project-details/';
            var tail = id ? id + '/' + action : action;
            return url + tail;
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(453);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(454);
        },
        onKeySuccess: function () {
            $('[data-js-add]', this.$el).focus().trigger('click');
        },
        addProject: function () {
            var name = this.$project.val().toLowerCase();
            var self = this;
            this.$project.trigger('validate');
            if ($('.validate-error', this.$el).length) {
                return;
            }
            config.trackingDispatcher.trackEventNumber(455);
            this.showLoading();
            AdminService.createProject(name)
                .done(function () {
                    config.userModel.get('projects')[name] = { projectRole: 'MEMBER', entryType: 'INTERNAL' };
                    Util.ajaxSuccessMessenger('projectCreated', name);
                    self.successClose();
                    config.router.navigate(self.getProjectUrl(name, 'settings'), { trigger: true });
                })
                .fail(function (error) {
                    self.hideLoading();
                    Util.ajaxFailMessenger(error, 'projectCreate');
                    self.$project.trigger('validate:error');
                });
        }
    });

    return ModalAddProject;
});
