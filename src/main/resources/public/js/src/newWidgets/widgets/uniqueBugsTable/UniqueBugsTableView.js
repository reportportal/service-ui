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
    var urls = require('dataUrlResolver');
    var coreService = require('coreService');
    var Moment = require('moment');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');

    var UniqueBugTable = BaseWidgetView.extend({
        tpl: 'tpl-widget-bug-table',
        tplList: 'tpl-widget-bug-table-list',
        tplItem: 'tpl-widget-bug-table-item',
        ADD_ITEMS_COUNT: 80,
        getData: function () {
            var items = [];
            _.each(this.model.getContent(), function (val, key) {
                var item = { bugId: key, items: [] };
                var time = 0;
                var name = '';
                _.each(val, function (i) {
                    var t = parseInt(i.startTime, 10);
                    var k = {
                        testItemId: i.id,
                        launchId: i.values.launchRef
                    };
                    item.items.push(k);
                    if (time === 0 || time > t) {
                        time = t;
                        name = i.name;
                    }
                });
                item.name = name;
                item.time = time;
                items.push(item);
            });
            items.sort(function (a, b) {
                return b.time - a.time;
            });
            return items;
        },
        render: function () {
            var params = {
                items: [],
                imageRoot: urls.getAvatar,
                dateFormat: Util.dateFormat,
                moment: Moment
            };
            var self = this;
            var scrollEl;
            if (!this.isEmptyData(this.getData())) {
                this.items = this.getData();
                params.items = this.items;
                this.$el.html(Util.templates(this.tpl, params));
                this.listContainer = $('[data-js-bugs-list]', this.$el);

                this.currentBugIndex = 0;
                this.currentBugItemIndex = 0;
                this.addPackItems();
                if (!this.isPreview) {
                    scrollEl = Util.setupBaronScroll($('.uniq-bugs-table', this.$el));
                    scrollEl.scroll(function () {
                        var elem = scrollEl.get(0);
                        if (elem.scrollHeight - elem.scrollTop < elem.offsetHeight * 2) {
                            self.addPackItems();
                        }
                    });
                }
            } else {
                this.addNoAvailableBock();
            }
        },
        addPackItems: function () {
            var currentItemCount = 0;
            var addedPack = [];
            while (currentItemCount < this.ADD_ITEMS_COUNT) {
                if (this.currentBugItemIndex === 0) {
                    if (!this.addBugList()) break;
                }
                if (this.currentBugItemIndex < this.currentBug.items.length) {
                    this.lastBugContainer.append(
                        Util.templates(
                            this.tplItem,
                            this.currentBug.items[this.currentBugItemIndex]
                        )
                    );
                    addedPack.push(this.currentBug.items[this.currentBugItemIndex]);
                    this.currentBugItemIndex += 1;
                } else {
                    this.currentBugItemIndex = 0;
                }
                currentItemCount += 1;
            }
            this.getItemsInfo(addedPack);
        },
        addBugList: function () {
            var params;
            var $listElement;
            if (this.currentBugIndex >= this.items.length) return false;
            this.currentBug = this.items[this.currentBugIndex];
            params = {
                item: this.currentBug,
                dateFormat: Util.dateFormat,
                imageRoot: urls.getAvatar,
                methodUpdateImagePath: Util.updateImagePath,
                moment: Moment
            };
            $listElement = $.parseHTML(Util.templates(this.tplList, params));
            Util.hoverFullTime($listElement);
            this.listContainer.append($listElement);
            this.lastBugContainer = $('[data-js-bugs-item]:last', this.listContainer);
            this.currentBugIndex += 1;
            return true;
        },
        renderTags: function (tags) {
            if (!_.isEmpty(tags)) {
                return '<span class="text-muted"><i class="material-icons">local_offer</i> ' + tags.join(', ') + '</span>';
            }
            return '';
        },
        renderItemName: function (name, path, id) {
            var url = this.getItemUrl(path, id);
            return '<a class="rp-blue-link-undrl" target="_blank" title="' + name + '" href="' + url + '">' + name + '</a><br />';
        },
        getItemUrl: function (path, id) {
            var projectId = this.appModel.get('projectId');
            return '#' + projectId + '/launches/all/' + path.join('/') + '?log.item=' + id;
        },
        getItemsInfo: function (items) {
            var self = this;
            var itemsIds;
            if (items.length) {
                itemsIds = _.uniq(_.map(items, function (item) { return item.testItemId; }));
                coreService.getTestItemsInfo(itemsIds)
                    .done(function (response) {
                        _.each(itemsIds, function (id) {
                            var item = _.find(response, function (d) { return d.id === id; });
                            if (item) {
                                self.calculateItemInfo(item, id);
                            } else {
                                $('[data-item-id="' + id + '"]', self.$el).empty().hide();
                            }
                        });
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'getItemsWidgetBugTable');
                        _.each(itemsIds, function (id) {
                            $('[data-item-id="' + id + '"]', self.$el).empty().hide();
                        });
                    });
            }
        },
        calculateItemInfo: function (itemData, id) {
            var path = [itemData.launchId].concat(_.keys(itemData.path_names));
            var issues = itemData.issue.externalSystemIssues;
            var tags = itemData.tags ? this.renderTags(itemData.tags) : '';
            var name = this.renderItemName(itemData.name, path, id);
            var self = this;
            $('[data-item-id="' + id + '"]', self.$el).empty().prepend(name, tags);
            _.forEach(issues, function (issue) {
                var link = $('#bugId-' + issue.ticketId, self.$el);
                if (issue.url && !link.parent().is('a.rp-blue-link-undrl')) {
                    link.wrap('<a class="rp-blue-link-undrl" target="_blank" href="' + issue.url + '"></a>');
                }
            });
        }
    });

    return UniqueBugTable;
});
