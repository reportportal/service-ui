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
    var FilterSearchView = require('modals/addWidget/FilterSearchView');
    var WidgetSettingsView = require('modals/addWidget/WidgetSettingsView');
    var Localization = require('localization');


    var SaveWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-save-widget',
        template: 'tpl-modal-add-widget-save-widget',

        bindings: {
            '[data-js-name-input]': 'value: name',
            '[data-js-description]': 'value: widgetDescription',
            '[data-js-is-shared]': 'checked: isShared, disabled: offSharedSwitcher',
            '[data-js-shared-control]': 'classes: {disabled: offSharedSwitcher}, attr: {title: titleForSharedSwitcher}'
        },
        computeds: {
            offSharedSwitcher: {
                get: function(){
                    return this.isSharedDashboard();
                }
            },
            titleForSharedSwitcher: {
                get: function(){
                    return this.isSharedDashboard() ? Localization.wizard.widgetOnSharedDashboard : '';
                }
            }
        },
        initialize: function(options) {
            this.dashboardModel = options.dashboardModel;
            if(this.dashboardModel && this.dashboardModel.get('isShared')){
                this.model.set('isShared', true);
            }
            this.render();
            Util.hintValidator($('[data-js-name-input]', this.$el), [
                {validator: 'minMaxRequired', type: 'widgetName', min: 3, max: 128},
                {validator: 'noDuplications', type: 'widgetName', source: []}
            ]);
            Util.hintValidator($('[data-js-description]', this.$el), {
                validator: 'maxRequired',
                type: '',
                max: 256
            });
            this.listenTo(this.model, 'change:name', this.onChangeName);
        },
        isSharedDashboard: function(){
            return this.dashboardModel && this.dashboardModel.get('isShared');
        },
        onChangeName: function(){
            if(this.validate()){
                this.trigger('disable:navigation', false);
            }
            else {
                this.trigger('disable:navigation', true);
            }
        },
        validate: function() {
            return !$('[data-js-name-input]', this.$el).trigger('validate').data('validate-error');
        },
        activate: function() {

        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        }
    });

    return SaveWidgetView;
});