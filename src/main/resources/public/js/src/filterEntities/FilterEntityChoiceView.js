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
    var _ = require('underscore');
    var Util = require('util');
    var Epoxy = require('backbone-epoxy');


    var FilterEntityChoiceView = Epoxy.View.extend({
        template: 'tpl-filter-entity-choice',
        tagName: 'li',

        bindings: {
            '[data-js-name]': 'text: getLabel',
            '[data-js-link]': 'classes: {"sub-option": subEntity}',
            ':el': 'classes: {hide: required}',
            '[data-js-check-visible]': 'checked: visible',
        },

        initialize: function () {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },

    });

    return FilterEntityChoiceView;
});
