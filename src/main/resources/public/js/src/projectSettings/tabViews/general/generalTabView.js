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
    var Localization = require('localization');

    var config = App.getInstance();

    var ProjectSettings = require('projectSettings/tabViews/general/generalSettingsModel');

    var GeneralTabView = Epoxy.View.extend({

        className: 'general-project-settings',

        tpl: 'tpl-project-settings-general',

        events: {
            'click #submit-settings': 'submitSettings'
        },

        initialize: function () {
            this.model = new ProjectSettings(config.project.configuration);
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
            this.listenTo(this.model, 'change:isAutoAnalyzerEnabled', function () {
                config.trackingDispatcher.trackEventNumber(384);
            });
            this.render();
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
            var interruptedJob = new DropDownComponent({
                data: _.map(config.forSettings.interruptedJob, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.model.get('interruptedJob')
            });
            var keepLogs = new DropDownComponent({
                data: _.map(config.forSettings.keepLogs, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.model.get('keepLogs')
            });
            var keepScreenshots = new DropDownComponent({
                data: _.map(config.forSettings.keepScreenshots, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.model.get('keepScreenshots')
            });
            var isAutoAnalyzerEnabled = new DropDownComponent({
                data: [
                    { name: Localization.ui.on, value: 'ON' },
                    { name: Localization.ui.off, value: 'OFF' }
                ],
                multiple: false,
                defaultValue: (this.model.get('isAutoAnalyzerEnabled') ? 'ON' : 'OFF')
            });
            $('[data-js-selector="interruptedJob"]', this.$el).html(interruptedJob.$el);
            $('[data-js-selector="keepLogs"]', this.$el).html(keepLogs.$el);
            $('[data-js-selector="keepScreenshots"]', this.$el).html(keepScreenshots.$el);
            $('[data-js-selector="isAutoAnalyzerEnabled"]', this.$el).html(isAutoAnalyzerEnabled.$el);
            this.listenTo(interruptedJob, 'change', this.selectProp);
            this.listenTo(keepLogs, 'change', this.selectProp);
            this.listenTo(keepScreenshots, 'change', this.selectProp);
            this.listenTo(isAutoAnalyzerEnabled, 'change', this.selectProp);
            if (!config.userModel.hasPermissions()) {
                $('[data-js-selector] [data-js-dropdown]', this.$el).attr('disabled', 'disabled');
            }
            this.dropdownComponents.push(
                interruptedJob,
                keepLogs,
                keepScreenshots,
                isAutoAnalyzerEnabled
            );
        },
        selectProp: function (value, event) {
            var val = value;
            var property = $(event.currentTarget).closest('[data-js-selector]').attr('data-js-selector');
            if (property === 'isAutoAnalyzerEnabled') {
                val = (val === 'ON');
            }
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

        submitSettings: function () {
            var externalSystemData = this.model.getProjectSettings();
            config.trackingDispatcher.trackEventNumber(385);
            this.clearFormErrors();
            Service.updateProject(externalSystemData)
                .done(function () {
                    _.merge(config.project.configuration, externalSystemData.configuration);
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
