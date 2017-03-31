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
    var Components = require('core/components');
    var AdminService = require('adminService');
    var Localization = require('localization');
    var ProjectsCollection = require('adminProjects/ProjectsCollection');
    var ProjectsItemView = require('adminProjects/ProjectsItemView');

    var config = App.getInstance();

    var ProjectsListView = Epoxy.View.extend({

        template: 'tpl-projects-list',
        listHeadTpl: 'tpl-projects-list-head',

        bindings: {
            '[data-js-search-text]': 'text: search'
        },

        initialize: function (options) {
            this.projectsType = options.projectsType;
            this.$total = options.total;
            this.renderViews = [];
            this.collection = new ProjectsCollection();
            this.listenTo(this.collection, 'reset', this.updateView.bind(this));
            this.listenTo(this.collection, 'remove', this.update.bind(this));
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
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

        setupAnchors: function () {
            this.$loaderEl = $('[data-js-projects-loader]', this.$el);
            this.$projectsList = $('[data-js-projects-list]', this.$el);
            this.$pagingEl = $('[data-js-projects-paging]', this.$el);
            this.$projectsContent = $('[data-js-projects-content]', this.$el);
            this.$emptyContent = $('[data-js-projects-empty]', this.$el);
        },

        renderProjects: function () {
            if (_.isEmpty(this.collection.models)) {
                this.$emptyContent.removeClass('hide');
                return;
            }
            this.$projectsContent.removeClass('hide');
            this.updateList();
            _.each(this.collection.models, function (project) {
                var projectItem = new ProjectsItemView({model: project, filterModel: this.model});
                this.$projectsList.append(projectItem.$el);
                this.renderViews.push(projectItem);
            }, this);
            this.trigger('loadProjectsReady');
        },

        updateView: function () {
            this.clearProjects();
            this.renderProjects();
        },

        updateList: function () {
            if(this.model.get('viewType') === 'table'){
                this.$projectsList.attr('class', 'projects-table-view');
                this.$projectsList.append(Util.templates(this.listHeadTpl, {}));
            }
            else {
                this.$projectsList.attr('class', 'projects-list-view');
            }
        },

        update: function () {
            this.clearProjects();
            this.loadProjects();
        },

        getDefaultPaging: function () {
            return {number: 1, size: 12};
        },

        onPage: function (page) {
            this.update();
        },

        onPageCount: function (size) {
            this.update();
        },

        onLoadProjects: function (data) {
            if (data.page.totalPages < data.page.number && data.page.totalPages != 0) {
                this.paging.trigger('page', data.page.totalPages);
                return;
            }
            this.paging.model.set(data.page);
            this.paging.render();
            this.collection.reset(data.content ? data.content : data);
            this.$total.html('(' + data.page.totalElements + ')');
        },

        getQueryData: function () {
            var query = this.projectsType == 'personal' ? '?filter.eq.configuration$entryType=PERSONAL' : '?filter.in.configuration$entryType=INTERNAL,UPSA',
                search = this.model.get('search'),
                sort = this.model.get('sort'),
                direction = this.model.get('direction');
            if (search) {
                query += '&filter.cnt.name=' + search;
            }
            if (sort) {
                query += '&page.sort=' + sort;
                if (direction) {
                    query += ',' + direction;
                }
            }
            query += '&page.page=' + this.paging.model.get('number') + '&page.size=' + this.paging.model.get('size');
            return query;
        },

        loadProjects: function () {
            var query = this.getQueryData();
            config.userModel.ready.done(function () {
                this.$projectsContent.addClass('hide');
                this.$emptyContent.addClass('hide');
                this.toggleLoader('show');
                AdminService.getProjects(query)
                    .done(function (data) {
                        this.onLoadProjects(data);
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'adminLoadProjects');
                    })
                    .always(function () {
                        this.toggleLoader('hide');
                    }.bind(this));
            }.bind(this));
        },

        toggleLoader: function (action) {
            this.$loaderEl[action]();
        },

        clearProjects: function(){
            _.each(this.renderViews, function(view) {
                view.destroy();
            });
            this.$projectsList.empty();
            this.renderViews = [];
        },

        destroy: function () {
            this.clearProjects();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return ProjectsListView;

});
