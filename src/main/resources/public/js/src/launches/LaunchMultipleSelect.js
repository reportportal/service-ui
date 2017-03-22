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
define(function (require, exports, module) {
    'use strict';

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

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
    var LoadBugAction = require('launches/multipleActions/loadBugAction');

    var config = App.getInstance();

    var LaunchMultipleSelectItem = Epoxy.View.extend({
        className: 'multi-select-item',
        template: 'tpl-launch-multiple-selected-item',

        events: {
            'click [data-ja-close-item]': 'onClickClose',
        },

        bindings: {
            '[data-js-item-name]': 'text: format("$1$2", name, numberText)',
            ':el': 'attr: {title: invalidMessage}, classes: {"error-validate": invalidMessage}',
        },

        initialize: function() {
            this.render();
            this.listenTo(this.model, 'remove', this.destroy);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickClose: function() {
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

            this.model.set({select: false, invalidMessage: ''});
        },
        destroy: function () {
            this.$el.remove();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });

    var SelectedItemsCollection = Backbone.Collection.extend({
        model: LaunchSuiteStepItemModel,
    });


    var LaunchMultipleSelectView = Epoxy.View.extend({
        template: 'tpl-launch-multiple-selected',

        events: {
            'click [data-ja-close]': 'onClickClose',
            'click [data-js-proceed]': 'onClickProceed',
        },

        actionValidators: {
            merge: function() {
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: model.validate.merge()});
                });
            },
            compare: function() {
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: ''})
                })
            },
            editdefect: function(){
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: model.validate.editDefect()})
                })
            },
            changemode: function() {
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: model.validate.changeMode()})
                })
            },
            forcefinish: function() {
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: model.validate.forceFinish()})
                })
            },
            remove: function() {
                _.each(this.collection.models, function(model) {
                     model.set({invalidMessage: model.validate.remove()})
                })
            },
            postbug: function() {
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: model.validate.postbug()})
                })
            },
            loadbug: function() {
                _.each(this.collection.models, function(model) {
                    model.set({invalidMessage: model.validate.loadbug()})
                })
            },
        },
        actionCall: {
            merge: function() {
                var self = this;
                this.mergeAction = new MergeAction({
                    items: this.collection.models,
                })
                this.mergeAction.getAsync().done(function() {
                    self.collectionItems.load();
                    self.mergeAction = null;
                    self.reset();
                })
            },
            compare: function() {
                var self = this;
                this.compareAction = new CompareAction({
                    items: this.collection.models,
                });
                this.compareAction.getAsync().done(function() {
                    self.compareAction = null;
                    self.reset();
                });
            },
            editdefect: function(){
                var self = this;
                this.editDefectAction = new EditDefectAction({
                    items: this.collection.models,
                });
                this.editDefectAction.getAsync().done(function() {
                    self.editDefectAction = null;
                    self.reset();
                });
            },
            changemode: function() {
                var self = this;
                ChangeModeAction({items: this.collection.models}).done(function() {
                    self.collectionItems.load(true);
                    self.reset();
                })
            },
            forcefinish: function() {
                var self = this;
                ForceFinishAction({items: this.collection.models}).done(function() {
                    self.collectionItems.load();
                    self.reset();
                })
            },
            remove: function() {
                var self = this;
                RemoveAction({items: this.collection.models}).done(function() {
                    self.compareAction = null;
                    self.collectionItems.load(true);
                    var parentModel = self.collectionItems.parentModel || self.collectionItems.launchModel;
                    if(parentModel) {
                        _.each(parentModel.collection.models, function (model) {
                            model.updateData(true);
                        });
                    }
                    self.reset();
                })
            },
            postbug: function() {
                var self = this;
                PostBugAction({items: this.collection.models}).done(function() {
                    self.reset();
                })
            },
            loadbug: function() {
                var self = this;
                LoadBugAction({items: this.collection.models}).done(function() {
                    self.reset();
                })
            }
        },

        initialize: function(options) {
            this.collectionItems = options.collectionItems;
            this.collection = new SelectedItemsCollection();
            this.activate = false;
            this.render();
            this.listenTo(this.collectionItems, 'change:select', this.onChangeSelect);
            this.listenTo(this.collectionItems, 'reset', this.onResetCollectionItems);
            this.listenTo(this.collection, 'change:select', this.onUnCheckItem);
            this.listenTo(this.collection, 'add', this.onAddItem);
            this.currentAction = '';
        },
        onChangeSelect: function(model, select) {
            if(select) {
                !this.collection.get(model.get('id')) && this.collection.add(model);
            } else {
                this.collection.remove(model.get('id'));
            }
            this.checkStatus();
        },
        onResetCollectionItems: function() {
            var self = this;
            _.each(this.collection.models, function(model) {
                var commonModel = self.collectionItems.get(model.get('id'));
                commonModel && commonModel.set({select: true});
            })
        },
        checkStatus: function() {
            if(this.collection.models.length && !this.activate){
                this.trigger('activate:true');
                this.activate = true;
            }
            if(!this.collection.models.length && this.activate) {
                this.trigger('activate:false');
                this.activate = false;
            }
        },
        onUnCheckItem: function(model) {
            var commonModel = this.collectionItems.get(model.get('id'));
            model.set({invalidMessage: ''});
            if(!commonModel) {
                this.collection.remove(model);
                this.checkStatus();
            }
            if(this.currentAction) {
                this.actionValidators[this.currentAction].call(this);
                this.checkInvalidStatus();
            }
        },
        checkInvalidStatus: function() {
            var answer = true;
            _.each(this.collection.models, function(model) {
                if(model.get('invalidMessage') != '') {
                    answer = false;
                    return false;
                }
            });
            if(answer) {
                this.$el.removeClass('invalid-state');
                this.currentAction = '';
            } else {
                var processBtn = $('[data-js-proceed]', this.$el),
                    action = _.every(this.collection.toJSON(), function(m){ return m.invalidMessage; }) ? 'addClass' : 'removeClass';
                processBtn[action]('disabled');
                this.$el.addClass('invalid-state');
            }
            return answer;
        },
        setAction: function(actionName) {
            if(this.actionValidators[actionName]) {
                this.actionValidators[actionName].call(this);
                this.currentAction = actionName;
                if(this.checkInvalidStatus()) {
                    this.actionCall[actionName].call(this);
                }
            }
        },
        reset: function() {
            while(this.collection.models.length) {
                this.collection.at(0).set({select: false});
            }
        },
        onClickProceed: function() {
            this.collectionItems.checkType()
                .done(function(data){
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
            var invalidItems = _.filter(this.collection.models, function(model) {
               return model.get('invalidMessage') != ''
            });
            _.each(invalidItems, function(model) {
                model.set({select: false});
            });
            this.setAction(this.currentAction);
        },
        onClickClose: function() {
            this.collectionItems.checkType()
                .done(function(data){
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
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onAddItem: function(model) {
            $('[data-js-multi-select-items]', this.$el).append((new LaunchMultipleSelectItem({model: model})).$el);
        },
        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });

    return LaunchMultipleSelectView;
});
