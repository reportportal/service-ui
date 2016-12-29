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
    var MembersTableView = require('projectMembers/MembersTableView');
    var Project = require('project');
    var ProjectsOld = require('projects');
    var ProjectsTabsView = require('adminProjects/ProjectsTabsView');
    var ProjectsHeaderView = require('adminProjects/ProjectsHeaderView');

    var config = App.getInstance();

    var ProjectsPageView = Epoxy.View.extend({

        tpl: 'tpl-projects-body',

        initialize: function (options) {
            this.$el = options.el;
            this.$header = options.header;
            this.page = options.page;
            this.id = options.id;
            this.action = options.action;
            console.log('ProjectsPageView: ', options);
        },

        events: {
            '[data-js-add-project]': 'addProject'
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.renderHeader();
            this.renderBody();
            return this;
        },

        renderHeader: function(){
            this.destroyHeader();
            this.header = new ProjectsHeaderView({
                data: this.getHeaderData()
            });
            this.$header.append(this.header.$el);
        },

        getHeaderData: function(){
            var url = '#administrate/' + this.page,
                data = [{name: Localization.admin.titleAllProjects, link: url}];
            if(this.id){
                url +='/' + this.id
                data.push({name: this.id, link: url});
                if(this.action && (this.action !== 'project-details')){
                    url +='/' +this.action;
                    data.push({name: Localization.admin['title' + this.action.capitalize()], link: url});
                }
            }
            return data;
        },

        renderBody: function () {
            console.log('renderBody');
            this.destroyBody();
            var key = this.page + '-' + this.action;
            switch (key) {
                case "projects-settings":
                    this.body = new Project.SettingsView({
                        holder: $('[data-js-admin-projects]', this.$el),
                        projectId: this.id,
                        adminPage: true
                    }).render();
                    break;
                case "projects-members":
                    this.body = new MembersTableView({
                        projectId: this.id,
                        grandAdmin: true
                    });
                    $('[data-js-admin-projects]', this.$el).append(this.body.$el);
                    break;
                case "projects-project-details":
                    this.body = new ProjectsOld.ProjectDetails({
                        contextName: this.page,
                        context: {},
                        el: $('[data-js-admin-projects]', this.$el),
                        projectId: this.id,
                        adminPage: true
                    }).render();
                    break;
                default:
                    this.action = this.action || 'internal';
                    this.body = new ProjectsTabsView({
                        action: this.action
                    });
                    $('[data-js-admin-projects]', this.$el).append(this.body.$el);
                    break;
            }
        },
        
        update: function () {
            this.renderHeader();
            this.renderBody();
        },

        addProject: function(e){
            e.preventDefault();
        },

        destroyHeader: function(){
            if (this.header) {
                this.header.destroy();
                this.header = null;
            }
            this.$header.empty();
        },
        destroyBody: function(){
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
        },

        destroy: function(){
            this.destroyHeader();
            this.destroyBody();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    return {
        ContentView: ProjectsPageView
    };

});