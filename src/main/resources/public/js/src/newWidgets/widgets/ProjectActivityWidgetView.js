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
define(function (require, exports, module) {
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
            this.isReverse = !_.isUndefined(options.isReverse)
                ? options.isReverse : false; // for status page widget
            this.testItems = [];
        },
        tpl: 'tpl-widget-activity-stream',
        parseOnOff: function (val) {
            return val === 'false' ? Localization.ui.off : val === 'true' ? Localization.ui.on : val;
        },
        getBts: function (val) {
            var bts = val.split(':');
            return { type: bts[0], name: bts[1] };
        },
        getData: function () {
            var dates = [];
            var contentData = this.model.getContent();
            if (contentData.result) {
                _.each(this.isReverse ? contentData.result : contentData.result.reverse(), function (val) {
                    if (!(!Util.hasValidBtsSystem() && val.values.objectType === 'testItem' && val.values.actionType.indexOf('issue') > 0)) {
                        var isEmail = null;
                        var emailAction = null;
                        var values = {
                            id: val.id
                        };
                        if (val.values.actionType === 'update_project') {
                            values.history = {};
                            _.each(val.values, function (v, k) {
                                if (k.indexOf('Value') > 0) {
                                    if (k === 'emailEnabled$newValue') {
                                        isEmail = 'email';
                                        emailAction = v === 'false' ? 'off_email' : 'on_email';
                                    } else if (k === 'emailCases$newValue') {
                                        isEmail = 'email';
                                        emailAction = 'update_email';
                                    } else {
                                        var a = k.split('$');
                                        var name = a[0];
                                        var type = a[1];
                                        var obj = {};
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

                        var date = new Date(parseFloat(values.last_modified));
                        var dateWoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        var dateKey = '' + Date.parse(dateWoTime);

                        values.fullTime = Util.dateFormat(parseFloat(values.last_modified));
                        values.momentTime = Moment(values.fullTime).fromNow();
                        values.userRef = (values.userRef) ? values.userRef.split('_').join(' ') : '';

                        var contains = _.find(dates, function (item) {
                            return item.day === dateKey;
                        });
                        if (contains) {
                            contains.items.push(values);
                        } else {
                            var now = new Date();
                            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
                            var dayTitle = '';
                            var yesterday = new Date(today - 86400000).valueOf();
                            var dt = new Date(parseFloat(dateKey));
                            var months = Localization.ui.months;
                            var days = Localization.ui.days;
                            if (dateKey === today) {
                                dayTitle = Localization.ui.today;
                            } else if (dateKey === yesterday) {
                                dayTitle = Localization.ui.yesterday;
                            } else if (today - dateKey <= 604800000) {
                                dayTitle = days[dt.getDay()];
                            } else {
                                dayTitle = months[dt.getMonth()] + ' ' + dt.getDate();
                            }
                            var obj = {
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
                parseOnOff: this.parseOnOff,
                methodUpdateImagePath: Util.updateImagePath,
                imageRoot: urls.getAvatar,
                dates: dates
            };

            this.$el.html(Util.templates(this.tpl, params));
            Util.hoverFullTime(this.$el);
            !this.isPreview && Util.setupBaronScroll($('.project-activity-panel', this.$el));
            this.getItemsInfo(_.uniq(this.testItems));
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
                        $.each($('[id="itemId-' + ikey + '"]'), function () {
                            $(this).html(' ' + responce.name).wrap('<a class="rp-blue-link-undrl" target="_blank" href="#' + projectId + '/launches/all/' + path.join('/') + '?log.item=' + ikey + '"></a>');
                        });
                    })
                    .fail(function (error) {
                        // Util.ajaxFailMessenger(error, 'getItemsWidgetBugTable');
                        $('#itemId-' + ikey, self.$el).html(Localization.widgets.testItemNotFound);
                    });
            });
        },
        checkForIssues: function (type) {
            return type === 'post_issue' || type === 'attach_issue';
        }
    });

    return ProjectActivityWidget;
});
