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

    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var $ = require('jquery');
    var _ = require('underscore');
    var WidgetService = require('newWidgets/WidgetService');
    var WidgetSettingsView = require('modals/addWidget/WidgetSettingsView');
    var SaveWidgetView = require('modals/addWidget/SaveWidgetView');
    var PreviewWidgetView = require('newWidgets/PreviewWidgetView');
    var Service = require('coreService');
    var App = require('app');

    var config = App.getInstance();


    var ModalEditWidget = ModalView.extend({
        template: 'tpl-modal-edit-widget',
        className: 'modal-edit-widget',

        events: {
            'click [data-js-save]': 'onClickSaveWidget',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel'
        },
        bindings: {
            '[data-js-widget-type]': 'html: gadgetName',
            '[data-js-widget-description]': 'html: gadgetDescription'
        },
        initialize: function (options) {
            if (!options.model) {
                return false;
            }
            this.originalModel = options.model;
            this.model = this.originalModel.clone();
            this.curWidget = WidgetService.getWidgetConfig(this.model.get('gadget'));
            this.render();

            this.listenTo(this.model, 'change', this.disableHideBackdrop);
        },
        sendEvent: function (eventOptions) {
            switch (eventOptions.view) {
            case 'filter':
                switch (eventOptions.action) {
                case 'add filter':
                    config.trackingDispatcher.trackEventNumber(328);
                    break;
                case 'submit filter':
                    config.trackingDispatcher.trackEventNumber(331);
                    break;
                case 'cancel filter':
                    config.trackingDispatcher.trackEventNumber(330);
                    break;
                case 'change filter name':
                    config.trackingDispatcher.trackEventNumber(327);
                    break;
                case 'edit filter item':
                    config.trackingDispatcher.trackEventNumber(298);
                    break;
                case 'select filter item':
                    config.trackingDispatcher.trackEventNumber(329);
                    break;
                case 'entity choice click':
                    config.trackingDispatcher.trackEventNumber(332);
                    break;
                case 'sorting list click':
                    config.trackingDispatcher.trackEventNumber(333);
                    break;
                case 'cancel add click':
                    config.trackingDispatcher.trackEventNumber(334);
                    break;
                case 'ok add click':
                    config.trackingDispatcher.trackEventNumber(335);
                    break;
                case 'edit entity':
                    config.trackingDispatcher.trackEventNumber(336);
                    break;
                case 'cancel edit filter':
                    config.trackingDispatcher.trackEventNumber(337);
                    break;
                case 'ok edit filter':
                    config.trackingDispatcher.trackEventNumber(338);
                    break;
                }
                break;
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.widgetSettingsView = new WidgetSettingsView({
                model: this.model,
                isShortForm: true
            });
            $('[data-js-widget-settings]', this.$el).html(this.widgetSettingsView.$el);
            this.listenTo(this.widgetSettingsView, 'change:view', this.onChangeSettingsViewMode);
            this.listenTo(this.widgetSettingsView, 'send:event', this.sendEvent);

            this.saveWidget = new SaveWidgetView({
                model: this.model,
                dashboardModel: this.dashboardModel
            });
            $('[data-js-widget-save]', this.$el).html(this.saveWidget.$el);
            this.listenTo(this.model, 'change', _.debounce(this.onChangeModel, 10));
        },
        onChangeModel: function (model) {
            this.curWidget = WidgetService.getWidgetConfig(model.get('gadget'));
        },
        onChangePreview: function () {
            this.previewWidgetView && this.previewWidgetView.destroy();
            this.previewWidgetView = new PreviewWidgetView({
                model: this.model,
                validateForPreview: this.validateForPreview.bind(this)
            });
            $('[data-js-widget-preview]', this.$el).html(this.previewWidgetView.$el);
        },
        onShown: function () {
            this.listenTo(this.model, 'change:gadget change:widgetOptions change:content_fields change:filter_id change:itemsCount', _.debounce(this.onChangePreview, 10));
            this.onChangePreview();
        },
        onShow: function () {
            this.widgetSettingsView.activate();
            this.saveWidget.activate();
        },
        onChangeSettingsViewMode: function (options) {
            if (options.mode === 'expandedSettingView') {
                this.$el.addClass('expanded-setting-view-mode');
                $('[data-js-cancel]', this.$el).add('[data-js-save]', this.$el).attr('disabled', 'disabled');
                return;
            }
            $('[data-js-cancel]', this.$el).add('[data-js-save]', this.$el).removeAttr('disabled');
            this.$el.removeClass('expanded-setting-view-mode');
        },
        onClickClose: function () {
            config.trackingDispatcher.trackEventNumber(320);
        },
        onClickCancel: function () {
            config.trackingDispatcher.trackEventNumber(325);
        },
        onKeySuccess: function () {
            $('[data-js-save]', this.$el).focus().trigger('click');
        },
        onClickSaveWidget: function () {
            var self = this;
            var data;
            var contentParameters = {};
            if (this.saveWidget.validate() && this.widgetSettingsView.validate()) {
                config.trackingDispatcher.trackEventNumber(326);
                this.$el.addClass('load');
                contentParameters.type = this.curWidget.widget_type;
                contentParameters.gadget = this.model.get('gadget');
                contentParameters.metadata_fields = this.model.get('metadata_fields');
                contentParameters.itemsCount = this.model.get('itemsCount');
                if (this.model.getContentFields().length) {
                    contentParameters.content_fields = this.model.getContentFields();
                }
                contentParameters.widgetOptions = this.model.getWidgetOptions();
                data = {
                    name: this.model.get('name'),
                    share: this.model.get('share'),
                    content_parameters: contentParameters
                };
                if (this.model.get('filter_id')) {
                    data.filter_id = this.model.get('filter_id');
                }
                if (this.model.get('description')) {
                    data.description = this.model.get('description');
                }
                this.showLoading();
                Service.updateWidget(data, this.model.get('id'))
                    .done(function (response) {
                        self.originalModel.set(self.model.toJSON());
                        self.successClose(response.id);
                        Util.ajaxSuccessMessenger('widgetSave');
                    })
                    .fail(function () {
                        Util.ajaxFailMessenger(null, 'widgetSave');
                        self.hideLoading();
                    });
            }
        },
        validateForPreview: function () {
            return this.widgetSettingsView.validate({ forPreview: true });
        },
        onDestroy: function () {
            this.widgetSettingsView && this.widgetSettingsView.destroy();
            this.saveWidget && this.saveWidget.destroy();
        }

    });

    return ModalEditWidget;
});
