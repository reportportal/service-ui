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
    var modalDefectEditor = require('modals/modalDefectEditor');


    var EditDefectAction = Epoxy.View.extend({
        initialize: function (options) {
            var self = this;
            var modal = new modalDefectEditor({
                items: options.items
            });
            this.async = $.Deferred();
            modal.show()
                .done(function (actionType) {
                    self.async.resolve(actionType);
                })
                .fail(function () {
                    self.async.resolve();
                });
        },
        getAsync: function () {
            return this.async;
        }
    });

    return EditDefectAction;
});
