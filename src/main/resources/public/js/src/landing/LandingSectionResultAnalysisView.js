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

    var LandingSectionResultAnalysisView = _LandingSection.extend({
        id: 'resultAnalysis',
        className: 'b-common clearfix',
        tpl: 'tpl-landing-section-result_analysis',

        changeScroll: function(scrollTop, scrollBlock){
            if(scrollBlock > 400){
                var $graph = $('.js-d3', this.$el);
                this.showAndAnimateElements($('.js-commonel', this.$el));
                $graph.removeClass("g-invisible").addClass($graph.data('animation'));
                this.animateDiagram();
                return true;
            }
        },
        animateDiagram: function(){
            var values = [90, 90, 90, 75, 60, 70, 90, 25];

            var dataY = [0, 20, 40, 60, 80];

            var margin = {
                    top: 0,
                    right: 180,
                    bottom: 30,
                    left: 50
                },
                w = 700 - margin.left - margin.right,
                h = 350 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .domain([0, 1])
                .range([0, w]);

            var data = d3.layout.histogram()
                .bins(x.ticks(20))
                (values);

            var y = d3.scale.linear()
                .domain([0, 120])
                .range([0, h]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var svg = d3.select(".js-histogram")
                .append("svg:svg")
                .attr("width", "100%")
                .attr("height", h + margin.top + margin.bottom)
                .attr("viewBox", "0 0 700 350")
                .attr("preserveAspectRatio", "xMaxYMax meet")
                .append("svg:g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("clipPath")
                .attr("id", "rectClipper")
                .append("rect")
                .attr("x", -50)
                .attr("y", 20)
                .attr("width", "0")
                .attr("height", h);


            values.forEach(function (d, i) {
                svg.append("rect")
                    .attr("x", 2 * i + 1 + (x(1.1 / values.length) * i))
                    .attr("y", h - y(90))
                    .attr("width", x(1.1 / values.length))
                    .attr("height", y(90))
                    .attr("fill", "#a3c644");
                // .attr("clip-path", "url(#rectClipper)");
                svg.append("rect")
                    .attr("x", 2 * i + 1 + (x(1.1 / values.length) * i))
                    .attr("y", 80)
                    .attr("width", x(1.1 / values.length))
                    .attr("height", y(90))
                    .attr("fill", "#ffc97d")
                    .transition()
                    .duration(2500)
                    .attr("height", y(90 - d));
                // .attr("clip-path", "url(#rectClipper)");
                svg.append("line")
                    .attr("x1", 2 * i + 2 + (x(1.1 / values.length) * (i + 1)))
                    .attr("x2", 2 * i + 2 + (x(1.1 / values.length) * (i + 1)))
                    .attr("y1", 50)
                    .attr("y2", h + 20)
                    .attr("class", "vlinehist")
                    .attr("clip-path", "url(#rectClipper)");
            });
            values.forEach(function (d, i) {
                if (d != 90) {
                    svg.append("line")
                        .attr("x1", -10)
                        .attr("x2", w + 150)
                        .attr("y1", h - y(d))
                        .attr("y2", h - y(d))
                        .attr("class", "hlinehist")
                        .attr("clip-path", "url(#rectClipper)");
                }
            });
            d3.select("#rectClipper rect")
                .transition()
                .duration(3000)
                .attr("width", "100%");

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
                .attr("y2", h + 80);

            dataY.forEach(function (d) {
                svg.append("svg:text")
                    .text(d)
                    .attr("y", -(y(d) - h - 18))
                    .attr("x", -10)
                    .attr("class", "text-y")
                    .attr("text-anchor", "end")
            })
        }
    });

    return LandingSectionResultAnalysisView;
});