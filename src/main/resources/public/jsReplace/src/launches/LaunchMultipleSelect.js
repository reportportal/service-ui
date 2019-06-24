/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var Util = require('util');
    var MergeAction = require('launches/multipleActions/mergeAction');
    var CompareAction = require('launches/multipleActions/compareAction');
    var EditDefectAction = require('launches/multipleActions/editDefectAction');
    var ForceFinishAction = require('launches/multipleActions/forceFinishAction');
    var RemoveAction = require('launches/multipleActions/removeAction');
    var ChangeModeAction = require('launches/multipleActions/changeModeAction');
    var PostBugAction = require('launches/multipleActions/postBugAction');
    var IgnoreAAAction = require('launches/multipleActions/ignoreAAAction');
    var IncludeAAAction = require('launches/multipleActions/includeAAAction');
    var LoadBugAction = require('launches/multipleActions/loadBugAction');
    var UnlinkIssueAction = require('launches/multipleActions/unlinkIssueAction');
    var Localization = require('localization');

    var config = App.getInstance();

    var LaunchMultipleSelectItem = Epoxy.View.extend({
        className: 'multi-select-item',
        template: 'tpl-launch-multiple-selected-item',

        events: {
            'click [data-ja-close-item]': 'onClickClose'
        },

        bindings: {
            '[data-js-item-name]': 'text: format("$1$2", name, numberText)',
            ':el': 'attr: {title: invalidMessage}, classes: {"error-validate": invalidMessage}'
        },

        initialize: function () {
            this.render();
            this.listenTo(this.model, 'remove', this.destroy);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickClose: function () {
            var type = this.model.get('type');
            switch (type) {
            case 'LAUNCH':
                config.trackingDispatcher.trackEventNumber(67);
                break;
            case 'SUITE':
            case 'TEST':
                config.trackingDispatcher.trackEventNumber(100.2);
                break;
            default:
                config.trackingDispatcher.trackEventNumber(161);
            }
            this.model.trigger('deleteTicket', this.model);
            this.model.set({ select: false, invalidMessage: '' });
        },
        onDestroy: function () {
            this.$el.remove();
        }
    });

    var SelectedItemsCollection = Backbone.Collection.extend({
        model: LaunchSuiteStepItemModel
    });


    var LaunchMultipleSelectView = Epoxy.View.extend({
        template: 'tpl-launch-multiple-selected',

        events: {
            'click [data-ja-close]': 'onClickClose',
            'click [data-js-proceed]': 'onClickProceed'
        },

        actionValidators: {
            merge: function () {
                if (this.collection.models.length === 1) {
                    this.collection.models[0].set({
                        invalidMessage: Localization.launches.selectMoreItem
                    });
                } else {
                    _.each(this.collection.models, function (model) {
                        model.set({ invalidMessage: model.validate.merge() });
                    });
                }
            },
            compare: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: '' });
                });
            },
            editdefect: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.editDefect() });
                });
            },
            changemode: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.changeMode() });
                });
            },
            forcefinish: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.forceFinish() });
                });
            },
            remove: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.remove() });
                });
            },
            postbug: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.postbug() });
                });
            },
            loadbug: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.loadbug() });
                });
            },
            unlinkIssue: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.unlinkIssue() });
                });
            },
            includeaa: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.includeaa() });
                });
            },
            ignoreaa: function () {
                _.each(this.collection.models, function (model) {
                    model.set({ invalidMessage: model.validate.ignoreaa() });
                });
            }
        },
        actionCall: {
            merge: function () {
                var self = this;
                this.mergeAction = new MergeAction({
                    items: this.collection.models
                });
                this.mergeAction.getAsync().done(function () {
                    self.collectionItems.load();
                    self.mergeAction = null;
                    self.reset();
                });
            },
            compare: function () {
                var self = this;
                this.compareAction = new CompareAction({
                    items: this.collection.models
                });
                this.compareAction.getAsync().done(function () {
                    self.compareAction = null;
                    self.reset();
                });
            },
            editdefect: function () {
                var self = this;
                this.editDefectAction = new EditDefectAction({
                    items: this.collection.models
                });
                this.editDefectAction.getAsync().done(function (actionType) {
                    if (actionType && actionType.action === 'postBug') {
                        self.actionCall.postbug.call(self);
                    } else if (actionType && actionType.action === 'loadBug') {
                        self.actionCall.loadbug.call(self);
                    } else if (actionType && actionType.action === 'unlinkIssue') {
                        self.setAction('unlinkIssue');
                    } else {
                        self.collectionItems.load();
                        self.reset();
                    }
                    self.editDefectAction = null;
                });
            },
            changemode: function () {
                var self = this;
                ChangeModeAction({ items: this.collection.models }).done(function () {
                    self.collectionItems.load(true);
                    self.reset();
                });
            },
            forcefinish: function () {
                var self = this;
                ForceFinishAction({ items: this.collection.models }).done(function () {
                    self.collectionItems.load();
                    self.reset();
                });
            },
            remove: function () {
                var parentModel;
                var self = this;
                RemoveAction({ items: this.collection.models }).done(function () {
                    self.compareAction = null;
                    self.collectionItems.load(true);
                    parentModel = self.collectionItems.parentModel
                        || self.collectionItems.launchModel;
                    if (parentModel) {
                        _.each(parentModel.collection.models, function (model) {
                            model.updateData(true);
                        });
                    }
                    self.reset();
                });
            },
            postbug: function () {
                var self = this;
                PostBugAction({ items: this.collection.models }).done(function () {
                    self.reset();
                });
            },
            loadbug: function () {
                var self = this;
                LoadBugAction({ items: this.collection.models }).done(function () {
                    self.reset();
                });
            },
            unlinkIssue: function () {
                var self = this;
                this.unlinkIssueAction = new UnlinkIssueAction({
                    items: this.collection.models
                });
                this.unlinkIssueAction.getAsync().done(function () {
                    self.collectionItems.load();
                    self.reset();
                });
            },
            includeaa: function () {
                var self = this;
                this.includeAAAction = new IncludeAAAction({
                    items: this.collection.models
                });
                this.includeAAAction.getAsync().done(function () {
                    self.collectionItems.load();
                    self.includeAAAction = null;
                    self.reset();
                });
            },
            ignoreaa: function () {
                var self = this;
                this.ignoreAAAction = new IgnoreAAAction({
                    items: this.collection.models
                });
                this.ignoreAAAction.getAsync().done(function () {
                    self.collectionItems.load();
                    self.ignoreAAAction = null;
                    self.reset();
                });
            }
        },

        initialize: function (options) {
            this.collectionItems = options.collectionItems;
            this.collection = new SelectedItemsCollection();
            this.activate = false;
            this.render();
            this.listenTo(this.collectionItems, 'change:select', this.onChangeSelect);
            this.listenTo(this.collectionItems, 'reset', this.onResetCollectionItems);
            this.listenTo(this.collection, 'change:select', this.onUnCheckItem);
            this.listenTo(this.collection, 'add', this.onAddItem);
            this.listenTo(this.collection, 'deleteTicket', this.onDeleteTicket);
            this.currentAction = '';
            this.scrollItems = Util.setupBaronScroll($('[data-js-multi-select-items]', this.$el));
        },
        onChangeSelect: function (model, select) {
            if (select) {
                !this.collection.get(model.get('id')) && this.collection.add(model);
            } else {
                this.collection.remove(model.get('id'));
            }
            this.checkStatus(model);
            Util.setupBaronScrollSize(this.scrollItems, { maxHeight: 120 });
            this.scrollItems.scrollTop(this.scrollItems.get(0).scrollHeight);
        },
        onDeleteTicket: function (ticketModel) {
            var commonModel = this.collectionItems.get(ticketModel.get('id'));
            this.collection.remove(ticketModel);
            commonModel && commonModel.set('select', false);
        },
        onResetCollectionItems: function () {
            var self = this;
            _.each(this.collection.models, function (model) {
                var commonModel = self.collectionItems.get(model.get('id'));
                commonModel && commonModel.set({ select: true });
            });
        },
        checkStatus: function (model) {
            model.trigger('before:toggle:multipleSelect');
            if (this.collection.models.length && !this.activate) {
                this.trigger('activate:true');
                this.activate = true;
            }
            if (!this.collection.models.length && this.activate) {
                this.trigger('activate:false');
                this.activate = false;
            }
            model.trigger('toggle:multipleSelect');
        },
        onUnCheckItem: function (model) {
            var commonModel = this.collectionItems.get(model.get('id'));
            model.set({ invalidMessage: '' });
            if (!commonModel) {
                this.collection.remove(model);
                this.checkStatus(model);
            }
            if (this.currentAction) {
                this.actionValidators[this.currentAction].call(this);
                this.checkInvalidStatus();
            }
        },
        checkInvalidStatus: function () {
            var processBtn;
            var action;
            var answer = true;
            _.each(this.collection.models, function (model) {
                if (model.get('invalidMessage') !== '') {
                    answer = false;
                    return false;
                }
                return true;
            });
            if (answer) {
                this.$el.removeClass('invalid-state');
                this.currentAction = '';
            } else {
                processBtn = $('[data-js-proceed]', this.$el);
                action = _.every(this.collection.toJSON(), function (m) { return m.invalidMessage; }) ? 'addClass' : 'removeClass';
                processBtn[action]('disabled');
                this.$el.addClass('invalid-state');
            }
            return answer;
        },
        setAction: function (actionName) {
            if (this.actionValidators[actionName]) {
                this.actionValidators[actionName].call(this);
                this.currentAction = actionName;
                if (this.checkInvalidStatus()) {
                    this.actionCall[actionName].call(this);
                }
            }
        },
        reset: function () {
            var model;
            var commonModel;
            while (this.collection.models.length) {
                model = this.collection.at(0);
                if (model.get('select')) {
                    model.set({ select: false });
                } else {
                    commonModel = this.collectionItems.get(model.get('id'));
                    commonModel && commonModel.set({ issue: model.get('issue') });
                    this.collection.remove(model);
                    this.checkStatus(model);
                }
            }
        },
        resetDefaultState: function () {
            this.reset();
            this.currentAction = '';
            this.checkInvalidStatus();
        },
        onClickProceed: function () {
            var self = this;
            var invalidItems = _.filter(this.collection.models, function (model) {
                return model.get('invalidMessage') !== '';
            });
            this.collectionItems.checkType()
                .done(function (data) {
                    switch (data) {
                    case 'LAUNCH':
                        config.trackingDispatcher.trackEventNumber(70);
                        break;
                    case 'SUITE':
                    case 'TEST':
                        config.trackingDispatcher.trackEventNumber(100.4);
                        break;
                    default:
                        config.trackingDispatcher.trackEventNumber(162);
                    }
                });
            _.each(invalidItems, function (model) {
                var commonModel = self.collectionItems.get(model.id);
                model.set({ select: false });
                if (self.currentAction === 'unlinkIssue' && commonModel && self.collectionItems.length) {
                    commonModel.set('select', false);
                }
            });
            this.setAction(this.currentAction);
        },
        onClickClose: function () {
            this.collectionItems.checkType()
                .done(function (data) {
                    switch (data) {
                    case 'LAUNCH':
                        config.trackingDispatcher.trackEventNumber(68);
                        break;
                    case 'SUITE':
                    case 'TEST':
                        config.trackingDispatcher.trackEventNumber(100.3);
                        break;
                    default:
                        config.trackingDispatcher.trackEventNumber(161);
                    }
                });
            this.reset();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onAddItem: function (model) {
            $('[data-js-multi-select-items]', this.$el).append((new LaunchMultipleSelectItem({ model: model })).$el);
        },
        onDestroy: function () {
            this.collection.destroy();
            this.$el.html('');
        }
    });

    return LaunchMultipleSelectView;
});
