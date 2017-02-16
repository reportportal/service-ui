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
    var Service = require('coreService');
    var Localization = require('localization');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var CoreService = require('coreService');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var ModalDefectEditor = require('modals/modalDefectEditor');
    var SimpleTooltipView = require('tooltips/SimpleTooltipView');

    var config = App.getInstance();

    var TicketView = Epoxy.View.extend({
        template: 'tpl-Launch-step-log-defect-ticket',
        tagName: 'a',
        events: {
            'click [data-js-issue-remove-ticket]': 'onClickRemove',
            'mouseenter': 'onMouseEnter',
        },
        bindings: {
            ':el': 'attr: {href: url}',
            '[data-js-ticket-id]': 'text: ticketId',
        },
        initialize: function() {
            this.render();
            this.$el.attr('target', '_blank');
            this.hoverAction = false;
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.model.collection.remove(this.model);
        },
        onMouseEnter: function() {
            if(!this.hoverAction) {
                this.hoverAction = true;
                var self = this;
                this.model.collection.getTicketInfo(this.model.get('ticketId'), this.model.get('systemId'))
                    .done(function(data) {
                        if (data.summary.length > 200) {
                            $('.ui-tooltip',self.$el).width(432);
                        }
                        $('[data-js-tooltip-message]', self.$el).html('<span>' + Localization.logs.summary +
                            '</span><br>' + data.summary +' <br><br>' +
                            '<span>' + Localization.logs.status + '</span><br>' +
                            ((data.status === 'Closed' || data.status === 'Resolved')?'<s>' + data.status + '</s>' : data.status)
                        );
                    })
                    .fail(function() {
                        $('[data-js-tooltip-message]', self.$el).html('<span> '+ Localization.logs.ticketNotFound
                            +'</span><br>' + Localization.logs.ticketStatusProblem);
                    })
                    .always(function() {
                        $('[data-js-preloader]', self.$el).addClass('hide');
                    })
            }
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });
    var TicketModel = Epoxy.Model.extend({
        defaults: {
            submitDate: 0,
            submitter: '',
            systemId: '',
            ticketId: '',
            url: '',
        }
    });
    var TicketCollection = Backbone.Collection.extend({
        model: TicketModel,
        initialize: function() {
            this.cacheAnswer = {};
        },
        getTicketInfo: function(ticketId, systemId) {
            var async = $.Deferred();
            var self = this;
            if (this.cacheAnswer[ticketId] && this.cacheAnswer[ticketId][systemId]) {
                async.resolve(this.cacheAnswer[ticketId][systemId]);
            } else {
                Service.getBtsTicket(ticketId, systemId)
                    .done(function (ticket) {
                        self.cacheAnswer[ticketId] = {};
                        self.cacheAnswer[ticketId][systemId] = ticket;
                        async.resolve(ticket)
                     })
                    .fail(function () {
                        async.reject();
                    });
            }
            return async;
        }
    });

    var StepLogDefectTypeView = Epoxy.View.extend({
        template: 'tpl-launch-step-log-defect-type',
        events: {
            'click [data-js-edit-defect]': 'onClickEditDefect',
        },
        bindings: {
            // '[data-js-issue-comment]': 'html: issueComment',
            '[data-js-issue-name]': 'text: issueName',
            '[data-js-issue-color]': 'attr: {style: format("background-color: $1", issueColor)}',
            '[data-js-issue-title]': 'attr: {title: issueTitle}',
            '[data-js-edit-defect]': 'attr: {disabled: launch_isProcessing, title: editIssueTitle}, classes: {disabled: launch_isProcessing}',
        },
        computeds: {
            issueComment: {
                deps: ['issue'],
                get: function(issue) {
                    var issue = this.model.getIssue();
                    if (issue && issue.comment) {
                        return issue.comment;
                    }
                    return '';
                }
            },
            issueName: {
                deps: ['issue'],
                get: function(issue) {
                    var issue = this.model.getIssue();
                    if (issue && issue.issue_type) {
                        var defectModel = this.defetTypesCollection.getDefectByLocator(issue.issue_type);
                        return defectModel.get('longName').setMaxLength(20);
                    }
                    return '';
                }
            },
            issueTitle: {
                deps: ['issue'],
                get: function(issue) {
                    var issue = this.model.getIssue();
                    if (issue && issue.issue_type) {
                        var defectModel = this.defetTypesCollection.getDefectByLocator(issue.issue_type);
                        return defectModel.get('longName');
                    }
                    return '';
                }
            },
            issueColor: {
                deps: ['issue'],
                get: function(issue) {
                    var issue = this.model.getIssue();
                    if (issue && issue.issue_type) {
                        var defectModel = this.defetTypesCollection.getDefectByLocator(issue.issue_type);
                        return defectModel.get('color');
                    }
                    return '';
                }
            },
            editIssueTitle: {
                deps: 'launch_isProcessing',
                get: function(launch_isProcessing) {
                    return launch_isProcessing ? Localization.launches.forbiddenIsProcessing : '';
                }
            },
        },
        initialize: function(options) {
            this.defetTypesCollection = new SingletonDefectTypeCollection();
            var self = this;
            this.defetTypesCollection.ready.done(function(){
                self.render();
                self.ticketsView = [];
                self.ticketCollection = new TicketCollection();
                self.listenTo(self.ticketCollection, 'reset', self.onResetTicketCollection);
                self.listenTo(self.ticketCollection, 'remove', self.onRemoveTicket);
                self.listenTo(self.model, 'change:issue', self.onChangeIssue);
                self.onChangeIssue();
                self.markdownViewer = new MarkdownViewer({text: self.getBinding('issueComment')});
                $('[data-js-issue-comment]', self.$el).html(self.markdownViewer.$el);
                self.listenTo(self.model, 'change:issue', function(){ self.markdownViewer.update(self.getBinding('issueComment')); });
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true})
            }));
            this.applyBindings();
        },
        onResetTicketCollection: function() {
            var self = this;
            while(self.ticketsView.length) {
                (self.ticketsView.pop()).destroy();
            }
            var $container = $('[data-js-issue-tickets]', this.$el);
            _.each(this.ticketCollection.models, function(model) {
                var view = new TicketView({model: model});
                $container.append(view.$el);
                self.ticketsView.push(view);
            })
        },
        onChangeIssue: function() {
            var tickets = [];
            var issue = this.model.getIssue();
            if (issue && issue.externalSystemIssues) {
                tickets = issue.externalSystemIssues;
            }
            this.ticketCollection.reset(tickets);
        },
        onClickEditDefect: function() {
            var defectEditor = new ModalDefectEditor({
                items: [this.model]
            });
            defectEditor.show();
        },

        onRemoveTicket: function(ticketModel){
            var ticketId = ticketModel.get('ticketId');
            var issue = this.model.getIssue();
            var newExternalSystem = _.reject(issue.externalSystemIssues, function (tk) {
                return tk.ticketId === ticketId;
            });
            issue.externalSystemIssues = newExternalSystem;
            var self = this;
            CoreService.removeTicket({issues: [{issue: issue, test_item_id: this.model.get('id')}]})
                .done(function (data) {
                    self.model.setIssue(issue);
                    Util.ajaxSuccessMessenger("removeTicket");
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error);
                });
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return StepLogDefectTypeView;
});
