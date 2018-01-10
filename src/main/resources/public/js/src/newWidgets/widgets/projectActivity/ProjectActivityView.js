/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var Moment = require('moment');
    var urls = require('dataUrlResolver');
    var Localization = require('localization');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');
    var coreService = require('coreService');

    var ProjectActivityWidget = BaseWidgetView.extend({
        initialize: function (options) {
            BaseWidgetView.prototype.initialize.call(this, options);
            this.testItems = [];
        },
        tpl: 'tpl-widget-activity-stream',
        replaceValues: function (val) {
            switch (val) {
            case 'false':
                return Localization.ui.off;
            case 'true':
                return Localization.ui.on;
            case 'STEP_BASED':
                return Localization.project.strategyRegular;
            case 'TEST_BASED':
                return Localization.project.strategyBdd;
            default:
                return val;
            }
        },
        getBts: function (val) {
            var bts = val.split(':');
            return { type: bts[0], name: bts[1] && bts[1] !== 'null' ? bts[1] : null };
        },
        getData: function () {
            var dates = [];
            var contentData = this.model.getContent();
            if (contentData.result) {
                _.each(contentData.result,
                    function (val) {
                        var date;
                        var dateWoTime;
                        var dateKey;
                        var isEmail = null;
                        var emailAction = null;
                        var values;
                        var contains;
                        var now;
                        var today;
                        var dayTitle;
                        var yesterday;
                        var dt;
                        var months;
                        var days;
                        var obj;
                        if (!(!Util.hasValidBtsSystem() && val.values.objectType === 'testItem' && val.values.actionType.indexOf('issue') > 0)) {
                            values = {
                                id: val.id
                            };
                            if (val.values.actionType === 'update_project') {
                                values.history = {};
                                _.each(val.values, function (v, k) {
                                    var a = k.split('$');
                                    var name = a[0];
                                    var type = a[1];
                                    obj = {};
                                    if (k.indexOf('Value') > 0) {
                                        if (k === 'emailEnabled$newValue') {
                                            isEmail = 'email';
                                            emailAction = v === 'false' ? 'off_email' : 'on_email';
                                        } else if (k === 'emailCases$newValue') {
                                            isEmail = 'email';
                                            emailAction = 'update_email';
                                        } else {
                                            a = k.split('$');
                                            name = a[0];
                                            type = a[1];
                                            obj = {};
                                            obj[type] = v;
                                            if (values.history[name]) {
                                                _.extend(values.history[name], obj);
                                            } else {
                                                values.history[name] = obj;
                                            }
                                        }
                                    }
                                    values[k] = v;
                                }, this);
                            } else {
                                _.extend(values, val.values);
                            }

                            if (isEmail) {
                                values.objectType = isEmail;
                                values.actionType = emailAction;
                            }

                            if (this.checkForIssues(values.actionType)) {
                                this.testItems.push(values.loggedObjectRef);
                            }

                            date = new Date(parseFloat(values.last_modified));
                            dateWoTime = new Date(date.getFullYear(),
                                date.getMonth(),
                                date.getDate());
                            dateKey = '' + Date.parse(dateWoTime);

                            values.fullTime = Util.dateFormat(parseFloat(values.last_modified));
                            values.momentTime = Moment(values.fullTime).fromNow();
                            values.userRef = (values.userRef) ? values.userRef.split('_').join(' ') : '';

                            contains = _.find(dates, function (item) {
                                return item.day === dateKey;
                            });
                            if (contains) {
                                contains.items.push(values);
                            } else {
                                now = new Date();
                                today = new Date(now.getFullYear(),
                                    now.getMonth(),
                                    now.getDate()).valueOf();
                                dayTitle = '';
                                yesterday = new Date(today - 86400000).valueOf();
                                dt = new Date(parseFloat(dateKey));
                                months = Localization.ui.months;
                                days = Localization.ui.days;
                                if (dateKey === today) {
                                    dayTitle = Localization.ui.today;
                                } else if (dateKey === yesterday) {
                                    dayTitle = Localization.ui.yesterday;
                                } else if (today - dateKey <= 604800000) {
                                    dayTitle = days[dt.getDay()];
                                } else {
                                    dayTitle = months[dt.getMonth()] + ' ' + dt.getDate();
                                }
                                obj = {
                                    day: dateKey,
                                    dayTitle: dayTitle,
                                    items: [values]
                                };
                                dates.push(obj);
                            }
                        }
                    }, this);
            }
            return dates;
        },
        render: function () {
            var dates = this.getData();
            var params = {
                properties: {
                    projectUrl: this.appModel.get('projectId')
                },
                getBts: this.getBts,
                getTicketUrlId: Util.getTicketUrlId,
                getTickets: this.getTickets,
                replaceValues: this.replaceValues,
                methodUpdateImagePath: Util.updateImagePath,
                imageRoot: urls.getAvatar,
                dates: dates
            };
            if (!this.isEmptyData(this.getData())) {
                this.$el.html(Util.templates(this.tpl, params));
                Util.hoverFullTime(this.$el);
                !this.isPreview && Util.setupBaronScroll($('.project-activity-panel', this.$el));
                this.getItemsInfo(_.uniq(this.testItems));
            } else {
                this.addNoAvailableBock();
            }
        },
        getTickets: function (item) {
            var newTickets = item.ticketId$newValue ? item.ticketId$newValue.split(',') : [];
            var oldTickets = item.ticketId$oldValue ? item.ticketId$oldValue.split(',') : [];
            return _.difference(newTickets, oldTickets);
        },
        getItemsInfo: function (items) {
            var self = this;
            var projectId = this.appModel.get('projectId');
            _.each(items, function (ikey) {
                coreService.getTestItemInfo(ikey)
                    .done(function (responce) {
                        var path = [responce.launchId].concat(_.keys(responce.path_names));
                        $.each($('[data-js-item-id="' + ikey + '"]'), function () {
                            $(this).html(' ' + responce.name).wrap('<a class="rp-blue-link-undrl" target="_blank" href="#' + projectId + '/launches/all/' + path.join('/') + '?log.item=' + ikey + '"></a>');
                        });
                    })
                    .fail(function () {
                        // Util.ajaxFailMessenger(error, 'getItemsWidgetBugTable');
                        $('[data-js-item-id="' + ikey + '"]', self.$el).html(Localization.widgets.testItemNotFound);
                    });
            });
        },
        checkForIssues: function (type) {
            return type === 'post_issue' || type === 'attach_issue';
        }
    });

    return ProjectActivityWidget;
});
