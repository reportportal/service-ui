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
    var DefectEditorView = require('launches/stepLevel/DefectEditorView');

    var StepItemIssueView = require('launches/stepLevel/StepItemIssueView');
    var LogItemInfoStackTraceView = require('launches/logLevel/LogItemInfoStackTraceView');
    var LogItemInfoDetailsView = require('launches/logLevel/LogItemInfoDetailsView');
    var LogItemInfoActivity = require('launches/logLevel/LogItemInfoActivity');
    var LogItemInfoAttachmentsView = require('launches/logLevel/LogItemInfoAttachments');
    var App = require('app');
    var ModalLoadBug = require('modals/modalLoadBug');
    var ModalPostBug = require('modals/modalPostBug');
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
                this.toggleModelField('stackTrace')
            },
            'click [data-js-item-gallery-label]': function () {
                this.toggleModelField('attachments')
            },
            'click [data-js-item-details-label]': function () {
                this.toggleModelField('itemDetails')
            },
            'click [data-js-item-activity-label]': function () {
                this.toggleModelField('activity')
            },
            'click [data-js-step-issue]': 'showDefectEditor',
            'click [data-js-match]': 'onClickMatch',
            'click [data-js-post-bug]': 'onClickPostBug',
            'click [data-js-load-bug]': 'onClickLoadBug'
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
            '[data-js-match]': 'classes: {hide: not(parent_launch_investigate)}',
            '[data-js-post-bug]': 'classes: {disabled: any(btsNotConfigured, notHaveIssue)}, attr: {title: postBugTitle}',
            '[data-js-load-bug]': 'classes: {disabled: any(btsNotCreate, notHaveIssue)}, attr: {title: loadBugTitle}',
        },

        computeds: {
            btsNotCreate: {
                deps: [],
                get: function () {
                    var configuration = this.appModel.get('configuration');
                    if (!configuration) {
                        return true;
                    }
                    if (configuration.externalSystem && configuration.externalSystem.length) {
                        return false;
                    }
                    return true;
                }
            },
            btsNotConfigured: {
                deps: ['btsNotCreate'],
                get: function (btsNotCreate) {
                    if (btsNotCreate) {
                        return true;
                    }
                    var configuration = this.appModel.get('configuration');
                    if (_.any(configuration.externalSystem, function (bts) {
                            return bts.fields && bts.fields.length;
                        })) {
                        return false;
                    }
                    return true;
                }
            },
            notHaveIssue: {
                deps: ['issue'],
                get: function () {
                    var issue = this.viewModel.getIssue();
                    if (issue && issue.issue_type) {
                        return false;
                    }
                    return true;
                }
            },
            postBugTitle: {
                deps: ['btsNotConfigured', 'notHaveIssue'],
                get: function (btsNotConfigured, notHaveIssue) {
                    if (btsNotConfigured) {
                        return Localization.launches.configureTBS;
                    } else if (notHaveIssue) {
                        return Localization.launches.noIssues;
                    } else {
                        return Localization.launches.postBug;
                    }
                }
            },
            loadBugTitle: {
                deps: ['btsNotCreate', 'notHaveIssue'],
                get: function (btsNotCreate, notHaveIssue) {
                    if (btsNotCreate) {
                        return Localization.launches.configureTBSLoad;
                    } else if (notHaveIssue) {
                        return Localization.launches.noIssuesLoad;
                    } else {
                        return Localization.launches.loadBug;
                    }
                }
            },
        },

        initialize: function (options) {
            this.appModel = new SingletonAppModel()
            this.viewModel = options.itemModel;
            this.model = new Epoxy.Model({
                stackTrace: false,
                attachments: false,
                itemDetails: false,
                activity: false,
            });
            this.render();
            // this.issueView = new StepItemIssueView({
            //     model: this.viewModel,
            //     $container: $('[data-js-step-issue]', this.$el)
            // });
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
        },
        showDefectEditor: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            if (!el.hasClass('disabled')) {
                this.setupEditor();
                this.onShowEditor();
            }
            e.stopPropagation();
        },
        setupEditor: function () {
            this.removeEditor();
            this.$editor = new DefectEditorView({
                origin: $('[data-js-log-defect-editor]', this.$el),
                model: this.viewModel
            });
            this.listenTo(this.$editor, 'defect::editor::hide', this.onHideEditor);
        },
        onShowEditor: function () {
            $('[data-js-item-info-issue]', this.$el).hide();
        },
        onHideEditor: function () {
            $('[data-js-item-info-issue]', this.$el).show();
        },
        removeEditor: function () {
            if (this.$editor) {
                this.$editor.destroy();
                this.$editor = null;
            }
        },
        onClickPostBug: function () {
            var modal = new ModalPostBug({
                items: [this.viewModel],
            });
            modal.render();
        },
        onClickLoadBug: function () {
            var modal = (new ModalLoadBug({
                items: [this.viewModel],
            }));
            modal.show();
        },
        onClickMatch: function () {
            var self = this;
            call('POST', Urls.launchMatchUrl(this.viewModel.get('launchId')))
                .done(function (response) {
                    self.viewModel.set('isProcessing', true);
                    Util.ajaxSuccessMessenger("startAnalyzeAction");
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "startAnalyzeAction");
                })
        },
        toggleModelField: function (field) {
            this.model.set(field, !this.model.get(field));
        },

        render: function () {
            this.$el.html(Util.templates(this.template), {});
        },

        destroy: function () {
            this.issueView && this.issueView.destroy();
            this.removeEditor();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    })

    return LogItemInfoView;
});