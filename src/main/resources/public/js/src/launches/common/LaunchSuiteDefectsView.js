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
    var App = require('app');
    var d3 = require('d3');
    var nvd3 = require('nvd3');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var LaunchSuiteDefectsHoverView = require('launches/common/LaunchSuiteDefectsHoverView');

    var config = App.getInstance();

    var LaunchSuiteDefectsView = Epoxy.View.extend({
        template: 'tpl-launch-suite-defects',

        bindings: {
            '[data-js-defects-total]': 'text: totalDefects, attr: {style: defectBorderColor}',
            '[data-js-link]': 'attr: {href: allCasesUrl}',
        },
        computeds: {
            totalDefects: {
                deps: ['statistics'],
                get: function(statistics) {
                    if (statistics && statistics['defects'] && statistics['defects'][this.type]
                        && statistics['defects'][this.type].total) {
                        return statistics['defects'][this.type].total;
                    }
                    return 0;
                }
            },
            allCasesUrl: function(){
                var url = this.model.get('clearUrl');
                var statusFilter = '&filter.in.issue$issue_type=';
                var subDefects = this.defectsCollection.toJSON();
                var defects = Util.getSubDefectsLocators(this.type, subDefects).join('%2C');

                var appendFilter = 'filter.eq.has_childs=false' + statusFilter + defects;
                return url + '|' + encodeURIComponent(appendFilter) + '?' + appendFilter;
            },
            defectBorderColor: function(){
                return 'border-color: ' + this.defectsCollection.getMainColorByType(this.type);
            },
        },

        events: {
            'mouseenter [data-js-hover-defect]': 'onHoverDefectType'
        },

        initialize: function(options) {
            this.type = options.type;
            this.defectsCollection = new SingletonDefectTypeCollection();
            this.defectsCollection.ready.done(function(){
                this.render();
            }.bind(this));
        },

        render: function() {
            this.applyBindings();
            if(this.getBinding('totalDefects')) {
                this.$el.html(Util.templates(this.template, {}));
                this.drawPieChart();
                var self = this;
                // var $hoverElement = $('[data-js-hover-element]', this.$el);
                this.hoverView = new LaunchSuiteDefectsHoverView({
                    el: $('[data-js-hover-view-container]', this.$el),
                    type: self.type,
                    model: self.model
                });
                this.applyBindings();
            }
        },
        onHoverDefectType: function(e){
            switch (this.type){
                case ('product_bug'):
                    config.trackingDispatcher.trackEventNumber(54);
                    break;
                case ('automation_bug'):
                    config.trackingDispatcher.trackEventNumber(56);
                    break;
                case ('system_issue'):
                    config.trackingDispatcher.trackEventNumber(58);
                    break;
                default:
                    break;
            }
        },
        getDefectByType: function(){
            var statistics = this.model.get('statistics');
            return statistics['defects'][this.type];
        },
        getStatisticsByType: function(){
            return parseInt(this.getDefectByType().total);
        },
        getDefectChartData: function (defect) {
            var data = [];
            var defect = this.getDefectByType();

            _.each(defect, function(v, k){
                if(k !== 'total'){
                    var customDefect = this.defectsCollection.getDefectType(k);
                    if(customDefect){
                        data.push({color: customDefect.color, key: customDefect.longName, value: parseInt(v)});
                    }
                }
            }, this);
            return data;
        },
        drawPieChart: function () {
            var pieWidth = 44;
            var pieHeight = 44;
            var data = this.getDefectChartData();

            this.chart = nvd3.models.pie()
                .x(function(d) {
                    return d.key;
                })
                .y(function(d) {
                    return d.value;
                })
                .width(pieWidth)
                .height(pieHeight)
                .showLabels(false)
                .donut(true)
                .growOnHover(false)
                .donutRatio(0.40)
                .startAngle(function(d){
                    return d.startAngle - Math.PI/2;
                })
                .endAngle(function(d){
                    return d.endAngle - Math.PI/2;
                })
                .color(function (d) {
                    return d.data.color;
                })
                .valueFormat(d3.format('f'));

            d3.select($('[data-js-chart]', this.$el).get(0))
                .datum([data])
                .call(this.chart);
        },
        destroy: function () {
            this.hoverView && this.hoverView.destroy();
            this.chart = null;
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    return LaunchSuiteDefectsView;
});
