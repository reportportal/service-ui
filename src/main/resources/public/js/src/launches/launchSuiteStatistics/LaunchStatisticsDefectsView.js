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

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var d3 = require('d3');
    var nvd3 = require('nvd3');
    var LaunchSuiteDefectsTooltip = require('launches/launchSuiteStatistics/LaunchSuiteDefectsTooltip');

    var config = App.getInstance();

    var LaunchStatisticsDefectsView = Epoxy.View.extend({
        template: 'tpl-launch-suite-item-defects',
        initialize: function(options) {
            this.$container = options.$container;
            this.type = options.type;
            this.render();
        },
        events: {
            'mouseenter [data-js-defect-type-id]:not(.rendered)': 'showDefectTooltip'
        },
        bindings: {
            '[data-js-defects-total]': 'text: totalDefects',
            '[data-js-defect-type-id]': 'attr: {id: defectTypeId}',
            '[data-js-cases-url]': 'attr: {href: allCasesUrl}',
            '[data-js-defect-border-color]': 'attr: {style: defectBorderColor}',
            '[data-js-defect-background-color]': 'attr: {style: defectBackgroundColor}'
        },
        computeds: {
            totalDefects: function(){
                var statistics = this.getBinding('statistics');
                return statistics['defects'][this.type].total;
            },
            defectTypeId: function(){
                var id = this.getBinding('id');
                return 'defect-'+id+'-'+this.type;
            },
            allCasesUrl: function(){
                var url = this.getBinding('url'),
                    id = this.getBinding('id'),
                    owner = this.getBinding('owner'),
                    positionalFilter = owner !== undefined ? '&filter.eq.launch=' : '&filter.in.path=',
                    statusFilter = '&filter.in.issue$issue_type=',
                    defectTypes = new SingletonDefectTypeCollection(),
                    subDefects = defectTypes.toJSON(),
                    defects = Util.getSubDefectsLocators(this.type, subDefects).join('%2C');

                return url + '?page.page=1&page.sort=start_time,ASC'
                    + '&filter.eq.has_childs=false'
                    + statusFilter
                    + defects
                    + positionalFilter + id;
            },
            defectBorderColor: function(){
                return 'border-color: ' + this.getDefectColor();
            },
            defectBackgroundColor: function(){
                var color = this.getDefectColor();
                return 'background-color: ' + color + ';' + 'border-color: ' + color;
            }
        },
        render: function() {
            var model = this.model.toJSON({computed: true});
            this.$el.html(Util.templates(this.template, {
                model: model,
                type: this.type,
                statistics: this.getStatisticsByType()
            }));
            this.$container.append(this.$el);
            if(this.type !== 'to_investigate'){
                setTimeout(function(){
                    this.drawPieChart();
                }.bind(this), 500);
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
            var data = [],
                defect = this.getDefectByType();

            _.each(defect, function(v, k){
                if(k !== 'total'){
                    var defects = new SingletonDefectTypeCollection(),
                        customDefect = defects.getDefectType(k);
                    if(customDefect){
                        data.push({color: customDefect.color, key: customDefect.longName, value: parseInt(v)});
                    }
                }
            }, this);
            return data;
        },
        getDefectColor: function () {
            var sd = config.patterns.defectsLocator,
                defect = this.getDefectByType(),
                defects = new SingletonDefectTypeCollection(),
                defectType = _.findKey(defect, function(v, k){
                    return sd.test(k);
                });
            if(defectType){
                var issueType = defects.getDefectType(defectType);
                if(issueType){
                    return issueType.color;
                }
            }
            return Util.getDefaultColor(this.type);
        },
        drawPieChart: function () {
            var pieWidth = 48,
                pieHeight = 48,
                id = 'defect-'+this.model.get('id')+'-'+this.type,
                data = this.getDefectChartData();

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

            //console.log('drawPieChart: ', d3.select('#' + id + ' svg'));

            d3.select('#' + id + ' svg')
                .datum([data])
                .call(this.chart);
        },
        showDefectTooltip: function (e) {
            var el = $(e.currentTarget);
            el.addClass('rendered');
            this.tooltip = new LaunchSuiteDefectsTooltip({
                $container: $('.rendered', this.$el),
                type: this.type,
                model: this.model
            });
        },
        destroy: function () {
            this.tooltip && this.tooltip.destroy();
            this.chart = null;
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    return LaunchStatisticsDefectsView;
});
