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

    // Tooltips
    var LaunchSuiteDefectsHoverView = require('launches/common/LaunchSuiteDefectsHoverView');
    var LaunchSuiteExecutionsTooltipView = require('tooltips/LaunchSuiteExecutionsTooltipView');
    var LaunchSuiteDurationTooltipView = require('tooltips/LaunchSuiteDurationTooltipView');

    var Localization = require('localization');

    var config = App.getInstance();

    var InfoPanelView = Epoxy.View.extend({
        template: 'tpl-launch-suite-info-panel',

        bindings: {
            '[data-js-passed-progress]': 'attr: {style: getPassedForProgress}',
            '[data-js-failed-progress]': 'attr: {style: getFailedForProgress}',
            '[data-js-skipped-progress]': 'attr: {style: getSkippedForProgress}',
            '[data-js-statistics-total]': 'text: totalStatistics',
            '[data-js-statistics-passed]': 'text: passedStatistics',
            '[data-js-defect-product_bug-total]': 'text: productBugTotal',
            '[data-js-defect-automation_bug-total]': 'text: automationBugTotal',
            '[data-js-defect-system_issue-total]': 'text: systemIssueTotal',
            '[data-js-defect-no_defect-total]': 'text: noDefectTotal',
            '[data-js-defect-to_investigate-total]': 'text: toInvestigateTotal',
            '[data-js-item-duration]': 'html: itemDuration'
        },
        computeds: {
            getPassedForProgress: function(){
                var stats = this.getBinding('statistics');
                return this.getStyleForProgress(stats, 'passed');
            },
            getFailedForProgress: function(){
                var stats = this.getBinding('statistics');
                return this.getStyleForProgress(stats, 'failed');
            },
            getSkippedForProgress: function(){
                var stats = this.getBinding('statistics');
                return this.getStyleForProgress(stats, 'skipped');
            },
            totalStatistics: function(){
                var stats = this.getBinding('statistics');
                return stats['executions'].total;
            },
            passedStatistics: function(){
                var stats = this.getBinding('statistics');
                return this.getExecutionStats(stats, 'passed');
            },
            productBugTotal: function(){
                var stats = this.getBinding('statistics');
                return this.getDefectStats(stats, 'product_bug');
            },
            automationBugTotal: function(){
                var stats = this.getBinding('statistics');
                return this.getDefectStats(stats, 'automation_bug');
            },
            systemIssueTotal: function(){
                var stats = this.getBinding('statistics');
                return this.getDefectStats(stats, 'system_issue');
            },
            noDefectTotal: function(){
                var stats = this.getBinding('statistics');
                return this.getDefectStats(stats, 'no_defect');
            },
            toInvestigateTotal: function(){
                var stats = this.getBinding('statistics');
                return this.getDefectStats(stats, 'to_investigate');
            },
            itemDuration: function(){
                var status = this.getBinding('status'),
                    startTime = this.getBinding('start_time'),
                    endTime = this.getBinding('end_time'),
                    duration = Util.timeFormat(startTime, endTime),
                    finish = Util.dateFormat(endTime, true),
                    title = Localization.launchesHeaders.interruptedAfter + ' ' + duration + '. ' + Localization.launchesHeaders.stoppedAt + ' ' + finish;

                if(status === config.launchStatus.interrupted){
                    return '<abbr title="' + title + '" class="text-danger"><strong>' + duration + '</strong></abbr>';
                }
                else if(status === config.launchStatus.inProgress){
                    var pref = Localization.launches.inProcess;
                    return '<span title="' + pref + '" class="duration-time"><img alt="' + pref + '" src="img/time-in-progress.gif"></span>';
                }
                else {
                    return '<abbr>' + duration + '</abbr>';
                }
            }
        },
        initialize: function(options) {
            this.defectTypes = this.getDefectTypes();
            this.render();
            this.listenTo(this.model, 'change:statistics', this.update);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true}),
                defectTypes: this.defectTypes
            }));
            this.loadDefectTooltip();
            this.loadDurationTooltip();
            this.loadExecutionsTooltip();
        },
        update: function () {
            this.loadDefectTooltip();
        },
        getExecutionStats: function(stats, type){
            var exec = stats.executions,
                total = +exec.total;
            return total ? ((+exec[type]/total) * 100).toFixed(2) : 0;
        },
        getDefectStats: function(stats, type){
            var defects = stats.defects;
            return defects[type].total;
        },
        getDefectTypes: function(){
            var stats = this.model.get('statistics'),
                defects = stats.defects,
                defectTypes = {};
            _.each(defects, function(val, type){
                var def = {
                    type: type,
                    color: Util.getDefaultColor(type),
                    longName: _.map(type.split('_'), function(t){ return t.capitalize(); }).join(' '),
                    shortName: Localization.defectShortCutById[type.toUpperCase()]
                };
                defectTypes[type] = def;
            }, this);
            return defectTypes;
        },
        getStyleForProgress: function(stats, type){
            var width = 'width: ' + this.getExecutionStats(stats, type) + '%;',
                background = 'background: ' + Util.getDefaultColor(type) + ';';
            return width + ' ' + background;
        },
        loadDefectTooltip: function () {
            var defectTooltips = this.$el.find('[data-js-defect-type]');
            var self = this;
            defectTooltips.each(function( index ) {
                var el = $(this);
                var type = el.data('js-defect-type');
                // var $hoverElement = el.next($('[data-js-hover-element]', this.$el));
                var tooltip = new LaunchSuiteDefectsHoverView({
                    el: $('[data-js-hover-element]', el),
                    type: type,
                    model: self.model
                });
                // Util.appendTooltip(function() {
                //     var tooltip = new LaunchSuiteDefectsHoverView({
                //         type: type,
                //         model: self.model
                //     });
                //     return tooltip.$el.html();
                // }, $hoverElement, $hoverElement);
            });
        },
        loadDurationTooltip: function(){
            var el = $('[data-js-duration]');
            var $hoverElement = el.next($('[data-js-hover-element]', this.$el));
            Util.appendTooltip(function() {
                var tooltip = new LaunchSuiteDurationTooltipView({});
                return tooltip.$el.html();
            }, $hoverElement, $hoverElement);
        },
        loadExecutionsTooltip: function(){
            var el = $('[data-js-executions]');
            var stats =  this.model.get('statistics');
            var data = {
                passed: this.getExecutionStats(stats, 'passed'),
                failed: this.getExecutionStats(stats, 'failed'),
                skipped: this.getExecutionStats(stats, 'skipped'),
            };
            var $hoverElement = el.next($('[data-js-hover-element]', this.$el));
            Util.appendTooltip(function() {
                var tooltip = new LaunchSuiteExecutionsTooltipView({
                    data: data
                });
                return tooltip.$el.html();
            }, $hoverElement, $hoverElement);
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return InfoPanelView;
});
