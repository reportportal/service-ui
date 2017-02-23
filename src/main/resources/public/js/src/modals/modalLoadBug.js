/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');

    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var Service = require('coreService');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var TicketModel = Epoxy.Model.extend({
        defaults: {
            url: '',
            ticketId: '',
        }
    });
    var TicketCollection = Backbone.Collection.extend({
        model: TicketModel,
    });
    var TicketView = Epoxy.View.extend({
       template: 'tpl-model-load-bug-item',
        className: 'ticket-row-view',
        events: {
            'click [data-js-remove-row]': 'onClickRemove',
            'blur [data-js-link-input]': 'onBlurLinkInput',
        },
        bindings: {
            '[data-js-link-input]': 'value: url',
            '[data-js-issue-input]': 'value: ticketId',
        },

        initialize: function() {
            var externalSystems = appModel.getArr('externalSystem');
            this.externalSystemType = '';
            if(externalSystems[0] && externalSystems[0].systemType) {
                this.externalSystemType = externalSystems[0].systemType;
            }
            this.render();
            this.listenTo(this.model.collection, 'add remove', this.onChangeCollection);
            this.onChangeCollection();
            Util.hintValidator($('[data-js-issue-input]', this.$el), {
                validator: 'minMaxRequired',
                type: 'issueId',
                min: 1,
                max: 128
            });
            Util.hintValidator($('[data-js-link-input]', this.$el), [{
                validator: 'matchRegex',
                type: 'issueLinkRegex',
                pattern: config.patterns.urlT,
                arg: 'i'
            }]);
        },
        onBlurLinkInput: function() {
            var $link = $('[data-js-link-input]', this.$el);
            var $issue = $('[data-js-issue-input]', this.$el);
            if ($link.parent().hasClass('validate-error') || $.trim($issue.val())) return;
            var autoValue = '';
            if (this.externalSystemType == 'JIRA') {
                autoValue = $link.val().split('/');
                autoValue = autoValue[autoValue.length - 1];
            }
            if (this.externalSystemType == 'TFS') {
                autoValue = $link.val().split('id=')[1];
                autoValue = autoValue ? autoValue.split('&')[0] : '';
            }
            this.model.set({ticketId: autoValue});
            $issue.trigger('validate');
        },
        onChangeCollection: function() {
            if(this.model.collection.models.length <= 1) {
                $('[data-js-remove-row]', this.$el).addClass('hide');
            } else {
                $('[data-js-remove-row]', this.$el).removeClass('hide');
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function() {
            this.model.collection.remove(this.model);
            this.destroy();
        },
        destroy: function() {
            this.$el.remove();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    var ModalLoadBug = ModalView.extend({
        template: 'tpl-modal-load-bug',
        className: 'modal-load-bug',

        events: {
            'click [data-bts-select-item]': 'onClickBts',
            'click [data-js-add-ticket]': 'onClickAddTicket',
            'click [data-js-load]': 'onClickLoad',
        },

        initialize: function(option) {
            this.externalSystems = appModel.getArr('externalSystem');
            if(!this.externalSystems.length) {
                console.log('No bts found');
                this.hide();
                return;
            }
            this.itemModels = option.items;
            this.testItemsIds = _.map(this.itemModels, function(model) {
                return model.get('id');
            });
            this.render();
            this.selectBts(this.externalSystems[0].id);
            this.collection = new TicketCollection();
            this.listenTo(this.collection, 'add', this.onAddTicket);
            this.collection.add({});
        },
        onKeySuccess: function () {
            $('[data-js-load]', this.$el).trigger('click');
        },
        onClickAddTicket: function() {
            this.collection.add({});
        },
        onClickLoad: function() {
            var self = this;
            $('.form-control', this.$el).trigger('validate');
            if (!$('.validate-error', this.$el).length) {
                var issues = _.map(this.collection.models, function(model) {
                    return {
                        ticketId: model.get('ticketId'),
                        url: model.get('url'),
                    }
                });
                var data = {
                    systemId: this.currentBts.id,
                    issues: issues,
                    testItemIds: this.testItemsIds,
                };
                Service.loadBugs(data)
                    .done(function (response) {
                        Util.ajaxSuccessMessenger("submitKeys");
                        // config.trackingDispatcher.jiraTicketLoad(data.issues.length);
                        _.each(self.itemModels, function(model) {
                            self.addIssuesToItem(model, data.issues);
                        })
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "submitKeys");
                    })
                    .always(function () {
                        self.successClose();
                    });
            }
        },
        addIssuesToItem: function(itemModel, issues) {
            var self = this;
            var curIssue = itemModel.getIssue();
            if(!curIssue.externalSystemIssues) {
                curIssue.externalSystemIssues = [];
            }
            var newIds = _.map(issues, function(issue) {
                return issue.ticketId;
            });
            var newExternalSystemIssues = [];  // remove not unic item
            _.each(curIssue.externalSystemIssues, function(externalItem) {
                if(!_.contains(newIds, externalItem.ticketId)){
                    newExternalSystemIssues.push(externalItem);
                }
            });
            _.each(issues, function(issue) {
                newExternalSystemIssues.push({
                    systemId: self.currentBts.id,
                    ticketId: issue.ticketId,
                    url: issue.url,
                })
            })
            curIssue.externalSystemIssues = newExternalSystemIssues;
            itemModel.setIssue(curIssue);
        },
        onAddTicket: function(model) {
            $('[data-js-load-items-container]', this.$el).append((new TicketView({model: model})).$el);
        },
        onClickBts: function(e) {
            e.preventDefault();
            this.selectBts($(e.currentTarget).data('bts-select-item'));
        },
        selectBts: function(id) {
            var currentBts = null;
            _.each(this.externalSystems, function(externalSystem) {
                if(externalSystem.id == id) {
                    currentBts = externalSystem;
                    return false;
                }
            });
            if(!currentBts) {
                return;
            }
            this.currentBts = currentBts;
            $('[data-js-bts-value]', this.$el).text(currentBts.project);
            $('[data-js-bts-link]', this.$el).text(currentBts.url);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {externalSystems: this.externalSystems}))
        }
    });

    return ModalLoadBug;
});
