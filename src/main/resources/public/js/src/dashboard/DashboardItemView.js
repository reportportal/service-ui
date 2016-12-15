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

    var Util = require('util');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    var Widget = require('widgets');
    var GadgetCollection = require('dashboard/GadgetCollection');
    var GadgetView = require('dashboard/GadgetView');

    require('gridstackUi');
    var config = App.getInstance();

    var DashboardItemView = Epoxy.View.extend({
        className: 'dashboard-item-view',
        template: 'tpl-dashboard-item',

        events: {
            'click [data-js-edit]': 'onClickEdit',
            'click [data-js-remove]': 'onClickRemove',
        },

        bindings: {
        },

        initialize: function(options) {
            this.gadgetViews = [];
            this.gadgetCollection = new GadgetCollection(this.model);
            this.listenTo(this.gadgetCollection, 'add', this.onAddGadget);
            this.listenTo(this.gadgetCollection, 'remove:view', this.onRemoveGadget);
            this.render();
            this.scrollElement = config.mainScrollElement;
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            this.activateGridStack();
        },
        activateGridStack: function() {
            var $gridStack = $('[data-js-grid-stack]', this.$el);
            $gridStack.gridstack({
                cellHeight: config.widgetGridCellHeight,
                verticalMargin: config.widgetGridVerticalMargin,
                draggable: {
                    handle: '[data-js-drag-handle]'
                },
                resizable: {
                    handles: 'se, sw'
                }
            });
            this.gridStack = $gridStack.data('gridstack')
            this.createGadgets();
            var self = this;
            $gridStack.on('change', function (e, items) {
                _.each(items, function(item) {
                    var id = item.el.data('id');
                    if(!id) return;
                    var gadgetModel = self.gadgetCollection.get(id);
                    if(!gadgetModel) return;
                    gadgetModel.set({
                        x: item.x,
                        y: item.y,
                        width: item.width,
                        height: item.height,
                    });
                })
            });
            // $gridStack.on('resizestart', function (event, ui) {
            //     var element = $(event.target);
            //     element.css('visibility', 'hidden');
            // });
            // $gridStack.on('resizestop', function (event, ui) {
            //     var element = $(event.target);
            //     element.css('visibility', 'visible');
            // });

        },
        onAddGadget: function(gadgetModel) {
            var view = new GadgetView({model: gadgetModel});
            this.gridStack.addWidget.apply(this.gridStack, view.getDataForGridStack());
            this.gadgetViews.push(view);
        },
        onRemoveGadget: function(view) {
            this.gridStack.removeWidget(view.el);
        },
        createGadgets: function() {
            this.gadgetCollection.add(this.model.getWidgets(), {parse: true});
        },
        onShow: function() {
            this.scrollerAnimate = new ScrollerAnimate(this.gadgetViews);
            var self = this;
            this.scrollElement
                .off('scroll.dashboardPage')
                .on("scroll.dashboardPage", function (e) {
                    self.onScroll();
                });
            this.onScroll();
        },
        onScroll: function() {
            var scrollTop = this.scrollElement.scrollTop();
            this.scrollerAnimate.activateScroll(scrollTop);
        },
        onClickEdit: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var self = this;
            (new ModalEditDashboard({
                dashboardCollection: this.model.collection,
                dashboardModel: this.model,
                mode: 'edit',
            })).show().done(function(newModel) {
                self.model.set(newModel.toJSON());
            })
        },
        onClickRemove: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var self = this;
            (new ModalConfirm({
                headerText: Localization.dialogHeader.dashboardDelete,
                bodyText: Util.replaceTemplate(Localization.dialog.dashboardDelete, this.model.get('name')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            })).show().done(function() {
                var collection = self.model.collection;
                self.model.collection.remove(self.model);
                self.destroy();
                collection.resetActive();
            })
        },

        destroy: function () {
            this.undelegateEvents();
            this.scrollElement.off('scroll.dashboardPage');
            this.stopListening();
            this.unbind();
            this.$el.remove();
        },
    });

    function ScrollerAnimate(blocks){
        this.blocks = blocks;
        this.scrollMap = [];
        this.documentHeight = 0;

        this._createScrollMap = function(){
            this.scrollMap = [];
            this.documentHeight = document.documentElement.clientHeight;
            for(var i = 0; i < this.blocks.length; i++){
                this.scrollMap.push({
                    scrollStart: this.blocks[i].el.offsetTop,
                    scrollEnd: this.blocks[i].el.offsetTop + this.blocks[i].el.offsetHeight
                });
            }
        };

        this.activateScroll = function(scrollTop){
            var scrollBottom = scrollTop + this.documentHeight;
            var showBlockIndexs = [];
            for(var i = 0; i < this.scrollMap.length; i++){
                if((this.scrollMap[i].scrollStart <= scrollBottom && scrollTop < this.scrollMap[i].scrollStart)
                    || (this.scrollMap[i].scrollEnd <= scrollBottom && scrollTop < this.scrollMap[i].scrollEnd)
                    || (this.scrollMap[i].scrollEnd > scrollBottom && scrollTop >= this.scrollMap[i].scrollStart)){
                    showBlockIndexs.push(i);
                    if(!this.blocks[i].activate){
                        this.blocks[i].activate = true;
                        this.blocks[i].activateGadget();
                    }
                }
            }
            // return middle block index
            if(showBlockIndexs.length != 2) return showBlockIndexs[parseInt(showBlockIndexs.length/2)];
            var middleScreen = scrollBottom - this.documentHeight/2,
                blockSeparate = this.scrollMap[showBlockIndexs[0]].scrollEnd;
            if(blockSeparate > middleScreen) return showBlockIndexs[0];
            return showBlockIndexs[1];
        };

        this.resize = function(){
            this._createScrollMap();
            this.activateScroll(config.mainScrollElement.scrollTop());
        }

        this._createScrollMap();
    }


    return DashboardItemView;
});
