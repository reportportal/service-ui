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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Components = require('components');
    var urls = require('dataUrlResolver');
    var App = require('app');
    var Localization = require('localization');
    var Service = require('coreService');
    var Helpers = require('helpers');
    var AdminService = require('adminService');
    var Widget = require('widgets');

    require('select2');

    var config = App.getInstance();

    var ContentView = Backbone.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.subContext = options.subContext;
        },
        render: function () {
            this.$header = new Header({
                header: this.context.getMainView().$header
            }).render();
            this.$body = new Body({
                context: this.context,
                body: this.context.getMainView().$body,
                tab: this.subContext
            }).render();
            return this;
        },
        update: function (options) {
            this.$body.update(options.subContext);
        },
        destroy: function () {
            this.$header.destroy();
            this.$body.destroy();
            this.undelegateEvents();
            this.unbind();
            delete this;
        }
    });

    var Header = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.header;
        },
        tpl: 'tpl-projectinfo-header',
        render: function () {
            this.$el.html(Util.templates(this.tpl, {projectId: config.project.projectId}));
            return this;
        }
    });

    var Body = Components.BaseView.extend({
        initialize: function (options) {
            this.widgets = [];
            this.staticWidgets = [
                {id: 'launches_quantity'},
                {id: 'investigated'},
                {id: 'last_launch'},
                {id: 'activities'},
                {id: 'issues_chart', childs: ['bugs_percentage', 'system_issues_percentage', 'auto_bugs_percentage']}
            ];
            this.context = options.context;
            this.$el = options.body;
            this.interval = 3;
            this.project = config.project.projectId;
            this.isRenderLaunchesOwner = false;
            this.xhrPool = [];
        },
        tpl: 'tpl-projectinfo-page',
        tplGeneralInfo: 'tpl-project-general-info',
        tplLaunchesOwners: 'tpl-project-launch-owners',
        unableLoadTpl: 'tpl-project-widget-unable-load',
        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.setupAnchors();
            this.loadProjectInfo();
            this.loadWidgets();
            return this;
        },
        renderGeneralInfo: function(data){
            var el = this.$generalInfo;
            var generalInfo = el.find('.general-info');
            var isGeneralInfo = (generalInfo.length > 0);
            $('.loading-widget', el).hide();
            generalInfo.remove();
            el.append(Util.templates(this.tplGeneralInfo, {info: data, hasValidBtsSystem: Util.hasValidBtsSystem()}));
            if(!isGeneralInfo) {
                Util.setupBaronScroll(el);
            }
        },
        renderLaunchesOwners: function(data){
            var el = this.$launchOwners,
                params = {};
            $('.loading-widget', el).hide();
            params.launchesPerUser = _.sortByOrder(data.launchesPerUser, 'count', false);
            el.append(Util.templates(this.tplLaunchesOwners, params));
            if(!this.isRenderLaunchesOwner) {
                Util.setupBaronScroll(el);
                this.isRenderLaunchesOwner = true;
            }
        },
        setupAnchors: function(){
            this.$launchOwners = $('#launches_owners .widget-body', this.$el);
            this.$generalInfo = $('#general_info .widget-body', this.$el);
            this.$projectDetails = [this.$generalInfo, this.$launchOwners];
        },
        loadProjectInfo: function () {
            var self = this,
                projectId = this.project;

            _.each(this.$projectDetails, function(w){
                var cont = $('.project-content', w);
                cont.length && cont.remove();
                $('.loading-widget', w).show();
            });

            AdminService.loadProjectInfo(projectId, this.interval)
                .done(function (data) {
                    self.renderGeneralInfo(data);
                    self.renderLaunchesOwners(data);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'loadProjectInfo');
                });
        },
        loadStaticWidget: function (widget) {
            var self = this,
                widgetId = widget.id,
                projectId = this.project;
            var xhr = AdminService.loadProjectDetailsWidgets(projectId, widgetId, this.interval)
                .done(function (data) {
                    self.renderWidget(data, widgetId);
                    if(widget.childs){
                        _.each(widget.childs, function(w){
                            self.renderWidget(data, w);
                        });
                    }
                })
                .fail(function (error) {
                    self.renderFailedLoad(widgetId);
                    if(widget.childs){
                        _.each(widget.childs, function(w){
                            self.renderFailedLoad(w);
                        });
                    }
                    Util.ajaxFailMessenger(error, 'widgetData');
                })
                .always(function() {
                    var i = this.xhrPool.indexOf(xhr);
                    if (i > -1) this.xhrPool.splice(i, 1);
                }.bind(this))
            this.xhrPool.push(xhr);
        },
        renderFailedLoad: function(widgetId){
            var widgetEl = $('#' + widgetId),
                $loading = $('.loading-widget', widgetEl),
                $errorEl = $('div.no-data-error', widgetEl);

            $loading.hide();
            $errorEl.length && $errorEl.remove();
            $('.widget-body', widgetEl).append(Util.templates(this.unableLoadTpl, {}));
        },
        renderWidget: function(data, widgetId){
            var container = $('#' + widgetId),
                $errorEl = $('div.no-data-error', container),
                $loading = $('.loading-widget', container),
                view = Widget.widgetService(widgetId),
                widget = null,
                params = {
                    container: $('.widget-body', container),
                    param: {
                        id: widgetId,
                        content: data,
                        interval: this.interval
                    }
                };

            if(widgetId == 'activities'){
                params.isAutoRefresh = false;
                params.isReverse = false;
                params.projectId = this.project;
            }

            $loading.hide();
            $errorEl.length && $errorEl.remove();

            widget = new view(params).render();
            this.widgets.push({id: widgetId, view: widget});
        },
        loadWidgets: function(){
            var cloneXhr = _.clone(this.xhrPool);
            _.each(cloneXhr, function(xhr) {
                xhr.abort();
            });
            _.each(this.widgets, function(widget){
                widget.view.destroy();
                    var widgetId = widget.id,
                        container = $('#' + widgetId);
                $('.loading-widget', container).show();
            }, this);
            this.widgets = [];

            _.each(this.staticWidgets, function(w){
                this.loadStaticWidget(w);
            }, this);
        },
        update: function () {
            this.loadProjectInfo();
            this.loadWidgets();
        },
        destroy: function () {
            _.each(this.widgets, function(widget){
                widget.view.destroy();
            });
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    return {
        Body: Body,
        ContentView: ContentView
    };
});