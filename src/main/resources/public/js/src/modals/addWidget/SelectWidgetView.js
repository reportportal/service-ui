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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var _ = require('underscore');
    var WidgetService = require('newWidgets/WidgetService');
    var App = require('app');

    var config = App.getInstance();

    var SelectWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-select-widget',
        template: 'tpl-modal-add-widget-select-widget',
        events: {
            'change input[type="radio"]': 'onChangeType'
        },

        initialize: function () {
            this.render();
            if (this.model.get('gadget')) {
                $('[value="' + this.model.get('gadget') + '"]', this.$el).attr('selected', 'selected');
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                widgets: WidgetService.getAllWidgetsConfig()
            }));
        },
        onChangeType: function () {
            var gadget = $('input:checked', this.$el).val();
            var defaults = this.model.defaults;
            $('[data-js-select-widget-header]', this.$el).removeClass('error-state');
            config.trackingDispatcher.trackEventNumber(291);
            defaults.gadget = gadget;
            this.model.set(defaults);
        },
        validate: function () {
            if ($('input:checked', this.$el).length) {
                return true;
            }
            $('[data-js-select-widget-header]', this.$el).addClass('error-state');
            return false;
        },
        onDestroy: function () {
        }
    });

    return SelectWidgetView;
});
