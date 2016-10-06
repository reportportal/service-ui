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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Components = require('core/components');
    var Service = require('coreService');
    var App = require('app');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Widgets = require('widgets');

    var config = App.getInstance();

    var CompareAction = Epoxy.View.extend({
        initialize: function(options) {
            var self = this;
            this.async = $.Deferred();
            this.ids = _.map(options.items, function(item) {
                return item.get('id');
            });
            this.compareModal = Util.getDialog({name: "tpl-launches-compare-modal"});
            this.modalContent = $("#compareContent", this.compareModal);
            this.modalContent.css('min-height', '420px');
            this.loader = $('.submitticket-loader', this.compareModal);
            this.compareModal.modal("show").one('hidden.bs.modal', function(){
                self.async.resolve();
            });
            this.load();
        },
        getAsync: function() {
            return this.async;
        },
        load: function() {
            var self = this;
            Service.getCompare(this.ids.join(','))
                .done(function (response) {
                    self.loader.hide();
                    self.createChart(response);
                }).fail(function (response) {
                    self.loader.hide();
                    Util.ajaxFailMessenger(response, "errorUpdateWidget");
                    self.compareModal.modal("hide");
                });
        },
        createChart: function (response) {
            var gadget = 'launches_comparison_chart',
                widgetsConfig = WidgetsConfig.getInstance(),
                criteria = widgetsConfig.widgetTypes[gadget].staticCriteria;
            delete criteria['statistics$defects$no_defect$total'];
            this.widget = new Widgets.LaunchesComparisonChart({
                container: this.modalContent,
                param: {
                    gadget: gadget,
                    content: response,
                    content_fields: _.keys(widgetsConfig.widgetTypes[gadget].staticCriteria),
                    height: config.defaultWidgetHeight
                }
            });
            this.widget.render();
        },
    });

    return CompareAction;
});