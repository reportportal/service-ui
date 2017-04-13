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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var MembersTableView = require('projectMembers/MembersTableView');
    var ProjectSettingsView = require('projectSettings/projectSettingsView');
    var ProjectsDetailsView = require('adminProjects/ProjectsDetailsView');
    var ProjectsTabsView = require('adminProjects/ProjectsTabsView');
    var AdminService = require('adminService');
    var ProjectsHeaderView = require('adminProjects/ProjectsHeaderView');

    var SingletonAppModel = require('model/SingletonAppModel');

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

        renderHeader: function () {
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
            var appModel;
            this.destroyBody();
            if (this.page === 'project-details') {
                appModel = new SingletonAppModel();
                AdminService.getProjectInfo(this.id)
                    .done(function (data) {
                        appModel.parse(data);
                        config.project = data;
                        this.renderProject();
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'projectLoad');
                    });
            } else {
                this.renderProjectsList();
            }
        },

        renderProjectsList: function () {
            this.body = new ProjectsTabsView({
                action: this.action || 'internal'
            });
            $('[data-js-admin-projects]', this.$el).append(this.body.$el);
        },

        renderProject: function () {
            var key = this.action;
            switch (key) {
            case 'settings':
                this.body = new ProjectSettingsView({
                    projectId: this.id,
                    adminPage: true,
                    tab: this.queryString
                });
                $('[data-js-admin-projects]', this.$el).html(this.body.$el);
                this.body.onShow && this.body.onShow();
                break;
            case 'members':
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

        update: function (options) {
            this.body.update(options.queryString);
        },

        addProject: function (e) {
            e.preventDefault();
        },

        destroyHeader: function () {
            if (this.header) {
                this.header.destroy();
                this.header = null;
            }
            this.$header.empty();
        },
        destroyBody: function () {
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
        },

        onDestroy: function () {
            this.destroyHeader();
            this.destroyBody();
            this.$el.html('');
        }
    });

    return {
        ContentView: ProjectsPageView
    };
});
