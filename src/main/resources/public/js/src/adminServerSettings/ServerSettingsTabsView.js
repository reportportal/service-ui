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
    var ServerSettingsTabsView = require('adminServerSettings/ServerSettingsTabsView');
    var EmailSettings = require('adminServerSettings/EmailServerSettingsView');
    var AuthSettings = require('adminServerSettings/AuthServerSettingsView');

    var config = App.getInstance();

    var ServerSettingsTabsView = Epoxy.View.extend({

        tpl: 'tpl-server-settings-shell',

        events: {
            'click [data-js-tab-action]': 'updateTabs'
        },

        initialize: function (options) {
            this.tab = options.action || "email";
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {tab: this.tab}));
            this.setupAnchors();
            this.renderTabContent();
        },

        update: function(tab, silent){
            this.tab = tab || "email";
            if (!silent) {
                $('[data-action=' + this.tab + ']', this.$el).tab('show');
            }
            this.renderTabContent();
        },

        updateTabs: function (e) {
            var $el = $(e.currentTarget),
                tab = $el.data('js-tab-action');
            config.router.navigate($el.attr('href'), {
                silent: true
            });
            this.update(tab, true);
        },

        renderTabContent: function(){
            this.tabView && this.tabView.destroy();

            var viewTab = this.getTabView(this.tab),
                currentContent = $('[data-js-tab-content="' + this.tab + '"]', this.$el);

            this.tabView = new viewTab();
            $('[data-js-tab-content]', this.$el).hide();
            $('[data-js-tab-action]', this.$el).closest('li.active').removeClass('active');
            $('[data-js-tab-action="' + this.tab + '"]', this.$el).closest('li').addClass('active');
            currentContent.append(this.tabView.$el);
            currentContent.show();
        },

        getTabView: function(tab) {
            switch (tab) {
                case 'auth':
                    return AuthSettings;
                    break;
                default :
                    return EmailSettings;
            }
        },

        setupAnchors: function () {

        },

        destroy: function(){
            this.tabView && this.tabView.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return ServerSettingsTabsView;

});