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

    var UnlinkIssueAction = Epoxy.View.extend({

        initialize: function (options) {
            var items = options.items;
            var modal;

            modal = new ModalConfirm({
                headerText: Localization.dialogHeader.unlinkIssue,
                bodyText: Localization.dialog.msgUnlinkIssue,
                okButtonDanger: false,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.unlink,
                confirmFunction: function () {
                    var data = {
                        issues: []
                    };
                    _.each(items, function (item) {
                        var issue = item.getIssue();
                        issue.externalSystemIssues = [];
                        data.issues.push({
                            test_item_id: item.get('id'),
                            issue: issue
                        });
                    }, this);

                    return CoreService.updateDefect(data).done(function () {
                        Util.ajaxSuccessMessenger();
                    }).fail(function (err) {
                        Util.ajaxFailMessenger(err);
                    });
                }
            });

            this.async = modal.show();
        },
        getAsync: function () {
            return this.async;
        }
    });

    return UnlinkIssueAction;
});
