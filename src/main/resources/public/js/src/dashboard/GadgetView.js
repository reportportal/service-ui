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


    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    var WidgetModel = require('newWidgets/WidgetModel');
    var WidgetView = require('newWidgets/WidgetView');
    var ModalEditWidget = require('modals/addWidget/modalEditWidget');
    var SimpleTooltipView = require('tooltips/SimpleTooltipView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');

    var config = App.getInstance();
    var launchFilterCollection = new SingletonLaunchFilterCollection();

    var GadgetView = Epoxy.View.extend({
        className: 'gadget-view grid-stack-item',
        template: 'tpl-gadget-view',
        errorTpl: 'tpl-gadget-unable-load',
        events: {
            'click [data-js-gadget-refresh]': 'onClickRefresh',
            'click [data-js-gadget-remove]': 'onClickRemove',
            'click [data-js-gadget-edit]': 'onClickGadgetEdit',
            'click [data-js-edit-invalid-data]': 'onClickGadgetEdit'
        },

        bindings: {
            '[data-js-name]': 'text: name',
            '[data-js-comment]': 'classes: {hide: not(description)}',
            '[data-js-shared]': 'classes: {hide: any(not(isShared), not(isMy))}',
            '[data-js-widget-type]': 'text: gadgetName',
            '[data-js-public]': 'classes: {hide: isMy}, attr: {title: sharedTitle}',
            '[data-js-gadget-remove]': 'classes: {hide: not(canRemove)}',
            '[data-js-gadget-edit]': 'classes: {hide: not(isMy)}',
            '[data-js-timeline]': 'classes: {hide: not(isTimeline)}'
        },
        computeds: {
            canRemove: {
                deps: ['isMy', 'isMyDashboard'],
                get: function(isMy, isMyDashboard) {
                    return (config.userModel.get('isAdmin') ||
                    config.userModel.getRoleForCurrentProject() == config.projectRolesEnum.project_manager ||
                    isMyDashboard || (isMy && isMyDashboard));
                }
            }
        },
        initialize: function() {
            this.activate = false;
            this.render();
            this.$el.addClass('load');
            this.$el.attr({'data-id': this.model.get('id'), 'data-gs-min-width': config.minWidgetWidth,
                'data-gs-min-height': config.minWidgetHeight});
            this.el.backboneView = this;// for gridstack
            this.listenTo(this.model, 'update:timer', this.updateTimer);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        appendTooltip: function(){
            var description =  this.model.get('description'),
                el = $('[data-js-comment]', this.$el);
            if(description){
                Util.appendTooltip(function() {
                    var tooltip = new SimpleTooltipView({message: description});
                    return tooltip.$el.html();
                }, el, el);
            }
        },
        onClickRefresh: function() {
            config.trackingDispatcher.trackEventNumber(287);
            this.update();
        },
        startResize: function() {
            this.$el.addClass('hide-widget');
        },
        stopResize: function() {
            this.widgetView && this.widgetView.resize();
            this.$el.removeClass('hide-widget');
        },
        update: function(silent) {
            !silent && this.$el.addClass('load');
            var self = this;
            this.model.update()
                .done(function(){
                    self.updateWidget();
                })
                .fail(function(error){
                    self.onLoadDataError(error);
                })
                .always(function() {
                    !silent && self.$el.removeClass('load');
                })
        },
        updateTimer: function() {
            this.activate && this.update(true);
        },
        updateWidget: function() {
            this.widgetView && this.widgetView.destroy();
            if(!this.model.get('gadget')){
                this.onLoadDataError();
                return;
            }
            this.widgetView = new WidgetView({model: (new WidgetModel(this.model.get('widgetData')))});
            $('[data-js-widget-container]', this.$el).html(this.widgetView.$el);
            this.appendTooltip();
        },
        onLoadDataError: function(error){
            var message = Localization.widgets.unableLoadData;
            if(error && error.status == 404){
                message = Localization.widgets.widgetNotFound;
            }
            else {
                var owner = this.model.get('owner'),
                    isShared = this.model.get('isShared');
                if(!isShared && (owner !== config.userModel.get('name'))){
                    message = Localization.widgets.unsharedWidget;
                }
            }
            $('[data-js-widget-container]', this.$el).html(Util.templates(this.errorTpl, {message: message}));
        },
        onClickRemove: function(e) {
            e.stopPropagation();
            config.trackingDispatcher.trackEventNumber(288);
            var self = this;
            var dangerRemove = (!this.model.get('isMy') && !this.model.get('isMyDashboard'));
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deletedWidget,
                bodyText: Util.replaceTemplate(
                    !dangerRemove ? Localization.dialog.deletedWidget:Localization.dialog.deletedWidgetDanger,
                    this.model.get('name')),
                confirmText: !dangerRemove?'':Localization.dialog.deletedWidgetDangerConfirmText,
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            });
            modal.show().done(function() {
                self.model.trigger('remove:view', self); // for gridstack
                self.model.collection.remove(self.model);
                self.destroy();
            });
            $('[data-js-close]', modal.$el).on('click', function(){
                config.trackingDispatcher.trackEventNumber(339);
            });
            $('[data-js-cancel]', modal.$el).on('click', function(e){
                config.trackingDispatcher.trackEventNumber(340);
            });
            $('[data-js-ok]', modal.$el).on('click', function(){
                config.trackingDispatcher.trackEventNumber(341);
            });
        },
        activateGadget: function() {
            this.activate = true;
            this.update();
        },
        onClickGadgetEdit: function() {
            config.trackingDispatcher.trackEventNumber(286);
            var self = this;
            (new ModalEditWidget({
                model: this.model
            })).show()
                .done(function() {
                    if(typeof self.model.changed.isShared != 'undefined') {
                        launchFilterCollection.ready.done(function() {
                            launchFilterCollection.update();
                        })
                    }
                    self.update();
                })
        },
        getDataForGridStack: function() {
            return [this.el, this.model.get('x'), this.model.get('y'), this.model.get('width'), this.model.get('height')];
        },
        onDestroy: function () {
            this.$el.remove();
        },
    });


    return GadgetView;
});
