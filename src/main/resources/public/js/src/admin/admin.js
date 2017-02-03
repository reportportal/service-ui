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
    var UserModel = require('model/UserModel');
    var SingletonUserStorage = require('storage/SingletonUserStorage');

    var Header = require('sections/header');
    var Content = require('sections/content');
    var Sidebar = require('sections/sidebar');
    var Footer = require('sections/footer');

    var config = App.getInstance();

    var MainView = Backbone.View.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.contextName = 'admin';
            this.$body = $("#mainContainer", this.$el);
            this.user = new UserModel();

            this.userStorage = new SingletonUserStorage();
        },

        events: {
            'click #logout': 'onClickLogout'
        },

        render: function (options) {
            config.currentProjectsSettings = {};
            var lastURL = this.userStorage.get('lastActiveURL') || config.userModel.get('defaultProject');

            this.headerView = new Header({
                isAdminPage: true,
                tpl: 'tpl-admin-header',
                currentPage: options.page,
                lastURL: lastURL
            }).render();

            this.contentView = new Content({
                isAdminPage: true,
                contextName: this.contextName,
                el: this.$body,
                queryString: options.queryString
            }).render(options);

            this.footerView = new Footer().render();

            this.sidebarView = new Sidebar({
                tpl: 'tpl-admin-side-bar',
                lastURL: lastURL
            }).render();
            return this;
        },

        onClickLogout: function (e) {
            e.preventDefault();
            this.user.logout();
        },

        update: function (options) {
            this.contentView.update(options);
            this.headerView.update(options);
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
