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
    var SwipeGalleryComponent = require('components/SwipeGalleryComponent');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;

    var ItemAttachmentsModel = Epoxy.Model.extend({
        defaults: {
            pageNumber: 1,
            totalPages: 1,
            itemId: '',
            content: [],
            itemModels: [],
        },

        initialize: function(options) {
            if(!options.notLoad && this.get('content').length == 0) {
                this.load();
            }
            this.listenTo(this, 'change:pageNumber', this.load);
        },
        load: function() {
            var async = $.Deferred();
            this.trigger('load', true);
            var self = this;
            async.always(function() {
                self.trigger('load', false);
            });
            if(this.get('pageNumber') < 1 || this.get('pageNumber') > this.get('totalPages')) {
                this.set({content: []});
                async.resolve();
            }else {
                var path = Urls.getLogsUrl() + '?' + this.getParamsUrl().join('&');
                this.request && this.request.abort();
                this.request = call('GET', path)
                    .done(function(data) {
                        if(data.content.length == 0) {
                            async.reject();
                            return;
                        }
                        self.set({content: data.content});
                        async.resolve(data)
                    })
                    .fail(function() {
                        async.reject();
                    });
            }
            return async.promise()
        },
        getParamsUrl: function() {
            var params = ['filter.ex.binary_content=true'];
            params.push('filter.eq.item=' + this.get('itemId'));
            params.push('page.page=' + this.get('pageNumber'));
            params.push('page.size=6');
            return params;
        },
    });

    var ItemAttachmentsView = Epoxy.View.extend({
        tagName: 'li',
        template: 'tpl-launch-log-item-info-attachments-items',

        initialize: function(){
            this.render();
            this.listenTo(this.model, 'load', this.onLoad);
            this.collection = new Backbone.Collection([], {model: ItemAttachmentModel});
            this.listenTo(this.model, 'change:content', this.onChangeContent);
            this.listenTo(this.collection, 'reset', this.onResetCollection);
            this.onChangeContent();
        },
        onLoad: function(stateLoad) {
            if(stateLoad) {
                this.$el.addClass('load');
                return;
            }
            this.$el.removeClass('load');
        },
        onChangeContent: function() {
            var self = this;
            var content = this.model.get('content');
            _.each(content, function(item) {
                item.pageNumber = self.model.get('pageNumber');
            })
            this.collection.reset(content);
            this.model.set({itemModels: this.collection.models});
        },
        onResetCollection: function() {
            var $itemsList = $('[data-js-items-list]',this.$el);
            $itemsList.html('');
            _.each(this.collection.models, function(model) {
                $itemsList.append((new ItemAttachmentView({model: model})).$el);
            }, this)
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
    })

    var ItemAttachmentModel = Epoxy.Model.extend({
        defaults: {
            binary_content: {id: "", thumbnail_id: "", content_type: "image/png"},
            message: "",
            test_item: "",
            time: 0,
            active: false,
            empty: false,
        },
        computeds: {
            previewImg: {
                deps: ['binary_content'],
                get: function(binaryContent) {
                    if(binaryContent && binaryContent.content_type == 'image/png' && binaryContent.thumbnail_id) {
                        return Urls.getFileById(binaryContent.thumbnail_id);
                    }
                    return '#';
                }
            },
            mainImg: {
                deps: ['binary_content'],
                get: function(binaryContent) {
                    if(binaryContent && binaryContent.content_type == 'image/png' && binaryContent.id) {
                        return Urls.getFileById(binaryContent.id);
                    }
                    return '';
                }
            },
        },
    });

    var ItemAttachmentView = Epoxy.View.extend({
        className: 'gallery-preview',

        events: {
            'click [data-js-gallery-image]': 'onClickGalleryImage',
        },

        bindings: {
            '[data-js-gallery-image]': 'css: {backgroundImage: format("url($1)", previewImg)}',
            ':el': 'classes: {active: active}',
        },

        initialize: function() {
            this.$el.html('<div class="gallery-image" data-js-gallery-image></div>');
        },
        onClickGalleryImage: function() {
            this.model.trigger('change:active:slide', this.model);
        }
    });

    var ItemAttachmentMainView = Epoxy.View.extend({
        tagName: 'li',
        template: 'tpl-launch-log-item-info-attachments-main-item',

        events: {
            'click [data-js-rotate]': 'onClickRotate'
        },

        bindings: {
            '[data-js-main-image]': 'html: format("<img src=$1>", mainImg)'
        },

        initialize: function() {
            this.rotate = 0;
            this.render();
            this.listenTo(this.model, 'change:id', this.onChangeId);
        },
        onClickRotate: function() {
            this.rotate += 90;
            $('[data-js-main-image] img', this.$el).css('transform', 'rotate('+this.rotate+'deg)');
        },
        onChangeId: function(model, id) {
            this.rotate = 0;
            if(id) {
                this.$el.removeClass('hide-content')
            } else {
                this.$el.addClass('hide-content')
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        }
    });


    var LogItemInfoAttachmentsView = Epoxy.View.extend({
        template: 'tpl-launch-log-item-info-attachments',

        events: {
            'click [data-ja-close]': 'onClickClose',
        },

        initialize: function(options) {
            this.render();
            this.isLoad = false;
            this.$main = $('.launch-log-info-attachments', this.$el);
            this.itemModel = options.itemModel;
            this.parentModel = options.parentModel;
            this.listenTo(this.parentModel, 'change:attachments', this.onShow);
            this.pageSize = 6;
            this.collectionPreviews = new Backbone.Collection([], {model: ItemAttachmentsModel});
            this.sortPreviewModels = this.collectionPreviews;
            this.collectionMain = new Backbone.Collection([], {model: ItemAttachmentModel});
            this.currentLoadCollection = new Backbone.Collection();
            this.totalPages = 1;
            this.curPage = 1;
            this.galleryMain = new SwipeGalleryComponent({
                el: $('[data-js-main-gallery]', self.$el),
                collection: this.collectionMain,
                itemView: ItemAttachmentMainView,
                options: {
                    // mouseEvents: true,
                    loop: true,
                }
            });
            this.galleryPreviews = new SwipeGalleryComponent({
                el: $('[data-js-min-gallery]',self.$el),
                collection: this.collectionPreviews,
                itemView: ItemAttachmentsView,
                options: {
                    // mouseEvents: true,
                    loop: true,
                }
            });
            this.listenTo(this.collectionPreviews, 'change:itemModels', this.updateLoadItems);
            this.listenTo(this.galleryPreviews, 'change:slide', this.onChangeSlide);
            this.listenTo(this.galleryMain, 'change:slide', this.onChangeGalleryMainSlide);
            this.listenTo(this.currentLoadCollection, 'change:active:slide', this.onChangeMainActiveSlide);
        },
        onShow: function(model, show) {
            if(show && !this.isLoad) {
                this.isLoad = true;
                this.load();
            }
        },
        onChangeMainActiveSlide: function(activeModel) {
            var self = this;
            var index = 0;
            _.each(this.currentLoadCollection.models, function(model, num) {
                model.set({active: false});
                if(model.get('id') == activeModel.get('id')) {
                    index = num;
                }
            });
            activeModel.set({active: true});
            this.collectionMain.reset([
                this.currentLoadCollection.at(index).toJSON()
            ]);
            if(this.currentLoadCollection.at(index + 1)) {
                this.collectionMain.add(this.currentLoadCollection.at(index + 1).toJSON());
            } else {
                this.collectionMain.add({id: ''});
            }
            if(this.currentLoadCollection.at(index - 1)) {
                this.collectionMain.add(this.currentLoadCollection.at(index - 1).toJSON());
            }else {
                this.collectionMain.add({id: ''});
            }
        },
        updateLoadItems: function() {
            var self = this;
            self.currentLoadCollection.reset([]);
            _.each(this.sortPreviewModels.models, function(model) {
                self.currentLoadCollection.push(model.get('itemModels'))
            });
        },
        load: function() {
            this.$main.addClass('load');
            var itemsModel = new ItemAttachmentsModel({
                pageNumber: this.curPage,
                itemId: this.itemModel.get('id'),
                notLoad: true,
            });
            var self = this;
            itemsModel.load()
                .done(function(data) {
                    self.totalPages = data.page.totalPages;
                    itemsModel.set({totalPages: self.totalPages});
                    var dataForPreview = [itemsModel];
                    if(self.totalPages > 1) {
                        dataForPreview.push({pageNumber: self.curPage + 1, itemId: self.itemModel.get('id'), totalPages: self.totalPages});
                        if(self.totalPages > 2) {
                            dataForPreview.push({pageNumber: self.curPage - 1, itemId: self.itemModel.get('id'), totalPages: self.totalPages});
                        }
                    }
                    self.collectionPreviews.reset(dataForPreview);

                    self.$main.removeClass('load');
                    self.galleryPreviews.setRenderStatus();
                    self.galleryMain.setRenderStatus();
                    self.onChangeMainActiveSlide(self.currentLoadCollection.at(0));
                    self.updateArrowMainGallery(0);
                    self.updateArrowState(self.curPage);
                })
                .fail(function() {
                    self.$main.removeClass('load');
                    self.$main.addClass('not-found');
                })
        },
        updateArrowMainGallery: function(curIndex) {
            if(this.currentLoadCollection.at(curIndex+1)){
                $('[data-js-main-gallery] .arrow_right').removeClass('disabled');
            } else {
                $('[data-js-main-gallery] .arrow_right').addClass('disabled');
            }
            if(this.currentLoadCollection.at(curIndex-1)) {
                $('[data-js-main-gallery] .arrow_left').removeClass('disabled')
            } else {
                $('[data-js-main-gallery] .arrow_left').addClass('disabled')
            }
        },
        onChangeGalleryMainSlide: function(options) {
            var curIndex = 0;
            var activeModel = options.galleryModels[options.index];
            if(activeModel.get('id') == '') {
                if(options.dirrection == 'right') {
                    this.galleryMain.prev();
                } else {
                    this.galleryMain.next();
                }
                return;
            }
            _.each(this.currentLoadCollection.models, function(model, num) {
                model.set({active: false});
                if(model.get('id') == activeModel.get('id')) {
                    model.set({active: true});
                    curIndex = num;
                }
            });
            this.updateArrowMainGallery(curIndex);
            if(options.dirrection == 'right'){
                if(!this.currentLoadCollection.at(curIndex+1)){
                    options.galleryModels[options.index+1].set({id: ''});
                    return;
                }
                options.galleryModels[options.index+1].set(this.currentLoadCollection.at(curIndex+1).toJSON());
                if(options.galleryModels[options.index-1].get('pageNumber') &&
                    options.galleryModels[options.index-1].get('pageNumber') != options.galleryModels[options.index].get('pageNumber')) {
                    this.galleryPreviews.next();
                }
                return;
            }
            if(!this.currentLoadCollection.at(curIndex-1)) {
                options.galleryModels[options.index-1].set({id: ''});
                return;
            } else
            options.galleryModels[options.index-1].set(this.currentLoadCollection.at(curIndex-1).toJSON());
            if(options.galleryModels[options.index+1].get('pageNumber') != options.galleryModels[options.index].get('pageNumber')) {
                this.galleryPreviews.prev();
            }
        },
        onChangeSlide: function(options) {
            this.sortPreviewModels = {models: options.galleryModels};
            var activeModel = options.galleryModels[options.index];
            var pageNumber = activeModel.get('pageNumber');
            this.updateArrowState(pageNumber);
            if (pageNumber < 1 || pageNumber > this.totalPages) {
                if(options.dirrection == 'left') {
                    this.galleryPreviews.next();
                } else {
                    this.galleryPreviews.prev();
                }
                return;
            }
            if(options.dirrection == 'right'){
                options.galleryModels[options.index+1] &&
                options.galleryModels[options.index+1].set({pageNumber: pageNumber +1});
                return;
            }
            options.galleryModels[options.index-1] &&
            options.galleryModels[options.index-1].set({pageNumber: pageNumber -1})
        },
        updateArrowState: function(activePageNumber) {
            if(activePageNumber <= 1) {
                $('[data-js-min-gallery] .arrow_left', this.$el).addClass('disabled');
            } else {
                $('[data-js-min-gallery] .arrow_left', this.$el).removeClass('disabled');
            }
            if(activePageNumber >= this.totalPages) {
                $('[data-js-min-gallery] .arrow_right', this.$el).addClass('disabled');
            } else {
                $('[data-js-min-gallery] .arrow_right', this.$el).removeClass('disabled');
            }
        },


        onClickClose: function() {
            this.parentModel.set({attachments: false});
        },

        render: function() {
            this.$el.html(Util.templates(this.template), {});
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return LogItemInfoAttachmentsView;
});