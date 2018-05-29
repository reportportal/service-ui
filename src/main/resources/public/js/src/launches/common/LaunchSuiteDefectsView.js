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

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var LaunchSuiteDefectsHoverView = require('launches/common/LaunchSuiteDefectsHoverView');
    var DonutChartComponent = require('components/DonutChartComponent');
    var config = App.getInstance();

    var LaunchSuiteDefectsView = Epoxy.View.extend({
        template: 'tpl-launch-suite-defects',

        events: {
            'click [data-js-link]': 'onClickDefectType'
        },
        bindings: {
            '[data-js-defects-total]': 'text: totalDefects, attr: {style: defectBorderColor}',
            '[data-js-link]': 'attr: {href: executionLink}'
        },
        computeds: {
            totalDefects: {
                deps: ['statistics'],
                get: function (statistics) {
                    if (statistics && statistics.defects && statistics.defects[this.type]
                        && statistics.defects[this.type].total) {
                        return statistics.defects[this.type].total;
                    }
                    return 0;
                }
            },
            executionLink: {
                deps: ['url', 'has_childs'],
                get: function (url, hasChilds) {
                    if (hasChilds) {
                        return this.allCasesUrl();
                    }
                    return undefined;
                }
            },
            defectBorderColor: function () {
                return 'border-color: ' + this.defectsCollection.getMainColorByType(this.type);
            }
        },
        initialize: function (options) {
            this.type = options.type;
            this.clickable = (typeof options.clickable !== 'undefined') ? options.clickable : true;
            this.defectsCollection = new SingletonDefectTypeCollection();
            this.defectsCollection.ready.done(function () {
                this.render();
            }.bind(this));
        },

        render: function () {
            var self = this;
            this.applyBindings();
            if (this.getBinding('totalDefects')) {
                this.$el.html(Util.templates(this.template, { clickable: this.clickable }));
                this.drawDonutChart();
                // var $hoverElement = $('[data-js-hover-element]', this.$el);
                this.hoverView = new LaunchSuiteDefectsHoverView({
                    el: $('[data-js-hover-view-container]', this.$el),
                    type: self.type,
                    model: self.model,
                    noLink: !this.clickable
                });
                this.applyBindings();
            }
        },
        allCasesUrl: function () {
            var url = this.model.get('url');
            var statusFilter = '&filter.in.issue$issue_type=';
            var subDefects = this.defectsCollection.toJSON();
            var defects = Util.getSubDefectsLocators(this.type, subDefects).join('%2C');

            var appendFilter = 'filter.eq.has_childs=false' + statusFilter + defects;
            return url + '?' + appendFilter;
        },
        onClickDefectType: function () {
            this.model.trigger('drill:item', this.model);
            if (this.model.get('type') === 'SUITE') {
                switch (this.type) {
                case ('product_bug'):
                    config.trackingDispatcher.trackEventNumber(126.1);
                    break;
                case ('automation_bug'):
                    config.trackingDispatcher.trackEventNumber(128.1);
                    break;
                case ('system_issue'):
                    config.trackingDispatcher.trackEventNumber(130.1);
                    break;
                default:
                    break;
                }
            } else {
                switch (this.type) {
                case ('product_bug'):
                    config.trackingDispatcher.trackEventNumber(54.2);
                    break;
                case ('automation_bug'):
                    config.trackingDispatcher.trackEventNumber(56.2);
                    break;
                case ('system_issue'):
                    config.trackingDispatcher.trackEventNumber(58.2);
                    break;
                default:
                    break;
                }
            }
        },
        getDefectByType: function () {
            var statistics = this.model.get('statistics');
            return statistics.defects[this.type];
        },
        getDefectChartData: function () {
            var self = this;
            var data = [];
            var defects = this.getDefectByType();
            var offset = 75;
            Object.keys(defects).forEach(function(defect) {
                if (defect !== 'total') {
                    var val = defects[defect];
                    var percents = val / defects.total * 100;

                    data.push({
                        value: percents,
                        color: self.defectsCollection.getDefectType(defect).color,
                        offset: 100 - offset,
                    });
                    offset = offset + percents;
                }
            });
            return data;
        },
        drawDonutChart: function () {
            var data = this.getDefectChartData();
            var $el = $('[data-js-chart]', this.$el);
            var chart = new DonutChartComponent({
                viewBox: 64,
                strokeWidth: 13,
                items: data,
            });
            $el.html(chart.el);
        },
        onDestroy: function () {
            this.hoverView && this.hoverView.destroy();
            this.chart && (this.chart = this.chart.destroy());
            this.$el.remove();
            delete this;
        }
    });

    return LaunchSuiteDefectsView;
});
