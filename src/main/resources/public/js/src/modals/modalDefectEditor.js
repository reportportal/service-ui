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
    var CoreService = require('coreService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');
    var Markitup = require('markitup');
    var MarkitupSettings = require('markitupset');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var ModalDefectEditor = ModalView.extend({
        template: 'tpl-modal-defect-editor',
        className: 'modal-defect-editor',

        events: {
            'keyup textarea': 'validateForSubmition',
            'click [data-js-save]:not(.disabled)': 'updateDefectType',
            'click [data-js-select-issue]': 'selectIssueType',
            'click [data-js-close-editor]': 'closeEditor'
        },

        initialize: function(option) {
            this.items = option.items;
            this.defectTypesCollection = new SingletonDefectTypeCollection();
            this.defectTypesCollection.ready.done(function(){
                this.render();
            }.bind(this));
            this.selectedIssue = null;
            this.inProcess = false;
        },

        render: function() {
            this.$el.html(Util.templates(this.template, {
                item: this.items[0],
                isMultipleEdit: this.isMultipleEdit(),
                defectsGroup: config.defectsGroupSorted,
                subDefects: this.getSubDefects(),
                getIssueType: this.getIssueType,
                getIssueComment: this.getIssueComment,
                getDefectType: this.getDefectType()
            }));

            this.setupAnchors();
            this.setupMarkItUp();
            this.attachKeyActions();
        },

        isMultipleEdit: function(){
            return this.items.length > 1;
        },

        setupAnchors: function () {
            this.$submitBtn = $("[data-js-save]", this.$el);
            this.$textarea = $("[data-js-issue-comment]", this.$el);
            this.$type = $("[data-js-issue-name]", this.$el);
            this.$replaceComments = $("[data-js-replace-comment]", this.$el);
        },

        validateForSubmition: function (e) {
            var item = this.items[0];
            if (this.$textarea.val() !== (this.getIssueComment(item) || '') || this.selectedIssue !== this.getIssueType(item)) {
                this.$submitBtn.removeAttr('disabled');
            } else {
                this.$submitBtn.attr('disabled', 'disabled');
            }
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

        getIssueType: function(item){
            var data = item.getIssue();
            return data.issue_type;
        },

        getIssueComment: function(item){
            var data = item.getIssue();
            return data.comment ? data.comment : '';
        },

        getDefectType: function(){
            var self = this;
            return function(item){
                var issue = self.getIssueType(item),
                    issueType = self.defectTypesCollection.getDefectType(issue);
                return issueType;
            };
        },

        getSubDefects: function(){
            var def = {},
                defectTypes =  this.defectTypesCollection.toJSON();
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

        selectIssueType: function (e) {
            var el = $(e.currentTarget),
                locator = el.data('locator'),
                issueType = this.defectTypesCollection.getDefectType(locator),
                menu = el.closest('.dropdown-menu');

            $('label', menu).removeClass('selected');
            el.addClass('selected');
            this.selectedIssue = locator;
            this.$type.text(issueType.longName).attr('class', el.find('.badge').attr('class'));
            this.$type.closest('[data-js-issue-title]').data('id', this.selectedIssue);
            $('[data-js-noissue-name]', this.$el).hide();
            $('[data-js-issue-title]', this.$el).show();
            $('[data-js-issue-title] i', this.$el).css('background', issueType.color);
            this.validateForSubmition();
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
        },
        updateDefectType: function () {
            if (this.inProcess) {
                return;
            }
            this.inProcess = true;
            var comment = $.trim(this.$textarea.val()),
                selectedIssue = this.selectedIssue,
                issues = [],
                replaceComments = this.$replaceComments.is(':checked');
            _.forEach(this.items, function (item) {
                var issue = {};
                if((replaceComments && this.isMultipleEdit() && comment) || (!this.isMultipleEdit() && comment)){
                    issue.comment = comment;
                }
                issue.issue_type = selectedIssue || this.getIssueType(item);
                issues.push({
                    test_item_id: item.get('id'),
                    issue: issue
                });
                item.setIssue(issue);
            }, this);
            CoreService.updateDefect({issues: issues})
                .done(function () {
                    var itemIssue = this.getIssueType(this.items[0]);
                    if (selectedIssue && itemIssue !== selectedIssue) {
                        config.trackingDispatcher.defectStateChange(itemIssue, selectedIssue);
                    }
                    Util.ajaxSuccessMessenger("updateDefect");
                    this.hide();
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "updateDefect");
                }).always(function () {
                this.inProcess = false;
            }.bind(this));
        }
    });

    return ModalDefectEditor;
})