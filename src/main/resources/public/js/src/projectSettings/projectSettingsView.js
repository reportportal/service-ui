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
    var SingletonAppModel = require('model/SingletonAppModel');
    var DropDownComponent = require('components/DropDownComponent');

    var GeneralTabView = require('projectSettings/tabViews/general/generalTabView');
    var NotificationsTabView = require('projectSettings/tabViews/notifications/notificationsTabView');
    var BtsTabView = require('projectSettings/tabViews/bts/btsTabView');
    var DefectTabView = require('projectSettings/tabViews/defectTypes/defectTypesTabView');
    var DemoDataTabView = require('projectSettings/tabViews/demoData/demoDataTabView');

    var config = App.getInstance();

    var ProjectSettingsView = Epoxy.View.extend({

        className: 'project-settings',

        tpl: 'tpl-project-settings-shell',

        events: {
            'click .tab.settings': 'getTab'
        },

        initialize: function (options) {
            this.adminPage = options.adminPage;
            this.projectId = options.projectId;
            this.tab = options.tab || 'general';
            this.appModel = new SingletonAppModel();
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {
                tab: this.tab,
                projectId: this.projectId,
                generateDemoDataAccess: Util.isInPrivilegedGroup() || this.isPersonalProjectOwner(),
                adminPage: this.adminPage
            }));
            return this;
        },

        onShow: function () {
            this.setupAnchors();
            this.setupSelectDropDown();
            this.renderTabContent();
        },

        setupAnchors: function () {
            this.$tabContent = $('[data-js-tab-content]', this.$el);
        },

        renderTabContent: function () {
            var ViewTab;
            this.tabView && this.tabView.destroy();

            ViewTab = this.getTabView(this.tab);
            this.tabView = new ViewTab();

            this.$tabContent.html(this.tabView.$el);

            this.tabView.onShow && this.tabView.onShow();

            this.tabSelector.activateItem(this.tab);
            $('[data-js-tab-action]', this.$el).closest('li.active').removeClass('active');
            $('[data-js-tab-action="' + this.tab + '"]', this.$el).closest('li').addClass('active');
        },

        update: function (tab) {
            $('.users-typeahead.launches').select2('close');
            $('.users-typeahead.tags').select2('close');
            $('.users-typeahead.recipients').select2('close');
            this.tab = tab || 'general';
            this.renderTabContent();
        },

        setupSelectDropDown: function () {
            this.tabSelector = new DropDownComponent({
                data: [
                    { name: 'GENERAL', value: 'general' },
                    { name: 'NOTIFICATIONS', value: 'notifications' },
                    { name: 'BUG TRACKING SYSTEM', value: 'bts' },
                    { name: 'DEFECT TYPES', value: 'defect' },
                    { name: 'DEMO DATA', value: 'demoData' }
                ],
                multiple: false,
                defaultValue: this.tab
            });
            $('[data-js-nav-tabs-mobile]', this.$el).html(this.tabSelector.$el);
            this.listenTo(this.tabSelector, 'change', this.updateTabs);
        },

        isPersonalProjectOwner: function () {
            var user = config.userModel.get('name');
            var project = this.appModel.get('projectId');
            var isPersonalProject = this.appModel.isPersonalProject();
            return isPersonalProject && project === user + '_personal';
        },

        getTabView: function (tab) {
            switch (tab) {
            case 'notifications':
                config.trackingDispatcher.trackEventNumber(386);
                return NotificationsTabView;
            case 'bts':
                config.trackingDispatcher.trackEventNumber(397);
                return BtsTabView;
            case 'defect':
                config.trackingDispatcher.trackEventNumber(426);
                return DefectTabView;
            case 'demoData':
                config.trackingDispatcher.trackEventNumber(427);
                return DemoDataTabView;
            default:
                config.trackingDispatcher.trackEventNumber(380);
                return GeneralTabView;
            }
        },

        getTab: function (e) {
            e.preventDefault();
            this.updateTabs($(e.currentTarget).data('js-tab-action'));
        },

        updateTabs: function (tab) {
            var link = (this.adminPage) ? '#administrate/project-details/' + this.projectId + '/settings/' + tab : '#' + this.projectId + '/settings/' + tab;
            config.router.navigate(link, {
                trigger: true
            });
        },

        onDestroy: function () {
            this.tabView && this.tabView.destroy();
            this.tabView = null;
        }
    });

    return ProjectSettingsView;
});
