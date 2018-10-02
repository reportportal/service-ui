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

define(function (require) {
    'use strict';

    var Backbone = require('backbone');
    var App = require('app');

    var Header = require('sections/header');
    var Content = require('sections/content');
    var Sidebar = require('sections/sidebar');
    var Footer = require('sections/footer');

    var config = App.getInstance();

    var MainView = Backbone.View.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.contextName = options.contextName;
        },

        render: function (options) {
            this.$el.empty();
            this.sidebarView = new Sidebar({
                tpl: 'tpl-sidebar',
                projectUrl: config.project.projectId,
                currentPage: this.contextName,
            }).render();
            this.footerView = new Footer().render();
            this.headerView = new Header({
                tpl: 'tpl-header',
                currentPage: this.contextName,
            }).render();

            this.contentView = new Content({
                isAdminPage: false,
                el: this.$el
            }).render(options);
        },

        update: function (options) {
            this.contentView.update(options);
        },

        destroy: function () {
            this.contentView.destroy();
            this.contentView = null;
            this.sidebarView.destroy();
            this.sidebarView = null;
            this.headerView.destroy();
            this.headerView = null;
            this.footerView.destroy();
            this.footerView = null;

            this.undelegateEvents();
            this.stopListening();
            this.$el && this.$el.off();
        }
    });

    return {
        MainView: MainView
    };
});
