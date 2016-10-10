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
    var ModalConfirm = require('modals/modalConfirm');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');

    var MoveToDebugAction = function(options) {
        var items = options.items;
        var modal = new ModalConfirm({
            headerText: 'Move to debug',
            bodyText: 'Are you sure you want to move selected launches to Debug?',
            cancelButtonText: 'Cancel',
            okButtonText: 'Move',
            confirmFunction: function() {
                var entities = {};
                _.each(items, function(item) {
                    entities[item.get('id')] = {mode: 'DEBUG'};
                });
                return CallService.call('PUT', Urls.getLaunchUpdate(), {entities: entities}).done(function() {
                    Util.ajaxSuccessMessenger('switchToDebug');
                }).fail(function(err) {
                    Util.ajaxFailMessenger(err, 'switchToDebug');
                })
            }
        });

        return modal.show();
    };


    return MoveToDebugAction;
});