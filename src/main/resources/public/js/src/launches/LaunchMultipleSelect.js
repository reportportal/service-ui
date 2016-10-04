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
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var Util = require('util');

    var LaunchMultipleSelectItem = Epoxy.View.extend({
        className: 'multi-select-item',
        template: 'tpl-launch-multiple-selected-item',

        events: {
            'click [data-ja-close-item]': 'onClickClose',
        },

        bindings: {
            '[data-js-item-name]': 'text: format("$1$2", name, numberText)',
        },

        initialize: function() {
            this.render();
            this.listenTo(this.model, 'remove', this.destroy);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickClose: function() {
            this.model.set({select: false});
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
        },
        onChangeSelect: function(model, select) {
            var cloneModel = model.clone();
            if(select) {
                !this.collection.get(model.get('id')) && this.collection.add(cloneModel);
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
            if(commonModel) {
                commonModel.set({select: false});
            } else {
                this.collection.remove(model);
                this.checkStatus();
            }
        },
        reset: function() {
            this.onClickClose();
        },
        onClickClose: function() {
            while(this.collection.models.length) {
                this.collection.at(0).set({select: false});
            }
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
