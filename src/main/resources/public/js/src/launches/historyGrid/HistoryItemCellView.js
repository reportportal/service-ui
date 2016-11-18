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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SimpleTooltipView = require('tooltips/SimpleTooltipView');
    // var LaunchSuiteDefectsTooltipView = require('tooltips/LaunchSuiteDefectsTooltipView');
    var Textile = require('textile');
    var Localization = require('localization');

    var config = App.getInstance();


    var HistoryItemCellView = Epoxy.View.extend({
        template: 'tpl-launch-history-item-cell',
        issueTpl: 'tpl-launch-history-item-issue',
        statisticsTpl: 'tpl-launch-history-item-stats',
        className: function () {
            var cellWidth = this.getCellWidth(),
                statusCls = 'history-status-' + this.model.get('status');
            return 'col-md-' + cellWidth + ' history-col ' + statusCls;
        },
        bindings: {
            '[data-js-history-statistics]': 'getStatistics: statistics',
            '[data-js-history-issue]': 'getIssue: issue'
        },
        bindingHandlers: {
            getClass: {
                set: function ($el) {

                }
            },
            getStatistics: {
                set: function ($el, stats) {
                    var model = this.view.model,
                        issue = model.get('issue');
                    if (!issue) {
                        $el.html('');
                        var defects = stats.defects,
                            defectsByType = {};
                        _.each(defects, function (val, defect) {
                            if (val.total != 0) {
                                var sd = config.patterns.defectsLocator,
                                    defectType = _.findKey(val, function (v, k) {
                                        return sd.test(k);
                                    });
                                if (defectType) {
                                    var issueType = this.view.defectsCollection.getDefectType(defectType);
                                    if (issueType) {
                                        defectsByType[defect] = {
                                            shortName: issueType.shortName,
                                            fullName: issueType.longName,
                                            color: issueType.color || Util.getDefaultColor(defect),
                                            cls: Util.getDefectCls(defect)
                                        };
                                    }
                                }
                            }
                        }, this);
                        $el.append(Util.templates(this.view.statisticsTpl, {stats: defectsByType}))
                    }
                    return '';
                }
            },
            getIssue: {
                set: function ($el) {
                    var model = this.view.model,
                        issue = model.get('issue');
                    if (issue) {
                        $el.html('');
                        var objIssue = model.getIssue(),
                            issueType = this.view.defectsCollection.getDefectType(objIssue.issue_type),
                            data = {
                                tickets: _.map(objIssue.tickets, function(t){ return t.ticketId; }).join(', '),
                                comment: objIssue.comment ? Textile(objIssue.comment.setMaxLength(256)).escapeScript() : '',
                                issueType: issueType,
                                cls: Util.getDefectCls(issueType.typeRef.toLocaleLowerCase())
                            };
                        $el.append(Util.templates(this.view.issueTpl, {stats: data}));
                    }
                    return '';
                }
            }
        },
        initialize: function (options) {
            this.launchesSize = options.launchesSize;
            this.$container = options.container;
            this.defectsCollection = new SingletonDefectTypeCollection();
            this.defectsCollection.ready.done(function () {
                this.render();
            }.bind(this));
        },
        events: {
            'mouseenter [data-tooltip-type]': 'showTooltip'
        },
        render: function () {
            this.$container.append(this.$el.html(Util.templates(this.template, {
                cellWidth: this.getCellWidth()
            })));
        },
        getCellWidth: function () {
            return this.launchesSize > 5 ? 1 : this.launchesSize <= 3 ? this.launchesSize <= 2 ? 4 : 3 : 2;
        },
        showTooltip: function (e) {
            var el = $(e.currentTarget),
                type = el.data('tooltipType');
            if(!el.data('tooltip')){
                el.data('tooltip', 'tooltip');
                this.createTooltip(el, type);
            }
        },
        createTooltip: function (el, type) {
            if(type == 'warning' || type == 'comment' || type == 'tickets' || type == 'issue') {
                var $hoverElement = el;
                Util.appendTooltip(function() {
                    var tooltip = new SimpleTooltipView({message: el.data('tooltip-content')});
                    return tooltip.$el.html();
                }, $hoverElement, $hoverElement);
            }
            else {
                var $hoverElement = el,
                    self = this;
                // Util.appendTooltip(function() {
                //     var tooltip = new LaunchSuiteDefectsTooltipView({
                //         type: type,
                //         model: self.model
                //     });
                //     return tooltip.$el.html();
                // }, $hoverElement, $hoverElement);
            }
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return HistoryItemCellView;
});
