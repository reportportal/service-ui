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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var LaunchItemMenuView = require('launches/launchLevel/LaunchItemMenuView');
    var LaunchSuiteDefectsView = require('launches/common/LaunchSuiteDefectsView');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var ItemStartTimeView = require('launches/common/ItemStartTimeView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var ModalLaunchItemEdit = require('modals/modalLaunchItemEdit');
    var CommonItemView = require('launches/common/CommonItemView');

    var config = App.getInstance();

    var LaunchSuiteItemView = CommonItemView.extend({
        template: 'tpl-launch-suite-item',
        className: 'row rp-table-row',
        statusTpl: 'tpl-launch-suite-item-status',
        events: {
            click: 'onClickView',
            'click [data-js-name-link]': 'onClickName', // common method
            'click [data-js-launch-menu]': 'showItemMenu',
            'click [data-js-item-edit]': 'onClickEdit',
            'click [data-js-tag]': 'onClickTag',
            'click [data-js-owner-name]': 'onClickOwnerName',
            'click [data-js-statistics-to-investigate]': 'onClickToInvestigate',
            'click [data-js-toggle-open]': 'onClickOpen',
            'click [data-js-select-label]': 'onClickSelectLabel',
            'click [data-js-select-item]': 'onClickSelectInput'
        },
        bindings: {
            ':el': 'classes: {"select-state": select}',
            '[data-js-analize-label]': 'classes: {visible: isProcessing}',
            '[data-js-name-link]': 'attr: {href: url}',
            '[data-js-name]': 'text: name, attr: {title: nameTitle}',
            '[data-js-launch-number]': 'text: numberText',
            '[data-js-item-edit]': 'classes: {hide: hideEdit}',
            '[data-js-owner-block]': 'classes: {hide: not(owner)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-select-item]': 'checked: select, attr: {disabled: launch_isProcessing}',
            '[data-js-tags-container]': 'sortTags: tags',
            '[data-js-statistics-total]': 'text: executionTotal, attr: {href: executionTotalLink}, classes: {"not-link": not(executionTotalLink)}',
            '[data-js-statistics-failed]': 'text: executionFailed, attr: {href: executionFailedLink}, classes: {"not-link": not(executionTotalLink)}',
            '[data-js-statistics-skipped]': 'text: executionSkipped, attr: {href: executionSkippedLink}, classes: {"not-link": not(executionTotalLink)}',
            '[data-js-statistics-passed]': 'text: executionPassed, attr: {href: executionPassedLink}, classes: {"not-link": not(executionTotalLink)}',
            '[data-js-statistics-to-investigate]': 'text: defectToInvestigate'
        },
        bindingHandlers: {
            sortTags: {
                set: function ($element) {
                    var $tagsBlock;
                    var sortTags = this.view.model.get('sortTags');
                    if (!sortTags.length) {
                        $element.addClass('hide');
                    } else {
                        $element.removeClass('hide');
                    }
                    $tagsBlock = $('[data-js-tags]', $element);
                    $tagsBlock.html('');
                    _.each(sortTags, function (tag) {
                        $tagsBlock.append('  <a data-js-tag="' + tag + '">' + tag.replaceTabs() + '</a>');
                    });
                }
            }
        },
        computeds: {
            hideEdit: {
                deps: ['launch_owner'],
                get: function () {
                    return this.model.validate.edit();
                }
            },
            nameTitle: {
                deps: ['url'],
                get: function (url) {
                    if (!url) {
                        return Localization.launches.noItemsInside;
                    }
                    return '';
                }
            },
            executionTotal: {
                deps: ['statistics'],
                get: function (statistics) {
                    return this.getExecution(statistics, 'total');
                }
            },
            executionTotalLink: {
                deps: ['url', 'has_childs'],
                get: function (url, hasChilds) {
                    if (hasChilds) {
                        return this.allCasesUrl('total');
                    }
                    return undefined;
                }
            },
            executionPassed: {
                deps: ['statistics'],
                get: function (statistics) {
                    return this.getExecution(statistics, 'passed');
                }
            },
            executionPassedLink: {
                deps: ['url', 'has_childs'],
                get: function (url, hasChilds) {
                    if (hasChilds) {
                        return this.allCasesUrl('passed');
                    }
                    return undefined;
                }
            },
            executionSkipped: {
                deps: ['statistics'],
                get: function (statistics) {
                    return this.getExecution(statistics, 'skipped');
                }
            },
            executionSkippedLink: {
                deps: ['url', 'has_childs'],
                get: function (url, hasChilds) {
                    if (hasChilds) {
                        return this.allCasesUrl('skipped');
                    }
                    return undefined;
                }
            },
            executionFailed: {
                deps: ['statistics'],
                get: function (statistics) {
                    return this.getExecution(statistics, 'failed');
                }
            },
            executionFailedLink: {
                deps: ['url', 'has_childs'],
                get: function (url, hasChilds) {
                    if (hasChilds) {
                        return this.allCasesUrl('failed');
                    }
                    return undefined;
                }
            },
            defectToInvestigate: {
                deps: ['statistics'],
                get: function (statistics) {
                    if (statistics.defects && statistics.defects.to_investigate
                        && parseInt(statistics.defects.to_investigate.total, 10)) {
                        return statistics.defects.to_investigate.total;
                    }
                    return '';
                }
            }
        },
        getExecution: function (statistics, executionType) {
            if (statistics.executions && statistics.executions[executionType] &&
                parseInt(statistics.executions[executionType], 10)) {
                return statistics.executions[executionType];
            }
            return '';
        },
        allCasesUrl: function (type) {
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
            return url + '?filter.eq.has_childs=false' + statusFilter;
        },
        initialize: function (options) {
            var defectCollection = new SingletonDefectTypeCollection();
            var self = this;
            var toInvest;
            this.statistics = [];
            this.filterModel = options.filterModel;
            this.render();
            this.applyBindings();
            defectCollection.ready.done(function () {
                var investigateFilter = '';
                if (self.getBinding('defectToInvestigate')) {
                    toInvest = defectCollection.findWhere({ typeRef: 'TO_INVESTIGATE' });
                    if (toInvest) {
                        investigateFilter = 'filter.eq.has_childs=false&filter.in.issue$issue_type=' + toInvest.get('locator');
                        $('[data-js-statistics-to-investigate]', self.$el).attr({
                            href: self.model.get('url') + '?' + investigateFilter
                        });
                    }
                }
                $('[data-js-label-pb]', self.$el).css({ backgroundColor: defectCollection.getMainColorByType('product_bug') });
                $('[data-js-label-ab]', self.$el).css({ backgroundColor: defectCollection.getMainColorByType('automation_bug') });
                $('[data-js-label-si]', self.$el).css({ backgroundColor: defectCollection.getMainColorByType('system_issue') });
                $('[data-js-label-ti]', self.$el).css({ backgroundColor: defectCollection.getMainColorByType('to_investigate') });
            });
            this.listenTo(this.model, 'scrollToAndHighlight', this.highlightItem);
            this.markdownViewer = new MarkdownViewer({ text: this.model.get('description') });
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
            this.listenTo(this.model, 'change:description', function (model, description) { self.markdownViewer.update(description); });
            this.listenTo(this.model, 'change:description change:tags', this.activateAccordion);
            this.listenTo(this.markdownViewer, 'load', this.activateAccordion);
            this.listenTo(this.model, 'before:toggle:multipleSelect', this.afterChangeScrollTop);
            this.listenTo(this.model, 'toggle:multipleSelect', this.changeScrollTop);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, { type: this.model.get('type') }));
            this.renderDuration();
            this.renderStartTime();
            this.renderDefects();
        },
        highlightItem: function () {
            var self;
            this.$el.prepend('<div class="highlight"></div>');
            self = this;
            config.mainScrollElement.animate({ scrollTop: this.el.offsetTop }, 500, function () {
                self.$el.addClass('hide-highlight');
            });
        },
        renderDuration: function () {
            this.duration && this.duration.destroy();
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-item-status]', this.$el)
            });
        },
        renderStartTime: function () {
            this.startTime && this.startTime.destroy();
            this.startTime = new ItemStartTimeView({
                model: this.model
            });
            $('[data-js-start-time-container]', this.$el).html(this.startTime.$el);
        },
        renderDefects: function () {
            this.productBug && this.productBug.destroy();
            this.productBug = new LaunchSuiteDefectsView({
                model: this.model,
                el: $('[data-js-statistics-product-bug]', this.$el),
                type: 'product_bug'
            });
            this.autoBug && this.autoBug.destroy();
            this.autoBug = new LaunchSuiteDefectsView({
                model: this.model,
                el: $('[data-js-statistics-automation-bug]', this.$el),
                type: 'automation_bug'
            });
            this.systemIssue && this.systemIssue.destroy();
            this.systemIssue = new LaunchSuiteDefectsView({
                model: this.model,
                el: $('[data-js-statistics-system-issue]', this.$el),
                type: 'system_issue'
            });
        },
        onClickToInvestigate: function () {
            if (this.model.get('type') === 'SUITE') {
                config.trackingDispatcher.trackEventNumber(131);
            } else {
                config.trackingDispatcher.trackEventNumber(60);
            }
        },
        showItemMenu: function (e) {
            var $link;
            config.trackingDispatcher.trackEventNumber(24);
            if (!$(e.currentTarget).hasClass('rendered')) {
                $link = $(e.currentTarget);
                this.menu = new LaunchItemMenuView({
                    model: this.model
                });
                $link
                    .after(this.menu.$el)
                    .addClass('rendered')
                    .dropdown();
            }
        },
        onClickTag: function (e) {
            var tag = $(e.currentTarget).data('js-tag');
            this.addFastFilter('tags', tag);
        },
        onClickOwnerName: function () {
            this.addFastFilter('user', this.model.get('owner'));
        },
        addFastFilter: function (filterId, value) {
            var launchFilterCollection;
            var tempFilterModel;
            if (this.model.get('mode') === 'DEBUG') {
                this.filterModel.trigger('add_entity', filterId, value);
                return;
            }
            if (this.filterModel.get('id') === 'all') {
                launchFilterCollection = new SingletonLaunchFilterCollection();
                tempFilterModel = launchFilterCollection.generateTempModel();
                config.router.navigate(tempFilterModel.get('url'), { trigger: true });
                tempFilterModel.trigger('add_entity', filterId, value);
            } else {
                this.filterModel.trigger('add_entity', filterId, value);
            }
        },
        onClickView: function (e) {
            if ((e.ctrlKey || e.metaKey) && !($(e.target).is('a') && !($(e.target).is('input')))
                && !this.model.get('launch_isProcessing')) {
                this.model.set({ select: !this.model.get('select') });
                if (e.altKey && this.model.get('select')) {
                    this.model.trigger('check:before:items', this.model.get('id'));
                }
            }
        },
        onClickSelectLabel: function (e) {
            e.stopPropagation();
        },
        onClickSelectInput: function (e) {
            if (this.model.get('type') === 'SUITE') {
                config.trackingDispatcher.trackEventNumber(100.1);
            } else {
                config.trackingDispatcher.trackEventNumber(61.2);
            }
            if (e.ctrlKey && e.altKey) {
                this.model.trigger('check:before:items', this.model.get('id'));
            }
        },
        onClickEdit: function () {
            var modal;
            if (this.model.get('type') === 'SUITE') {
                config.trackingDispatcher.trackEventNumber(98);
            } else {
                config.trackingDispatcher.trackEventNumber(53);
            }
            modal = new ModalLaunchItemEdit({
                item: this.model
            });
            modal.show();
        },
        onClickOpen: function () {
            this.$el.toggleClass('open');
        },
        activateAccordion: function () {
            var innerHeight = 198;
            if ($(window).width() < 900) {
                innerHeight = 318;
            }
            if (this.$el.innerHeight() > innerHeight) {
                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        },
        onDestroy: function () {
            this.markdownViewer && this.markdownViewer.destroy();
            this.menu && this.menu.destroy();
            this.duration && this.duration.destroy();
            this.startTime && this.startTime.destroy();
            _.each(this.statistics, function (v) {
                if (_.isFunction(v.destroy)) {
                    v.destroy();
                }
            });
        }
    });

    return LaunchSuiteItemView;
});
