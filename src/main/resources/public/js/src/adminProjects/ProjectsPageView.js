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
    var ProjectsDetailsView = require('adminProjects/ProjectsDetailsView');
    var ProjectsTabsView = require('adminProjects/ProjectsTabsView');
    var AdminService = require('adminService');
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
            this.queryString = options.queryString;
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
                page: this.page,
                id: this.id,
                action: this.action,
                queryString: this.queryString
            });
            this.$header.append(this.header.$el);
        },

        renderBody: function () {
            this.destroyBody();
            if(this.page == 'project-details'){
                AdminService.getProjectInfo(this.id)
                    .done(function (data) {
                        config.project = data;
                        this.renderProject();
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'projectLoad');
                    });
            }
            else {
                this.renderProjectsList();
            }
        },

        renderProjectsList: function(){
            this.body = new ProjectsTabsView({
                action: this.action || 'internal'
            });
            $('[data-js-admin-projects]', this.$el).append(this.body.$el);
        },

        renderProject: function(){
            var key = this.action;
            switch (key) {
                case "settings":
                    this.body = new Project.SettingsView({
                        holder: $('[data-js-admin-projects]', this.$el),
                        projectId: this.id,
                        adminPage: true,
                        tab: this.queryString
                    }).render();
                    break;
                case "members":
                    this.body = new MembersTableView({
                        projectId: this.id,
                        grandAdmin: true
                    });
                    $('[data-js-admin-projects]', this.$el).append(this.body.$el);
                    break;
                default:
                    this.body = new ProjectsDetailsView({
                        contextName: this.page,
                        context: {},
                        el: $('[data-js-admin-projects]', this.$el),
                        id: this.id,
                        queryString: this.queryString,
                        adminPage: true
                    }).render();
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
