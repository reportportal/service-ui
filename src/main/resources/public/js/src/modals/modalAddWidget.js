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

    var Epoxy = require('backbone-epoxy');
    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var $ = require('jquery');
    var WidgetsConfig = require('widget/widgetsConfig');

    var SelectWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-select-widget',
        template: 'tpl-modal-add-widget-select-widget',
        events: {
            'change input[type="radio"]': 'onChangeType',
            'click [data-js-next-step]': 'onClickNextStep',
        },
        bindings: {
            '[data-js-next-step]': 'attr: {disabled: not(gadget)}',
        },
        initialize: function() {
            this.widgetConfig = WidgetsConfig.getInstance();
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {widgets: this.widgetConfig.widgetTypes}))
        },
        onClickNextStep: function(e) {
            e.preventDefault();
            this.trigger('next');
            console.log('trigger')
        },
        onChangeType: function() {
            this.model.set({gadget: $('input:checked', this.$el).val()});
        },
        destroy: function() {

        }
    })

    var ModalAddWidget = ModalView.extend({
        template: 'tpl-modal-add-widget',
        className: 'modal-add-widget',

        events: {

        },
        bindings: {
            '[data-js-widget-type]': 'text: gadgetName',
            '[data-js-widget-description]': 'text: gadgetDescription',
            '[data-js-widget-preview]': 'css: {"background-image": format("url($1)", gadgetPreviewImg)}',
        },

        initialize: function(options) {
            if(!options.model) {
                console.log('Model is not found');
                return false;
            }
            this.viewModel = new (Epoxy.Model.extend({
                defaults: { step: 1 }
            }));
            this.render();
            this.selectWidgetView = new SelectWidgetView({model: this.model});
            $('[data-js-step-1]', this.$el).html(this.selectWidgetView.$el);
            this.listenTo(this.viewModel, 'change:step', this.setState);
            this.setState();
            this.listenTo(this.selectWidgetView, 'next', this.nextState);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        setState: function() {
            $('[data-js-step-1-title], [data-js-step-2-title], [data-js-step-3-title]', this.$el).removeClass('active visited');
            $('[data-js-step-1], [data-js-step-2], [data-js-step-3]', this.$el).removeClass('active');
            switch(this.viewModel.get('step')) {
                case 1:
                    $('[data-js-step-1-title], [data-js-step-1]', this.$el).addClass('active');
                    break;
                case 2:
                    $('[data-js-step-1-title]', this.$el).addClass('visited');
                    $('[data-js-step-2-title], [data-js-step-2]', this.$el).addClass('active');
                    break;
                case 3:
                    $('[data-js-step-1-title], [data-js-step-2-title]', this.$el).addClass('visited');
                    $('[data-js-step-3-title], [data-js-step-3]', this.$el).addClass('active');
                    break;
            }
        },
        nextState: function() {
            var curStep = this.viewModel.get('step');
            console.log(curStep);
            if(curStep < 3) {
                this.viewModel.set('step', curStep + 1);
            }
        }

    });

    return ModalAddWidget;
});