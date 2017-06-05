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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var LogHistoryLine = require('launches/logLevel/LogHistoryLine');
    var LogItemInfoView = require('launches/logLevel/LogItemInfoView');
    var LogItemLogsTable = require('launches/logLevel/LogItemLogsTable');
    var Urls = require('dataUrlResolver');
    var ModalLogAttachmentImage = require('modals/modalLogAttachmentImage');
    var ModalLogAttachmentBinary = require('modals/modalLogAttachmentBinary');

    var config = App.getInstance();

    var LogBodyView = Epoxy.View.extend({
        template: 'tpl-launch-log-body',

        initialize: function (options) {
            this.context = options.context;
            this.collectionItems = options.collectionItems;
            this.launchModel = options.launchModel;
            this.render();
            this.listenTo(this.collectionItems, 'change:log:item', this.onChangeLogItem);
            this.listenTo(this.collectionItems, 'update:logs', this.onChangeLogItem);
            this.onChangeLogItem();

            if (this.context === 'userdebug') {
                this.$el.find('[data-js-log-item-container]').addClass('debug-mode');
            }
            this.supportedLogBinary = ['xml', 'javascript', 'json', 'css', 'php'];
        },
        onChangeLogItem: function () {
            $('[data-js-log-item-container]', this.$el).removeClass('not-found');
            $('[data-js-log-item-container]', this.$el).addClass('load');
            this.history && this.off(this.history);
            this.history && this.history.destroy();
            this.historyItem && this.historyItem.destroy();
            this.logsItem && this.logsItem.destroy();
            if (!this.collectionItems.get(this.collectionItems.getInfoLog().item)) {
                $('[data-js-log-item-container]', this.$el).addClass('not-found');
                $('[data-js-log-item-container]', this.$el).removeClass('load');
            } else {
                this.history = new LogHistoryLine({
                    el: $('[data-js-history-line]', this.$el),
                    collectionItems: this.collectionItems,
                    launchModel: this.launchModel
                });
                this.listenTo(this.history, 'load:history', this.onLoadHistory);
                this.listenTo(this.history, 'activate:item', this.selectHistoryItem);
            }
        },
        onLoadHistory: function () {
            $('[data-js-log-item-container]', this.$el).removeClass('load');
        },
        selectHistoryItem: function (itemModel, firstInit) {
            var curOptions = this.collectionItems.getInfoLog();
            var itemModelFromCollection;
            curOptions.history = itemModel.get('id');
            this.collectionItems.setInfoLog(curOptions);
            !firstInit && config.router.navigate(
                this.collectionItems.getPathByLogItemId(curOptions.item), { trigger: false }
            );
            itemModelFromCollection = this.collectionItems.get(itemModel.id);
            if (itemModelFromCollection) {
                itemModel.set('path_names', itemModelFromCollection.get('path_names'));
            }

            this.historyItem && this.stopListening(this.historyItem) && this.historyItem.destroy();
            this.historyItem = new LogItemInfoView({
                el: $('[data-js-item-info]', this.$el),
                context: this.context,
                itemModel: itemModel,
                launchModel: this.launchModel,
                supportedLogBinary: this.supportedLogBinary
            });
            this.listenTo(this.historyItem, 'goToLog', this.goToLog);
            this.listenTo(this.historyItem, 'change:issue', this.onChangeItemIssue);
            this.listenTo(this.historyItem, 'click:attachment', this.onClickAttachments);
            this.logsItem && this.stopListening(this.logsItem) && this.logsItem.destroy();
            this.logsItem = new LogItemLogsTable({
                el: $('[data-js-item-logs]', this.$el),
                itemModel: itemModel,
                collectionItems: this.collectionItems,
                mainPath: this.collectionItems.getPathByLogItemId(curOptions.item),
                options: this.collectionItems.getInfoLog(),
                supportedLogBinary: this.supportedLogBinary
            });
            this.listenTo(this.logsItem, 'goToLog:end', this.onEndGoToLog);
            this.listenTo(this.logsItem, 'click:attachment', this.onClickAttachments);
        },
        onChangeItemIssue: function () {
            _.each(this.launchModel.collection.models, function (model) {
                if (model.get('level')) {
                    model.updateData(true);
                }
            });
        },
        goToLog: function (logId) {
            this.logsItem && this.logsItem.goToLog(logId);
        },
        onClickAttachments: function (model) {
            var contentType = model.get('binary_content').content_type;
            var binaryId = model.get('binary_content').id;
            var language = contentType.split('/')[1];
            var isImage = contentType.indexOf('image/') > -1;
            var isValidForModal = _.contains(this.supportedLogBinary, language) || isImage;
            var modal;
            var url;

            if (isValidForModal) {
                if (isImage) {
                    modal = new ModalLogAttachmentImage({
                        imageId: binaryId
                    });
                    modal.show();
                } else {
                    modal = new ModalLogAttachmentBinary({
                        binaryId: binaryId,
                        language: language,
                        supportedLanguages: this.supportedLogBinary
                    });
                    modal.show();
                }
            } else {
                url = Urls.getFileById(binaryId);
                window.open(url);
            }
        },
        onEndGoToLog: function () {
            this.historyItem.endGoToLog();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, { context: this.context }));
        },
        onDestroy: function () {
            this.history && this.history.destroy();
            this.historyItem && this.historyItem.destroy();
            this.logsItem && this.logsItem.destroy();
            this.$el.html('');
        }
    });
    return LogBodyView;
});
