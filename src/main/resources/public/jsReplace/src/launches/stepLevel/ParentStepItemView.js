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
    var FilterModel = require('filters/FilterModel');

    var ParentStepItemView = Epoxy.View.extend({
        template: 'tpl-launch-step-parent',

        initialize: function (options) {
            this.context = options.context;
            this.render(options);
        },
        render: function (options) {
            var startUrl = '';
            var allFilterModel;
            if (options.launchId) {
                allFilterModel = new FilterModel({ id: 'all', context: this.context });
                startUrl = allFilterModel.get('url') + '/' + options.launchId;
                allFilterModel.destroy();
            }
            this.$el.html(Util.templates(this.template, {
                parentPath: options.parentPath,
                startUrl: startUrl
            }));
        },
        onDestroy: function () {
            this.$el.html('');
        }
    });

    return ParentStepItemView;
});
