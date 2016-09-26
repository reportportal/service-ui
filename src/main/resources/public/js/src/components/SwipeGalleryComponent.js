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
    var SwipeGallery = require('SwipeGallery');
    var Util = require('util');

    var SwipeGalleryView = Epoxy.View.extend({
        template: 'tpl-component-swipe-gallery',
        events: {
            'click .controls_overflow .control': 'onControlClick',
            'click .arrow_left': 'onClickLeft',
            'click .arrow_right': 'onClickRight',
        },

        initialize: function(data) {
            this.render();
            this.itemView = data.itemView;
            this.collection = data.collection;
            data.options = data.options || {};
            this.options = _.extend(data.options, {
                selector: $('[data-js-block]', this.$el),
                onChange: _.bind(this.onSliderChange, this)
            });
            this.renderAsync = $.Deferred();
            this.initCollection();
            this.items = {};
            if (this.collection.length !== 0) {
                this.renderAll(this.collection);
            }
        },
        setRenderStatus: function() {
            this.renderAsync.resolve();
        },
        initCollection: function() {
            if (this.collection == null) {
                this.collection = new SwipeGalleryCollection;
            }
            this.listenTo(this.collection, 'reset', this.onResetCollection);
            this.listenTo(this.collection, 'add', this.onAddCollection);
            return this.listenTo(this.collection, 'remove', this.onRemoveCollection);
        },
        onAddCollection: function(model) {
            var self = this;
            this.renderAsync.done(function() {
                self.renderItem(model);
                self.refreshPlugin();
            });
        },
        renderItem: function(model) {
            var item = new this.itemView({model: model, parentView: this});
            this.items[model.cid] = item;
            $('[data-js-list]', this.$el).append(item.$el);
        },
        onRemoveCollection: function(model) {
            var self = this;
            this.renderAsync.done(function() {
                self.items[model.cid].remove();
                self.refreshPlugin();
            })
        },
        onResetCollection: function(newCollection) {
            var self = this;
            this.renderAsync.done(function() {
                self.renderAll(newCollection)
            })
        },
        renderAll: function(collection) {
            var self = this;
            this.renderAsync.done(function() {
                _.each(self.items, function(value){
                    value.remove();
                })
                self.items = {};
                _.each(collection.models, function(model){
                    self.renderItem(model);
                })
                self.gallery && self.gallery.destroy();
                self.gallery = new SwipeGallery(self.options);
            })
        },
        onSliderChange: function(index, max, itemMas, dirrection) {
            var self = this;
            var galleryModels = [];
            _.each(itemMas, function(item) {
                galleryModels.push(self.collection.models[item.index]);
            })
            this.trigger('change:slide', {
                index: index,
                galleryModels: galleryModels,
                dirrection: dirrection,
            })
        },
        refreshPlugin: function() {
            if(this.gallery) {
                this.gallery.update();
            } else {
                this.gallery = new SwipeGallery(this.options);
            }
        },
        setOptions: function(options) {
            _.extend(this.options, options);
        },
        updateOptions: function(options) {
            this.gallery && this.gallery.updateOptions(options);
        },
        prev: function() {
            this.gallery && this.gallery.prev();
        },
        next: function() {
            this.gallery && this.gallery.next();
        },
        lock: function() {
            this.gallery && this.gallery.lock();
        },
        unlock: function() {
            this.gallery && this.gallery.unlock();
        },
        onControlClick: function(e) {
            this.gallery && this.gallery.goTo($(e.currentTarget).index());
        },
        onClickLeft: function() {
            this.gallery && this.gallery.prev();
        },
        onClickRight: function() {
            this.gallery && this.gallery.next();
        },

        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },

        destroy: function () {
            this.filterEntities.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });


    return SwipeGalleryView;
});
