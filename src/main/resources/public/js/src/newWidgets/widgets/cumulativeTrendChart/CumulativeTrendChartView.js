/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
    var _ = require('underscore');
    var Util = require('util');
    var C3ChartWidgetView = require('newWidgets/_C3ChartWidgetView');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var Service = require('coreService');
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
    var App = require('app');
    var config = App.getInstance();

    var CumulativeTrendWidget = C3ChartWidgetView.extend({
        template: 'tpl-widget-cumulative-trend',
        tooltipTemplate: 'tpl-widget-cumulative-trend-tooltip',
        className: 'cumulative-trend',

        render: function () {
            var contentData;

            if (this.isPreview) {
                this.$el.addClass('preview-view');
            }

            if (!this.isDataExists()) {
                this.addNoAvailableBock();
                return;
            }
            this.charts = [];
            this.scrollers = [];
            contentData = this.model.getContent().result;
            this.defetTypesCollection = new SingletonDefectTypeCollection();
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.$el.html(Util.templates(this.template, {}));

            this.defetTypesCollection.ready.done(function () {
                this.launchFilterCollection.ready.done(function () {
                    this.loadTempFilterModel().done(function () {
                        $('[data-js-preloader-cumulative-widget]', this.$el).removeClass('show');
                        this.drawBarChart($('[data-js-chart-container]', this.$el), contentData);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },
        loadTempFilterModel: function () {
            var async = $.Deferred();
            if (this.isPreview) {
                async.resolve();
                return async;
            }
            if (this.launchFilterCollection.get(this.model.get('filter_id'))) {
                this.tempFilterModelData = {
                    temp: true,
                    selection_parameters: this.launchFilterCollection.get(this.model.get('filter_id')).get('selection_parameters'),
                    entities: this.launchFilterCollection.get(this.model.get('filter_id')).get('entities')
                };
                async.resolve();
            } else {
                Service.getFilterData([this.model.get('filter_id')]).done(function (data) {
                    data && (this.tempFilterModelData = {
                        temp: true,
                        selection_parameters: JSON.stringify(data[0].selection_parameters),
                        entities: JSON.stringify(data[0].entities)
                    });
                    async.resolve();
                }.bind(this));
            }
            return async;
        },
        drawBarChart: function ($el, data) {
            var self = this;
            var chart;
            var legendScroller;
            var chartDataColumns = [];
            var passed = ['statistics$executions$passed'];
            var failed = ['statistics$executions$failed'];
            var skipped = ['statistics$executions$skipped'];
            var pb = ['statistics$defects$product_bug$total'];
            var ab = ['statistics$defects$automation_bug$total'];
            var si = ['statistics$defects$system_issue$total'];
            var nd = ['statistics$defects$no_defect$total'];
            var ti = ['statistics$defects$to_investigate$total'];
            var colors = {};
            var dataGroupNames = [];

            _.each(data, function (item) {
                dataGroupNames.push(item.id);
                _.each(item.values, function (value, key) {
                    switch (key) {
                    case passed[0]:
                        passed.push(value);
                        break;
                    case failed[0]:
                        failed.push(value);
                        break;
                    case skipped[0]:
                        skipped.push(value);
                        break;
                    case pb[0]:
                        pb.push(value);
                        break;
                    case ab[0]:
                        ab.push(value);
                        break;
                    case si[0]:
                        si.push(value);
                        break;
                    case nd[0]:
                        nd.push(value);
                        break;
                    case ti[0]:
                        ti.push(value);
                        break;
                    default:
                        break;
                    }
                });
            });
            _.each(data[0].values, function (val, key) { // gets colors for items
                colors[key] = config.defaultColors[key.split('$')[2]];
            });

            // pushing data in correct order
            data[0].values.statistics$executions$passed && chartDataColumns.push(passed);
            data[0].values.statistics$executions$failed && chartDataColumns.push(failed);
            data[0].values.statistics$executions$skipped && chartDataColumns.push(skipped);
            data[0].values.statistics$defects$product_bug$total && chartDataColumns.push(pb);
            data[0].values.statistics$defects$automation_bug$total && chartDataColumns.push(ab);
            data[0].values.statistics$defects$system_issue$total && chartDataColumns.push(si);
            data[0].values.statistics$defects$no_defect$total && chartDataColumns.push(nd);
            data[0].values.statistics$defects$to_investigate$total && chartDataColumns.push(ti);

            chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: chartDataColumns,
                    type: 'bar',
                    onclick: function (d, element) {
                        var url;
                        var newEntities = [];
                        var hasTagEntity = false;
                        var tempFilterModel = self.launchFilterCollection.generateTempModel(self.tempFilterModelData);
                        _.each(tempFilterModel.getEntitiesObj(), function (entity) {
                            var newTagEntity;
                            if (entity.filtering_field === 'tags') {
                                hasTagEntity = true;
                                if (~entity.value.split(',').indexOf(dataGroupNames[d.index])) {
                                    newEntities.push(entity);
                                } else {
                                    newTagEntity = {
                                        filtering_field: 'tags',
                                        condition: entity.condition,
                                        value: entity.value + ',' + dataGroupNames[d.index]
                                    };
                                    newEntities.push(newTagEntity);
                                }
                            } else {
                                newEntities.push(entity);
                            }
                        });
                        if (!hasTagEntity) {
                            newEntities.push({
                                filtering_field: 'tags',
                                condition: 'has',
                                value: dataGroupNames[d.index]
                            });
                        }
                        tempFilterModel.set('newEntities', JSON.stringify(newEntities));
                        url = tempFilterModel.get('url');
                        config.router.navigate(url, { trigger: true });
                    },
                    colors: colors
                },
                axis: {
                    x: {
                        show: !self.isPreview,
                        type: 'category',
                        categories: _.map(dataGroupNames, function (category) {
                            return category.split(self.model.getWidgetOptions().prefix[0] + ':')[1];
                        }),
                        tick: {
                            centered: true,
                            inner: true
                        }
                    },
                    y: {
                        show: !self.isPreview
                    }
                },
                grid: {
                    y: {
                        show: !self.isPreview
                    }
                },
                size: {
                    height: self.$el.parent().height()
                },
                interaction: {
                    enabled: !self.isPreview
                },
                padding: {
                    top: self.isPreview ? 0 : 85
                },
                legend: {
                    show: false // we use custom legend
                },
                tooltip: {
                    position: function (d, width, height, element) {
                        var left = d3.mouse(chart.element)[0] - (width / 2);
                        var top = d3.mouse(chart.element)[1] - height;
                        return {
                            top: top - 8, // 8 - offset for tooltip arrow
                            left: left
                        };
                    },
                    contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                        var groupName = dataGroupNames[d[0].index];
                        var itemsData = [];
                        _.each(d, function (item) {
                            itemsData.push({
                                color: color(item.id),
                                name: Localization.filterNameById[item.name.split('$total')[0]],
                                value: item.value
                            });
                        });
                        return Util.templates(self.tooltipTemplate, {
                            groupName: groupName,
                            items: itemsData
                        });
                    }
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                }
            });
            this.charts.push(chart);

            // Configuring custom legend block
            if (!self.isPreview) {
                d3.select(chart.element)
                    .insert('div', '.chart')
                    .attr('class', 'legend')
                    .insert('div', '.legend')
                    .attr('data-js-legend-wrapper', '') // wrapper for BaronScroll
                    .selectAll('span')
                    .data(_.map(chartDataColumns, function (column) {
                        return column[0];
                    }))
                    .enter()
                    .append('span')
                    .attr('data-id', function (id) {
                        return id;
                    })
                    .html(function (id) {
                        return '<div class="color-mark"></div>' + Localization.filterNameById[id.split('$total')[0]];
                    })
                    .each(function (id) {
                        if (~self.hiddenItems.indexOf(id)) {
                            $('.color-mark', $(this)).addClass('unchecked');
                        }
                        d3.select(this).select('.color-mark').style('background-color', chart.color(id));
                    })
                    .on('mouseover', function (id) {
                        chart.focus(id);
                    })
                    .on('mouseout', function (id) {
                        chart.revert();
                    })
                    .on('click', function (id) {
                        config.trackingDispatcher.trackEventNumber(342);
                        $('.color-mark', $(this)).toggleClass('unchecked');
                        chart.toggle(id);
                    });
                this.hiddenItems && chart.hide(this.hiddenItems);
                d3.select(chart.element).select('.legend')
                    .append('div')
                    .attr('class', 'legend-gradient')
                    .append('div')
                    .attr('class', 'legend-border');
                legendScroller = Util.setupBaronScroll($('[data-js-legend-wrapper]', $el));
                this.scrollers.push(legendScroller);
            }
        },
        updateWidget: function () {
            $('[data-js-preloader-cumulative-widget]', this.$el).addClass('show');
            _.each(this.charts, function (chart) {
                chart.flush();
                chart.resize({
                    height: this.$el.parent().height()
                });
            }.bind(this));
            $('[data-js-preloader-cumulative-widget]', this.$el).removeClass('show');
        },
        onBeforeDestroy: function () {
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });

    return CumulativeTrendWidget;
});
