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
    var UsersProjectsItemView = require('adminUsers/UserProjectsItemView');
    var UserProjectsCollection = require('adminUsers/UserProjectsCollection');
    var CoreService = require('coreService');
    var UsersAddProjectView = require('adminUsers/UserAddProjectView');

    var config = App.getInstance();

    var UserProjectsView = Epoxy.View.extend({
        tpl: 'tpl-users-projects',
        className: 'user-projects-list',

        bindings: {
        },

        computeds: {
        },

        events: {
            'click [data-js-add-project]': 'addUserProject'
        },

        initialize: function (options) {
            this.renderViews = [];
            this.collection = new UserProjectsCollection();
            this.listenTo(this.collection, 'reset', this.renderProjectsList);
            this.listenTo(this.collection, 'remove', this.renderProjectsList);
            this.render();
            this.setupAnchors();
            this.loadProjects();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {}));
        },

        setupAnchors: function(){
            this.$addProjectRow = $('[data-js-add-project-row]', this.$el);
            this.$loader = $('[data-js-loader]', this.$el);
        },

        loadProjects: function(){
            this.toggleLoader('show');
            CoreService.getUserAssignedProjects(this.model.get('userId'))
                .done(function (data) {
                    this.collection.parse(data);
                    this.toggleLoader('hide');
                }.bind(this));
        },

        renderProjectsList: function(){
            this.clearItems();
            _.each(this.collection.models, function(project){
                var projectItem = new UsersProjectsItemView({
                    model: project, userModel: this.model
                });
                $('[data-js-project-list]', this.$el).append(projectItem.$el);
                this.renderViews.push(projectItem);
            }, this);
        },

        toggleAddProject: function(type){
            var action = type == 'hide' ? 'add' : 'remove';
            this.$addProjectRow[action+'Class']('hide');
        },

        toggleLoader: function(type){
            var action = type == 'hide' ? 'add' : 'remove';
            this.$loader[action+'Class']('hide');
        },

        addUserProject: function(e){
            e.preventDefault();
            this.toggleAddProject('hide');
            var addFrom = new UsersAddProjectView({userModel: this.model});
            $('[data-js-add-form]', this.$el).append(addFrom.$el);
            this.listenToOnce(addFrom, 'user:assigned', function(){
                this.loadProjects();
                this.toggleAddProject('show');
                addFrom.destroy();
            }.bind(this));
        },

        clearItems: function(){
            _.each(this.renderViews, function(view) {
                view.destroy();
            });
            $('[data-js-project-list]', this.$el).html('');
            this.renderViews = [];
        },

        destroy: function(){
            this.clearItems();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return UserProjectsView;

});