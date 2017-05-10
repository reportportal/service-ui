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
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var Service = require('coreService');
    var WidgetService = require('newWidgets/WidgetService');
    var WidgetModel = require('newWidgets/WidgetModel');
    var LaunchesComparisonChart = require('newWidgets/widgets/LaunchesComparisonChartView');

    var ModalLaunchesCompare = ModalView.extend({
        template: 'tpl-modal-launches-compare',
        className: 'modal-launches-compare',


        initialize: function (options) {
            this.ids = _.map(options.items, function (item) {
                return item.get('id');
            });
            this.$el.addClass('load');
            this.render();
            this.load();
        },
        load: function () {
            var self = this;
            Service.getCompare(this.ids.join(','))
                .done(function (response) {
                    self.$el.removeClass('load');
                    self.createChart(response);
                }).fail(function (response) {
                    Util.ajaxFailMessenger(response, 'errorUpdateWidget');
                    self.hide();
                });
        },
        onKeySuccess: function () {

        },
        createChart: function (response) {
            var gadget = 'launches_comparison_chart';
            var self = this;
            $.when(WidgetService.getFullWidgetConfig(gadget)).done(function (widget) {
                var curWidget = widget;
                var criteria = curWidget.staticCriteria;
                var widgetData = {
                    id: _.uniqueId() + '-' + gadget,
                    content_parameters: { gadget: gadget },
                    content: response
                };
                delete criteria.statistics$defects$no_defect$total;
                widgetData.content_parameters.content_fields = _.keys(criteria);
                self.widget = new LaunchesComparisonChart({
                    isPreview: true,
                    model: new WidgetModel(widgetData, { parse: true })
                });
                self.$el.addClass('ready');
                setTimeout(function () {
                    $('[data-js-widget-content]', this.$el).append(self.widget.$el);
                    self.widget.onShow();
                }, 500);
            });
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        }
    });

    return ModalLaunchesCompare;
});
