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
    var Localization = require('localization');
    var Textile = require('textile');
    var CoreService = require('coreService');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var config = App.getInstance();

    var StepItemIssueView = Epoxy.View.extend({
        template: 'tpl-launch-step-issue',
        ticketsTpl: 'tpl-launch-step-issue-tickets',
        events: {
            'click [data-js-issue-remove-ticket]': 'removeTicket'
        },
        bindings: {
            '[data-js-issue-type]': 'classes:{disabled:disableIssue}, attr:{title: switchTitle}',
            '[data-js-issue-checkbox]': 'attr:{disabled: disableIssue}',
            '[data-js-issue-name]': 'text: setIssueName',
            '[data-js-issue-title]': 'attr: {title: setIssueTitle}',
            '[data-js-issue-color]': 'attr: {style: setIssueColor}',
            '[data-js-issue-comment]': 'html: setComment',
            '[data-js-issue-tickets]': 'html: attachTickets'
        },
        computeds: {
            setIssueName: function(){
                var issue = this.getBinding('issue'),
                    defect = this.getDefectType();
                return defect.longName.setMaxLength(20);
            },
            setIssueTitle: function(){
                var issue = this.getBinding('issue'),
                    defect = this.getDefectType();
                return defect.longName;
            },
            setIssueColor: function(){
                var issue = this.getBinding('issue'),
                    defect = this.getDefectType();
                return 'background: ' + defect.color;
            },
            setComment: function(){
                var issue = this.getBinding('issue'),
                    comment = this.getComment();
                return Textile(comment.replace('*IssueDescription:*',"<br>*IssueDescription:*")).replaceNewLines().escapeScript();
            },
            attachTickets: function(){
                var issue = this.getBinding('issue'),
                    tickets = this.getTickets();
                return Util.templates(this.ticketsTpl, {tickets: tickets});
            },
            disableIssue: function(){
                return this.inProgress();
            },
            switchTitle: function(){
                return this.isProcessing() ? Localization.launches.forbiddenIsProcessing : '';
            }
        },
        inProgress : function(){
            var progress = config.launchStatus.inProgress;
            return this.getBinding('status') === progress ||  this.getBinding('parent_launch_status') === progress;
        },
        isProcessing : function(){
            return this.getBinding("isProcessing") || this.getBinding('parent_launch_isProcessing');
        },
        initialize: function(options) {
            this.$container = options.$container;
            this.defetTypesCollection = new SingletonDefectTypeCollection();
            this.defetTypesCollection.ready.done(function(){
                this.render();
            }.bind(this));
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true}),
                needMatchIssue: this.needMatchIssue()
            }));
            this.$container.append(this.$el);
        },
        needMatchIssue: function(){
            return this.model.get('level') === 'LOG';
        },
        getIssueType: function(){
            var issue = this.model.getIssue();
            return issue ? issue.issue_type : null;
        },
        getDefectType: function(){
            var issue = this.getIssueType(),
                defect = issue ? this.defetTypesCollection.getDefectType(issue) : null;
            return defect;
        },
        getComment: function(){
            var issue = this.model.getIssue();
            return issue && issue.comment ? issue.comment : '';
        },
        getTickets: function(){
            var issue = this.model.getIssue();
            return issue && issue.externalSystemIssues ? issue.externalSystemIssues : [];
        },
        removeTicket: function(e){
            e.preventDefault();
            e.stopPropagation();

            var $el = $(e.currentTarget).closest('[data-js-issue-ticket]'),
                ticketId = $el.data('ticket-id').toString(),
                issue = this.model.getIssue(),
                tickets = this.getTickets(),
                self = this;

            $el.tooltip('hide').tooltip('destroy');
            $el.remove();

            tickets = _.reject(tickets, function (tk) {
                return tk.ticketId === ticketId;
            });
            issue.externalSystemIssues = tickets;

            CoreService.removeTicket({issues: [{issue: issue, test_item_id: this.model.get('id')}]})
                .done(function (data) {
                    self.model.setIssue(issue);
                    Util.ajaxSuccessMessenger("removeTicket");
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error);
                });
        },
        canMatchIssues: function(){
            var statistics = this.model.get('statistics');
            return !this.inProgress()
                && statistics
                && statistics.defects
                && (+statistics.defects.to_investigate.total > 0)
                && !this.isProcessing();
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return StepItemIssueView;
});