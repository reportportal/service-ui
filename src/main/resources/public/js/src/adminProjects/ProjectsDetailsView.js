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
    var AdminService = require('adminService');
    var Urls = require('dataUrlResolver');
    var ProjectInfo = require('projectinfo');
    var Components = require('core/components');

    var config = App.getInstance();

    var ProjectsDetailsView = ProjectInfo.Body.extend({
        initialize: function (options) {
            ProjectInfo.Body.prototype.initialize.call(this, options);
            this.$el = options.el;
            this.action = options.action;
            this.interval = this.getInterval(options.queryString);
            this.project = options.id;
        },

        bodyTpl: "tpl-projects-details",

        getInterval: function (query) {
            return query ? +query.split('=')[1] : 3;
        },

        render: function () {
            this.$el.html(Util.templates(this.bodyTpl, {}));
            this.$content = $("#contentTarget", this.$el);
            this.$content.html(Util.templates(this.tpl));
            this.$interval = $(".btn-group:first", this.$el);

            this.setupAnchors();

            var self = this;
            config.project = {projectId: this.project};
            $.when(AdminService.getProjectInfo())
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
            config.router.navigate(Urls.detailsInterval(this.id, value), {silent: true});
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

    return ProjectsDetailsView;

});