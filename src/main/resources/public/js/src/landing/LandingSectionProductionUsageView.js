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
'use strict';

define(function(require, exports, module) {
    var _LandingSection = require('landing/_LandingSection')
    require('d3');

    var LandingSectionProductionUsageView = _LandingSection.extend({
        id: 'productionUsage',
        className: 'b-common clearfix',
        tpl: 'tpl-landing-section-production_usage',

        changeScroll: function(scrollTop, scrollBlock){
            if(scrollBlock > 400){
                var $graph = $('.js-d3', this.$el);
                this.showAndAnimateElements($('.js-commonel', this.$el));
                $graph.removeClass("g-invisible").addClass($graph.data('animation'));
                this.animateDiagram();
                return true;
            }
        },
        animateDiagram: function() {
            var data = [{
                "end_time": "2014-12-25",
                "value": 0.00
            }, {
                "end_time": "2015-01-12",
                "value": 35.00
            }, {
                "end_time": "2015-02-10",
                "value": 60.00
            }, {
                "end_time": "2015-03-18",
                "value": 70.00
            }, {
                "end_time": "2015-04-23",
                "value": 90.00
            }, {
                "end_time": "2015-05-29",
                "value": 200.00
            }, {
                "end_time": "2015-06-6",
                "value": 250.00
            }]

            var dataY = [50, 100, 200];
            var dayNumberMonth = d3.time.format("%a %d %b");
            var m = [0, 180, 30, 50],
                w = 700 - m[1] - m[3],
                h = 350 - m[0] - m[2],

                parse = d3.time.format("%Y-%m-%d")
                    .parse;

            var x = d3.time.scale()
                .range([0, w + 100]),
                y = d3.scale.linear()
                    .range([h, 0]);

            var area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                    return x(d.end_time);
                })
                .y0(h)
                .y1(function (d) {
                    return y(d.value);
                });

            var line = d3.svg.line()
                .interpolate("monotone")
                .x(function (d) {
                    return x(d.end_time);
                })
                .y(function (d) {
                    return y(d.value);
                });

            data.forEach(function (d) {
                d.end_time = parse(d.end_time);
                d.value = +d.value;
            });


            x.domain([data[0].end_time, data[data.length - 1].end_time]);
            y.domain([0, 300])
                .nice();

            var svg = d3.select(".js-graph")
                .append("svg:svg")
                .attr("width", "100%")
                .attr("height", h + m[0] + m[2])
                .attr("viewBox", "0 0 700 350")
                .attr("preserveAspectRatio", "xMaxYMax meet")
                .append("svg:g")
                .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

            svg.append("clipPath")
                .attr("id", "rectClip")
                .append("rect")
                .attr("x", -50)
                .attr("y", 20)
                .attr("width", 0)
                .attr("height", h);

            svg.append("svg:path")
                .attr("class", "line")
                .attr("d", line(data))
                .attr("clip-path", "url(#rectClip)");

            svg.append("svg:path")
                .attr("class", "area")
                .attr("d", area(data))
                .attr("clip-path", "url(#rectClip)");

            svg.append("line")
                .attr("class", "x axis")
                .attr("x1", -50)
                .attr("x2", w + 150)
                .attr("y1", h)
                .attr("y2", h);

            svg.append("line")
                .attr("class", "y axis")
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", 0)
                .attr("y2", h + 80)


            data.forEach(function (d) {
                if (d.end_time != data[data.length - 1].end_time && d.end_time != data[0].end_time) {
                    svg.append("line")
                        .attr("x1", x(d.end_time))
                        .attr("x2", x(d.end_time))
                        .attr("y1", d.value * 2 > h ? y(h - 70) : y(d.value * 2))
                        .attr("y2", y(5))
                        .attr('stroke', '#000')
                        .attr("class", "vlinecircle")
                        .attr("clip-path", "url(#rectClip)");
                    svg.append("svg:text")
                        .text(dayNumberMonth(d.end_time))
                        .attr("y", h + 25)
                        .attr("x", x(d.end_time) - 23);
                }
            })
            dataY.forEach(function (d) {
                svg.append("svg:text")
                    .text(d)
                    .attr("y", y(d))
                    .attr("x", -10)
                    .attr("class", "text-y")
                    .attr("text-anchor", "end")
            })

            d3.select("#rectClip rect")
                .transition()
                .duration(3000)
                .attr("width", "100%");
            data.forEach(function (d, i) {
                svg.append("circle")
                    .attr('r', 11)
                    .attr('stroke', '#e9e9e9')
                    .attr('stroke-width', '4')
                    .attr('fill', '#a3c644')
                    .attr('cx', x(d.end_time))
                    .attr('cy', y(d.value))
                    .attr("clip-path", "url(#rectClip)");
            })
        }
    });

    return LandingSectionProductionUsageView;
});