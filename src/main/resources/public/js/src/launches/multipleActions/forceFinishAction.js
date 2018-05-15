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

    var _ = require('underscore');
    var Util = require('util');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var App = require('app');

    var config = App.getInstance();

    var ForceFinishAction = function (options) {
        var items = options.items;
        var confirmText = '';
        var modal;
        items.forEach(function (item) {
            var itemOwner = item.attributes.owner;
            var loginUser = config.userModel.attributes.name;
            if (itemOwner !== loginUser) {
                if (items.length > 1) {
                    confirmText = Util.replaceTemplate(Localization.launches.finishSelectedLaunch,
                        Localization.ui.launches);
                } else {
                    confirmText = Util.replaceTemplate(Localization.launches.finishOneLaunch,
                        Localization.ui.launch);
                }
            }
        });
        modal = new ModalConfirm({
            headerText: Localization.dialogHeader.forceFinish,
            bodyText: (items.length > 1) ?
                Util.replaceTemplate(Localization.launches.finishWarning,
                    Localization.ui.launches,
                    Localization.ui.selectedItems) :
                Util.replaceTemplate(Localization.launches.finishWarning,
                    Localization.ui.launch,
                    Localization.ui.launch),
            confirmText: confirmText,
            cancelButtonText: Localization.ui.cancel,
            okButtonText: Localization.ui.finish,
            confirmFunction: function () {
                var entities = {};
                var time = new Date().getTime();
                _.each(items, function (item) {
                    entities[item.get('id')] = {
                        end_time: time,
                        status: config.launchStatus.stopped
                    };
                });
                return CallService.call('PUT', Urls.getLaunchStop(), { entities: entities }).done(function () {
                    Util.ajaxSuccessMessenger('finishLaunch');
                    _.each(items, function (item) {
                        item.set({ status: config.launchStatus.stopped });
                    });
                }).fail(function (err) {
                    Util.ajaxFailMessenger(err, 'finishLaunch');
                });
            }
        });

        return modal.show();
    };


    return ForceFinishAction;
});
