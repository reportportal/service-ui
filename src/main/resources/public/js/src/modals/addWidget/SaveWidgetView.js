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


    var SaveWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-save-widget',
        template: 'tpl-modal-add-widget-save-widget',

        bindings: {
            '[data-js-name-input]': 'value: name',
            '[data-js-description]': 'value: widgetDescription',
            '[data-js-is-shared]': 'checked: isShared',
        },
        initialize: function() {
            this.render();
            Util.hintValidator($('[data-js-name-input]', this.$el), [
                {validator: 'minMaxRequired', type: 'widgetName', min: 3, max: 128},
                {validator: 'noDuplications', type: 'widgetName', source: []}
            ])
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