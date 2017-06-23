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

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var config = App.getInstance();
    var Localization = require('localization');
    var MainBreadcrumbsComponent = require('components/MainBreadcrumbsComponent');

    var ProjectSettingsView = require('projectSettings/projectSettingsView');

    var Header = Epoxy.View.extend({

        id: 'headerBar',

        tpl: 'tpl-project-settings-header',

        initialize: function () {
            this.mainBreadcrumbs = new MainBreadcrumbsComponent({
                data: this.getHeaderData()
            });
            this.render();
        },

        getHeaderData: function () {
            var data = [{ name: Localization.project.settings, link: '#' + config.project.projectId + '/settings' }];
            return data;
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            $('[data-js-main-breadcrumbs]', this.$el).append(this.mainBreadcrumbs.$el);
            return this;
        },
        onDestroy: function () {
            this.$el.empty();
        }
    });

    var Body = Epoxy.View.extend({

        initialize: function (options) {
            this.context = options.context;
            this.tab = options.tab;
        },
        render: function () {
            this.projectSettings = new ProjectSettingsView({
                projectId: config.project.projectId,
                tab: this.tab
            });
            this.$el.html(this.projectSettings.$el);
            this.projectSettings.onShow && this.projectSettings.onShow();
            return this;
        },
        onShow: function () {
            this.render();
        },
        update: function (tab) {
            this.tab = tab;
            this.projectSettings.update(this.tab);
        },
        onDestroy: function () {
            this.projectSettings && this.projectSettings.destroy();
        }
    });

    var ContentView = Epoxy.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.subContext = options.subContext;
        },
        render: function () {
            this.header = new Header();
            this.context.getMainView().$header.html(this.header.$el);
            // do not call render method on body - since it is async data
            // dependant and will do it after fetch
            this.body = new Body({
                context: this.context,
                tab: this.subContext
            });
            this.context.getMainView().$body.html(this.body.$el);
            this.body.onShow && this.body.onShow();
            return this;
        },
        update: function (options) {
            this.body.update(options.subContext);
        },
        onDestroy: function () {
            this.header.destroy();
            this.body.destroy();

            $('.select2-drop-active', this.$el).remove();
        }
    });

    return {
        ContentView: ContentView
    };
});
