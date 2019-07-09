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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Service = require('coreService');
    var Localization = require('localization');

    var LogItemInfoLastAction = Epoxy.View.extend({
        template: 'tpl-launch-log-item-info-latest-action',
        initialize: function (options) {
            this.render();
            this.itemModel = options.itemModel;
            this.onShow();
        },
        onShow: function () {
            this.listenTo(this.itemModel, 'change:issue', this.load);
            this.load();
        },
        load: function () {
            var self = this;
            Service.loadActivityItems(this.itemModel.get('id'))
                .done(function (data) {
                    self.parse(data);
                });
        },
        parse: function (data) {
            if (data.length !== 0) {
                $('[data-js-name]', this.$el).text(data[0].userRef);
                $('[data-js-action]', this.$el).text(this.actionName(data[0].actionType));
            }
        },
        actionName: function (actionType, history) {
            switch (actionType) {
            case 'update_item': {
                return _.size(history) > 1 ?
                        Localization.itemEvents.updateItemIssue :
                        Localization.itemEvents.updateItem;
            }
            case 'post_issue': return Localization.itemEvents.postIssue;
            case 'link_issue': return Localization.itemEvents.linkIssue;
            case 'unlink_issue': return Localization.itemEvents.unlinkIssue;
            case 'analyze_item': return Localization.itemEvents.changedByAnalyzer;
            case 'link_issue_aa': return Localization.itemEvents.issueLoadByAnalyzer;
            default: break;
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template), {});
        }
    });

    return LogItemInfoLastAction;
});
