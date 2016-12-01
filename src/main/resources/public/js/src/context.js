/*
 * Copyright 2016 EPAM Systems
 * 
 * 
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var App = require('app');
    var Projects = require('project');
    var ProjectInfo = require('projectinfo');
    var Member = require('member');
    var Main = require('mainview');
    var Dashboard = require('dashboard');
    var Favorites = require('favorites');
    var Launch = require('launch');
    var Profile = require('profile');
    var Util = require('util');
    var Service = require('coreService');
    var Admin = require('admin');
    var Register = require('register');

    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();
    var Context = {

        pages: [
            {name: 'login', url: 'login'},
            {name: 'documentation', url: 'documentation'},
            {name: 'user profile', url: 'user-profile'}
        ],

        service: function (name) {
            switch (name) {
                case "dashboard":
                    return Dashboard;
                    break;
                case "filters":
                    return Favorites;
                    break;
                case "launches":
                case "userdebug":
                    return Launch;
                    break;
                case "members":
                    return Member;
                    break;
                case "settings":
                    return Projects;
                    break;
                case "user-profile":
                    return Profile;
                    break;
                case "info":
                    return ProjectInfo;
                    break;
                default:
                    break;
            }
        },

        current: null,

        currentContext: null,

        adminContext: 'admin',

        mainView: undefined,

        invalidView: null,

        contentView: null,

        currentProjectId: null,

        create: {},

        bodyContainer: null,

        mainContainer: null,

        containersSet: false,

        wrongResponseTo404: function () {
            config.userModel.clearLastInsidePage();
            if (this.currentProjectId) {
                this.destroyViews();
                this.openInvalid();
            } else {
                this.logout();
            }
        },

        loadProject: function () {
            var self = this;

            return Service.getProject().then(
                function (response) {
                    self.currentProjectId = response.projectId;
                    config.project = response;
                    appModel.set({projectId: response.projectId, type: response.configuration.entryType});
                });
        },

        loadPreferences: function () {
            return Service.getPreferences().done(function (result) {
                config.preferences = result;
            });
        },

        openAdmin: function (page, id, action, queryString) {
            if(id) {
                appModel.set({projectId: id});
            }
            this.checkForContextChange(page);
            this.checkForContainers();

            var data = {page: page, id: id, action: action, queryString: queryString};
            this.currentProjectId = null;
            this.mainContainer && this.mainContainer.removeClass('tabbed');
            this.validateMainViewByContextName(this.adminContext);

            if (!this.mainView) {
                this.mainView = new Admin.MainView({
                    el: this.bodyContainer
                });
                this.mainView.render(data);
                this.trigger('renderMainView', this.mainView);
            } else {
                // set update active links
                this.mainView.update(data);
            }
        },

        checkForContainers: function () {
            if (!this.containersSet) {
                this.mainContainer = $('#mainContainer');
                this.bodyContainer = $("#bodyContainer");
                this.containersSet = true;
            }
        },

        checkForContextChange: function (newContext) {
            if (this.currentContext && this.currentContext !== newContext) {
                Util.clearXhrPool();
            }
            this.currentContext = newContext;
        },


        openRegister: function (id) {
            this.destroyViews();
            this.mainView = new Register.RegisterView({
                el: $("#bodyContainer"),
                id: id,
                context: this
            }).render();
        },

        openRouted: function (projectId, contextName, subContext, queryString) {
            this.checkForContextChange(contextName);
            this.checkForContainers();

            this.validateMainViewForAdmin();


            // make sure alert messages are whipped down on page transaction
            Util.clearMessage();

            config.project['projectId'] = projectId || config.userModel.get('defaultProject');

            var dependenciesCalls = [];
            if (this.preferencesAreNotLoaded()) {
                dependenciesCalls.push(this.loadPreferences());
            }

            if (this.projectIsNotLoaded(projectId) || this.isSettingsPage(contextName)) {
                dependenciesCalls.push(this.loadProject());
            }

            // make sure that previous 404's are removed
            this.destroyInvalidView();

            var self = this,
                renderPage = function () {
                    self.manageMainView({contextName: contextName, projectId: projectId || config.project.projectId});
                    self.validateContentViewByContextName(contextName);
                    //check for possible tabs
                    var tabbedAction = contextName === 'launches' ? 'add' : 'remove';
                    self.mainContainer[tabbedAction + "Class"]('tabbed');

                    if (self.contentView && self.contentView.update) {
                        // if context is the same update it
                        self.contentView.update({subContext: subContext, queryString: queryString});
                    } else {
                        // fill content view according to the context
                        var LocalView = self.service(contextName);
                        self.contentView = new LocalView.ContentView({
                            contextName: contextName,
                            context: self.getAppProp(),
                            subContext: subContext,
                            queryString: queryString
                        }).render();
                    }
                    self.trigger('onRenderPage', {
                        projectId: projectId,
                        contextName: contextName,
                        subContext: subContext,
                        queryString: queryString
                    })
                };

            if (dependenciesCalls.length) {
                $.when.apply($, dependenciesCalls).done(function () {
                    self.destroyContentView();
                    self.destroyMainView();
                    renderPage();
                }).fail(function () {
                    self.wrongResponseTo404();
                });
            } else {
                renderPage();
            }
            $('#main_content').focus();
        },

        isSettingsPage: function (context) {
            return context === 'settings';
        },

        validateMainViewForAdmin: function () {
            if (this.mainView && this.mainView.contextName === this.adminContext) {
                this.destroyViews();
            }
        },

        validateMainViewByContextName: function (name) {
            if (this.mainView && this.mainView.contextName !== name) {
                this.destroyViews();
            }
        },

        destroyViews: function () {
            this.destroyContentView();
            this.destroyMainView();
        },

        validateContentViewByContextName: function (name) {
            // empty content view if context changed
            if (this.contentView && this.contentView.contextName !== name) {
                this.destroyContentView();
            }
        },

        manageMainView: function (options) {
            // create main view if absent
            if (!this.mainView) {
                this.mainView = new Main.MainView({
                    el: this.mainContainer,
                    contextName: options.contextName
                });
                this.mainView.render();
                this.trigger('renderMainView', this.mainView);
            } else {
                // set update active links
                this.mainView.update(options);
            }
        },

        projectIsNotLoaded: function () {
            return !this.currentProjectId || this.currentProjectId !== config.project.projectId;
        },

        preferencesAreNotLoaded: function () {
            return !config.preferences || config.preferences.projectRef !== config.project.projectId;
        },

        openInvalid: function () {
            this.validateContentViewByContextName("not-found");
            var target;
            if (this.mainView) {
                target = $("#dynamic-content", this.mainView.$el);
            } else {
                target = $("#mainContainer");
            }
            this.invalidView = new Main.NotFoundPage({container: target}).render();
        },

        logout: function () {
            if (config.userModel &&  window.location.hash.indexOf('documentation') == -1) {
                // this.destroyContentView();
                // this.destroyMainView();

                // $('.js-loginblock').removeClass('b-login--open');
                // window.location = '/reportportal-ws';

                config.userModel.logout();
                this.currentProjectId = null;

                Util.ajaxInfoMessenger('logOuted');
            }
        },

        destroyMainView: function () {
            if (this.mainView) {
                this.mainView.destroy();
                this.mainView = null;
            }
        },

        destroyContentView: function () {
            if (this.contentView) {
                this.contentView.destroy();
                this.contentView = null;
            }
        },

        destroyInvalidView: function () {
            if (this.invalidView) {
                this.invalidView.destroy();
                this.invalidView = null;
            }
        },

        getAppProp: function () {
            var mainView = this.mainView;
            return {
                getMainView: function () {
                    return mainView;
                }
            }
        }
    };

    _.extend(Context, Backbone.Events);
    return Context;
});