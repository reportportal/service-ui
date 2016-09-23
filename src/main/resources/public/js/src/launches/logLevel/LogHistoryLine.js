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


    var LogHistoryLineCollection = Backbone.Collection.extend({
        model: LaunchSuiteStepItemModel,

        initialize: function(options) {
            this.launchId = options.launchId;
            this.listenTo(this, 'activate', this.activateItem);
        },
        activateItem: function(activeModel) {
            _.each(this.models, function(model) {
                model.set({active: false});
            })
            activeModel.set({active: true});
        },
        load: function(itemId) {
            var self = this;
            return Service.loadHistory(itemId)
                .done(function(data) {
                    self.reset(self.parse(data, itemId));
                })
        },
        parse: function(data, itemId) {
            var self = this;
            var answerData = _.map(data, function(item) {
                var answer = {launchNumber: item.launchNumber, active: false};
                if(item.launchId == self.launchId) {
                    _.each(item.resources, function(resource) {
                        if(resource.id == itemId) {
                            answer = _.extend(answer, self.updateDataForModel(resource));
                            answer.active = true;
                        }
                    })
                } else if(item.resources.length == 1){
                    answer = _.extend(answer, self.updateDataForModel(item.resources[0]));
                } else if(item.resources.length == 0) {
                    answer.status = 'NOT_FOUND';
                } else {
                    answer.status = 'MANY';
                }

                return answer;
            });
            return answerData.reverse();
        },
        updateDataForModel: function(data) {
            if(data.issue) {
                data.issue = JSON.stringify(data.issue);
            }
            if(data.tags) {
                data.tags = JSON.stringify(data.tags);
            }
            return data;
        }
    });

    var LogHistoryLineItemView = Epoxy.View.extend({
        template: 'tpl-launch-log-history-line-item',
        className: 'history-line-item',

        events: {
            'click': 'onClickItem',
        },
        bindings: {
            '[data-js-launch-number]': 'text: launchNumber',
            ':el': 'classes: {active: active}',
        },

        initialize: function() {
            this.render();
            this.$el.addClass('status-' + this.model.get('status'));
            this.defectTypeCollection = new SingletonDefectTypeCollection();
            this.updateIssue();
            this.listenTo(this.model, 'change:issue', this.updateIssue);
        },
        updateIssue: function() {
            var self = this;
            var issue = this.model.getIssue();
            if(issue.comment) {
                $('[data-js-comment]', this.$el).addClass('rp-display-inline-block');
            } else {
                $('[data-js-comment]', this.$el).removeClass('rp-display-inline-block')
            }
            if(issue.issue_type) {
                this.defectTypeCollection.ready.done(function() {
                    var defectTypeModel = self.defectTypeCollection.getDefectByLocator(issue.issue_type);
                    $('[data-js-issue-type]', self.$el).removeClass('hide').css({
                        backgroundColor: defectTypeModel.get('color'),
                        color: defectTypeModel.get('reverseColor'),
                        boxShadow: '0 0 1px ' + defectTypeModel.get('reverseColor'),
                    }).text(defectTypeModel.get('shortName'));
                })
            } else {
                $('[data-js-issue-type]', self.$el).addClass('hide')
            }
            if(issue.externalSystemIssues) {
                $('[data-js-ticket]', this.$el).addClass('rp-display-inline-block');
            } else {
                $('[data-js-ticket]', this.$el).removeClass('rp-display-inline-block')
            }
        },
        onClickItem: function() {
            if(!this.model.get('active') && this.model.get('status') != 'MANY' && this.model.get('status') != 'NOT_FOUND'){
                this.model.trigger('activate', this.model);
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, this.model.toJSON()));
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    var LogHistoryLineView = Epoxy.View.extend({
        template: 'tpl-launch-log-history-line',
        initialize: function(options) {
            this.collectionItems = options.collectionItems;
            this.launchModel = options.launchModel;
            this.renderedItems = [];
            this.collection = new LogHistoryLineCollection({launchId: this.launchModel.get('id')});
            this.listenTo(this.collection, 'reset', this.onResetHistoryItems);
            this.render();
            var self = this;
            this.collection.load(this.collectionItems.getInfoLog().item)
                .always(function() {
                    self.trigger('load:history');
                    var activeModels = self.collection.where({active: true});
                    if(activeModels.length == 1) {
                        self.trigger('activate:item', activeModels[0]);
                    }
                })
            this.listenTo(this.collection, 'activate', function(model) {
                self.trigger('activate:item', model);
            })
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onResetHistoryItems: function() {
            var $itemsContainer = $('[data-js-history-container]', this.$el);
            var self = this;
            _.each(this.collection.models, function(model) {
                var item = new LogHistoryLineItemView({model: model});
                $itemsContainer.append(item.$el);
                self.renderedItems.push(item);
            })
        },
        destroy: function () {
            while(this.renderedItems.length) {
                this.renderedItems.pop().destroy();
            }
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        },
    })

    return LogHistoryLineView;
});