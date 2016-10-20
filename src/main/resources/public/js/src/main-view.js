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
    var App = require('app');
    var UserModel = require('model/UserModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');

    var Header = require('sections/header');
    var Sidebar = require('sections/sidebar');
    var Footer = require('sections/footer');

    require('equalHeightRows');

    var config = App.getInstance();

    var MainView = Backbone.View.extend({
        initialize: function (options) {
            this.$el = options.el;
            this.contextName = options.contextName;
            //this.$header = null;
            this.$body = null;
        },

        render: function () {
            this.$el.empty();

            this.sidebarView = new Sidebar({
                tpl: 'tpl-main-side-bar',
                projectUrl: config.project.projectId,
                currentPage: this.contextName,
            }).render();

            this.headerView = new Header({
                tpl: 'tpl-main-top-header',
                currentPage: this.contextName,
            }).render();

            this.footerView = new Footer().render();

            this.createMainContainer();
            this.$header = $('#contentHeader', this.$el);
            this.$body = $('#dynamic-content', this.$el);
        },

        createMainContainer: function () {
            this.main = new Container({
                container: this.$el
            });
            this.main.render();
        },

        destroy: function () {
            if (this.main) {
                this.main.destroy();
            }
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.$el.off().empty();

            this.sidebarView.destroy();
            this.sidebarView = null;
            this.headerView.destroy();
            this.headerView = null;
            this.footerView.destroy();
            this.footerView = null;
        }

    });

    var Container = Backbone.View.extend({
        initialize: function (options) {
            this.$container = options.container;
        },

        tpl: 'tpl-container',

        events: {
            'click #btt': 'scrollTop'
        },

        scrollTop: function () {
            $('body,html').animate({
                scrollTop: 0
            }, 100);
            return false;
        },

        render: function () {
            this.$container.append(this.$el.html(Util.templates(this.tpl)));
        },

        destroy: function () {
            this.undelegateEvents();
            this.remove();
        }
    });

    var NotFoundPage = Backbone.View.extend({
        tpl: 'tpl-404',

        initialize: function (options) {
            this.$el = options.container;
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {
                url: config.userModel.getDefaultProjectHash()
            }));
            config.userModel.set({lastInsideHash: config.userModel.getDefaultProjectHash()});
            return this;
        },

        destroy: function () {
            this.undelegateEvents();
            this.$el.empty();
        }
    });

    return {
        MainView: MainView,
        Container: Container,
        Footer: Footer,
        NotFoundPage: NotFoundPage
    };
});
