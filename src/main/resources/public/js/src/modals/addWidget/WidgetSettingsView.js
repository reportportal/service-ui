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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var SettingCriteriaView = require('modals/addWidget/widgetSettings/SettingCriteriaView');
    var SettingItemsView = require('modals/addWidget/widgetSettings/SettingItemsView');
    var SettingSwitchMode = require('modals/addWidget/widgetSettings/SettingSwitchMode');
    var SettingActionView = require('modals/addWidget/widgetSettings/SettingActionView');
    var SettingUsersView = require('modals/addWidget/widgetSettings/SettingUsersView');
    var SettingLaunchView = require('modals/addWidget/widgetSettings/SettingLaunchView');



    var WidgetCriteriaView = Epoxy.View.extend({
        className: 'modal-add-widget-criteria-list rp-form',
        events: {
        },
        bindings: {
        },
        initialize: function() {
            this.renderedView = [];

        },
        renderView: function(viewConstructor, data) {
            var view = new viewConstructor({model: this.model});
            if(!view.unActive) {
                this.renderedView.push(view);
                this.$el.append(view.$el);
                view.activate && view.activate();
            }

        },
        activate: function() {
            _.each(this.renderedView, function(view) {
                view.destroy();
            });
            this.renderedView = [];
            this.renderView(SettingCriteriaView);
            this.renderView(SettingActionView);
            this.renderView(SettingItemsView);
            this.renderView(SettingSwitchMode);
            this.renderView(SettingUsersView);
            this.renderView(SettingLaunchView);
        },
        validate: function() {
            var result = true;
            _.each(this.renderedView, function(view) {
                if(!view.validate()) {
                    result = false;
                }
            })
            return result;
        }

    });

    return WidgetCriteriaView;
});