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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var ModalConfirm = require('modals/modalConfirm');
    var CoreService = require('coreService');
    var Localization = require('localization');

    var IncludeAAAction = Epoxy.View.extend({

        initialize: function (options) {
            var items = options.items;
            var typeItems = (items.length > 1) ? Localization.ui.items : Localization.ui.item;
            var itemName;
            var modal;

            itemName = (items.length > 1) ? typeItems : typeItems + ' \'' + items[0].get('name').bold() + '\'';
            modal = new ModalConfirm({
                headerText: Util.replaceTemplate(Localization.dialogHeader.includeAA, typeItems),
                bodyText: Util.replaceTemplate(Localization.dialog.msgIncludeAA, itemName),
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.include,
                okButtonDanger: false,
                confirmFunction: function () {
                    var message;
                    var data = {
                        issues: []
                    };
                    _.each(items, function (item) {
                        var issue = item.getIssue();
                        issue.ignoreAnalyzer = false;
                        data.issues.push({
                            test_item_id: item.get('id'),
                            issue: issue
                        });
                    }, this);
                    message = (items.length > 1) ? 'includeItemsAA' : 'includeItemAA';
                    return CoreService.updateDefect(data).done(function () {
                        Util.ajaxSuccessMessenger(message);
                    }).fail(function (err) {
                        Util.ajaxFailMessenger(err, message);
                    });
                }
            });

            this.async = modal.show();
        },
        getAsync: function () {
            return this.async;
        }
    });

    return IncludeAAAction;
});
