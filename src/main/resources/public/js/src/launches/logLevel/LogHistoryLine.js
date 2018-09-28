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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Service = require('coreService');
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();

    var LogHistoryLineCollection = Backbone.Collection.extend({
        model: LaunchSuiteStepItemModel,

        initialize: function (options) {
            this.launchModel = options.launchModel;
            this.launchId = options.launchId;
            this.listenTo(this, 'activate', this.activateItem);
        },
        activateItem: function (activeModel) {
            _.each(this.models, function (model) {
                model.set({ active: false });
            });
            activeModel.set({ active: true });
        },
        load: function (itemId, historyId) {
            var self = this;
            return Service.loadHistory(itemId)
                .done(function (data) {
                    self.reset(self.parse(data, historyId));
                });
        },
        parse: function (data, itemId) {
            var self = this;
            var answerData = _.map(data, function (item, num) {
                var answer = { launchNumber: item.launchNumber, active: false, parent_launch_status: item.launchStatus };
                _.each(item.resources, function (resource) {
                    if (resource.id == itemId) {
                        answer.active = true;
                    }
                });
                if (item.launchId == self.launchModel.get('id') || (num == 0 && self.launchModel.get('failLoad'))) {
                    answer.parent_launch_investigate = self.launchModel.getToInvestigate();
                    if (!answer.active) {
                        answer = _.extend(answer, self.updateDataForModel(item.resources[0]));
                    } else {
                        _.each(item.resources, function (resource) {
                            if (resource.id == itemId) {
                                answer = _.extend(answer, self.updateDataForModel(resource));
                            }
                        });
                    }
                } else if (item.resources.length == 1) {
                    answer = _.extend(answer, self.updateDataForModel(item.resources[0]));
                } else if (item.resources.length == 0) {
                    answer.status = 'NOT_FOUND';
                } else {
                    answer.status = 'MANY';
                }

                return answer;
            });
            return answerData.reverse();
        },
        updateDataForModel: function (data) {
            if (data.issue) {
                data.issue = JSON.stringify(data.issue);
            }
            if (data.tags) {
                data.tags = JSON.stringify(data.tags);
            }
            return data;
        }
    });

    var LogHistoryLineItemView = Epoxy.View.extend({
        template: 'tpl-launch-log-history-line-item',
        className: 'history-line-item',

        events: {
            click: 'onClickItem'
        },
        bindings: {
            '[data-js-launch-number]': 'text: launchNumber',
            ':el': 'classes: {active: active}',
            '[data-js-tooltip-item]': 'attr: {title: statusTitle}',
            '[data-js-launch-link]': 'attr: {href: getUrl, class: getLinkClass}',
            '[data-js-info]': 'classes: {hide: not(hasInfo)}',
            '[data-js-growth-duration]': 'text: durationGrowth',
            //'[data-js-growth-block]': 'classes: {hide: not(durationGrowth)}, attr: {title: durationGrowth}'
        },

        computeds: {
            durationGrowth: {
                get: function () {
                    var currentDuration;
                    var prevDuration;
                    var growth;
                    if (this.validForDurationGrowth(this.model) && this.prevModel
                        && this.validForDurationGrowth(this.prevModel)) {
                        currentDuration = this.model.get('start_time') - this.model.get('end_time');
                        prevDuration = this.prevModel.get('start_time') - this.prevModel.get('end_time');
                        growth = (currentDuration / prevDuration) - 1;
                        if (growth > 0) {
                            return '+' + Math.round(growth * 100) + '%';
                        }
                        return '';
                    }
                    return '';
                }
            },
            hasInfo: {
                get: function () {
                    var issue = this.model.getIssue();
                    return issue.comment || (issue.externalSystemIssues && issue.externalSystemIssues.length);
                }
            },
            statusTitle: {
                deps: ['status'],
                get: function (status) {
                    var duration = '';
                    if (status !== 'MANY' && status !== 'NOT_FOUND' && status !== 'IN_PROGRESS') {
                        duration = '; ' + Util.timeFormat(this.model.get('start_time'), this.model.get('end_time'), true);
                    }
                    //return Localization.historyLine.tooltips[status] + duration;
                    return Localization.historyLine.tooltips[status];
                }
            },
            getLinkClass: {
                deps: ['id'],
                get: function (id) {
                    var className = '';
                    if (id && id !== this.currentItemId) {
                        className = 'active-link';
                    }
                    return className;
                }
            },
            getUrl: {
                deps: ['id', 'launchId', 'path_names'],
                get: function (id, launchId, pathNames) {
                    var link;
                    if (id && id !== this.currentItemId) {
                        link = '#' + this.model.appModel.get('projectId') + '/launches/all/';
                        link += this.model.get('launchId');
                        _.each(Object.keys(pathNames), function (key) {
                            link += '/' + key;
                        });
                        link += '?log.item=' + id;
                    }
                    return link;
                }
            }
        },
        isAction: function () {
            return this.model.get('status') !== 'MANY' && this.model.get('status') !== 'NOT_FOUND';
        },
        validForDurationGrowth: function (model) {
            var status = model.get('status');
            return status === 'FAILED' || status === 'PASSED';
        },
        initialize: function (options) {
            this.currentItemId = options.currentItemId;
            this.prevModel = options.prevModel;
            this.render();
            this.$el.addClass('status-' + this.model.get('status'));
            this.defectTypeCollection = new SingletonDefectTypeCollection();
            this.updateIssue();
            this.listenTo(this.model, 'change:issue', this.updateIssue);
            if (this.model.get('parent_launch_status') === 'IN_PROGRESS') {
                this.$el.addClass('launch-is-progress');
            }
        },
        updateIssue: function () {
            var self = this;
            var issue = this.model.getIssue();
            if (issue.issue_type) {
                this.defectTypeCollection.ready.done(function () {
                    var defectTypeModel = self.defectTypeCollection.getDefectByLocator(issue.issue_type);
                    $('[data-js-issue-type]', self.$el).removeClass('hide').css({
                        backgroundColor: defectTypeModel.get('color'),
                        color: defectTypeModel.get('reverseColor'),
                        boxShadow: '0 0 1px ' + defectTypeModel.get('reverseColor')
                    }).text(defectTypeModel.get('shortName'));
                });
            } else {
                $('[data-js-issue-type]', self.$el).addClass('hide');
            }
        },
        onClickItem: function () {
            if (!this.model.get('active') && this.isAction()) {
                config.trackingDispatcher.trackEventNumber(190);
                this.model.trigger('activate', this.model);
                this.model.trigger('hover:false');
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.model.toJSON()));
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    var LogHistoryLineView = Epoxy.View.extend({
        template: 'tpl-launch-log-history-line',

        initialize: function (options) {
            this.collectionItems = options.collectionItems;
            this.launchModel = options.launchModel;
            this.renderedItems = [];
            this.collection = new LogHistoryLineCollection({ launchModel: this.launchModel });
            this.listenTo(this.collection, 'reset', this.onResetHistoryItems);
            this.listenTo(this.collection, 'hover:true', this.onHoverItem);
            this.listenTo(this.collection, 'hover:false', this.onOutItem);
            this.render();
            var self = this;
            var itemId = this.collectionItems.getInfoLog().item;
            var itemModel = this.collectionItems.get(itemId);
            if (itemModel) {
                this.load = this.collection.load(itemId, this.collectionItems.getInfoLog().history || itemId)
                    .always(function () {
                        self.trigger('load:history');
                        var activeModels = self.collection.where({ active: true });
                        if (activeModels.length == 1) {
                            self.trigger('activate:item', activeModels[0], true);
                        }
                    });
            }

            this.listenTo(this.collection, 'activate', function (model) {
                self.trigger('activate:item', model);
            });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        getLastPassedOrFailedItem: function (idx) {
            var prevItems = this.collection.models.slice(0, idx).reverse();
            return _.find(prevItems, function (item) {
                return item.get('status') === 'PASSED' || item.get('status') === 'FAILED';
            });
        },
        onResetHistoryItems: function () {
            var itemId = this.collectionItems.getInfoLog().item;
            var $itemsContainer = $('[data-js-history-container]', this.$el);
            var self = this;
            _.each(this.collection.models, function (model, idx) {
                var prevModel = self.getLastPassedOrFailedItem(idx);
                var item = new LogHistoryLineItemView({
                    model: model,
                    currentItemId: itemId,
                    prevModel: prevModel
                });
                $itemsContainer.append(item.$el);
                self.renderedItems.push(item);
            });
        },
        destroy: function () {
            this.load && this.load.abort();
            while (this.renderedItems.length) {
                this.renderedItems.pop().destroy();
            }
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return LogHistoryLineView;
});
