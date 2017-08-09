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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var EmailSettings = require('adminServerSettings/EmailServerSettingsView');
    var AuthSettings = require('adminServerSettings/authServerSettings/AuthServerSettingsView');
    var StatisticsSettings = require('adminServerSettings/StatisticsServerSettingsView');
    var DropDownComponent = require('components/DropDownComponent');

    var config = App.getInstance();

    var ServerSettingsTabsView = Epoxy.View.extend({

        tpl: 'tpl-server-settings-shell',

        events: {
            'click [data-js-tab-action]': 'getTab'
        },

        initialize: function (options) {
            this.tab = options.action || 'email';
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, { tab: this.tab }));
            this.setupAnchors();
            this.setupSelectDropDown();
            this.renderTabContent();
        },

        update: function (tab) {
            this.tab = tab || 'email';
            this.renderTabContent();
        },

        setupSelectDropDown: function () {
            this.tabSelector = new DropDownComponent({
                data: [
                    { name: 'E-MAIL SERVER', value: 'email' },
                    { name: 'AUTHORIZATION CONFIGURATION', value: 'auth' },
                    { name: 'STATISTICS', value: 'statistics' }
                ],
                multiple: false,
                defaultValue: this.tab
            });
            $('[data-js-nav-tabs-mobile]', this.$el).html(this.tabSelector.$el);
            this.listenTo(this.tabSelector, 'change', this.updateTabs);
        },

        getTab: function (e) {
            e.preventDefault();
            this.updateTabs($(e.currentTarget).data('js-tab-action'));
        },

        updateTabs: function (tab) {
            switch (tab) {
            case 'auth':
                config.trackingDispatcher.trackEventNumber(491);
                break;
            default:
                config.trackingDispatcher.trackEventNumber(490);

            }
            config.router.navigate('#administrate/settings/' + tab);
            this.update(tab);
        },

        renderTabContent: function () {
            var ViewTab;

            this.tabView && this.tabView.destroy();

            ViewTab = this.getTabView(this.tab);
            this.tabView = new ViewTab();
            this.$tabContent.html(this.tabView.$el);

            $('[data-js-tab-action]', this.$el).closest('li.active').removeClass('active');
            $('[data-js-tab-action="' + this.tab + '"]', this.$el).closest('li').addClass('active');
            this.tabSelector.activateItem(this.tab);
        },

        getTabView: function (tab) {
            switch (tab) {
            case 'auth':
                return AuthSettings;
            case 'statistics':
                return StatisticsSettings;
            default :
                return EmailSettings;
            }
        },

        setupAnchors: function () {
            this.$tabContent = $('[data-js-tab-content]', this.$el);
        },

        destroy: function () {
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
