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
define(function(require, exports, module) {
    'use strict';
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Widget = require('widgets');
    var Service = require('coreService');
    var WidgetsConfig = require('widget/widgetsConfig');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var GadgetModel = require('dashboard/GadgetModel');
    var WidgetModel = require('newWidgets/WidgetModel');
    var WidgetView = require('newWidgets/WidgetView');
    var Moment = require('moment');

    var PreviewWidgetView = Epoxy.View.extend({
        className: 'preview-widget-view',
        initialize: function(options){
            this.filterModel = options.filterModel;
            if(options.sharedWidgetModel) {
                this.model =  new GadgetModel({gadget: options.sharedWidgetModel.get('gadget')});
            }
            var gadget = this.model.get('gadget');
            if((!this.filterModel && !options.sharedWidgetModel) || gadget == 'activity_stream' || gadget == 'launches_table' ||
                gadget == 'unique_bug_table' || gadget == 'most_failed_test_cases') {
                this.$el.css("background-image", "url("+ this.model.get('gadgetPreviewImg') +")");
                return true;
            } else {
                this.$el.html('<div class="preloader" style="display: block; padding-top: 50px;">' +
                    '<i class="material-icons loader-animation">refresh</i>' +
                    '</div>')
            }
            if(options.sharedWidgetModel) {
                var self = this;
                Service.getSharedWidgetData(options.sharedWidgetModel.get('id'))
                    .done(function (data) {
                        self.model.parseData(data);
                        self.widgetView && self.widgetView.destroy();
                        self.widgetView = new WidgetView({model: (new WidgetModel(self.model.get('widgetData'))), preview: true});
                        self.$el.html(self.widgetView.$el);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'sharedWidgetData');
                    });
            } else {
                var filterOptions = this.filterModel.getOptions();
                filterOptions.push('filter.!in.status=IN_PROGRESS');
                filterOptions.push('page.page=1');
                filterOptions.push('page.size=' + this.model.get('itemsCount'));

                var self = this;
                this.request = Service.getWidgetData(this.filterModel.get('type'), filterOptions.join('&'))
                    .done(function (data) {
                        // if (widget && widget.gadget === 'launches_comparison_chart') {
                        //     data.content = widgetPreviewService.getComparisonLaunches(data, revert);
                        // }
                        self.renderWidgetPreview(data);
                    })
                    .fail(function (error) {
                        // Util.ajaxFailMessenger(null, 'widgetPreviewData');
                    });
            }

        },
        parseWidgetPreviewData: function (data, model) {
            return widgetPreviewService.parseData(data, model);
        },
        getCriteriaFields: function (criteria, params) {
            var content = params.content_fields || [];
            for (var key in criteria) {
                content.push(key);
            }
            params.content_fields = _.uniq(content);
        },
        getDefaultCriteriaFields: function (widget, params) {
            params.content_fields = _.uniq(widget.defaultCriteria);
        },
        getContentParameters: function (model) {
            var model = model.toJSON();
            var widgetConfig = WidgetsConfig.getInstance();
            var widget = widgetConfig.widgetTypes[model.widget_id];
            var params = {
                type: widget.widget_type,
                gadget: widget.gadget
            };
            var widgetOptions = {};

            if (widget.limit) {
                params['itemsCount'] = model.limit ? model.limit : widget.limit.def;
            }
            if (widget.mode && model.mode == 'timeline') {
                widgetOptions['timeline'] = ["DAY"];
            }
            if (widget.actions) {
                var actions = [];
                if (!model.actions) {
                    _.each(widget.actions, function (a) {
                        Array.prototype.push.apply(actions, a.actions);
                    });
                }
                else {
                    actions = model.actions;
                }
                widgetOptions['actionType'] = actions;
            }
            if (widget.usersFilter && model.users && !_.isEmpty(model.users)) {
                widgetOptions['userRef'] = model.users;
            }
            if (widget.launchesFilter) {
                widgetOptions['launchNameFilter'] = model.launches;
            }

            if (widget.noCriteria && widget.staticCriteria && widget.gadget !== 'activity_stream') {
                params['content_fields'] = _.map(widget.staticCriteria, function (val, key) {
                    return key;
                });
            } else {
                if (!_.isEmpty(model.criteria)) {
                    var keys = _.isArray(widget.criteria) ? _.flatten(_.map(widget.criteria, function(d){return d.keys;})) : _.keys(widget.criteria);
                    params['content_fields'] = widget.criteria ? _.intersection(model.criteria, keys) : model.criteria;
                }
                else {
                    if (!_.isEmpty(widget.defaultCriteria)) {
                        this.getDefaultCriteriaFields(widget, params);
                    }
                    else if (widget.criteria) {
                        this.getCriteriaFields(widget.criteria, params);
                    }
                }
                if (widget.staticCriteria) {
                    this.getCriteriaFields(widget.staticCriteria, params);
                }
            }
            var noValidForMetadata = ['unique_bug_table', 'activity_stream', 'launches_table', 'most_failed_test_cases'];
            if (!_.contains(noValidForMetadata, widget.gadget)) {
                params['metadata_fields'] = ['name', 'number', 'start_time'];
            }
            if (widget.gadget == 'most_failed_test_cases') {
                params['metadata_fields'] = ['name', 'start_time'];
            }
            if (!_.isEmpty(widgetOptions)) {
                params['widgetOptions'] = widgetOptions;
            }
            return params;
        },
        renderWidgetPreview: function (data) {
            var isTimeline = !!(this.model.getWidgetOptions() && this.model.getWidgetOptions().timeline && this.model.getWidgetOptions().timeline.length)
            var oldWidgetModel = new Backbone.Model({
                widget_id: this.model.get('gadget'),
                criteria: this.model.getContentFields(),
                mode: isTimeline ? 'timeline' : 'launch',
            });
            var params = this.getContentParameters(oldWidgetModel);
            var view = Widget.widgetService(this.model.get('gadget'));
            var widget = {
                    isTimeline: isTimeline,
                    id: _.uniqueId('preview-'),
                    name: this.model.get('name'),
                    content: this.parseWidgetPreviewData(data, oldWidgetModel),
                    height: 140
                };

            this.widget && this.widget.destroy();
            this.$el.html('');
            this.widget = new view({
                container: this.$el,
                // model: this.model,
                parent: this,
                isPreview: true,
                param: _.extend(params, widget)
            }).render();
        },
        // validateLimitForPreview: function (widget, limit) {
        //     var def = widget.limit,
        //         min = def.min,
        //         max = def.max;
        //     return limit >= min && limit <= max;
        // },
        destroy: function() {
            this.request && this.request.abort();
            this.widget && this.widget.destroy();
            this.$el.remove();
        }
    });


    var widgetPreviewService = {
        parseData: function (data, model) {
            var type = model.get('widget_id');
            switch (type) {
                case "old_line_chart":
                    return this.getLineTrendChartData(data, model);
                    break;
                case "statistic_trend":
                    return this.getLineTrendChartData(data, model);
                    break;
                case "investigated_trend":
                    return this.getColumnChartData(data, model);
                    break;
                case "launch_statistics":
                    return this.getCombinePieChartData(data, model);
                    break;
                case "overall_statistics":
                    return this.getStaticticsPanelData(data, model);
                    break;
                case "not_passed":
                    return this.getNotPassedChartData(data);
                    break;
                case "cases_trend":
                    return this.getCasesTrendChartData(data, model);
                    break;
                case "bug_trend":
                    return this.getBugsTrendChartData(data, model);
                    break;
                case "launches_comparison_chart":
                    return this.getLaunchesComparisonChartData(data, model);
                    break;
                case "launches_duration_chart":
                    return this.getLaunchesDurationChartData(data);
                    break;
                default:
                    return null;
                    break;
            }
        },

        fixCriteria: function (type, key, issueType) {
            var execCount = 'statistics$executionCounter$',
                issueCount = 'statistics$issueCounter$';

            if(type == 'defects'){
                if(issueType){
                    var k = issueType.split('_');
                    if (k[1]) {
                        k[1] = k[1].capitalize();
                    }
                    return issueCount + k.join('') + '$' + key;
                }
                else {
                    var d = key.split('_');
                    if (d[1]) {
                        d[1] = d[1].capitalize();
                    }
                    return issueCount + d.join('');
                }
            }
            else {
                return execCount + key;
            }
        },

        calcValue: function (val) {
            var calc = 0;
            if (_.isObject(val)) {
                if (_.isUndefined(val.total)) {
                    _.each(val, function (v, k) {
                        calc += parseInt(v);
                    });
                }
                else {
                    calc = parseInt(val.total);
                }
            }
            else {
                calc = parseInt(val);
            }
            return calc;
        },

        getValues: function (criteria, launch) {
            var values = {};
            _.each(criteria, function (c) {
                var k = c.split('$'),
                    last = _.last(k),
                    type = k[1],
                    v = launch ? type == 'defects' ? launch[k[0]][type][k[2]][last] : launch[k[0]][type][last] : 0,
                    key = this.fixCriteria(type, last, k[2]),
                    val = this.calcValue(v || 0);
                values[key] = val;
            }, this);
            return values;
        },

        getLaunchInfo: function (launch) {
            return {
                name: launch.name,
                number: launch.number,
                startTime: launch.start_time
            }
        },

        getCriteria: function (model) {
            var criteria = model.get('criteria'),
                widgetsConfig = WidgetsConfig.getInstance();
            if (!criteria) {
                criteria = widgetsConfig.widgetTypes[model.get('widget_id')].criteria;
                if (!criteria) {
                    criteria = widgetsConfig.widgetTypes[model.get('widget_id')].staticCriteria;
                }
                return _.keys(criteria);
            }
            return criteria;
        },

        getComparisonLaunches: function (data, revert) {
            var compare = [],
                launches = data.content;
            for (var i = 0, length = launches.length; i < length; i++) {
                if (compare.length >= 2) {
                    break;
                }
                if (launches.status !== 'inProgress') {
                    compare.push(launches[i]);
                }
            }
            if (!revert) {
                compare.reverse();
            }
            return compare;
        },

        getStaticticsPanelData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                criteria = this.getCriteria(model);
            if (!_.isEmpty(launches)) {
                _.each(launches, function (launch) {
                    _.each(criteria, function (c) {
                        var k = c.split('$'),
                            type = k[1],
                            key = _.last(k),
                            v = launch ? type == 'defects' ? launch[k[0]][type][k[2]][key] : launch[k[0]][type][key] : 0,
                            val = this.calcValue(v || 0);

                        if (content[key]) {
                            content[key] += val;
                        }
                        else {
                            content[key] = val;
                        }
                    }, this);
                }, this);
            }
            return {result: [{values: content}]};
        },

        getLineTrendChartData: function (data, model) {
            var content = {},
                isTimelineMode = model.get('mode') && model.get('mode') == 'timeline',
                launches = data.content.reverse(),
                criteria = this.getCriteria(model);

            if (!_.isEmpty(launches)) {
                if (!isTimelineMode) {
                    content.result = [];
                    _.each(launches, function (launch) {
                        var info = this.getLaunchInfo(launch);
                        info.values = this.getValues(criteria, launch);
                        content.result.push(info);
                    }, this);
                }
                else {
                    var dates = [];
                    _.each(launches, function (launch) {
                        var values = this.getValues(criteria, launch),
                            time = Moment(launch.start_time).format('YYYY-MM-DD');
                        dates.push(Moment(time, 'YYYY-MM-DD').unix());
                        if (content.hasOwnProperty(time)) {
                            var d = content[time][0].values;
                            _.each(d, function (v, k) {
                                d[k] = v + values[k];
                            });
                        }
                        else {
                            content[time] = [{values: values}];
                        }
                    }, this);
                    var minDate = _.min(dates),
                        maxDate = _.max(dates),
                        currentDate = Moment.unix(minDate).format('YYYY-MM-DD'),
                        zero = this.getValues(criteria);
                    while (Moment(currentDate, 'YYYY-MM-DD').unix() < maxDate) {
                        currentDate = Moment(currentDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');
                        if (!content.hasOwnProperty(currentDate)) {
                            content[currentDate] = [{values: zero}];
                        }
                    }
                }
            }
            return content;
        },

        getColumnChartData: function (data, model) {
            var content = {},
                isTimelineMode = model.get('mode') && model.get('mode') == 'timeline',
                criteria = this.getCriteria(model),
                self = this,
                launches = data.content.reverse(),
                getStatsData = function (crt, stats) {
                    var total = 0,
                        inv = 0,
                        to_inv = 0;

                    _.each(crt, function (c) {
                        var arr = c.split('$'),
                            type = arr[2],
                            def = _.last(arr);
                        if(_.has(stats.defects[type], def)){
                            var val = stats.defects[type][def],
                                calc = self.calcValue(val);
                            if (type === 'to_investigate') {
                                to_inv += calc;
                            }
                            else {
                                inv += calc;
                            }
                            total += calc;
                        }
                    }, this);
                    return {total: total, inv: inv, to_inv: to_inv};
                };

            if (!_.isEmpty(launches)) {
                if (!isTimelineMode) {
                    content.result = [];
                    _.each(launches, function (launch) {
                        var launchInfo = this.getLaunchInfo(launch),
                            stats = launch.statistics,
                            data = getStatsData(criteria, stats),
                            total = data.total,
                            inv = data.inv,
                            to_inv = data.to_inv;

                        launchInfo.values = {
                            investigated: total ? Math.round((inv / total * 100) * 100) / 100 : 0,
                            to_investigate: total ? Math.round((to_inv / total * 100) * 100) / 100 : 0
                        };
                        content.result.push(launchInfo);
                    }, this);
                }
                else {
                    var dates = [],
                        days = {};
                    _.each(launches, function (launch) {
                        var time = Moment(launch.start_time).format('YYYY-MM-DD'),
                            stats = launch.statistics,
                            data = getStatsData(criteria, stats),
                            total = data.total,
                            inv = data.inv,
                            to_inv = data.to_inv;

                        dates.push(Moment(time, 'YYYY-MM-DD').unix());

                        if (days.hasOwnProperty(time)) {
                            var d = days[time];
                            d.total += total;
                            d.to_investigate += to_inv;
                            d.investigated += inv;
                        }
                        else {
                            days[time] = {
                                total: total,
                                to_investigate: to_inv,
                                investigated: inv
                            };
                        }
                    }, this);
                    var minDate = _.min(dates),
                        maxDate = _.max(dates),
                        currentDate = Moment.unix(minDate).format('YYYY-MM-DD');

                    while (Moment(currentDate, 'YYYY-MM-DD').unix() < maxDate) {
                        currentDate = Moment(currentDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');
                        if (!days.hasOwnProperty(currentDate)) {
                            days[currentDate] = {total: 0, to_investigate: 0, investigated: 0};
                        }
                    }
                    _.each(days, function (val, key) {
                        var total = val.total,
                            inv = val.investigated,
                            to_inv = val.to_investigate,
                            values = {
                                investigated: total ? Math.round((inv / total * 100) * 100) / 100 : 0,
                                to_investigate: total ? Math.round((to_inv / total * 100) * 100) / 100 : 0
                            };
                        content[key] = [{values: values}];
                    }, this);
                }
            }
            return content;
        },

        getLaunchesDurationChartData: function (data) {
            var content = {result: []},
                launches = data.content.reverse();

            _.each(launches, function (launch) {
                var launchInfo = this.getLaunchInfo(launch);
                launchInfo.values = {
                    status: launch.status,
                    start_time: launch.start_time,
                    end_time: launch.end_time,
                    duration: launch.end_time - launch.start_time
                };
                content.result.push(launchInfo);
            }, this);
            return content;
        },

        getLaunchesComparisonChartData: function (data, model) {
            var content = {},
                launches = data.content,
                criteries = _.map(this.getCriteria(model), function (k) {
                    var cArr = k.split('$');
                    return cArr[2];
                });

            if (!_.isEmpty(launches)) {
                content.result = [];
                _.each(launches, function (launch) {
                    var launchInfo = this.getLaunchInfo(launch),
                        stats = {};
                    _.each(launch.statistics, function (val, key) {
                        var total = _.reduce(val, function (memo, v, k) {
                            var val = this.calcValue(v);
                            return (k !== 'total' && _.contains(criteries, k)) ? memo + val : memo;
                        }, 0, this);

                        _.each(val, function (v, k) {
                            if (k !== 'total' && _.contains(criteries, k)) {
                                var val = this.calcValue(v),
                                    s = total ? Math.round((val / total * 100) * 100) / 100 : 0;
                                stats[this.fixCriteria(key, k)] = s;
                            }
                        }, this);
                        launchInfo.values = stats;

                    }, this);

                    content.result.push(launchInfo);
                }, this);
            }
            return content;
        },

        getNotPassedChartData: function (data) {
            var content = {},
                launches = data.content.reverse();

            if (!_.isEmpty(launches)) {
                content.result = [];
                _.each(launches, function (launch) {
                    var launchInfo = this.getLaunchInfo(launch),
                        stats = launch.statistics,
                        exec = stats.executions,
                        total = parseInt(exec.total),
                        fail = parseInt(exec.failed),
                        skip = parseInt(exec.skipped),
                        val = total ? Math.round((((fail + skip) / total) * 100) * 100) / 100 : 0;
                    launchInfo.values = {'% (Failed+Skipped)/Total': val};
                    content.result.push(launchInfo);
                }, this);
            }
            return content;
        },

        getBugsTrendChartData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                criteria = this.getCriteria(model),
                prev = 0;

            if (!_.isEmpty(launches)) {
                content.result = [];
                _.each(launches, function (launch) {
                    var launchInfo = this.getLaunchInfo(launch),
                        stats = launch.statistics,
                        defects = stats.defects,
                        values = {},
                        total = 0;

                    _.each(criteria, function (c) {
                        var arr = c.split('$'),
                            def = arr[2],
                            val = defects[def],
                            calc = this.calcValue(val);
                        total += calc;
                        values[this.fixCriteria(c)] = calc;
                    }, this);

                    values.issuesCount = total;
                    values.delta = total - prev;
                    launchInfo.values = values;
                    prev = total;
                    content.result.push(launchInfo);
                }, this);
            }
            return content;
        },

        getCasesTrendChartData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                isTimelineMode = model.get('mode') && model.get('mode') == 'timeline',
                criteria = 'total',
                getTotal = function (launch) {
                    var stats = launch.statistics,
                        exec = stats.executions,
                        total = parseInt(exec.total);
                    return total;
                };

            if (!_.isEmpty(launches)) {
                if (!isTimelineMode) {
                    var prev = 0;
                    content.result = [];
                    _.each(launches, function (launch, i) {
                        var launchInfo = this.getLaunchInfo(launch),
                            total = getTotal(launch),
                            addValue = (i == 0) ? 0 : total - prev;

                        prev = total;
                        launchInfo.values = {};
                        launchInfo.values[this.fixCriteria('executions', criteria)] = total;
                        launchInfo.values.delta = addValue;
                        content.result.push(launchInfo);
                    }, this);

                }
                else {
                    var dates = [],
                        days = {};
                    _.each(launches, function (launch) {
                        var time = Moment(launch.start_time).format('YYYY-MM-DD'),
                            total = getTotal(launch),
                            val = {total: total, time: Moment(time, 'YYYY-MM-DD').unix()};

                        if (days.hasOwnProperty(time)) {
                            var item = days[time],
                                t = item.total;
                            if (total > t) {
                                days[time] = val;
                            }
                        }
                        else {
                            days[time] = val;
                            dates.push(Moment(time, 'YYYY-MM-DD').unix());
                        }
                    }, this);

                    var minDate = _.min(dates),
                        maxDate = _.max(dates),
                        currentDate = Moment.unix(minDate).format('YYYY-MM-DD');
                    while (Moment(currentDate, 'YYYY-MM-DD').unix() < maxDate) {
                        currentDate = Moment(currentDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');
                        if (!days.hasOwnProperty(currentDate)) {
                            days[currentDate] = {total: 0, time: Moment(currentDate, 'YYYY-MM-DD').unix()};
                        }
                    }
                    var values = _.values(days),
                        prev = 0;
                    values.sort(function (a, b) {
                        return a.time - b.time;
                    });

                    _.each(values, function (item, i) {
                        var time = Moment.unix(item.time).format('YYYY-MM-DD'),
                            total = item.total,
                            addVal = (i == 0) ? 0 : total - prev,
                            values = {};
                        values[this.fixCriteria('executions', criteria)] = total;
                        values.delta = addVal;
                        content[time] = [{values: values}];
                        prev = total;
                    }, this);
                }
            }
            return content;
        },

        getCombinePieChartData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                launch = _.last(launches),
                criteries = this.getCriteria(model);
            if (launch) {
                var launchInfo = this.getLaunchInfo(launch);
                content.result = [];
                launchInfo.values = {};
                _.each(criteries.reverse(), function (c) {
                    var cArr = c.split('$'),
                        type = cArr[1],
                        defect = _.last(cArr),
                        val = (launch.statistics && launch.statistics[type]) ? type === 'defects' ? launch.statistics[type][cArr[2]][defect]  : launch.statistics[type][defect] : 0,
                        calc = this.calcValue(val || 0);
                    launchInfo.values[this.fixCriteria(type, defect, cArr[2])] = calc;
                }, this);

                content.result.push(launchInfo);
            }
            return content;
        }

    };



    return PreviewWidgetView;
})
