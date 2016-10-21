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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Components = require('core/components');
    var Service = require('coreService');
    var App = require('app');
    var modalDefectEditor = require('modals/modalDefectEditor');

    var config = App.getInstance();

    var EditDefectAction = Epoxy.View.extend({
        initialize: function(options) {
            var self = this;
            this.async = $.Deferred();
            var modal = new modalDefectEditor({
                items: options.items,
            });
            modal.show()
                .always(function() {
                    self.async.resolve();
                })
        },
        getAsync: function() {
            return this.async;
        },
    });

    return EditDefectAction;
});