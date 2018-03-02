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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Service = require('coreService');
    var DropDownComponent = require('components/DropDownComponent');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();
    var ProjectSettingsModel = require('projectSettings/tabViews/general/generalSettingsModel');

    var GeneralTabView = Epoxy.View.extend({
        className: 'general-project-settings',
        tpl: 'tpl-project-settings-general',

        events: {
            'click #submit-settings': 'submitSettings',
            'change input[type="radio"]': 'onChangeAABase'
        },
        bindings: {
            '[data-js-is-auto-analize]': 'checked: isAutoAnalyzerEnabled',
            '[data-js-aa-base-block]': 'classes: {hide: not(isAutoAnalyzerEnabled)}',
            '[data-js-analize-on-the-fly]': 'checked: analyzeOnTheFly, attr: {disabled: not(isAutoAnalyzerEnabled)}'
        },

        initialize: function () {
            var self = this;
            this.registryInfoModel = new SingletonRegistryInfoModel();
            this.model = new ProjectSettingsModel(appModel.get('configuration'));
            this.dropdownComponents = [];
            this.listenTo(this.model, 'change:interruptedJob', function () {
                config.trackingDispatcher.trackEventNumber(381);
            });
            this.listenTo(this.model, 'change:keepLogs', function () {
                config.trackingDispatcher.trackEventNumber(382);
            });
            this.listenTo(this.model, 'change:keepScreenshots', function () {
                config.trackingDispatcher.trackEventNumber(383);
            });
            this.listenTo(this.model, 'change:isAutoAnalyzerEnabled', function (model, value) {
                if (!value) {
                    self.model.set({ analyzeOnTheFly: false });
                }
                config.trackingDispatcher.trackEventNumber(384);
            });
            this.render();
            $('[value="' + (this.model.get('analyzer_mode') || 'LAUNCH_NAME') + '"]', this.$el).attr('checked', 'checked');
        },

        render: function () {
            var params = _.merge(this.model.toJSON(), {
                currentProject: config.project.projectId,
                access: config.userModel.hasPermissions()
            });
            this.$el.html(Util.templates(this.tpl, params));
            this.setupDropdowns();
            return this;
        },
        setupDropdowns: function () {
            var isEpamInstance = this.registryInfoModel.get('isEpamInstance');

            var interruptedJob = new DropDownComponent({
                data: _.map(config.forSettings.interruptedJob, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.model.get('interruptedJob')
            });
            var keepLogs = new DropDownComponent({
                data: _.map(
                    isEpamInstance ? _.reject(config.forSettings.keepLogs, function (val) { return val.value === 'forever'; }) : config.forSettings.keepLogs,
                    function (val) {
                        return { name: val.name, value: val.value, disabled: false };
                    }
                ),
                multiple: false,
                defaultValue: this.model.get('keepLogs')
            });
            var keepScreenshots = new DropDownComponent({
                data: _.map(
                    isEpamInstance ? _.reject(config.forSettings.keepScreenshots, function (val) { return val.value === 'forever'; }) : config.forSettings.keepScreenshots,
                    function (val) {
                        return { name: val.name, value: val.value, disabled: false };
                    }
                ),
                multiple: false,
                defaultValue: this.model.get('keepScreenshots')
            });
            $('[data-js-selector="interruptedJob"]', this.$el).html(interruptedJob.$el);
            $('[data-js-selector="keepLogs"]', this.$el).html(keepLogs.$el);
            $('[data-js-selector="keepScreenshots"]', this.$el).html(keepScreenshots.$el);
            this.listenTo(interruptedJob, 'change', this.selectProp);
            this.listenTo(keepLogs, 'change', this.selectProp);
            this.listenTo(keepScreenshots, 'change', this.selectProp);
            if (!config.userModel.hasPermissions()) {
                $('[data-js-selector] [data-js-dropdown]', this.$el).attr('disabled', 'disabled');
            }
            this.dropdownComponents.push(
                interruptedJob,
                keepLogs,
                keepScreenshots
            );
        },
        selectProp: function (value, event) {
            var val = value;
            var property = $(event.currentTarget).closest('[data-js-selector]').attr('data-js-selector');
            this.model.set(property, val);
        },

        clearFormErrors: function () {
            if ($('div.error-block', this.$el).is(':visible')) {
                $('.rp-form-group', this.$el).removeClass('has-error');
                $('div.error-block', this.$el).empty().hide();
            }
        },

        showFormErrors: function (el, message) {
            var cont = el.closest('.rp-form-group');
            cont.addClass('has-error');
            $('div.error-block', cont).empty().html(message).show();
        },

        hideFormsErrors: function (el) {
            var cont = el.closest('.rp-form-group');
            cont.removeClass('has-error');
            $('div.error-block', cont).empty().hide();
        },

        onChangeAABase: function (e) {
            this.model.set('analyzer_mode', e.target.value);
        },

        submitSettings: function () {
            var generalSettings = this.model.getProjectSettings();
            config.trackingDispatcher.trackEventNumber(385);
            this.clearFormErrors();
            if (!generalSettings.configuration.isAutoAnalyzerEnabled) {
                generalSettings.configuration.analyzer_mode = 'LAUNCH_NAME';
                $('[value="LAUNCH_NAME"]', this.$el).attr('checked', 'checked');
            }
            Service.updateProject(generalSettings)
                .done(function () {
                    var newConfig = appModel.get('configuration');
                    _.merge(newConfig, generalSettings.configuration);
                    appModel.set({ configuration: newConfig });
                    Util.ajaxSuccessMessenger('updateProjectSettings');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateProjectSettings');
                });
        },

        onDestroy: function () {
            _.each(this.dropdownComponents, function (item) {
                item.destroy();
            });
            $('body > #select2-drop-mask, body > .select2-sizer').remove();
        }
    });

    return GeneralTabView;
});
