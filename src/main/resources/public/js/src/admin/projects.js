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
    var Util = require('util');
    var Components = require('components');
    var App = require('app');
    var urls = require('dataUrlResolver');
    var Service = require('adminService');
    var Member = require('member');
    var Projects = require('project');
    var ProjectInfo = require('projectinfo');
    var MemberService = require('memberService');
    var Widget = require('widgets');

    // var Localization = require('localization');

    var config = App.getInstance();

    var List = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.action = options.action || 'internal';
            this.currentView = config.currentProjectsSettings.listView || config.defaultProjectsSettings.listView;
        },

        getDefaultFilter: function () {
            return {
                search: config.defaultProjectsSettings.search,
                sort: config.defaultProjectsSettings.sorting,
                direction: config.defaultProjectsSettings.sortingDirection
            };
        },

        shellTpl: 'tpl-admin-content-shell',
        headerTpl: 'tpl-admin-projects-header',
        listShellTpl: 'tpl-admin-projects-list-shell',

        render: function (options) {
            this.$el.html(Util.templates(this.shellTpl));
            this.$header = $("#contentHeader", this.$el);
            this.$body = $("#contentBody", this.$el);
            this.fillContent();
            return this;
        },

        renderTab: function(){
            if(this.tabView){
                this.tabView.destroy();
                this.clearSearch();
            }
            this.tabView = this.getProjectsView();
            this.tabView.render();
        },

        updateRoute: function (e) {
            var el = $(e.currentTarget);
            var query = el.data('query');
            if (el.parent().hasClass('active')) {
                return;
            }
            config.router.navigate(el.attr('href'), {silent: true});
            this.action = query;
            this.renderTab();
        },

        getProjectsView: function () {
            var tab = this.action;
            return new ProjectsList({
                viewType: this.currentView,
                projectsType: tab,
                total: $('[data-js-'+tab+'-qty]', this.$el),
                container: $('[data-js-'+tab+'-content]', this.$el),
                filter: this.filter || this.getDefaultFilter()
            });
        },
        clearSearch: function(){
            this.filter.search = config.defaultProjectsSettings.search;
            this.$searchString.val('');
        },
        fillContent: function (options) {
            this.filter = this.filter || this.getDefaultFilter();

            this.$header.html(Util.templates(this.headerTpl, options));
            this.$body.html(Util.templates(this.listShellTpl, {query: this.action}));

            this.setupAnchors();

            Util.bootValidator(this.$searchString, [{
                validator: 'minMaxNotRequired',
                type: 'addProjectName',
                min: 3,
                max: 256
            }]);

            this.renderTab();
            this.listenTo(this.tabView, 'loadProjectsReady', this.onLoadProjectsReady);
        },

        setupAnchors: function(){
            this.$sortBlock = $("[data-js-sort-block]", this.$body);
            this.$searchString = $("[data-js-filter-projects]", this.$body);
        },

        events: {
            'click #sortDirection .rp-btn': 'changeSorting',
            'validation::change [data-js-filter-projects]': 'filterProjects',
            'click .projects-view': 'changeProjectsView',
            'click [data-toggle="tab"]': 'updateRoute'
        },

        changeProjectsView: function (event) {
            event.preventDefault();
            var $target = $(event.currentTarget),
                viewType = $target.data('view-type');
            $('.projects-view').removeClass('active');
            $target.addClass('active');
            this.currentView = config.currentProjectsSettings.listView = viewType;
            this.tabView.updateView({
                viewType: viewType
            });
        },

        onLoadProjectsReady: function () {
            $('#sortDirection .rp-btn').attr('disabled', false);
        },

        changeSorting: function (e) {
            var btn = $(e.currentTarget);
            if (btn.hasClass('active')) {
                btn.toggleClass('desc');
                this.filter.direction = config.currentProjectsSettings.sortingDirection = btn.hasClass('desc') ? 'desc' : 'asc';
            } else {
                $(".active, .desc", this.$sortBlock).removeClass('active').removeClass('desc');
                btn.addClass('active');
                this.filter.direction = config.currentProjectsSettings.sortingDirection = 'asc';
                this.filter.sort = config.currentProjectsSettings.sorting = btn.data('type');
            }
            this.tabView.update({
                direction: this.filter.direction,
                sort: this.filter.sort,
                search: this.filter.search
            });
        },

        filterProjects: function (e, data) {
            var self = this;
            clearTimeout(this.searching);
            this.searching = setTimeout(function () {
                if (data.valid && self.filter.search !== data.value) {
                    self.filter.search = config.currentProjectsSettings.search = data.value;
                    self.tabView.update({
                        direction: self.filter.direction,
                        sort: self.filter.sort,
                        search: self.filter.search
                    });
                }
            }, config.userFilterDelay);
        },

        destroy: function () {
            this.tabView && this.tabView.destroy();
            this.tabView = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var ProjectsList =  Components.BaseView.extend({
        initialize: function(options){
            this.projectsType = options.projectsType;
            this.$total = options.total;
            this.$container = options.container;
            this.viewType = options.viewType || 'list-view';
            this.filter = options.filter;
        },

        tpl: 'tpl-admin-projects-list',
        listListTpl: 'tpl-admin-projects-tile-view',
        listTableTpl: 'tpl-admin-projects-table-view',

        events: {
            'click .remove-project': 'removeProject',
            'click .assign-to-project': 'assignAdminToProject'
        },

        render: function(){
            this.$container.append(this.$el.html(Util.templates(this.tpl)));
            this.setupAnchors();

            this.paging = new Components.PagingToolbarSaveUser({
                el: this.$pagingEl,
                model: new Backbone.Model(this.getDefaultPaging()),
                pageType: 'adminProjectList'
            });
            this.listenTo(this.paging, 'page', this.onPage);
            this.listenTo(this.paging, 'count', this.onPageCount);

            this.loadProjects();
        },
        renderProjects: function(){
            var tpl = this.getCurrentTpl();
            this.$listEl.append(Util.templates(tpl, {
                collection: this.collection.toJSON(),
                util: Util,
                isNew: this.isNew,
                hasRunsLastWeek: this.hasRunsLastWeek,
                isPersonalProject: this.isPersonalProject,
                active: true,
                canDelete: this.canDelete,
                search: this.filter.search,
                filter: this.searchFilter,
                textWrapper: Util.textWrapper,
                userProjects: config.userModel.get('projects')
            }));
            this.trigger('loadProjectsReady');
        },
        updateView: function(data){
            this.viewType = data.viewType;
            this.$listEl.empty();
            this.renderProjects();
        },
        isPersonalProject: function(project){
            return project.entryType === 'PERSONAL';
        },
        isNew: function(stamp){
            return Util.daysBetween(new Date(), new Date(stamp)) <= 7;
        },
        getCurrentTpl: function(){
            return this.viewType === 'table' ? this.listTableTpl : this.listListTpl;
        },
        update: function(options){
            this.filter = options || this.filter;
            this.$listEl.empty();
            this.loadProjects();
        },
        setupAnchors: function(){
            this.$loaderEl = $('[data-js-projects-loader]', this.$el);
            this.$listEl = $('[data-js-projects-list]', this.$el);
            this.$pagingEl = $('[data-js-projects-paging]', this.$el);
        },
        getDefaultPaging: function(){
            return {number: 1, size: 12};
        },
        onPage: function(page) {
            this.update();
        },
        onPageCount: function(size) {
            this.update();
        },
        onLoadProjects: function(data){
            if(data.page.totalPages < data.page.number && data.page.totalPages != 0){
                this.paging.trigger('page', data.page.totalPages);
                return;
            }
            this.paging.model.set(data.page);
            this.paging.render();
            this.collection = new Backbone.Collection(data.content ? data.content : data);
            this.renderProjects();

            this.$total.html('('+data.page.totalElements+')');
        },
        getQueryData: function(){
            var query = this.projectsType == 'personal' ? '?filter.eq.configuration$entryType=PERSONAL' : '?filter.in.configuration$entryType=INTERNAL,UPSA';
            if(this.filter.search){
                query += '&filter.cnt.name=' + this.filter.search;
            }
            if(this.filter.sort){
                query += '&page.sort='+this.filter.sort;
                if(this.filter.direction){
                    query += ','+this.filter.direction;
                }
            }
            query += '&page.page=' + this.paging.model.get('number') + '&page.size=' + this.paging.model.get('size');
            return query;
        },
        loadProjects: function () {
            var query = this.getQueryData();
            config.userModel.ready.done(function () {
                this.toggleLoader('show');
                Service.getProjects(query)
                    .done(function (data) {
                        this.onLoadProjects(data);
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'adminLoadProjects');
                    })
                    .always(function(){
                        this.toggleLoader('hide');
                    }.bind(this));
            }.bind(this));
        },
        toggleLoader: function(action){
            this.$loaderEl[action]();
        },
        searchFilter: function (item, searchString) {
            if (!searchString) {
                return true;
            } else {
                var regex = new RegExp(searchString.escapeRE(), 'i');
                return regex.test(item.projectId);
            }
        },
        hasRunsLastWeek: function (stamp) {
            return Util.daysBetween(new Date(), new Date(stamp)) < 7;
        },
        canDelete: function (item) {
            return !Util.isDeleteLock(item);
        },
        removeProject: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var id = '' + el.data('id');
            var status = el.data('active');

            Util.confirmDeletionDialog({
                callback: function () {
                    var self = this;
                    Service.deleteProject(id)
                        .done(function () {
                            var curProjects = config.userModel.get('projects');
                            delete curProjects[id];
                            config.userModel.set('projects', curProjects);
                            self.update();
                            Util.ajaxSuccessMessenger("deleteProject");
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, "deleteProject");
                        });
                }.bind(this),
                message: 'deleteProject',
                format: [id]
            });
        },
        assignAdminToProject: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var projectId = el.data('project');
            var data = {};
            var defaultRole = config.projectRoles[1];

            data[config.userModel.get('name')] = defaultRole;
            MemberService.assignMember(data, projectId)
                .done(function () {
                    el.closest('.no-assigned').removeClass('no-assigned');
                    config.userModel.get('projects')[projectId] = {projectRole: defaultRole};
                    Util.ajaxSuccessMessenger("assignYourSelf", (projectId + '').toUpperCase());
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "assignYourSelf");
                });
        },
        destroy: function(){
            this.paging = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var Project = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.id = options.id;
            this.action = options.action;
            this.query = options.queryString;
            this.vent = _.extend({}, Backbone.Events);
        },

        allNames: null,
        $name: null,
        settingsBlock: undefined,
        usersBlock: undefined,

        headerTpl: 'tpl-admin-project-header',
        bodyTpl: 'tpl-admin-project-body',
        shellTpl: 'tpl-admin-content-shell',
        permissionsTpl: 'tpl-permissions-map',
        membersNavigationTpl: 'tpl-members-navigation',

        render: function () {
            this.$el.html(Util.templates(this.shellTpl));
            this.$header = $("#contentHeader", this.$el);
            this.$body = $("#contentBody", this.$el);

            var tab = this.action === 'members' ? 'members' : 'settings';

            this.$header.html(Util.templates(this.headerTpl, {
                projectName: this.id,
                tab: tab,
            }));

            if (this.action !== 'add') {
                this.$header.find('#headerBar').append(Util.templates(this.permissionsTpl, {
                    tab: tab,
                    id: this.id,
                    query: this.query,
                    btnVisible: {
                        btnPermissionMap: true,
                        btnProjectSettings: true,
                        btnProjectMembers: true
                    }
                }));
            }

            this.$body.html(Util.templates(this.bodyTpl, {
                tab: tab,
                id: this.id,
                query: this.query
            }));

            this.$settings = $("#projectSettings", this.$body);

            this.$users = $("#projectUsers", this.$body);

            this.$users.html(Util.templates(this.membersNavigationTpl, {
                canManage: true,
                query: this.query,
                projectId: this.id,
                adminPage: true
            }));

            this.$assignedMembers = $("#assignedMembers", this.$body);
            this.$addMember = $("#addMember", this.$body);
            this.$inviteMember = $("#inviteMember", this.$body);
            this.$assignMember = $("#assignMember", this.$body);

            if (this.id) {
                config.project = {projectId: this.id};
                var self = this;
                Service.getProjectInfo()
                    .done(function (data) {
                        config.project = data;
                        self.renderProject();
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'projectLoad');
                    });
            } else {
                var self = this;
                Service.getProjectNames()
                    .done(function (data) {
                        self.allNames = _.map(data, function (n) {
                            return n.toLowerCase();
                        });
                        self.setupAddProject();
                    })
                    .fail(function (error) {

                    });
                this.setupAddProject();
            }
            this.$header.find('#headerBar').find('li.active > a').addClass('disabled');

            return this;
        },

        renderProject: function () {
            if (this.action === 'settings') {
                this.renderSettings();
            } else if (this.action === 'members') {
                this.renderUsers();
                this.listenTo(this.usersBlock, 'user::action', this.removeSettings.bind(this));
            }
        },

        renderSettings: function () {
            this.resetMembersView();
            if (!this.settingsBlock) {
                this.settingsBlock = new Projects.SettingsView({
                    holder: this.$settings,
                    projectId: this.id,
                    adminPage: true,
                    tab: this.query
                }).render();

            } else {
                this.settingsBlock.update(this.query);
            }
            this.$header.find('#headerBar').find('li.tab-permissions-map').hide();
        },

        removeSettings: function () {
            if (this.settingsBlock) {
                this.settingsBlock.destroy();
                this.settingsBlock = null;
                this.$settings.off().empty();
            }
        },

        renderUsers: function () {
            var usersView = this.getUsersView(this.query);
            this.destroyUsersBlock();
            this.usersBlock = new usersView(this.getMembersDataObject()).render();
            this.$header.find('#headerBar').find('li.tab-permissions-map').show();
        },

        getMembersDataObject: function () {
            var data = {
                container: this.membersTab,
                isDefaultProject: this.id === config.demoProjectName
            };

            if (this.fullMembers) {
                data.projectId = this.id;
                data.project = {type: config.project.configuration.entryType, projectId: this.id};
                data.user = config.userModel.toJSON();
                data.roles = config.projectRoles;
                data.memberAction = 'unAssignMember';
                data.projectRoleIndex = config.projectRoles.length + 1;
                data.grandAdmin = true;
            }
            return data;
        },

        getUsersView: function (query) {
            this.fullMembers = false;
            this.membersTab = null;

            switch (query) {
                case "add":
                    this.membersTab = this.$addMember;
                    return Member.MembersAdd;
                    break;
                case "invite":
                    this.membersTab = this.$inviteMember;
                    return Member.MembersInvite;
                    break;
                case "assign":
                    this.fullMembers = true;
                    this.membersTab = this.$assignMember;
                    return Member.MembersViewAssign;
                    break;
                default:
                    this.fullMembers = true;
                    this.membersTab = this.$assignedMembers;
                    return Member.MembersView;
                    break;
            }
        },

        setupAddProject: function () {
            this.$name = $("#projectName", this.$body);
            Util.bootValidator(this.$name, [
                {validator: 'required', type: 'projectName', noTrim: true},
                {validator: 'minMaxNotRequired', type: 'addProjectName', min: 3, max: 256, noTrim: true},
                {validator: 'matchRegex', type: 'projectNameRegex', pattern: '^[a-zA-Z0-9_-]*$', arg: 'i', noTrim: true},
                {validator: 'noDuplications', type: 'projectName', source: this.allNames || []}
            ]);
        },

        update: function (options) {
            this.id = options.id || this.id;
            this.action = options.action;
            this.query = options.queryString;
            this.renderProject();
        },

        events: {
            'click .tab': 'updateRoute',
            'click .rp-nav-tabs .disabled': 'stopPropagation',
            'click #create-project': 'createProject',
            'click [data-js-show-permissions-map]': 'onClickShowPermissionsMap'
        },

        onClickShowPermissionsMap: function (e) {
            e.preventDefault();
            Util.getDialog({name: 'tpl-permissions-map-modal'})
                .modal('show');
        },

        createProject: function () {
            this.$name.trigger('validate');
            var self = this;
            if (this.$name.data('valid')) {
                var name = this.$name.val().toLowerCase();
                Service.createProject(name)
                    .done(function (data) {
                        config.userModel.get('projects')[name] = {projectRole: "MEMBER", entryType: "INTERNAL"};
                        Util.ajaxSuccessMessenger('projectCreated', name);
                        config.router.navigate(self.getUrl(name, 'settings'), {trigger: true});
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'projectCreate');
                    });
            }
        },

        stopPropagation: function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        getUrl: function (id, action) {
            var url = '#administrate/projects/';
            var tail = id ? id + '/' + action : action;
            return url + tail;
        },

        updateRoute: function (e) {
            var el = $(e.currentTarget);
            var action = el.data('action');
            var query = el.data('query');

            if (el.parent().hasClass('active') || el.hasClass('disabled') || el.hasClass('settings')) {
                return;
            }

            config.router.navigate(el.attr('href'), {silent: true});

            this.query = el.data('query');
            if (action) {
                this.action = el.data('action');
            }

            if (this.action === 'members') {
                this.$header.find('#headerBar').find('#title-members').show();
                this.$header.find('#headerBar').find('#title-settings').hide();
            } else {
                this.$header.find('#headerBar').find('#title-members').hide();
                this.$header.find('#headerBar').find('#title-settings').show();
            }
            if (!el.parent().hasClass('active')) {
                el.closest('ul').find('a').removeClass('disabled');
                el.addClass('disabled');
            }
            this.renderProject();
        },

        resetMembersView: function () {
            this.usersBlock && this.usersBlock.destroy();
            $(".active", this.$users).removeClass('active');
            $("li:first", this.$users).addClass('active');
            this.$assignedMembers.addClass('active');
        },

        destroyUsersBlock: function () {
            if (this.usersBlock) {
                this.usersBlock.destroy();
                this.usersBlock = null;
                $('.nav-tabs.nav-tabs-custom a', this.users).removeClass('disabled');
            }
        },

        destroy: function () {
            this.destroyUsersBlock();
            this.removeSettings();
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var ProjectDetails = ProjectInfo.Body.extend({
        initialize: function (options) {
            ProjectInfo.Body.prototype.initialize.call(this, options);
            this.$el = options.el;
            this.action = options.action;
            this.interval = this.getInterval(options.queryString);
            this.project = options.id;
        },

        infoTpl: "tpl-admin-project-details",

        getInterval: function (query) {
            return query ? +query.split('=')[1] : 3;
        },

        render: function () {
            this.$el.html(Util.templates(this.infoTpl, {
                projectId: this.id,
                interval: this.interval
            }));
            this.$content = $("#contentTarget", this.$el);
            this.$content.html(Util.templates(this.tpl));
            this.$interval = $(".btn-group:first", this.$el);

            this.setupAnchors();

            var self = this;
            config.project = {projectId: this.project};
            $.when(Service.getProjectInfo())
                .done(function (data) {
                    config.project = data;
                    self.loadProjectInfo();
                    self.loadWidgets();
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'projectLoad');
                });

            return this;
        },

        events: {
            'change [name=interval]': 'updateInterval'
        },

        setActiveInterval: function () {
            $(".active", this.$interval).removeClass('active');
            $("#interval" + this.interval, this.$interval).prop('checked', true).parent().addClass('active');
        },

        updateInterval: function (e) {
            var value = $("input[name=interval]:checked", this.$interval).data('value');
            this.interval = value;
            config.router.navigate(urls.detailsInterval(this.id, value), {silent: true});
            this.loadProjectInfo();
            this.loadWidgets();
        },

        update: function (data) {
            this.interval = data.queryString ? +data.queryString.split('=')[1] : 3;
            this.setActiveInterval();
            this.loadProjectInfo();
            this.loadWidgets();
        },

        destroy: function () {
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    return {
        List: List,
        Project: Project,
        ProjectDetails: ProjectDetails
    };
});
