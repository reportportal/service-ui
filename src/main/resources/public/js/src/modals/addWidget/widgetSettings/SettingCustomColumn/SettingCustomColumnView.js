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

    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');


    var SettingCustomColumnView = Epoxy.View.extend({
        className: 'modal-add-widget-setting-custom-column',
        template: 'tpl-modal-add-widget-setting-custom-column',
        bindings: {
            '[data-js-name-input]': 'value:name',
            '[data-js-value-input]': 'value:value'
        },
        events: {
            'click [data-js-remove]': 'onClickRemove'
        },
        initialize: function (options) {
            this.render();
            $('[data-js-number]', this.$el).text(options.number);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function () {
            this.model.collection.remove(this.model);
        },
        onDestroy: function () {
            this.$el.remove();
        }
    });

    return SettingCustomColumnView;
});
