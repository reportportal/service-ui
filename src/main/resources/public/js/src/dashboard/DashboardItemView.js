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
    var ModalAddWidget = require('modals/addWidget/modalAddWidget');
    var modalAddSharedWidget = require('modals/addSharedWidget/modalAddSharedWidget');
    var Localization = require('localization');
    var GadgetCollection = require('dashboard/GadgetCollection');
    var GadgetView = require('dashboard/GadgetView');
    var GadgetModel = require('dashboard/GadgetModel');
    var WidgetModel = require('newWidgets/WidgetModel');
    var WidgetConfig = require('widget/widgetsConfig');

    require('gridstackUi');
    require('fullscreen');
    var config = App.getInstance();

    var DashboardItemView = Epoxy.View.extend({
        className: 'dashboard-item-view',
        template: 'tpl-dashboard-item',

        events: {
            'click [data-js-edit]': 'onClickEdit',
            'click [data-js-remove]': 'onClickRemove',
            'click [data-js-full-screen]': 'onClickFullScreen',
            'click [data-js-close-fullscreen]': 'onClickExitFullScreen',
            'click [data-js-add-widget]': 'onClickAddWidget',
            'click [data-js-add-shared-widget]': 'onClickAddSharedWidget',
        },

        bindings: {
            ':el': 'classes: {"not-my": not(isMy)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-add-widget]': 'classes: {disabled: not(validateForAddWidget)}, attr: {title: getAddBtnTitle}',
            '[data-js-add-shared-widget]': 'classes: {disabled: not(validateForAddWidget)}, attr: {title: getAddBtnTitle}'
        },

        computeds: {
            validateForAddWidget: {
                deps: ['widgets'],
                get: function(widgets) {
                    widgets = this.model.getWidgets();
                    return widgets.length < config.maxWidgetsOnDashboard;
                }
            },
            getAddBtnTitle: {
                deps: ['widgets'],
                get: function(widgets){
                    widgets = this.model.getWidgets();
                    return widgets.length >= config.maxWidgetsOnDashboard ? Localization.dashboard.maxWidgetsAdded : '';
                }
            }
        },

        initialize: function(options) {
            this.gadgetViews = [];
            this.scrollElement = config.mainScrollElement;
            this.onShowAsync = $.Deferred();
            this.render();
            var self = this;
            if(this.model.get('notLoad')) {
                this.$el.addClass('load');
                this.model.update().done(function() {
                    self.$el.removeClass('load');
                    self.postInit();
                    self.applyBindings();
                })
            } else {
                this.postInit();
            }
        },
        postInit: function() {
            var self = this;
            WidgetConfig.updateInstance().done(function() {
                self.gadgetCollection = new GadgetCollection([], {dashboardModel: self.model});
                self.listenTo(self.gadgetCollection, 'add', self.onAddGadget);
                self.listenTo(self.gadgetCollection, 'remove:view', self.onRemoveGadget);
                self.listenTo(self.gadgetCollection, 'remove', self.checkEmptyDashboard);
                self.activateGridStack();
                self.listenTo(self.model, 'add:widget', self.onAddNewGadget);
                self.listenTo(self.model, 'change:isShared', self.onShareDashboard);
            });

        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onAddNewGadget: function(model) {
            this.checkEmptyDashboard();
            this.gadgetCollection.add(model);
            this.updateScroll();
        },
        onShareDashboard: function(){
            if(this.model.get('isShared')){
                _.each(this.gadgetViews, function(view){
                    view.model.set('isShared', true);
                }, this);
            }
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
                },
                disableDrag: !this.model.get('isMy'),
                disableResize: !this.model.get('isMy'),
            });
            this.gridStack = $gridStack.data('gridstack');
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
                });
                self.gadgetCollection.sort();
                self.updateScroll();
            });
            $gridStack.on('resizestart', function (event, ui) {
                var view = event.target.backboneView;
                view && view.startResize();
            });
            $gridStack.on('resizestop', function (event, ui) {
                var view = event.target.backboneView;
                setTimeout(function(){
                    view && view.stopResize();
                }, 300);
            });

        },
        onClickFullScreen: function(e) {
            e.preventDefault();
            $('body').fullscreen({toggleClass: 'fullscreen'});
            this.updateGadgetsTimer();
        },
        onAddGadget: function(gadgetModel) {
            var view = new GadgetView({model: gadgetModel, dashboardModel: this.model});
            this.gridStack.addWidget.apply(this.gridStack, view.getDataForGridStack());
            this.gadgetViews.push(view);
        },
        onRemoveGadget: function(view) {
            this.gridStack.removeWidget(view.el);
        },
        checkEmptyDashboard: function() {
            if(!this.model.getWidgets().length) {
                this.$el.addClass('not-found');
            } else {
                this.$el.removeClass('not-found');
            }
        },
        createGadgets: function() {
            this.checkEmptyDashboard();
            this.gadgetCollection.add(this.model.getWidgets(), {silent: true, parse: true});
            this.gadgetCollection.forEach(function(model){
                this.onAddGadget(model);
            }, this);
            this.updateScroll();
            var self = this;
            this.$el.on('resize', function(){
                self.scrollerAnimate.resize();
            });
        },
        updateScroll: function() {
            var self = this;
            this.onShowAsync.done(function() {
                self.scrollerAnimate = new ScrollerAnimate(self.gadgetViews);
                self.scrollElement
                    .off('scroll.dashboardPage')
                    .on("scroll.dashboardPage", function (e) {
                        self.onScroll();
                    });
                self.onScroll();
            })
        },
        onShow: function() {
            this.onShowAsync.resolve();
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
        onClickExitFullScreen: function(e) {
            clearTimeout(this.updateTimer);
            e.preventDefault();
            e.stopPropagation();
            $.fullscreen.exit();
        },
        updateGadgetsTimer: function() {
            clearTimeout(this.updateTimer);
            var self = this;
            this.updateTimer = setTimeout(function() {
                _.each(self.gadgetCollection.models, function(gadgetModel) {
                    gadgetModel.trigger('update:timer');
                });
                self.updateGadgetsTimer();
            }, 60000);
        },
        onClickAddWidget: function(e) {
            e.preventDefault();
            e.stopPropagation();
            (new ModalAddWidget({model: new GadgetModel(), dashboardModel: this.model})).show();
        },
        onClickAddSharedWidget: function(e) {
            e.preventDefault();
            e.stopPropagation();
            (new modalAddSharedWidget({model: new GadgetModel(), dashboardModel: this.model})).show();
        },
        destroy: function () {
            clearTimeout(this.updateTimer);
            $.fullscreen.exit();
            this.undelegateEvents();
            this.gridStack && this.gridStack.destroy();
            this.$el.off('resize');
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
