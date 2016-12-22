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
    var Localization = require('localization');

    var ChangeModeAction = function(options) {
        var items = options.items;
        var mode = items[0].get('mode') == 'DEBUG' ? 'DEFAULT' : 'DEBUG';
        var itemsText = (items.length > 1) ? Localization.ui.selectedLaunches : Localization.ui.launch;
        var modeText = (mode == 'DEBUG') ? Localization.ui.debug : Localization.ui.allLaunches;
        var modal = new ModalConfirm({
            headerText: (mode == 'DEBUG') ? Localization.dialogHeader.moveToDebug: Localization.dialogHeader.moveToAllLaunches,
            bodyText: Util.replaceTemplate(Localization.dialog.moveLaunch, itemsText, modeText),
            cancelButtonText: Localization.ui.cancel,
            okButtonText: Localization.ui.move,
            confirmFunction: function() {
                var entities = {};
                _.each(items, function(item) {
                    entities[item.get('id')] = {mode: mode};
                });
                return CallService.call('PUT', Urls.getLaunchUpdate(), {entities: entities}).done(function() {
                    Util.ajaxSuccessMessenger((mode == 'DEBUG') ? 'switchToDebug' : 'switchToAllLaunches');
                }).fail(function(err) {
                    Util.ajaxFailMessenger(err, (mode == 'DEBUG') ? 'switchToDebug' : 'switchToAllLaunches');
                })
            }
        });

        return modal.show();
    };


    return ChangeModeAction;
});