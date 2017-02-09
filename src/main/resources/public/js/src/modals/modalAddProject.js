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
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var AdminService = require('adminService');

    require('validate');

    var config = App.getInstance();

    var ModalAddProject = ModalView.extend({

        template: 'tpl-modal-add-project',
        className: 'modal-add-project',
        events: {
            'click [data-js-add]': 'addProject',
        },
        initialize: function(options) {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.showLoading();
            AdminService.getProjectNames()
                .done(function (data) {
                    this.allNames = _.map(data, function (n) {
                        return n.toLowerCase();
                    });
                    this.bindValidators();
                    this.hideLoading();

                }.bind(this))
                .fail(function (error) {});

        },
        setupAnchors: function(){
            this.$project = $('[data-js-project-name]', this.$el);
        },
        bindValidators: function(){
            Util.hintValidator(this.$project, [
                {validator: 'required', type: 'projectName', noTrim: true},
                {validator: 'minMaxNotRequired', type: 'addProjectName', min: 3, max: 256, noTrim: true},
                {validator: 'matchRegex', type: 'projectNameRegex', pattern: '^[a-zA-Z0-9_-]*$', arg: 'i', noTrim: true},
                {validator: 'noDuplications', type: 'projectName', source: this.allNames || []}
            ]);
        },
        getProjectUrl: function (id, action) {
            var url = '#administrate/project-details/',
                tail = id ? id + '/' + action : action;
            return url + tail;
        },
        onKeySuccess: function () {
            $('[data-js-add]', this.$el).focus().trigger('click');
        },
        addProject: function () {
            this.$project.trigger('validate');
            if($('.validate-error', this.$el).length){
                return;
            }
            this.showLoading();
            var name = this.$project.val().toLowerCase();
            AdminService.createProject(name)
                .done(function (data) {
                    config.userModel.get('projects')[name] = {projectRole: "MEMBER", entryType: "INTERNAL"};
                    Util.ajaxSuccessMessenger('projectCreated', name);
                    config.router.navigate(this.getProjectUrl(name, 'settings'), {trigger: true});
                    this.successClose();
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'projectCreate');
                });
        }
    });

    return ModalAddProject;
});
