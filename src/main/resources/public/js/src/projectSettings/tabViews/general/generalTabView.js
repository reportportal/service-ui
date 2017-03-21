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
    "use strict";
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Service = require('coreService');

    var config = App.getInstance();

    var ProjectSettings = require('projectSettings/tabViews/general/generalSettingsModel');

    var GeneralTabView = Epoxy.View.extend({

        className: 'general-project-settings',

        tpl: 'tpl-project-settings-general',

        events: {
            'click #submit-settings': 'submitSettings',
            'click .dropdown-menu a': 'selectProp'
        },

        initialize: function () {
            this.model = new ProjectSettings(config.project.configuration);
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
                edit: config.project && config.project.projectId,
                currentProject: config.project.projectId,
                access: config.userModel.hasPermissions(),
                settings: config.forSettings
            });
            this.$el.html(Util.templates(this.tpl, params));
            return this;
        },

        selectProp: function (e) {
            e.preventDefault();
            var link = $(e.target),
                btn = link.closest('.open').find('.dropdown-toggle'),
                val = (link.data('value')) ? link.data('value') : link.text(),
                id = btn.attr('id');
            if (id === 'isAutoAnalyzerEnabled') {
                val = (val === 'ON');
            }
            this.model.set(id, val);
            $('.select-value', btn).text(link.text());
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

        submitSettings: function (e) {
            config.trackingDispatcher.trackEventNumber(385);
            var externalSystemData = this.model.getProjectSettings();
            this.clearFormErrors();
            Service.updateProject(externalSystemData)
                .done(function (response) {
                    _.merge(config.project.configuration, externalSystemData.configuration);
                    Util.ajaxSuccessMessenger('updateProjectSettings');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateProjectSettings');
                });
        },

        onDestroy: function () {
            $("body > #select2-drop-mask, body > .select2-sizer").remove();
        }
    });

    return GeneralTabView;
});
