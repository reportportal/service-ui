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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');

    var StepLogDefectTypeView = require('launches/common/StepLogDefectTypeView');

    var LogItemInfoStackTraceView = require('launches/logLevel/LogItemInfoTabs/LogItemInfoStackTraceView');
    var LogItemInfoDetailsView = require('launches/logLevel/LogItemInfoTabs/LogItemInfoDetailsView');
    var LogItemInfoActivity = require('launches/logLevel/LogItemInfoTabs/LogItemInfoActivity');
    var LogItemInfoAttachmentsView = require('launches/logLevel/LogItemInfoTabs/LogItemInfoAttachments');
    var LogItemInfoParametresView = require('launches/logLevel/LogItemInfoTabs/LogItemInfoParametresView');
    var LogItemInfoLastAction = require('launches/logLevel/LogItemInfoTabs/LogItemInfoLastAction');
    var App = require('app');
    var _ = require('underscore');

    var config = App.getInstance();

    var LogItemInfoTabsView = Epoxy.View.extend({
        template: 'tpl-launch-log-item-info-tabs',
        className: 'launch-log-item-info-tabs',

        events: {
            'click [data-js-item-stack-trace-label]': function () {
                config.trackingDispatcher.trackEventNumber(200);
                this.toggleModelField('stackTrace');
            },
            'click [data-js-item-gallery-label]': function () {
                config.trackingDispatcher.trackEventNumber(201);
                this.toggleModelField('attachments');
            },
            'click [data-js-item-details-label]': function () {
                config.trackingDispatcher.trackEventNumber(202);
                this.toggleModelField('itemDetails');
            },
            'click [data-js-item-activity-label]': function () {
                config.trackingDispatcher.trackEventNumber(203);
                this.toggleModelField('activity');
            },
            'click [data-js-item-parametres-label]': function () {
                this.toggleModelField('parametres');
                this.scroll = Util.setupBaronScroll($('[data-js-item-parametres-container] table', this.$el), null, { direction: 'm' });
                Util.setupBaronScrollSize(this.scroll, { maxHeight: 445 });
                $(window).resize(); // for scroll rerender
            }
        },

        bindings: {
            '[data-js-item-stack-trace-label]': 'classes: {active: stackTrace}',
            '[data-js-item-gallery-label]': 'classes: {active: attachments}',
            '[data-js-item-details-label]': 'classes: {active: itemDetails}',
            '[data-js-item-parametres-label]': 'classes: {active: parametres}',
            '[data-js-item-activity-label]': 'classes: {hide: isShowActivities, active: activity}',
            '[data-js-item-stack-trace]': 'classes: {hide: not(stackTrace)}',
            '[data-js-item-gallery]': 'classes: {hide: not(attachments)}',
            '[data-js-item-details]': 'classes: {hide: not(itemDetails)}',
            '[data-js-item-activity]': 'classes: {hide: not(activity)}',
            '[data-js-item-parametres]': 'classes: {hide: not(parametres)}'
        },

        computeds: {
            isShowActivities: function () {
                return !(this.lastRunItemId === this.viewModel.get('id'));
            }
        },
        initialize: function (options) {
            this.context = options.context;
            this.viewModel = options.itemModel;
            this.lastRunItemId = options.lastRunItemId;
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    stackTrace: false,
                    attachments: false,
                    itemDetails: false,
                    activity: false,
                    parametres: false
                }
            }))();
            this.listenTo(this.model, 'change:stackTrace change:attachments change:itemDetails change:activity change:parametres', this.onChangeTabModel);
            this.render();
            if (this.validateForIssue()) {
                this.issueView = new StepLogDefectTypeView({
                    model: this.viewModel,
                    pageType: 'logs',
                    el: $('[data-js-step-issue]', this.$el),
                    context: this.context
                });
            }
            this.stackTrace = new LogItemInfoStackTraceView({
                el: $('[data-js-item-stack-trace]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model
            });
            this.details = new LogItemInfoDetailsView({
                el: $('[data-js-item-details]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model
            });
            this.activity = new LogItemInfoActivity({
                el: $('[ data-js-item-activity]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model
            });
            this.attachments = new LogItemInfoAttachmentsView({
                el: $('[data-js-item-gallery]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model
            });
            this.parametres = new LogItemInfoParametresView({
                el: $('[data-js-item-parametres]', this.$el),
                model: this.viewModel
            });
            this.applyBindings();
            if (!this.getBinding('isShowActivities')) {
                this.latest = new LogItemInfoLastAction({
                    itemModel: this.viewModel
                });
                $('[data-js-latest-container]', this.$el).html(this.latest.$el);
            }

            this.listenTo(this.stackTrace, 'goToLog', this.goToLog);
            this.listenTo(this.attachments, 'click:attachment', this.onClickAttachment);
        },
        onClickAttachment: function (model) {
            this.trigger('click:attachment', model);
        },
        goToLog: function (logId) {
            this.trigger('goToLog', logId);
        },
        endGoToLog: function () {
            this.stackTrace.endGoToLog();
        },
        goToAttachment: function (logId) {
            var self = this;
            config.mainScrollElement.animate({ scrollTop: this.el.offsetTop }, 500, function () {
                self.attachments.goToAttachmentsPrev();
                self.model.set({ attachments: true });
                self.attachments.goToAttachments(logId);
            });
        },
        validateForIssue: function () {
            return !!this.viewModel.get('issue');
        },
        onChangeTabModel: function (model, value) {
            if (value) {
                this.model.set(_.extend(_.clone(this.model.defaults), model.changed));
            }
        },
        toggleModelField: function (field) {
            this.model.set(field, !this.model.get(field));
        },

        render: function () {
            this.$el.html(Util.templates(this.template));
        },

        onDestroy: function () {
            this.stackTrace && this.stackTrace.destroy();
            this.details && this.details.destroy();
            this.activity && this.activity.destroy();
            this.attachments && this.attachments.destroy();
            this.latest && this.latest.destroy();
        }
    });

    return LogItemInfoTabsView;
});
