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
    var ModalView = require('modals/_modalView');

    var App = require('app');
    var Util = require('util');
    var Service = require('coreService');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Widgets = require('widgets');

    var config = App.getInstance();

    var ModalLaunchesCompare = ModalView.extend({
        template: 'tpl-modal-launches-compare',
        className: 'modal-launches-compare',


        initialize: function(options) {
            this.ids = _.map(options.items, function(item) {
                return item.get('id');
            });
            this.$el.addClass('load');
            this.render();
            this.load();
        },
        load: function() {
            var self = this;
            Service.getCompare(this.ids.join(','))
                .done(function (response) {
                    self.$el.removeClass('load');
                    self.createChart(response);
                }).fail(function (response) {
                    Util.ajaxFailMessenger(response, "errorUpdateWidget");
                    self.hide();
                });
        },
        onKeySuccess: function () {
          return;
        },
        createChart: function (response) {
            var gadget = 'launches_comparison_chart',
                container = $('[data-js-widget-content]', this.$el),
                widgetsConfig = WidgetsConfig.getInstance(),
                criteria = widgetsConfig.widgetTypes[gadget].staticCriteria;
            delete criteria['statistics$defects$no_defect$total'];
            this.widget = new Widgets.LaunchesComparisonChart({
                container: container,
                param: {
                    gadget: gadget,
                    content: response,
                    content_fields: _.keys(widgetsConfig.widgetTypes[gadget].staticCriteria),
                    height: config.defaultWidgetHeight
                }
            });
            this.$el.addClass('ready');
            var self = this;
            setTimeout(function () {
                self.widget.render();
            }, 500);

        },

        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        }
    });

    return ModalLaunchesCompare;
});
