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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    var ModalAddWidget = require('modals/addWidget/modalAddWidget');
    var ModalAddSharedWidget = require('modals/addSharedWidget/modalAddSharedWidget');
    var Localization = require('localization');
    var GadgetCollection = require('dashboard/GadgetCollection');
    var GadgetView = require('dashboard/GadgetView');
    var GadgetModel = require('dashboard/GadgetModel');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    require('gridstackUi');
    require('fullscreen');
    var config = App.getInstance();
    var launchFilterCollection = new SingletonLaunchFilterCollection();

    var TIME_UPDATE = 60000;
    var TIME_UPDATE_FULL_SCREEN = 30000;

    var DashboardItemView = Epoxy.View.extend({
        className: 'dashboard-item-view',
        template: 'tpl-dashboard-item',

        events: {
            'click [data-js-edit]': 'onClickEdit',
            'click [data-js-remove]': 'onClickRemove',
            'click [data-js-full-screen]': 'onClickFullScreen',
            'click [data-js-close-fullscreen]': 'onClickExitFullScreen',
            'click [data-js-add-widget]': 'onClickAddWidget',
            'click [data-js-add-widget-bootm]': 'onClickWidgetBottom',
            'click [data-js-add-shared-widget]': 'onClickAddSharedWidget'
        },

        bindings: {
            ':el': 'classes: {"not-my": not(isMy)}',
            '[data-js-owner-name]': 'text: owner'
        },

        initialize: function () {
            var self = this;
            this.gadgetViews = [];
            this.scrollElement = config.mainScrollElement;
            this.onShowAsync = $.Deferred();
            this.render();
            if (this.model.get('notLoad')) {
                this.$el.addClass('load');
                this.model.update().done(function () {
                    self.$el.removeClass('load');
                    self.postInit();
                    self.applyBindings();
                });
            } else {
                this.postInit();
            }
        },
        postInit: function () {
            this.gadgetCollection = new GadgetCollection([], { dashboardModel: this.model });
            this.listenTo(this.gadgetCollection, 'add', this.onAddGadget);
            this.listenTo(this.gadgetCollection, 'remove:view', this.onRemoveGadget);
            this.listenTo(this.gadgetCollection, 'remove', this.checkEmptyDashboard);
            this.activateGridStack();
            this.listenTo(this.model, 'add:widget', this.onAddNewGadget);
            this.listenTo(this.model, 'change:share', this.onShareDashboard);
            this.updateGadgetsTimer(TIME_UPDATE);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, { isMyDashboard: this.isMyDashboard() }));
        },
        isMyDashboard: function () {
            return this.model.get('owner') === config.userModel.get('name');
        },
        onAddNewGadget: function (model) {
            this.checkEmptyDashboard();
            this.gadgetCollection.add(model);
            this.updateScroll();
        },
        onShareDashboard: function () {
            if (this.model.get('share')) {
                _.each(this.gadgetViews, function (view) {
                    view.model.set('share', true);
                }, this);
            }
        },
        activateGridStack: function () {
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
                disableResize: !this.model.get('isMy')
            });
            this.gridStack = $gridStack.data('gridstack');
            this.createGadgets();
            var self = this;
            $gridStack.on('change', function (e, items) {
                _.each(items, function (item) {
                    var id = item.el.data('id');
                    if (!id) return;
                    var gadgetModel = self.gadgetCollection.get(id);
                    if (!gadgetModel) return;
                    gadgetModel.set({
                        x: item.x,
                        y: item.y,
                        width: item.width,
                        height: item.height
                    });
                });
                self.gadgetCollection.sort();
                self.updateScroll();
            });
            $gridStack.on('dragstop', function (event, ui) {
                config.trackingDispatcher.trackEventNumber(285);
            });
            $gridStack.on('resizestart', function (event, ui) {
                var view = event.target.backboneView;
                view && view.startResize();
                config.trackingDispatcher.trackEventNumber(289);
            });
            $gridStack.on('resizestop', function (event, ui) {
                var view = event.target.backboneView;
                setTimeout(function () {
                    view && view.stopResize();
                }, 300);
            });
        },
        onClickFullScreen: function (e) {
            e.preventDefault();
            config.trackingDispatcher.trackEventNumber(283);
            $('body').fullscreen({ toggleClass: 'fullscreen' });
            this.updateGadgetsTimer(TIME_UPDATE_FULL_SCREEN);
        },
        onAddGadget: function (gadgetModel) {
            if (gadgetModel.get('share')) {
                launchFilterCollection.ready.done(function () {
                    launchFilterCollection.update();
                });
            }
            var view = new GadgetView({ model: gadgetModel, dashboardModel: this.model });
            this.gridStack.addWidget.apply(this.gridStack, view.getDataForGridStack());
            this.gadgetViews.push(view);
        },
        onRemoveGadget: function (view) {
            this.gridStack.removeWidget(view.el);
        },
        checkEmptyDashboard: function () {
            if (!this.model.getWidgets().length) {
                this.$el.addClass('not-found');
            } else {
                this.$el.removeClass('not-found');
            }
        },
        createGadgets: function () {
            this.checkEmptyDashboard();
            this.gadgetCollection.add(this.model.getWidgets(), { silent: true, parse: true });
            this.gadgetCollection.forEach(function (model) {
                this.onAddGadget(model);
            }, this);
            this.updateScroll();
            var self = this;
            this.$el.on('resize', function () {
                self.scrollerAnimate.resize();
            });
        },
        updateScroll: function () {
            var self = this;
            this.onShowAsync.done(function () {
                self.scrollerAnimate = new ScrollerAnimate(self.gadgetViews);
                self.scrollElement
                    .off('scroll.dashboardPage')
                    .on('scroll.dashboardPage', function () {
                        self.onScroll();
                    });
                self.onScroll();
            });
        },
        onShow: function () {
            this.onShowAsync.resolve();
        },
        onScroll: function () {
            var scrollTop = this.scrollElement.scrollTop();
            this.scrollerAnimate.activateScroll(scrollTop);
        },
        onClickEdit: function (e) {
            e.preventDefault();
            e.stopPropagation();
            config.trackingDispatcher.trackEventNumber(282);
            var self = this;
            (new ModalEditDashboard({
                dashboardCollection: this.model.collection,
                dashboardModel: this.model,
                mode: 'edit'
            })).show().done(function (newModel) {
                self.model.set(newModel.toJSON());
            });
        },
        onClickRemove: function (e) {
            e.preventDefault();
            e.stopPropagation();
            config.trackingDispatcher.trackEventNumber(284);
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.dashboardDelete,
                bodyText: Util.replaceTemplate(Localization.dialog.dashboardDelete, this.model.get('name')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete
            });
            modal.show()
                .done(function () {
                    var collection = self.model.collection;
                    self.model.collection.remove(self.model);
                    self.destroy();
                    collection.resetActive();
                });
            modal.$el.on('click', function () {
                var $target = $(e.target);
                var isCancel = $target.is('[data-js-cancel]');
                var isDelete = $target.is('[data-js-ok]');
                var isClose = ($target.is('[data-js-close]') || $target.is('[data-js-close] i'));
                if (isClose) {
                    config.trackingDispatcher.trackEventNumber(276);
                } else if (isCancel) {
                    config.trackingDispatcher.trackEventNumber(277);
                } else if (isDelete) {
                    config.trackingDispatcher.trackEventNumber(278);
                }
            });
        },
        onClickExitFullScreen: function (e) {
            this.updateGadgetsTimer(TIME_UPDATE);
            e.preventDefault();
            e.stopPropagation();
            $.fullscreen.exit();
        },
        updateGadgetsTimer: function (time) {
            clearTimeout(this.updateTimer);
            var self = this;
            this.updateTimer = setTimeout(function () {
                _.each(self.gadgetCollection.models, function (gadgetModel) {
                    gadgetModel.trigger('update:timer');
                });
                self.updateGadgetsTimer(time);
            }, time);
        },
        onClickAddWidget: function (e) {
            e.preventDefault();
            e.stopPropagation();
            config.trackingDispatcher.trackEventNumber(280);
            (new ModalAddWidget({ dashboardModel: this.model })).show();
        },
        onClickWidgetBottom: function (e) {
            e.preventDefault();
            e.stopPropagation();
            config.trackingDispatcher.trackEventNumber(345);
            (new ModalAddWidget({ dashboardModel: this.model })).show();
        },
        onClickAddSharedWidget: function (e) {
            e.preventDefault();
            e.stopPropagation();
            config.trackingDispatcher.trackEventNumber(281);
            (new ModalAddSharedWidget({
                model: (new GadgetModel()),
                dashboardModel: this.model
            })).show();
        },
        destroy: function () {
            clearTimeout(this.updateTimer);
            $.fullscreen.exit();
            _.each(this.gadgetViews, function (view) {
                view.destroy();
            });
            this.undelegateEvents();
            this.gridStack && this.gridStack.destroy();
            this.$el.off('resize');
            this.scrollElement.off('scroll.dashboardPage');
            this.stopListening();
            this.unbind();
            this.$el.remove();
        }
    });

    function ScrollerAnimate(blocks) {
        this.blocks = blocks;
        this.scrollMap = [];
        this.documentHeight = 0;

        this._createScrollMap = function () {
            this.scrollMap = [];
            this.documentHeight = document.documentElement.clientHeight;
            for (var i = 0; i < this.blocks.length; i++) {
                this.scrollMap.push({
                    scrollStart: this.blocks[i].el.offsetTop,
                    scrollEnd: this.blocks[i].el.offsetTop + this.blocks[i].el.offsetHeight
                });
            }
        };

        this.activateScroll = function (scrollTop) {
            var scrollBottom = scrollTop + this.documentHeight;
            var showBlockIndexs = [];
            for (var i = 0; i < this.scrollMap.length; i++) {
                if ((this.scrollMap[i].scrollStart <= scrollBottom && scrollTop < this.scrollMap[i].scrollStart)
                    || (this.scrollMap[i].scrollEnd <= scrollBottom && scrollTop < this.scrollMap[i].scrollEnd)
                    || (this.scrollMap[i].scrollEnd > scrollBottom && scrollTop >= this.scrollMap[i].scrollStart)) {
                    showBlockIndexs.push(i);
                    if (!this.blocks[i].activate) {
                        this.blocks[i].activate = true;
                        this.blocks[i].activateGadget();
                    }
                }
            }
            // return middle block index
            if (showBlockIndexs.length !== 2) return showBlockIndexs[parseInt(showBlockIndexs.length / 2, 10)];
            var middleScreen = scrollBottom - (this.documentHeight / 2);
            var blockSeparate = this.scrollMap[showBlockIndexs[0]].scrollEnd;
            if (blockSeparate > middleScreen) return showBlockIndexs[0];
            return showBlockIndexs[1];
        };

        this.resize = function () {
            this._createScrollMap();
            this.activateScroll(config.mainScrollElement.scrollTop());
        };

        this._createScrollMap();
    }


    return DashboardItemView;
});
