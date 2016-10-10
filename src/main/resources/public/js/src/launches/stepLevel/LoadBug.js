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
    var Util = require('util');
    var App = require('app');
    var Components = require('core/components');
    var Localization = require('localization');
    var CoreService = require('coreService');

    var config = App.getInstance();

    var LoadBug = Components.DialogShell.extend({

        initialize: function (options) {
            options['headerTxt'] = 'loadBug';
            options['actionTxt'] = 'add';
            options['actionStatus'] = true;
            Components.DialogShell.prototype.initialize.call(this, options);
            this.items = options.items ? options.items : [this.model];
            this.editor = options.editor;
            this.systems = _.sortBy(config.project.configuration.externalSystem, 'project');
            this.systemId = config.session.lastLoadedTo || this.systems[0].id;
            this.type = Util.getExternalSystem();
        },

        contentBody: 'tpl-load-bug',
        rowTpl: 'tpl-load-bug-row',

        render: function () {
            Components.DialogShell.prototype.render.call(this, {isBeta: true});
            var current = _.find(this.systems, {id: this.systemId});
            this.$content.html(Util.templates(this.contentBody, {
                systems: this.systems,
                current: current || this.systems[0]
            }));
            this.$rowsHolder = $("#rowHolder", this.$content);
            this.$postToUrl = $("#postToUrl", this.$el);
            this.renderRow();
            this.attachKeyActions();
            this.delegateEvents();
            return this;
        },
        renderRow: function () {
            this.$rowsHolder.append(Util.templates(this.rowTpl));
            Util.bootValidator($(".issue-row:last .issue-id", this.$rowsHolder), {
                validator: 'minMaxRequired',
                type: 'issueId',
                min: 1,
                max: 128
            });
            Util.bootValidator($(".issue-row:last .issue-link", this.$rowsHolder), [
                {
                    validator: 'matchRegex',
                    type: 'issueLinkRegex',
                    pattern: config.patterns.urlT,
                    arg: 'i'
                }
            ]);
        },
        addRow: function () {
            this.renderRow();
            this.$rowsHolder.addClass('multi');
        },
        removeRow: function (e) {
            $(e.currentTarget).closest('.issue-row').remove();
            if ($(".issue-row", this.$rowsHolder).length === 1) this.$rowsHolder.removeClass('multi');
        },
        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'click .project-name': 'updateProject',
                'click #addRow': 'addRow',
                'click .remove-row': 'removeRow',
                'blur .issue-link': 'autoFillId'
            });
        },
        attachKeyActions: function(){
            this.$el.on('keydown', function(e){
                if(e.ctrlKey && e.keyCode === 13){
                    this.submit();
                }
            }.bind(this))
        },
        autoFillId: function (e) {
            if (this.canAutoFill()) {
                var $link = $(e.currentTarget),
                    $id = $link.closest('.issue-row').find('.issue-id'),
                    link = $link.val(),
                    autoValue;
                if (!link || !$link.data('valid') || $.trim($id.val())) return;
                if (this.isJiraBts()) {
                    autoValue = link.split('/');
                    autoValue = autoValue[autoValue.length - 1];
                }
                if (this.isTfsBts()) {
                    autoValue = link.split('id=')[1];
                    autoValue = autoValue ? autoValue.split('&')[0] : '';
                }
                $id.val(autoValue).trigger('validate');
            }
        },
        canAutoFill: function () {
            return this.type && (this.isJiraBts() || this.isTfsBts());
        },
        isJiraBts: function () {
            return this.type === config.btsEnum.jira;
        },
        isTfsBts: function () {
            return this.type === config.btsEnum.tfs;
        },
        updateProject: function (e) {
            Util.dropDownHandler(e);
            this.systemId = $(e.currentTarget).attr('id');
            var system = _.find(this.systems, {id: this.systemId});
            this.$postToUrl.text(system.url);
        },

        getIssuesForUpdate: function (response) {
            var issues = [],
                issue = this.model.getIssue(),
                externalSystemIssues = issue.externalSystemIssues || [],
                $editor = this.editor.$el;

            _.each(response.issues, function(is){
                externalSystemIssues.push({
                    ticketId: is.ticketId,
                    systemId: response.systemId,
                    url: is.url
                });
            });
            _.each(this.items, function(item){
                issues.push({issue: issue, test_item_id: item.get('id')});
            });
            //for multiple load bug
           /* _.forEach(items, function (item, i) {
                var defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge'),
                    chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null,
                    issue = {
                        issue_type: chosenIssue ? chosenIssue : item.issue.issue_type,
                        comment: item.issue.comment,
                        externalSystemIssues: item.issue.externalSystemIssues || []
                    };

                if ($('#replaceComments').prop('checked')) {
                    issue.comment = $('.markItUpEditor').val().length > 0 ? $('.markItUpEditor').val() : this.items[i].issue.comment;
                }

                if (item.id == $('.editor-row').closest('.selected').attr('id')) {
                    issue.comment = $('.markItUpEditor').val();
                }
                issues.push({issue: issue, test_item_id: item.id});
            }, this);*/
            return issues;
        },

        updateIssues: function(data){
            var newIssue = data[0];
            _.each(this.items, function(item){
                var issue = item.getIssue();
                issue.externalSystemIssues = newIssue.externalSystemIssues;
                item.setIssue(issue);
            })
        },

        submit: function () {
            $('.form-control', this.$rowsHolder).trigger('validate');
            if (!$('.has-error', this.$rowsHolder).length) {
                var data = {},
                    self = this;
                data.systemId = this.systemId;
                data.testItemIds = _.map(this.items, function(item){ return item.get('id')});
                data.issues = _.map($('.issue-row', this.$rowsHolder), function (row) {
                    var id = $(row).find('.issue-id').val(),
                        url = $(row).find('.issue-link').val();
                    return {
                        ticketId: id,
                        url: url
                    }
                });
                this.inSubmit = true;
                CoreService.loadBugs(data)
                    .done(function (response) {
                        var issues = self.getIssuesForUpdate(data);
                        CoreService.updateDefect({issues: issues})
                            .done(function (resp) {
                                self.updateIssues(resp);
                                Util.ajaxSuccessMessenger("submitKeys");
                                self.trigger("bug::loaded");
                            })
                            .fail(function (error) {
                                Util.ajaxFailMessenger(error, "updateDefect");
                            })
                            .always(function () {
                                self.done();
                            });
                        config.session.lastLoadedTo = self.systemId;
                        config.trackingDispatcher.jiraTicketLoad(data.issues.length);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "submitKeys");
                    })
                    .always(function () {
                        self.inSubmit = false;
                    });
            }
        }
    });

    return LoadBug;
});