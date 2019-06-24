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
    var ServerSettingsHeaderView = require('adminServerSettings/ServerSettingsHeaderView');
    var ServerSettingsTabsView = require('adminServerSettings/ServerSettingsTabsView');

    var config = App.getInstance();

    var ServerSettingsPageView = Epoxy.View.extend({

        tpl: 'tpl-server-settings-body',

        initialize: function (options) {
            this.$el = options.el;
            this.$header = options.header;
            this.action = options.action;
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.renderHeader();
            this.renderBody();
            return this;
        },

        renderHeader: function(){
            this.header = new ServerSettingsHeaderView();
            this.$header.append(this.header.$el);
        },

        renderBody: function () {
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
            this.body = new ServerSettingsTabsView({
                action: this.action
            });
            $('[data-js-settings]', this.$el).append(this.body.$el);
        },

        update: function () {
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
            this.renderBody();
        },

        destroy: function(){
            this.header && this.header.destroy();
            this.body && this.body.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    return {
        ContentView: ServerSettingsPageView
    };

});