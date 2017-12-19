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
    var Util = require('util');
    var App = require('app');
    var _ = require('underscore');
    var Localization = require('localization');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var StepLogDefectTypeView = require('launches/common/StepLogDefectTypeView');
    var ModalLaunchItemEdit = require('modals/modalLaunchItemEdit');
    var ModalStepItemDetails = require('modals/modalStepItemDetails');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var ItemStartTimeView = require('launches/common/ItemStartTimeView');
    var CommonItemView = require('launches/common/CommonItemView');


    var config = App.getInstance();

    var StepItemView = CommonItemView.extend({
        template: 'tpl-launch-step-item',
        className: 'row rp-table-row',
        events: {
            click: 'onClickView',
            'click [data-js-name-link]': 'onClickName', // common method
            // 'click [data-js-time-format]': 'toggleStartTimeView',
            'click [data-js-item-edit]': 'onClickEdit',
            'click [data-js-tag]': 'onClickTag',
            'click [data-js-toggle-open]': 'onClickOpen',
            'click [data-js-select-label]': 'onClickSelectLabel',
            'click [data-js-select-item]': 'onClickSelectInput',
            'click [data-js-item-details]': 'onClickDetails'
        },
        bindings: {
            '[data-js-name-link]': 'attr: {href: url}',
            '[data-js-name]': 'text: name',
            '[data-js-item-edit]': 'classes: {hide: hideEdit}',
            '[data-js-status]': 'text: status_loc',
            '[data-js-owner-block]': 'classes: {hide: not(owner)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-tags-container]': 'sortTags: tags',
            '[data-js-method-type]': 'text: showMethodType',
            '[data-js-time-from-now]': 'text: startFromNow',
            // '[data-js-time-exact]': 'text: startFormat',
            ':el': 'classes: {failed: highlightedFailed, "select-state": select, "collapse-method": validateForCollapsed}',
            '[data-js-select-item]': 'checked:select, attr: {disabled: launch_isProcessing}'
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
            showMethodType: {
                deps: ['type'],
                get: function (type) {
                    return Localization.testTableMethodTypes[type];
                }
            },
            highlightedFailed: {
                deps: ['status'],
                get: function (status) {
                    return status === 'FAILED';
                }
            },
            validateForCollapsed: {
                deps: ['status', 'type'],
                get: function (status, type) {
                    return (type.indexOf('METHOD') >= 0 || type.indexOf('CLASS') >= 0) && status !== 'FAILED';
                }
            }
        },
        initialize: function (options) {
            var self = this;
            this.noIssue = options.noIssue;
            this.filterModel = options.filterModel;
            this.context = options.context;
            this.render();
            this.listenTo(this.model, 'scrollToAndHighlight', this.highlightItem);
            this.markdownViewer = new MarkdownViewer({ text: this.model.get('description') });
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
            this.listenTo(this.model, 'change:description', function (model, description) { self.markdownViewer.update(description); });
            this.listenTo(this.model, 'change:description change:tags change:issue', this.activateAccordion);
            this.listenTo(this.markdownViewer, 'load', this.activateAccordion);
            this.listenTo(this.model, 'before:toggle:multipleSelect', this.afterChangeScrollTop);
            this.listenTo(this.model, 'toggle:multipleSelect', this.changeScrollTop);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({ computed: true }),
                noIssue: this.noIssue,
                isCollapsedMethod: this.isCollapsedMethod()
            }));
            this.renderDuration();
            this.renderStartTime();
            this.renderRetries();
            if (this.hasIssue() && !this.noIssue) {
                this.renderIssue();
            }
        },
        highlightItem: function () {
            var self = this;
            this.$el.prepend('<div class="highlight"></div>');
            config.mainScrollElement.animate({ scrollTop: this.el.offsetTop }, 500, function () {
                self.$el.addClass('hide-highlight');
            });
        },
        renderStartTime: function () {
            this.startTime && this.startTime.destroy();
            this.startTime = new ItemStartTimeView({
                model: this.model
            });
            $('[data-js-start-time-container]', this.$el).html(this.startTime.$el);
        },
        renderDuration: function () {
            this.duration && this.duration.destroy();
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-item-status]', this.$el)
            });
        },
        // toggleStartTimeView: function () {
        //     this.model.collection.trigger('change:time:format');
        // },
        isCollapsedMethod: function () {
            return this.model.get('type') !== 'STEP' && this.model.get('status') !== 'FAILED';
        },
        hasIssue: function () {
            var issue = this.model.get('issue');
            return !!issue;
        },
        renderIssue: function () {
            this.issueView = new StepLogDefectTypeView({
                model: this.model,
                el: $('[data-js-step-issue]', this.$el),
                context: this.context
            });
            this.listenTo(this.issueView, 'load:comment', this.activateAccordion);
            this.listenTo(this.issueView, 'quickFilter:AA', function () {
                this.filterModel.trigger('add_entity', 'issue$auto_analyzed', 'TRUE');
            });
            this.listenTo(this.issueView, 'quickFilter:ignoreAA', function () {
                this.filterModel.trigger('add_entity', 'issue$ignore_analyzer', 'TRUE');
            });
        },
        onClickTag: function (e) {
            var tag = $(e.currentTarget).data('js-tag');
            this.filterModel && this.addFastFilter('tags', tag);
        },
        addFastFilter: function (filterId, value) {
            this.filterModel.trigger('add_entity', filterId, value);
        },
        onClickEdit: function () {
            config.trackingDispatcher.trackEventNumber(149);
            var modal = new ModalLaunchItemEdit({
                item: this.model
            });
            modal.show();
        },
        onClickDetails: function () {
            var modal = new ModalStepItemDetails({
                model: this.model
            });
            modal.show();
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
            config.trackingDispatcher.trackEventNumber(152);
            if (e.ctrlKey && e.altKey) {
                this.model.trigger('check:before:items', this.model.get('id'));
            }
        },
        activateAccordion: function () {
            if (this.$el.innerHeight() > 198) {
                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        },
        onClickOpen: function () {
            this.$el.toggleClass('open');
        },
        onDestroy: function () {
            this.issueView && this.issueView.destroy();
            this.duration && this.duration.destroy();
            this.duration && this.duration.destroy();
            this.markdownViewer && this.markdownViewer.destroy();
            this.$el.html('');
            delete this;
        }
    });

    return StepItemView;
});
