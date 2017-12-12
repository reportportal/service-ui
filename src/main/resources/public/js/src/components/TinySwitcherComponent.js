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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');

    var TinySwitcherComponent = Epoxy.View.extend({
        className: 'tiny-switcher-component',
        template: 'tpl-tiny-switcher-component',
        events: {
            'click [data-js-tiny-switcher]': 'onClickTinySwitcher'
        },
        initialize: function (options) {
            // TODO: add support for vertical orientation & range functionality
            // options = {
            //     holder: $(''),
            //     isEnabledByDefault: true/false,
            //     label: '',
            //     labelPosition: 'l' || 'r',
            // };
            this.options = options;
            this.enabled = options.isEnabledByDefault;
            this.options.holder.html(this.$el);
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.options));
            !this.options.label && $('[data-js-tiny-switcher-label]', this.$el).addClass('hide');
            $('[data-js-checkbox]', this.$el).prop('checked', this.enabled);
            $('[data-js-tiny-switcher-label]', this.$el).addClass(
                (this.options.labelPosition && this.options.labelPosition === 'r') ? 'right' : 'left'
            );
        },
        onClickTinySwitcher: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.enabled = !this.enabled;
            $('[data-js-checkbox]', this.$el).prop('checked', this.enabled);
            this.trigger('changeState', this.enabled);
        },
        onDestroy: function () {
            this.$el.html('');
            delete this;
        }
    });

    return TinySwitcherComponent;
});
