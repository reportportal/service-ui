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
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var LaunchItemMenuView = require('launches/launchLevel/LaunchItemMenuView');
    var LaunchSuiteDefectsView = require('launches/common/LaunchSuiteDefectsView');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var ModalLaunchItemEdit = require('modals/modalLaunchItemEdit');
    var d3 = require('d3');
    var nvd3 = require('nvd3');

    var config = App.getInstance();

    var LaunchSuiteItemView = Epoxy.View.extend({
        template: 'tpl-launch-suite-item',
        statusTpl: 'tpl-launch-suite-item-status',
        events: {
            'click [data-js-name-link]': 'onClickName',
            'click [data-js-launch-menu]:not(.rendered)': 'showItemMenu',
            'click [data-js-time-format]': 'toggleStartTimeView',
            'click [data-js-item-edit]': 'onClickEdit',
            'click [data-js-tag]': 'onClickTag',
            'click [data-js-owner-name]': 'onClickOwnerName',
        },
        bindings: {
            '[data-js-item-row]': 'classes: {"select-state": select}',
            '[data-js-analize-label]': 'classes: {visible: isProcessing}',
            '[data-js-name-link]': 'attr: {href: url}',
            '[data-js-name]': 'text: name',
            '[data-js-launch-number]': 'text: numberText',
            '[data-js-item-edit]': 'classes: {hide: hideEdit}',
            '[data-js-description]': 'text: description',
            '[data-js-owner-block]': 'classes: {hide: not(owner)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-time-exact]': 'text: startFormat',
            '[data-js-select-item]': 'checked: select',
            '[data-js-tags-container]': 'sortTags: tags',
            '[data-js-statistics-total]': 'text: executionTotal, attr: {href: executionTotalLink}',
            '[data-js-statistics-failed]': 'text: executionFailed, attr: {href: executionFailedLink}',
            '[data-js-statistics-skipped]': 'text: executionSkipped, attr: {href: executionSkippedLink}',
            '[data-js-statistics-passed]': 'text: executionPassed, attr: {href: executionPassedLink}',
            '[data-js-statistics-to-investigate]': 'text: defectToInvestigate',
        },
        bindingHandlers: {
            sortTags: {
                set: function($element) {
                    var sortTags = this.view.model.get('sortTags');
                    if(!sortTags.length){
                        $element.addClass('hide');
                    } else {
                        $element.removeClass('hide');
                    }
                    var $tagsBlock = $('[data-js-tags]', $element);
                    $tagsBlock.html('');
                    _.each(sortTags, function(tag) {
                        $tagsBlock.append('  <a data-js-tag="' + tag + '">' + tag.replaceTabs() + '</a>')
                    })
                }
            }
        },
        computeds: {
            hideEdit: {
                deps: ['launch_owner'],
                get: function() {
                    return this.model.validate.edit()
                }
            },
            executionTotal: {
                deps: ['statistics'],
                get: function(statistics) {
                    return this.getExecution(statistics, 'total');
                }
            },
            executionTotalLink: function() {
                return this.allCasesUrl('total');
            },
            executionPassed: {
                deps: ['statistics'],
                get: function(statistics) {
                    return this.getExecution(statistics, 'passed');
                }
            },
            executionPassedLink: function() {
                return this.allCasesUrl('passed');
            },
            executionSkipped: {
                deps: ['statistics'],
                get: function(statistics) {
                    return this.getExecution(statistics, 'skipped');
                }
            },
            executionSkippedLink: function() {
                return this.allCasesUrl('skipped');
            },
            executionFailed: {
                deps: ['statistics'],
                get: function(statistics) {
                    return this.getExecution(statistics, 'failed');
                }
            },
            executionFailedLink: function() {
                return this.allCasesUrl('failed');
            },
            defectToInvestigate: {
                deps: ['statistics'],
                get: function(statistics) {
                    if (statistics.defects && statistics.defects.to_investigate && parseInt(statistics.defects.to_investigate.total)) {
                        return statistics.defects.to_investigate.total;
                    }
                    return '';
                }
            },
        },
        getExecution: function(statistics, executionType) {
            if (statistics.executions && statistics.executions[executionType] && parseInt(statistics.executions[executionType])) {
                return statistics.executions[executionType];
            }
            return '';
        },
        allCasesUrl: function(type){
            var url = this.model.get('url');
            var statusFilter = '';

            switch (type) {
                case 'total':
                    statusFilter = '&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED&filter.in.type=STEP';
                    break;
                case 'passed':
                case 'failed':
                case 'skipped':
                    statusFilter = '&filter.in.status=' + type.toUpperCase() + '&filter.in.type=STEP';
                    break;
                default:
                    break;
            }
            return url + '|'+ decodeURIComponent('filter.eq.has_childs=false' + statusFilter) + '?'
                + '&filter.eq.has_childs=false' + statusFilter;
        },



        initialize: function(options) {
            this.statistics = [];
            this.filterModel = options.filterModel;
            this.render();
            this.applyBindings();
            if (this.getBinding('defectToInvestigate')) {
                var defectCollection = new SingletonDefectTypeCollection();
                var self = this;
                defectCollection.ready.done(function(){
                    var toInvest = defectCollection.findWhere({typeRef: 'TO_INVESTIGATE'});
                    if (toInvest) {
                        $('[data-js-statistics-to-investigate]', self.$el).attr({
                            href: self.model.get('url') + '?filter.eq.has_childs=false&filter.in.issue$issue_type=' + toInvest.get('locator')
                        })
                    }
                })
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {type: this.model.get('type')}));
            this.renderDuration();
            this.renderDefects();

            // this.renderStatistics();
        },
        toggleStartTimeView: function (e) {
            this.model.collection.trigger('change:time:format')
        },
        renderDuration: function(){
            this.duration && this.duration.destroy();
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-item-status]', this.$el)
            });
        },
        renderDefects: function() {
            this.productBug && this.productBug.destroy();
            this.productBug = new LaunchSuiteDefectsView({
                model: this.model, el: $('[data-js-statistics-product-bug]', this.$el), type: 'product_bug'});
            this.autoBug && this.autoBug.destroy();
            this.autoBug = new LaunchSuiteDefectsView({
                model: this.model, el: $('[data-js-statistics-automation-bug]', this.$el), type: 'automation_bug'});
            this.systemIssue && this.systemIssue.destroy();
            this.systemIssue = new LaunchSuiteDefectsView({
                model: this.model, el: $('[data-js-statistics-system-issue]', this.$el), type: 'system_issue'});
        },
        showItemMenu: function (e) {
            var $link = $(e.currentTarget);
            this.menu = new LaunchItemMenuView({
                model: this.model
            });
            $link
                .after(this.menu.$el)
                .addClass('rendered')
                .dropdown();
        },
        onClickTag: function(e) {
            var tag = $(e.currentTarget).data('js-tag');
            this.addFastFilter('tags', tag);
        },
        onClickOwnerName: function() {
            this.addFastFilter('user', this.model.get('owner'));
        },
        addFastFilter: function(filterId, value) {
            if(this.filterModel.get('id') == 'all') {
                var launchFilterCollection = new SingletonLaunchFilterCollection();
                var tempFilterModel = launchFilterCollection.generateTempModel();
                config.router.navigate(tempFilterModel.get('url'), {trigger: true});
                tempFilterModel.trigger('add_entity', filterId, value);
            } else {
                this.filterModel.trigger('add_entity', filterId, value);
            }
        },
        onClickName: function(e) {
            e.preventDefault();
            this.model.trigger('drill:item', this.model);
            config.router.navigate($(e.currentTarget).attr('href'), {trigger: true});
        },
        onClickEdit: function() {
            var modal = new ModalLaunchItemEdit({
                item: this.model,
            })
            modal.show();
        },
        destroy: function () {
            this.menu && this.menu.destroy();
            this.duration && this.duration.destroy();
            _.each(this.statistics, function(v){
                if(_.isFunction(v.destroy)){
                    v.destroy();
                }
            });
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return LaunchSuiteItemView;
});
