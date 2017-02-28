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
    var App = require('app');

    var config = App.getInstance();

    var RemoveAction = function(options) {
        var items = options.items;
        var typeItems = (items.length > 1) ? Localization.ui.launches : Localization.ui.launch;
        var itemNumber;

        if(items[0].get('type') != 'LAUNCH') {
            typeItems = (items.length > 1) ? Localization.ui.items : Localization.ui.item;
            itemNumber = '';
        } else {
            itemNumber = ' #' + items[0].get('number').toString().bold();
        }

        var itemName = (items.length > 1) ? typeItems : typeItems + ' \'' + items[0].get('name').bold() + itemNumber + '\'';

        var modal = new ModalConfirm({
            headerText: Localization.ui.delete +' '+ typeItems,
            bodyText: Util.replaceTemplate(Localization.dialog.msgDeleteItems, typeItems, itemName),
            confirmText: Util.replaceTemplate(Localization.launches.deleteAgree, typeItems),
            cancelButtonText: Localization.ui.cancel,
            okButtonText: Localization.ui.delete,
            confirmFunction: function() {
                config.trackingDispatcher.trackEventNumber(79);
                var ids = _.map(items, function(item) {
                    return item.get('id');
                });
                var message = (items.length > 1)? 'deleteLaunches' : 'deleteLaunch';
                var path = Urls.getLaunchBase();
                if(items[0].get('type') != 'LAUNCH') {
                    path = Urls.itemBase();
                    message = (items.length > 1)? 'deleteTestItems' : 'deleteTestItem';
                }
                return CallService.call('DELETE', path + '?ids=' + ids.join(',')).done(function() {
                    Util.ajaxSuccessMessenger(message);
                }).fail(function(err) {
                    Util.ajaxFailMessenger(err, message);
                })
            }
        });
        modal.$el.on('click', function(e){
            var $target = $(e.target);
            if ($target.is('[data-js-close]') || $target.is('[data-js-close] i')) {
                config.trackingDispatcher.trackEventNumber(77);
            }
            if($target.is('[data-js-cancel]')){
                config.trackingDispatcher.trackEventNumber(78);
            }
        });

        return modal.show();
    };


    return RemoveAction;
});
