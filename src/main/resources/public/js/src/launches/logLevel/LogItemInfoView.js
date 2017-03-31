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

    var StepLogDefectTypeView = require('launches/common/StepLogDefectTypeView');

    var LogItemInfoStackTraceView = require('launches/logLevel/LogItemInfoStackTraceView');
    var LogItemInfoDetailsView = require('launches/logLevel/LogItemInfoDetailsView');
    var LogItemInfoActivity = require('launches/logLevel/LogItemInfoActivity');
    var LogItemInfoAttachmentsView = require('launches/logLevel/LogItemInfoAttachments');
    var App = require('app');
    var PostBugAction = require('launches/multipleActions/postBugAction');
    var LoadBugAction = require('launches/multipleActions/loadBugAction');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Localization = require('localization');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;

    var config = App.getInstance();

    var LogItemInfoView = Epoxy.View.extend({
        template: 'tpl-launch-log-item-info',

        events: {
            'click [data-js-item-stack-trace-label]': function () {
                config.trackingDispatcher.trackEventNumber(200);
                this.toggleModelField('stackTrace');
            },
            'click [data-js-item-gallery-label]': function () {
                config.trackingDispatcher.trackEventNumber(201);
                this.toggleModelField('attachments')
            },
            'click [data-js-item-details-label]': function () {
                config.trackingDispatcher.trackEventNumber(202);
                this.toggleModelField('itemDetails')
            },
            'click [data-js-item-activity-label]': function () {
                config.trackingDispatcher.trackEventNumber(203);
                this.toggleModelField('activity')
            },
            'click [data-js-match]': 'onClickMatch',
            'click [data-js-post-bug]': 'onClickPostBug',
            'click [data-js-load-bug]': 'onClickLoadBug',
            'mouseenter [data-js-item-stack-trace-label]': function(){
                config.trackingDispatcher.trackEventNumber(196);
            },
            'mouseenter [data-js-item-gallery-label]': function(){
                config.trackingDispatcher.trackEventNumber(197);
            },
            'mouseenter [data-js-item-details-label]': function(){
                config.trackingDispatcher.trackEventNumber(198);
            },
            'mouseenter [data-js-item-activity-label]': function(){
                config.trackingDispatcher.trackEventNumber(199);
            }
        },

        bindings: {
            '[data-js-item-stack-trace-label]': 'classes: {active: stackTrace}',
            '[data-js-item-gallery-label]': 'classes: {active: attachments}',
            '[data-js-item-details-label]': 'classes: {active: itemDetails}',
            '[data-js-item-activity-label]': 'classes: {active: activity}',
            '[data-js-item-stack-trace]': 'classes: {hide: not(stackTrace)}',
            '[data-js-item-gallery]': 'classes: {hide: not(attachments)}',
            '[data-js-item-details]': 'classes: {hide: not(itemDetails)}',
            '[data-js-item-activity]': 'classes: {hide: not(activity)}',
            '[data-js-match]': 'classes: {hide: not(parent_launch_investigate), disabled: not(validateMatchIssues)}, attr: {title: matchIssuesTitle}',
            '[data-js-post-bug]': 'classes: {disabled: validatePostBug}, attr: {title: postBugTitle}',
            '[data-js-load-bug]': 'classes: {disabled: validateLoadBug}, attr: {title: loadBugTitle}',
        },

        computeds: {
            validateMatchIssues: {
                deps: ['parent_launch_isProcessing', 'parent_launch_status'],
                get: function(parent_launch_isProcessing, parent_launch_status) {
                    return (!parent_launch_isProcessing && parent_launch_status != config.launchStatus.inProgress)
                }
            },
            matchIssuesTitle: {
                deps: ['parent_launch_isProcessing', 'parent_launch_status'],
                get: function(parent_launch_isProcessing, parent_launch_status) {
                    if(parent_launch_status == config.launchStatus.inProgress) {
                        return Localization.launches.launchNotInProgress;
                    }
                    if (parent_launch_isProcessing) {
                        return Localization.launches.launchIsProcessing;
                    }
                    return Localization.launches.matchTitle;
                }
            },
            validateLoadBug: {
                deps: ['launch_isProcessing'],
                get: function () {
                    return this.viewModel.validate.loadbug();
                }
            },
            validatePostBug: {
                deps: ['launch_isProcessing'],
                get: function () {
                    return this.viewModel.validate.postbug();
                }
            },
            postBugTitle: {
                deps: ['issue', 'validatePostBug'],
                get: function (issue, validatePostBug) {
                    if (validatePostBug) {
                        return validatePostBug;
                    }
                    return Localization.launches.postBug;
                }
            },
            loadBugTitle: {
                deps: ['issue', 'validateLoadBug'],
                get: function (issue, validateLoadBug) {
                    if (validateLoadBug) {
                        return validateLoadBug;
                    }
                    return Localization.launches.loadBug;
                }
            },
        },

        initialize: function (options) {
            this.context = options.context;
            this.appModel = new SingletonAppModel();
            this.viewModel = options.itemModel;
            this.launchModel = options.launchModel;
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    stackTrace: false,
                    attachments: false,
                    itemDetails: false,
                    activity: false,
                }
            }));
            this.listenTo(this.model, 'change:stackTrace change:attachments change:itemDetails change:activity', this.onChangeTabModel);
            this.listenTo(this.launchModel, 'change:isProcessing', this.onChangeLaunchProcessing);
            this.listenTo(this.viewModel, 'change:issue', this.onChangeIssue);
            this.onChangeLaunchProcessing();
            this.render();
            if(this.validateForIssue()){
                this.issueView = new StepLogDefectTypeView({
                    model: this.viewModel,
                    pageType: 'logs',
                    el: $('[data-js-step-issue]', this.$el)
                });
            }
            this.stackTrace = new LogItemInfoStackTraceView({
                el: $('[data-js-item-stack-trace]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model,
            });
            this.details = new LogItemInfoDetailsView({
                el: $('[data-js-item-details]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model,
            });
            this.activity = new LogItemInfoActivity({
                el: $('[ data-js-item-activity]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model,
            });
            this.attachments = new LogItemInfoAttachmentsView({
                el: $('[data-js-item-gallery]', this.$el),
                itemModel: this.viewModel,
                parentModel: this.model,
            });
            this.listenTo(this.stackTrace, 'goToLog', this.goToLog);
        },
        goToLog: function(logId) {
            this.trigger('goToLog', logId);
        },
        endGoToLog: function() {
            this.stackTrace.endGoToLog();
        },
        goToAttachment: function(logId) {
            var self = this;
            config.mainScrollElement.animate({ scrollTop: this.el.offsetTop}, 500, function() {
                self.attachments.goToAttachmentsPrev();
                self.model.set({attachments: true});
                self.attachments.goToAttachments(logId);
            });

        },
        onChangeIssue: function () {
            this.trigger('change:issue');
        },
        onChangeLaunchProcessing: function() {
            this.viewModel.set({parent_launch_isProcessing: this.launchModel.get('isProcessing')});
        },
        validateForIssue: function(){
            return !!this.viewModel.get('issue');
        },
        onClickPostBug: function () {
            config.trackingDispatcher.trackEventNumber(193);
            PostBugAction({items: [this.viewModel], from: 'logs'});
        },
        onClickLoadBug: function () {
            config.trackingDispatcher.trackEventNumber(194);
            LoadBugAction({items: [this.viewModel], from: 'logs'});
        },
        onClickMatch: function () {
            config.trackingDispatcher.trackEventNumber(195);
            var self = this;
            call('POST', Urls.launchMatchUrl(this.viewModel.get('launchId')))
                .done(function (response) {
                    self.launchModel.set({isProcessing: true});
                    Util.ajaxSuccessMessenger("startAnalyzeAction");
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "startAnalyzeAction");
                })
        },
        onChangeTabModel: function(model, value) {
            if (value) {
                this.model.set(_.extend(_.clone(this.model.defaults), model.changed));
            }
        },
        toggleModelField: function (field) {
            this.model.set(field, !this.model.get(field));
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {context: this.context}));
        },

        destroy: function () {
            this.issueView && this.issueView.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    })

    return LogItemInfoView;
});
