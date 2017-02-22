/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Localization = require('localization');

    var SelectDashboardItemView = Epoxy.View.extend({
        className: 'shared-widget-item',
        template: 'tpl-modal-add-shared-widget-item',
        bindings: {
            '[data-js-widget-select]': 'checked: active, disabled: added',
            ':el': 'classes: {"widget-already-added": added}, attr: {title: getAddedTitle}',
            '[data-js-widget-name]': 'text: name',
            '[data-js-gadget-name]': 'text: gadgetName',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-description]': 'text: description'
        },
        computeds: {
            getAddedTitle: {
                deps: ['added'],
                get: function(added){
                    return added ? Localization.wizard.sharedWidgetAdded : '';
                }
            }
        },

        initialize: function(options) {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        }
    });

    return SelectDashboardItemView;
});
