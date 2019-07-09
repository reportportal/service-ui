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
    var _ = require('underscore');

    var RetriesLabelView = Epoxy.View.extend({
        template: 'tpl-retries-label',
        className: 'retries-label-view',
        tagName: 'span',
        events: {
            'click [data-js-retries-link]': 'onClickLink'
        },
        bindings: {
        },
        initialize: function (options) {
            this.context = options.context;
            if (this.model.get('retries') && this.model.get('retries').length) {
                this.render();
            }
        },
        render: function () {
            var retries = _.clone(this.model.get('retries'));
            retries.push(this.model.attributes);
            this.$el.html(Util.templates(this.template, {
                retries: retries,
                isLogLevel: this.context === 'logLevel'
            }));
        },
        onClickLink: function () {
            (this.context !== 'logLevel') && this.trigger('activate:retries');
        },
        onDestroy: function () {
            this.$el.empty();
            delete this;
        }
    });

    return RetriesLabelView;
});
