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
    var _ = require('underscore');
    var Util = require('util');
    var ModalConfirm = require('modals/modalConfirm');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var Localization = require('localization');
    var App = require('app');

    var config = App.getInstance();

    var RemoveAction = function (options) {
        var items = options.items;
        var typeItems = (items.length > 1) ? Localization.ui.launches : Localization.ui.launch;
        var itemNumber;
        var itemName;
        var modal;
        var confirmText = '';
        var safe = true;
        var quantity;

        if (items[0].get('type') !== 'LAUNCH') {
            typeItems = (items.length > 1) ? Localization.ui.items : Localization.ui.item;
            itemNumber = '';
        } else {
            itemNumber = ' #' + items[0].get('number').toString().bold();
        }
        items.forEach(function (item) {
            var itemType = item.attributes.type;
            var itemOwner = item.attributes.owner;
            var loginUser = config.userModel.attributes.name;
            var itemParentOwner = item.attributes.parent_launch_owner;
            if ((itemType === 'LAUNCH' && itemOwner !== loginUser) ) {
                confirmText = Util.replaceTemplate(Localization.launches.deleteWarningAgree,
                    typeItems);
                safe = false;
            } else if (itemParentOwner && itemParentOwner !== loginUser){
                confirmText = Util.replaceTemplate(Localization.launches.deleteItemsWarningAgree,
                    typeItems);
                safe = false;
            }
        });
        itemName = (items.length > 1) ? typeItems : typeItems + ' \'' + items[0].get('name').bold() + itemNumber + '\'';
        quantity = (items.length > 1) ? Localization.ui.they : Localization.ui.it;
        modal = new ModalConfirm({
            headerText: Localization.ui.delete + ' ' + typeItems,
            bodyText: Util.replaceTemplate(Localization.dialog.msgDeleteItems, itemName, quantity),
            confirmText: confirmText,
            cancelButtonText: Localization.ui.cancel,
            okButtonText: Localization.ui.delete,
            confirmFunction: function () {
                var type = items[0].get('type');
                var ids;
                var message;
                var path;
                if (type) {
                    config.trackingDispatcher.trackEventNumber(79);
                } else if (type !== 'SUITE' || type !== 'TEST') {
                    config.trackingDispatcher.trackEventNumber(182);
                }
                ids = _.map(items, function (item) {
                    return item.get('id');
                });
                message = (items.length > 1) ? 'deleteLaunches' : 'deleteLaunch';
                path = Urls.getLaunchBase();
                if (type !== 'LAUNCH') {
                    path = Urls.itemBase();
                    message = (items.length > 1) ? 'deleteTestItems' : 'deleteTestItem';
                }
                return CallService.call('DELETE', path + '?ids=' + ids.join(',')).done(function () {
                    Util.ajaxSuccessMessenger(message);
                }).fail(function (err) {
                    Util.ajaxFailMessenger(err, message);
                });
            },
            safeRemoval: safe
        });
        modal.$el.on('click', function (e) {
            var $target = $(e.target);
            var type = items[0].get('type');
            var isCancel = $target.is('[data-js-cancel]');
            var isClose = ($target.is('[data-js-close]') || $target.is('[data-js-close] i'));
            if (type === 'LAUNCH') {
                if (isClose) {
                    config.trackingDispatcher.trackEventNumber(77);
                }
                if (isCancel) {
                    config.trackingDispatcher.trackEventNumber(78);
                }
            } else if (type !== 'SUITE' || type !== 'TEST') {
                if (isClose) {
                    config.trackingDispatcher.trackEventNumber(180);
                }
                if (isCancel) {
                    config.trackingDispatcher.trackEventNumber(181);
                }
            }
        });

        return modal.show();
    };


    return RemoveAction;
});
