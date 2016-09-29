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

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');

    var LogItemLogsItem = Epoxy.View.extend({
        template: 'tpl-launch-log-item-logs-item',

        bindings: {
            '[data-js-message]': 'text: message',
            '[data-js-time]': 'text: timeString',
            '[data-js-image]': 'attr: {src: imagePath}, classes: {hide: not(binary_content)}',
            '[data-js-table-row]': 'levelClass: level'
        },

        bindingHandlers: {
            levelClass: {
                set: function($element, value) {
                    if(!value) { return; }
                    $element.addClass('level-' + value);
                }
            }
        },

        initialize: function() {
            this.render();
        },

        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        }
    });

    return LogItemLogsItem;
});