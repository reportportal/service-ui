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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var Markitup = require('markitup');
    var MarkitupSettings = require('markitupset');
    var CoreService = require('coreService');
    var LoadBug = require('launches/stepLevel/LoadBug');
    var PostBug = require('launches/stepLevel/PostBug');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var config = App.getInstance();

    var Editor = Epoxy.View.extend({
        template: 'tpl-step-defect-editor',
        ticketsTpl: 'tpl-launch-step-issue-tickets',
        className: 'row rp-table-row selected editor-row',
        bindings: {
            '[data-js-load-bug]': 'attr: {title: titleForLoadBug}, disabled: canLoadBug',
            '[data-js-post-bug]': 'attr: {title: titleForPostBug, disabled: canPostBug}',
            '[data-js-multiple-selected]': 'classes: {hidden: showMultipleSelected}',
            '[data-js-issue-name]': 'text: setIssueName',
            '[data-js-issue-title]': 'attr: {dataId: setIssueId, title: setIssueTitle}',
            '[data-js-issue-color]': 'attr: {style: setIssueColor}',
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
            setIssueId: function(){
                var issue = this.getBinding('issue'),
                    defect = this.getIssueType();
                return defect;
            },
            setIssueColor: function(){
                var issue = this.getBinding('issue'),
                    defect = this.getDefectType();
                return 'background: ' + defect.color;
            },
            attachTickets: function(){
                var issue = this.getBinding('issue'),
                    tickets = this.getTickets();
                return Util.templates(this.ticketsTpl, {tickets: tickets});
            },
            canLoadBug: function(){
                return !this.validateForLoadBug();
            },
            titleForLoadBug: function(){
                return this.validateForLoadBug() ? Localization.launches.loadBug : Localization.launches.configureTBS;
            },
            canPostBug: function(){
                return !this.validateForPostBug();
            },
            titleForPostBug: function(){
                return this.validateForPostBug() ? Localization.launches.postBug : Localization.launches.configureTBS;
            },
            showMultipleSelected: function(){
                return true;
            }
        },
        events: {
            'keyup textarea': 'validateForSubmition',
            'click [data-js-post-bug]:not(.disabled)': 'openPostBug',
            'click [data-js-load-bug]:not(.disabled)': 'openLoadBug',
            'click [data-js-submit]:not(.disabled)': 'updateDefectType',
            'click [data-js-select-issue]': 'selectIssueType',
            'click [data-js-close-editor]': 'closeEditor',
            'click [data-js-issue-remove-ticket]': 'removeTicket'
        },
        initialize: function(options) {
            this.$origin = options.origin;
            this.defetTypesCollection = new SingletonDefectTypeCollection();
            this.defetTypesCollection.ready.done(function(){
                this.render();
            }.bind(this));
            this.selectedIssue = this.getIssueType();
            this.inProcess = false;
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model,
                comment: this.getIssueComment(),
                defectType: this.getDefectType(),
                defectsGroup: ['TO_INVESTIGATE', 'PRODUCT_BUG', 'AUTOMATION_BUG', 'SYSTEM_ISSUE', 'NO_DEFECT'],
                subDefects: this.getSubDefects()
            }));
            this.$origin.html(this.$el);
            this.setupAnchors();
            this.setupMarkItUp();
            this.attachKeyActions();
            console.log('render');
        },
        setupAnchors: function () {
            this.$submitBtn = $("[data-js-submit]", this.$el);
            this.$textarea = $("[data-js-issue-comment]", this.$el);
            this.$type = $(".pr-defect-type-badge span", this.$el); //need to fix
            //this.$multipleEditHolder = $(".rp-defect-multiple-edit:first", this.$el);
            this.$multipleEditAmount = $("[data-js-selected-qty]", this.$el);
            this.$replaceComments = $("[data-js-replace-comment]", this.$el);
        },
        attachKeyActions: function(){
            this.$el.on('keydown', function(e){
                if(e.keyCode === 27){
                    this.closeEditor();
                }
                else if(e.ctrlKey && e.keyCode === 13){
                    this.updateDefectType();
                }
            }.bind(this))
        },
        validateForLoadBug: function(){
            return Util.hasValidBtsSystem();
        },
        validateForPostBug: function(){
            return Util.canPostToJira();
        },
        getIssueType: function(){
            var data = this.model.getIssue();
                return data.issue_type;
        },
        getIssueComment: function(){
            var data = this.model.getIssue();
            return data.comment ? data.comment : '';
        },
        getDefectType: function(){
            var issue = this.getIssueType(),
                issueType = this.defetTypesCollection.getDefectType(issue);
            return issueType;
        },
        getSubDefects: function(){
            var def = {},
                defectTypes =  this.defetTypesCollection.toJSON();
            _.each(defectTypes, function(d){
                var type = d.typeRef;
                if(def[type]){
                    def[type].push(d);
                }
                else {
                    def[type] = [d];
                }
            });
            return def;
        },
        getTickets: function(){
            var issue = this.model.getIssue();
            return issue && issue.externalSystemIssues ? issue.externalSystemIssues : [];
        },
        selectIssueType: function (e) {
            var el = $(e.currentTarget),
                locator = el.data('locator'),
                issueType = this.defetTypesCollection.getDefectType(locator),
                menu = el.closest('.dropdown-menu');

            $('label', menu).removeClass('selected');
            el.addClass('selected');
            this.selectedIssue = locator;
            this.$type.text(issueType.longName).attr('class', el.find('.badge').attr('class'));
            this.$type.closest('.pr-defect-type-badge').data('id', this.selectedIssue)
            $('.pr-defect-type-badge i', this.$el).css('background', issueType.color);
            this.validateForSubmition();
        },
        openPostBug: function(){
            this.postBugView && this.postBugView.destroy();
            this.postBugView = new PostBug({
                //items: _.values(this.items)
                model: this.model,
                editor: this
            }).render();
            this.listenTo(this.postBugView, "bug::attached", this.closeEditor);
        },
        openLoadBug: function(){
            this.loadBugView && this.loadBugView.destroy();
            this.loadBugView = new LoadBug({
                model: this.model,
                //items: _.values(this.items),
                editor: this
            }).render();
            this.listenTo(this.loadBugView, "bug::loaded", this.closeEditor);

        },
        closeEditor: function(){
            this.trigger('defect::editor::hide');
            this.destroy();
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
        validateForSubmition: function (e) {
            if (this.$textarea.val() !== (this.getIssueComment() || '') || this.selectedIssue !== this.getIssueType()) {
                this.$submitBtn.removeClass('disabled');
            } else {
                this.$submitBtn.addClass('disabled');
            }
        },
        setupMarkItUp: function(){
            var link = _.filter(MarkitupSettings.markupSet, {name: 'Link'})[0];
            link.openWith = '"[![Title]!]":';
            link.closeWith = '[![Link:!:http://]!]';
            link.placeHolder = ' ';

            this.$textarea.markItUp(_.extend({
                customPlaceholder: 'true',
                afterInsert: function () {
                    this.validateForSubmition();
                }.bind(this)
            }, MarkitupSettings));
            this.$textarea.focus();

            console.log('setupMarkItUp');
        },
        updateDefectType: function () {
            if (this.inProcess) {
                return;
            }
            this.inProcess = true;
            var self = this,
                issue = {comment: $.trim(this.$textarea.val()), issue_type: this.selectedIssue},
                issue_type = this.getIssueType(),
                issues = [];//,
                //replaceComments = this.$replaceComments.is(':checked');
            issues.push({
                test_item_id: this.model.get('id'),
                issue: issue
            });
            CoreService.updateDefect({issues: issues})
                .done(function () {
                    if (issue_type !== issue.issue_type) {
                        config.trackingDispatcher.defectStateChange(issue_type, issue.issue_type);
                    }
                    self.model.setIssue(issue);
                    self.closeEditor();
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "updateDefect");
                }).always(function () {
                    this.inProcess = false;
                }.bind(this));
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    return Editor
});