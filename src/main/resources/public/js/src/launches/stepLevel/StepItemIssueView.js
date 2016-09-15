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
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var config = App.getInstance();


    var StepItemIssueView = Epoxy.View.extend({
        template: 'tpl-launch-step-issue',
        events: {},
        bindings: {
            '[data-js-issue-type]': 'classes:{disabled:disableIssue}, attr:{title: switchTitle}',
            '[data-js-issue-checkbox]': 'attr:{disabled: disableIssue}'
        },
        computeds: {
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
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true}),
                issueType: this.getIssueType(),
                btsIssues: this.getBtsIssues(),
                comment: this.getComment(),
                textile: Textile,
                needMatchIssue: this.needMatchIssue()
            }));
            this.$container.append(this.$el);
        },
        needMatchIssue: function(){
            return this.model.get('level') === 'LOG';
        },
        getIssue: function(){
            var issue = this.model.get('issue');
            return issue ? issue.issue_type : null;
        },
        getIssueType: function(){
            var issue = this.getIssue(),
                defects = new SingletonDefectTypeCollection(),
                defect = issue ? defects.getDefectType(issue) : null;
            return defect;
        },
        getBtsIssues: function(){
            var issue = this.model.get('issue');
            return issue ? issue.externalSystemIssues : null;
        },
        getComment: function(){
            var issue = this.model.get('issue');
            return issue ? issue.comment : null;
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
