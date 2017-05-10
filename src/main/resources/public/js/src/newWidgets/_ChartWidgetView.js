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
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Util = require('util');
    var App = require('app');
    var coreService = require('coreService');
    var Moment = require('moment');
    var Localization = require('localization');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var d3 = require('d3');
    var d3tip = require('d3Tip');

    var config = App.getInstance();

    var ChartWidgetView = BaseWidgetView.extend({
        tplTooltip: 'tpl-widget-tooltip',
        attributes: function () {
            return { id: this.id };
        },
        redirectOnElementClick: function (type) {
            var self;
            if (!this.isPreview) {
                self = this;
                this.chart[type].dispatch.on('elementClick', function (e) {
                    config.trackingDispatcher.trackEventNumber(344);
                    if (self.model.get('isTimeline')) {
                        self.redirectForTimeLine(e);
                    } else {
                        self.redirectToLaunch(e);
                    }
                });
            }
        },
        redirectForTimeLine: function (e) {
            var range = 86400000;
            var filterId = this.model.get('filter_id');
            coreService.getFilterData([filterId])
                .done(function (response) {
                    var time = Moment.unix(e.point.startTime);
                    var dateFilter = {
                        condition: 'btw',
                        filtering_field: 'start_time',
                        is_negative: false,
                        value: time.format('x') + ',' + (parseInt(time.format('x'), 10) + range)
                    };
                    var filtersCollection = new SingletonLaunchFilterCollection();
                    var newFilter = filtersCollection.generateTempModel();
                    var entities = response[0].entities || [];
                    var link = newFilter.get('url');

                    entities.push(dateFilter);
                    newFilter.set('newEntities', JSON.stringify(entities));
                    link += '?' + newFilter.getOptions().join('&');
                    if (link) {
                        setTimeout(function () {
                            document.location.hash = link;
                        }, 100);
                    }
                });
        },
        redirectToLaunch: function (e) {
            var key = e.series.key;
            var seria = _.find(this.series, function (v, k) {
                return v.key === key;
            });
            var seriesId = seria ? seria.seriesId : '';
            var cat = this.categories[e.pointIndex];
            var id = cat.id;
            var link = seriesId && id ? this.linkToRedirectService(seriesId, id) : '';
            if (link) {
                setTimeout(function () {
                    document.location.hash = link;
                }, 100);
            }
        },
        createTooltip: function (content) {
            return d3tip()
                .attr({ class: 'd3-tip', id: 'd3-tip-' + this.id })
                .style('display', 'none')
                .offset([-10, 0])
                .html(function (d) {
                    return content;
                });
        },
        tooltipLabel: Localization.widgets.casesLabel,
        tooltipContent: function () {
            var self = this;
            return function (key, x, y, e, graph) {
                var index = e.pointIndex;
                var cat = self.categories[index];
                var date;
                config.trackingDispatcher.trackEventNumber(343);
                if (self.model.get('isTimeline')) {
                    date = Moment.unix(cat.startTime);
                    return '<p style="text-align:left"><strong>' + date.format('YYYY-MM-DD') + '</strong><br/>' + key + ': <strong>' + y + '</strong> ' + self.tooltipLabel + '</p>';
                }
                date = self.formatDateTime(cat.startTime);
                return '<p style="text-align:left"><strong>' + cat.name + ' ' + cat.number + '</strong><br/>' + date + '<br/>' + key + ': <strong>' + y + '</strong> ' + self.tooltipLabel + '</p>';
            };
        },
        addSVG: function () {
            this.$el.css('overflow', 'visible').attr(this.attributes()).append('<svg></svg>');
        },
        formatNumber: function (d) {
            var cat;
            var date;
            if (d % 1 === 0) {
                cat = this.categories[d - 1];
                if (!this.model.get('isTimeline')) {
                    return (cat && cat.number) ? cat.number : d;
                }
                date = Moment.unix(cat.startTime);
                return date.format('ddd') + ',<br>' + date.format('YYYY-MM-DD');
            }
            return '';
        },
        formatCategories: function (d) {
            var cat = this.categories[d - 1];
            var date;
            if (!this.model.get('isTimeline')) {
                date = this.formatDateTime(cat.startTime);
                return '<strong>' + cat.name + ' ' + cat.number + '</strong><br/><span style="font-weight:normal">' + date + '</span>';
            }
            date = Moment.unix(cat.startTime);
            return '<strong>' + date.format('YYYY-MM-DD') + '</span>';
        },
        formatDateTime: function (time) {
            return Util.dateFormat(new Date(time));
        },
        disabeLegendEvents: function () {
            if (this.chart.legend) {
                for (var property in this.chart.legend.dispatch) {
                    this.chart.legend.dispatch[property] = function () {
                    };
                }
            }
        },
        addLegendClick: function (svg) {
            if (this.chart.legend) {
                svg.selectAll('.nvd3.nv-legend').on('click', function () {
                    config.trackingDispatcher.trackEventNumber(342);
                });
            }
        },
        addLaunchNameTip: function (svg, tip) {
            if (!this.isPreview) {
                var self = this;
                svg.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text')
                    .each(function (d) {
                        d3.select(this)
                            .on('mouseover.' + self.id, function (event) {
                                if (d3.select(this).style('opacity') === 1) {
                                    var category = self.categories[event - 1] || {};
                                    if (!category.name && !category.number) return;
                                    tip
                                        .style('display', 'block')
                                        .html(Util.templates(self.tplTooltip, {
                                            tooltipName: Localization.launches.launchName,
                                            tooltipContent: category.name + ' ' + category.number
                                        })).show();
                                }
                            })
                            .on('mouseout.' + self.id, function () {
                                tip
                                    .style('display', 'none')
                                    .hide();
                            });
                    });
            }
        },
        updateTickForTimeLine: function (vis) {
            var self = this;
            vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                var $this = $(this);
                var isMaxMin = $('.nv-x .tick', '#' + self.id + ' svg').index($this.parent()) === $('.nv-x .tick', '#' + self.id + ' svg').length - 1;
                var multiLineText = $this.text().split('<br>');

                $this.empty();
                for (var i = 0; i < multiLineText.length; i++) {
                    d3.select(this).append('tspan')
                        .text(multiLineText[i])
                        .attr('dy', i ? '1.2em' : 0)
                        .attr('x', isMaxMin ? -10 : 0)
                        .attr('y', 20)
                        .attr('text-anchor', 'middle')
                        .attr('class', 'tspan' + i);
                }
            });
        },
        getSeries: function () {
            var series = {};
            var gadget = this.model.get('gadget');
            var contentFields = this.model.getContentFields();
            this.invalid = 0;

            _.each(contentFields, function (i) {
                var fieldName = _.last(i.split('$'));
                var seriesId = fieldName;
                var name = Localization.launchesHeaders[seriesId];
                if (gadget === 'launches_comparison_chart' || gadget === 'last_launch') {
                    var n = seriesId.split('_');
                    if (n[1]) {
                        n[1] = n[1].capitalize();
                    }
                    seriesId = n.join('');
                }
                if (!name) {
                    var subDefect = this.defectsCollection.getDefectType(seriesId);
                    name = subDefect.longName;
                    if (!subDefect) {
                        name = Localization.widgets.invalidCriteria;
                        seriesId = 'invalid';
                        this.invalid++;
                    }
                }
                series[fieldName] = {
                    key: name,
                    seriesId: seriesId,
                    color: this.getSeriesColor(seriesId),
                    values: []
                };
            }, this);
            if (gadget === 'launches_comparison_chart') {
                delete series.total;
            }
            this.series = series;
            return this.series;
        },
        updateInvalidCriteria: function (vis) {
            if (this.invalid) {
                vis.selectAll('.nv-legend .nv-legend-text').each(function (d, i) {
                    if (d.seriesId === 'invalid') {
                        d3.select(this).attr('fill', d.color);
                        d3.select(this.previousSibling).attr('r', '2');
                    }
                });
                $('#' + this.id)
                    .addClass('widget-invalid')
                    .append(this.invalidDataMessage(this.invalid));
            }
        },
        getData: function () {
            var contentData = this.model.getContent() || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var criteria = this.model.getContentFields();
                var series = this.getSeries(criteria);

                if (!this.model.get('isTimeline')) {
                    _.each(contentData.result, function (d, i) {
                        var cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number,
                            startTime: parseInt(d.startTime, 10)
                        };
                        this.categories.push(cat);
                        _.each(d.values, function (v, k) {
                            var type = _.last(k.split('$'));
                            var prop = _.extend({ x: i + 1, y: parseFloat(v) }, cat);
                            series[type] && series[type].values.push(prop);
                        });
                    }, this);
                } else {
                    var pairs = _.pairs(contentData);
                    pairs.sort(function (a, b) {
                        return Moment(a[0], 'YYYY-MM-DD').unix() - Moment(b[0], 'YYYY-MM-DD').unix();
                    });
                    _.each(pairs, function (p, i) {
                        var values = p[1][0].values;
                        var date = Moment(p[0], 'YYYY-MM-DD');
                        var cat = {
                            time: date.format('YYYY-MM-DD'),
                            startTime: date.unix()
                        };
                        this.categories.push(cat);
                        _.each(values, function (v, k) {
                            var type = _.last(k.split('$'));
                            var prop = { startTime: date.unix(), x: i + 1, y: parseFloat(v) };
                            series[type].values.push(prop);
                        });
                    }, this);
                }
                return _.values(series);
            }
            return [];
        },
        updateWidget: function () {
            this.chart && this.chart.update();
        },
        onDestroy: function () {
            $(window).off('resize.' + this.id);
            this.chart = null;
            $('#d3-tip-' + this.id).remove();
        }
    });

    return ChartWidgetView;
});
