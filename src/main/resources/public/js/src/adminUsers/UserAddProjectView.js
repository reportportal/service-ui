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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var AdminService = require('adminService');
    var MembersService = require('projectMembers/MembersService');
    require('validate');

    var config = App.getInstance();

    var UsersAddProject = Epoxy.View.extend({
        tpl: 'tpl-users-project-add',
        className: 'row rp-table-row user-projects-row',

        bindings: {
            '[data-js-project]': 'value: projectId',
            '[data-js-project-role]': 'text: getProjectRole',
            '[data-js-dropdown-roles]': 'updateRoleDropDown: projectRole',
            '[data-js-assign]': 'classes: {disabled: not(canAssign)}, attr: {disabled: not(canAssign)}',
        },

        computeds: {
            canAssign: {
                deps: ['projectId', 'projectRole'],
                get: function (projectId, projectRole) {
                    return projectId && projectRole;
                }
            },
            getProjectRole: {
                deps: ['projectRole'],
                get: function (projectRole) {
                    var roles = Util.getRolesMap();
                    return roles[projectRole];
                }
            },
        },

        bindingHandlers: {
            updateRoleDropDown: {
                set: function ($el, role) {
                    _.each($('a', $el), function (a) {
                        var action = $(a).data('value') === role ? 'add' : 'remove';
                        $(a)[action + 'Class']('active');
                    });
                }
            }
        },

        events: {
            'click [data-js-dropdown-roles] a': 'selectProjectRole',
            'click [data-js-assign]': 'assignToProject'
        },

        initialize: function (options) {
            this.userModel = options.userModel;
            this.model = new Epoxy.Model({
                projectId: '',
                entryType: '',
                projectRole: config.defaultProjectRole
            });
            this.render();
            this.setupAnchors();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {roles: Util.getRolesMap()}));
            this.setupAnchors();
            this.setupValidation();
            this.setupProjectSearch();
        },

        setupAnchors: function () {
            this.$form = $('[data-js-assign-form]', this.$el);
            this.$selectProject = $('[data-js-project]', this.$el);
        },

        setupProjectSearch: function () {
            var self = this;
            Util.setupSelect2WhithScroll(this.$selectProject, {
                multiple: false,
                min: config.forms.projectNameRange[0],
                minimumInputLength: config.forms.projectNameRange[0],
                maximumInputLength: config.forms.projectNameRange[1],
                placeholder: Localization.admin.enterProjectName,
                allowClear: true,
                initSelection: function (element, callback) {
                    callback({id: element.val(), text: element.val()});
                },
                query: function (query) {
                    AdminService.getProjects(self.getSearchQuery(query.term))
                        .done(function (response) {
                            var data = {results: []}
                            _.each(response.content, function (item) {
                                var userProjects = _.keys(self.userModel.getAssignedProjects());
                                if (!_.contains(userProjects, item.projectId)) {
                                    data.results.push({
                                        id: item.projectId,
                                        text: item.projectId,
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

        setupValidation: function () {
            $.validator.setDefaults({
                debug: true,
                success: "valid"
            });
            this.validator = this.$form.validate({
                errorClass: 'has-error',
                rules: {
                    project: {
                        required: true
                    }
                },
                messages: {
                    project: {
                        required: Localization.validation.requiredDefault
                    }
                },
                ignore: 'input[id^="s2id"]',
                errorPlacement: function (error, element) {
                    error.appendTo($('[data-js-error-text]', element.closest('[data-js-assign-form-group]')));
                },
                highlight: function (element, errorClass) {
                    $(element).closest('[data-js-assign-form-group]').addClass(errorClass);
                },
                unhighlight: function (element, errorClass) {
                    $(element).closest('[data-js-assign-form-group]').removeClass(errorClass);
                }
            });
        },

        getSearchQuery: function (query) {
            return '?page.sort=name,asc&page.page=1&page.size=10&&filter.cnt.name=' + query;
        },

        selectProjectRole: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            if ($el.hasClass('active') || $el.hasClass('disabled')) {
                return;
            }
            var newRole = $el.data('value');
            this.model.set('projectRole', newRole);
        },

        assignToProject: function (e) {
            e.preventDefault();
            var data = {};
            data[this.userModel.get('userId')] = this.model.get('projectRole');
            MembersService.assignMember(data, this.model.get('projectId'))
                .done(function () {
                    this.trigger('user:assigned');
                    Util.ajaxSuccessMessenger("assignMember", this.userModel.get('full_name') || this.userModel.get('userId'));
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "assignMember");
                });
        },

        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return UsersAddProject;

});