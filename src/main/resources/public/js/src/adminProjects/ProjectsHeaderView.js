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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var MainBreadcrumbsComponent = require('components/MainBreadcrumbsComponent');
    var ModalAddProject = require('modals/modalAddProject');

    var config = App.getInstance();

    var ProjectsHeaderView = Epoxy.View.extend({
        tpl: 'tpl-projects-header',

        bindings: {
            '[data-js-project-buttons]': 'classes: {hide: showProjectBtns}',
            '[data-js-add-project-button]': 'classes: {hide: showAddProject}',
            '[data-js-project-settings]': 'classes: {disabled: showSettingsBtn}, attr: {href: getSettingsLink}',
            '[data-js-project-members]': 'classes: {disabled: showMembersBtn}, attr: {href: getMembersLink}',
        },

        computeds: {
            showProjectBtns: {
                deps: ['id', 'action'],
                get: function(id, action){
                    return !(id && action);
                }
            },
            showAddProject: {
                deps: ['id', 'action'],
                get: function(id, action){
                    return !(!id && !action);
                }
            },
            showSettingsBtn: {
                deps: ['action'],
                get: function(action){
                    return action == 'settings';
                }
            },
            showMembersBtn: {
                deps: ['action'],
                get: function(action){
                    return action == 'members';
                }
            },
            getSettingsLink: {
                deps: ['id'],
                get: function(id){
                    return '#administrate/project-details/' + id + '/settings';
                }
            },
            getMembersLink: {
                deps: ['id'],
                get: function(id){
                    return '#administrate/project-details/' + id + '/members';
                }
            }
        },

        initialize: function (options) {
            this.model = new Epoxy.Model();
            this.model.set({
                page: options.page,
                id: options.id,
                action: options.action,
                queryString: options.queryString
            });
            this.mainBreadcrumbs = new MainBreadcrumbsComponent({
                data: this.getHeaderData()
            });
            this.render();
        },

        events: {
            'click [data-js-add-project]': 'addProject'
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            $('[data-js-main-breadcrumbs]', this.$el).append(this.mainBreadcrumbs.$el);
        },

        getHeaderData: function(){
            var page = this.model.get('page'),
                id = this.model.get('id'),
                action = this.model.get('action'),
                url = '#administrate/' + page,
                data = [{name: Localization.admin.titleAllProjects, link:  '#administrate/projects',}];
            if(this.id){
                url +='/' + id
                data.push({name: id, link: url});
                if(action){
                    url +='/' +action;
                    data.push({name: Localization.admin['title' + action.capitalize()], link: url});
                }
            }
            return data;
        },

        addProject: function(e){
            e.preventDefault();
            var modal = new ModalAddProject();
            modal.show();
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return ProjectsHeaderView;

});