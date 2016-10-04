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
            this.currentTpl = config.currentProjectsSettings.listView || config.defaultProjectsSettings.listView;
        },

        getDefaultFilter: function () {
            return {
                search: config.currentProjectsSettings.search || config.defaultProjectsSettings.search,
                sort: config.currentProjectsSettings.sorting || config.defaultProjectsSettings.sorting,
                direction: config.currentProjectsSettings.sortingDirection || config.defaultProjectsSettings.sortingDirection
            };
        },

        shellTpl: 'tpl-admin-content-shell',
        headerTpl: 'tpl-admin-projects-header',
        listTileTpl: 'tpl-admin-projects-tile-view',
        listTableTpl: 'tpl-admin-projects-table-view',
        listShellTpl: 'tpl-admin-projects-list-shell',

        render: function (options) {
            this.$el.html(Util.templates(this.shellTpl));
            this.$header = $("#contentHeader", this.$el);
            this.$body = $("#contentBody", this.$el);
            this.fillContent(options);
            return this;
        },

        restoreSettings: function () {
            var tpl = this.currentTpl || config.currentProjectsSettings.listView || config.defaultProjectsSettings.listView;
            var type = (tpl === this.listTableTpl) ? 'table' : 'tile';
            var filterButtonGroup = $('#sortDirection .rp-btn');
            var filterButton = $('#sortDirection .rp-btn[data-type="' + this.filter.sort + '"]');

            $('.projects-view').removeClass('active');
            $('.projects-view[data-view-type="' + type + '"]').addClass('active');
            $('#nameFilter').val(this.filter.search);

            filterButtonGroup.removeClass('active');
            filterButton.addClass('active');

            if (this.filter.direction === 'desc') {
                filterButtonGroup.removeClass('desc');
                filterButton.addClass('desc');
            }

            filterButtonGroup.attr('disabled', true);
            this.on('loadProjectsReady', this.onLoadProjectsReady, this);
        },

        fillContent: function (options) {
            this.filter = this.getDefaultFilter();

            this.$header.html(Util.templates(this.headerTpl, options));
            this.$sortBlock = $("#sortDirection", this.$header);
            this.$searchString = $("#nameFilter", this.$header);
            Util.bootValidator(this.$searchString, [{
                validator: 'minMaxNotRequired',
                type: 'addProjectName',
                min: 3,
                max: 256
            }]);

            this.$body.html(Util.templates(this.listShellTpl, options));
            this.$activeAmount = $("#activeFound", this.$body);
            this.$activeHolder = $("#activeProjectsList", this.$body);
            this.$inactiveAmount = $("#inactiveFound", this.$body);
            this.$inactiveHolder = $("#collapseInactive", this.$body);
            this.$personalHolder = $('[data-js-personal-projects]', this.$body);
            this.$personalAmount = $('[data-js-personal-amount]', this.$body);

            this.restoreSettings();
            this.loadProjects();
        },

        events: {
            'show.bs.collapse #accordion': 'renderInactive',
            'click .remove-project': 'removeProject',
            'click #sortDirection .rp-btn': 'changeSorting',
            'validation::change #nameFilter': 'filterProjects',
            'click .assign-to-project': 'assignAdminToProject',
            'click .projects-view': 'changeProjectsView'
        },

        changeProjectsView: function (event) {
            event.preventDefault();

            var $target = $(event.currentTarget);
            var template = ($target.data('view-type') == 'table') ? this.listTableTpl : this.listTileTpl;

            config.currentProjectsSettings.listView = template;
            this.currentTpl = template;

            $('.projects-view').removeClass('active');
            $target.addClass('active');

            if (this.projectsData && _.size(this.projectsData)) {
                this.reRenderProjects();
            }
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

        onLoadProjectsReady: function () {
            $('#sortDirection .rp-btn').attr('disabled', false);
        },

        changeSorting: function (e) {
            var btn = $(e.currentTarget);
            this.off('loadProjectsReady', this.onLoadProjectsReady, this);

            if (btn.hasClass('active')) {
                btn.toggleClass('desc');
                this.filter.direction = config.currentProjectsSettings.sortingDirection = btn.hasClass('desc') ? 'desc' : 'asc';
            } else {
                $(".active, .desc", this.$sortBlock).removeClass('active').removeClass('desc');
                btn.addClass('active');
                this.filter.direction = config.currentProjectsSettings.sortingDirection = 'asc';
                this.filter.sort = config.currentProjectsSettings.sorting = btn.data('type');
            }
            this.makeSorting();
        },

        makeSorting: function () {
            this.projectsData.active = _.sortByOrder(this.projectsData.active, this.filter.sort, this.filter.direction === 'asc');
            this.projectsData.personal = _.sortByOrder(this.projectsData.personal, this.filter.sort, this.filter.direction === 'asc');
            if (this.$inactiveHolder.hasClass('in')) {
                this.projectsData.inactive = _.sortByOrder(this.projectsData.inactive, this.filter.sort, this.filter.direction === 'asc');
            }
            this.reRenderProjects();
        },

        filterProjects: function (e, data) {
            var self = this;
            clearTimeout(this.searching);
            this.searching = setTimeout(function () {
                if (data.valid) {
                    self.filter.search = config.currentProjectsSettings.search = data.value;
                    self.reRenderProjects();
                }
            }, config.userFilterDelay);
        },

        reRenderProjects: function () {
            this.renderActiveProjects();
            this.renderPersonalProjects();
            if (this.$inactiveHolder.hasClass('in')) {
                this.renderInactive();
            } else {
                var self = this;
                var result = _.reduce(this.projectsData.inactive, function (sum, p) {
                    return sum + self.searchFilter(p, self.filter.search);
                }, 0);
                this.$inactiveAmount.text(result);
            }
        },

        renderPersonalProjects: function(){
            this.$personalHolder.html(Util.templates(this.currentTpl, {
                collection: this.projectsData.personal,
                util: Util,
                isNew: this.isNew,
                hasRunsLastWeek: this.hasRunsLastWeek,
                active: true,
                canDelete: this.canDelete,
                search: this.filter.search,
                filter: this.searchFilter,
                textWrapper: Util.textWrapper,
                userProjects: config.userModel.get('projects')
            }));

            this.$personalAmount.text($(".project-row", this.$personalHolder).length);
        },

        renderInactive: function () {
            this.$inactiveHolder.html(Util.templates(this.currentTpl, {
                collection: this.projectsData.inactive,
                util: Util,
                canDelete: this.canDelete,
                search: this.filter.search,
                filter: this.searchFilter,
                textWrapper: Util.textWrapper,
                userProjects: config.userModel.get('projects'),
                inactiveProject: true
            }));
            this.$inactiveAmount.text($(".project-row", this.$inactiveHolder).length);
        },

        canDelete: function (item) {
            return !Util.isDeleteLock(item);
        },

        update: function (options) {
            this.fillContent(options);
        },

        loadProjects: function () {
            var self = this;
            this.$searchString.attr('disabled', 'disabled');
            config.userModel.ready.done(function () {
                Service.getProjects()
                    .done(function (data) {
                        data = _.sortBy(data, function (project) {
                            return project.creationDate;
                        }).reverse();
                        self.projectsData = _.groupBy(data, function (project) {
                            return project.entryType == "PERSONAL" ? 'personal' : project.launchesQuantity || self.isNew(project.creationDate) ? 'active' : 'inactive';
                        });
                        self.makeSorting();
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'adminLoadProjects');
                    })
                    .always(function(){
                        self.$searchString.removeAttr('disabled');
                    });
            });
        },

        renderActiveProjects: function () {
            this.$activeHolder.html(Util.templates(this.currentTpl, {
                collection: this.projectsData.active,
                util: Util,
                isNew: this.isNew,
                hasRunsLastWeek: this.hasRunsLastWeek,
                active: true,
                canDelete: this.canDelete,
                search: this.filter.search,
                filter: this.searchFilter,
                textWrapper: Util.textWrapper,
                userProjects: config.userModel.get('projects')
            }));
            this.$activeAmount.text($(".project-row", this.$activeHolder).length);

            this.trigger('loadProjectsReady');
        },

        searchFilter: function (item, searchString) {
            if (!searchString) {
                return true;
            } else {
                var regex = new RegExp(searchString.escapeRE(), 'i');
                return regex.test(item.projectId);
            }
        },

        isNew: function (stamp) {
            return Util.daysBetween(new Date(), new Date(stamp)) <= 7;
        },

        hasRunsLastWeek: function (stamp) {
            return Util.daysBetween(new Date(), new Date(stamp)) < 7;
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
                            self.removeFromCollection(id, status);
                            var curProjects = config.userModel.get('projects');
                            delete curProjects[id];
                            config.userModel.set('projects', curProjects);
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

        removeFromCollection: function (id, status) {
            var collection = status ? this.projectsData.active : this.projectsData.inactive;
            var index = _.findIndex(collection, function (project) {
                return project.projectId === id;
            });
            collection.splice(index, 1);
            if (status) {
                this.renderActiveProjects();
            } else {
                this.renderInactive();
            }
        },

        destroy: function () {
            this.projectsData = null;
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
