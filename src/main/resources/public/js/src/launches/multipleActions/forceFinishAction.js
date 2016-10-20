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
    var Localization = require('localization');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');

    var ForceFinishAction = function(options) {
        var items = options.items;
        var modal = new ModalConfirm({
            headerText: Localization.dialogHeader.forceFinish,
            bodyText: Localization.launches.finishItemsWarning,
            confirmText: Localization.launches.finishItemsAgree,
            cancelButtonText: Localization.ui.cancel,
            okButtonText: Localization.ui.finish,
            confirmFunction: function() {
                // var entities = {};
                // _.each(items, function(item) {
                //     entities[item.get('id')] = {mode: 'DEBUG'};
                // });
                // return CallService.call('PUT', Urls.getLaunchStop(), {entities: entities}).done(function() {
                //     Util.ajaxSuccessMessenger('switchToDebug');
                // }).fail(function(err) {
                //     Util.ajaxFailMessenger(err, 'switchToDebug');
                // })
            }
        });

        return modal.show();
    };


    return ForceFinishAction;
});