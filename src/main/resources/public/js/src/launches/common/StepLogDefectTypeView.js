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
    var ModalDefectEditor = require('modals/modalDefectEditor');

    var config = App.getInstance();

    var StepLogDefectTypeView = Epoxy.View.extend({
        template: 'tpl-launch-step-log-defect-type',
        events: {
            'click [data-js-issue-remove-ticket]': 'onClickRemoveTicket',
            'click [data-js-edit-defect]': 'onClickEditDefect',
        },
        bindings: {
            '[data-js-issue-comment]': 'html: issueComment',
            '[data-js-issue-name]': 'text: issueName',
            '[data-js-issue-color]': 'attr: {style: format("background-color: $1", issueColor)}',
            '[data-js-issue-title]': 'attr: {title: issueTitle}',
            '[data-js-edit-defect]': 'attr: {disabled: launch_isProcessing, title: editIssueTitle}, classes: {disabled: launch_isProcessing}',
            '[data-js-issue-tickets]': 'html: issueTicketsHtml',
        },
        computeds: {
            issueComment: {
                deps: ['issue'],
                get: function(issue) {
                    var issue = this.model.getIssue();
                    if (issue && issue.comment) {
                        return Textile(issue.comment.replace('*IssueDescription:*',"<br>*IssueDescription:*")).replaceNewLines().escapeScript();
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
            issueTicketsHtml: {
                deps: ['issue'],
                get: function(issue) {
                    var issue = this.model.getIssue();
                    if (issue && issue.externalSystemIssues) {
                        var resultHtml = ''
                        _.each(issue.externalSystemIssues, function(externalSystem) {
                            resultHtml += '<a href=' + externalSystem.url + ' target="_blank">' +
                                    '<span>' + externalSystem.ticketId + '</span>' +
                                    '<i data-js-issue-remove-ticket="' + externalSystem.ticketId + '" class="material-icons">clear</i>'+
                                 '</a>';
                        })
                        return resultHtml;
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
            this.defetTypesCollection.ready.done(function(){
                this.render();
            }.bind(this));
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true})
            }));
            this.applyBindings();
        },

        onClickEditDefect: function() {
            var defectEditor = new ModalDefectEditor({
                items: [this.model]
            });
            defectEditor.show();
        },

        onClickRemoveTicket: function(e){
            e.stopPropagation();
            e.preventDefault();
            var ticketId = $(e.currentTarget).data('js-issue-remove-ticket');
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