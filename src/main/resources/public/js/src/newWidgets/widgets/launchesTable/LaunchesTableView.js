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
    var Epoxy = require('backbone-epoxy');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Util = require('util');
    var Moment = require('moment');
    var d3 = require('d3');
    var c3 = require('c3');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var App = require('app');

    var config = App.getInstance();

    var LaunchesTableItem = Epoxy.View.extend({
        className: 'row rp-table-row',
        tpl: 'tpl-widget-filters-table-item',
        toolTipContent: 'tpl-launches-table-tooltip-defects',
        bindings: {
            '[data-js-name-link]': 'attr: {href: getItemUrl}',
            '[data-js-name]': 'text: name',
            '[data-js-launch-number]': 'text: number'
        },
        computeds: {
            getItemUrl: {
                deps: ['id'],
                get: function (id) {
                    return '#' + this.appModel.get('projectId') + '/launches/all/' + id;
                }
            }
        },
        events: {
            'click [data-js-toggle-open]': 'onClickOpen',
            'mouseenter [data-js-launch-defect]': 'showDefectTooltip',
            'click [data-js-tag]': 'onClickTag',
            'click [data-js-user-tag]': 'onClickUserTag'
        },
        initialize: function (options) {
            this.widgetId = options.widgetId;
            this.criteria = options.criteria;
            this.link = options.link;
            this.contentFields = options.contentFields;
            this.charts = [];
            this.appModel = new SingletonAppModel();
            this.defectTypes = new SingletonDefectTypeCollection();
            this.render();
            this.markdownViewer = new MarkdownViewer({ text: this.model.get('description') });
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
            var self = this;
            this.listenTo(this.model, 'change:description', function (model, description) {
                self.markdownViewer.update(description);
            });
            // this.listenTo(this.model, 'change:description change:tags', this.activateAccordion);
            // this.listenTo(this.markdownViewer, 'load', this.activateAccordion);
            self.renderDefects();
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl, {
                item: this.model.toJSON(),
                criteria: this.criteria,
                projectUrl: this.appModel.get('projectId'),
                defectTypes: this.defectTypes,
                getDefectColor: this.getDefectColor,
                allCasesUrl: this.allCasesUrl.bind(this),
                dateFormat: Util.dateFormat,
                widgetId: this.widgetId,
                moment: Moment
            }));
        },
        activateAccordion: function () {
            var innerHeight = 198;
            if ($(window).width() < 900) {
                innerHeight = 318;
            }
            if (this.$el.innerHeight() > innerHeight) {
                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        },
        onClickOpen: function () {
            this.$el.toggleClass('open');
        },
        allCasesUrl: function (type) {
            var url = this.link + '/' + this.model.get('id');
            var statusFilter = '';
            var subDefects;
            var defects;

            switch (type) {
            case 'total':
                statusFilter = '&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED&filter.in.type=STEP';
                break;
            case 'failedPlusInterrupted':
                statusFilter = '&filter.in.status=FAILED,INTERRUPTED&filter.in.type=STEP';
                break;
            case 'passed':
            case 'failed':
            case 'skipped':
                statusFilter = '&filter.in.status=' + type.toUpperCase() + '&filter.in.type=STEP';
                break;
            default:
                subDefects = this.defectTypes.toJSON();
                defects = Util.getSubDefectsLocators(type, subDefects).join('%2C');
                statusFilter = '&filter.in.issue$issue_type=' + defects;
            }
            return url + '?filter.eq.has_childs=false' + statusFilter;
        },
        onClickTag: function (e) {
            var tagName = $(e.currentTarget).data('tag');
            e.preventDefault();
            this.goToLaunchWithFilter('tags', tagName);
        },
        onClickUserTag: function (e) {
            var userName = $(e.currentTarget).data('tag');
            e.preventDefault();
            this.goToLaunchWithFilter('user', userName);
        },
        goToLaunchWithFilter: function (filterName, filterValue) {
            var launchFilterCollection = new SingletonLaunchFilterCollection();
            var tempFilterModel = launchFilterCollection.generateTempModel();
            config.router.navigate(tempFilterModel.get('url'), { trigger: true });
            tempFilterModel.trigger('add_entity', filterName, filterValue);
        },
        renderDefects: function () {
            var defectCell = $('[data-js-launch-defect]', this.$el);
            _.each(defectCell, function (cell) {
                var el = $(cell);
                var type = el.data('defectType');
                var defects = this.getDefectByType(this.model.toJSON(), type);
                var id = this.widgetId + '-defect-' + this.model.get('id') + '-' + type;
                var chartData = {
                    columns: [],
                    colors: {}
                };
                _.each(defects, function (val, defectType) {
                    var defectModel;
                    if (defectType !== 'total') {
                        defectModel = this.defectTypes.getDefectByLocator(defectType);
                        defectModel && chartData.columns.push([defectType, val]);
                        defectModel && (chartData.colors[defectType] = defectModel.get('color'));
                    }
                }, this);
                this.drawDonutChart(chartData, id);
            }, this);
        },
        getDefectByType: function (item, type) {
            var ordered = {};
            ordered.total = item['statistics$defects$' + type].total;
            _.each(this.contentFields, function (field) {
                _.each(item['statistics$defects$' + type], function (val, key) {
                    if (~field.indexOf('statistics$defects$') && (key === field.split('$')[field.split('$').length - 1])) {
                        ordered[key] = val;
                    }
                });
            });
            return ordered;
        },
        showDefectTooltip: function (e) {
            var el = $(e.currentTarget);
            var type = el.data('defectType');
            if (!el.data('tooltip')) {
                el.data('tooltip', 'tooltip');
                this.createDefectTooltip(el, type);
            }
        },
        createDefectTooltip: function (el, type) {
            var launchId = el.closest('.row.rp-table-row').attr('id');
            var content = this.renderDefectsTooltip(launchId, type);
            el.append(content);
        },
        renderDefectsTooltip: function (launchId, type) {
            var launch = this.model.toJSON();
            var defect = this.getDefectByType(launch, type);
            var sd = config.patterns.defectsLocator;
            var params = {
                total: defect.total,
                defects: [],
                type: type,
                item: launch,
                noSubDefects: !this.defectTypes.checkForSubDefects(),
                color: this.getDefectColor(defect, type, this.defectTypes),
                url: this.allCasesUrl(type)
            };
            _.each(defect, function (v, k) {
                var defects;
                var issueType;
                if (k !== 'total') {
                    if (v || sd.test(k)) {
                        defects = this.defectTypes;
                        issueType = defects.getDefectType(k);
                        if (issueType) {
                            issueType.val = parseInt(v, 10);
                            params.defects.push(issueType);
                        }
                    }
                }
            }, this);
            params.defects.sort(Util.sortSubDefects);
            return Util.templates(this.toolTipContent, params);
        },
        getDefectColor: function (defect, type, defectTypes) {
            var sd = config.patterns.defectsLocator;
            var defectType = _.findKey(defect, function (v, k) {
                return sd.test(k);
            });
            var issueType;
            if (defectType) {
                issueType = defectTypes.getDefectType(defectType);
                if (issueType) {
                    return issueType.color;
                }
            }
            return Util.getDefaultColor(type);
        },
        drawDonutChart: function (data, id) {
            var $el = $('#' + id + ' [data-js-chart]', this.$el);
            var chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: data.columns,
                    type: 'donut',
                    order: null,
                    colors: data.colors
                },
                size: {
                    width: 56,
                    height: 56
                },
                donut: {
                    width: 12,
                    label: {
                        show: false
                    }
                },
                interaction: {
                    enabled: false
                },
                legend: {
                    show: false
                }
            });
            this.charts.push(chart);
        },
        onDestroy: function () {
            this.markdownViewer && this.markdownViewer.destroy();
            _.each(this.charts, function (chart) {
                chart.destroy();
            });
            this.charts = null;
            this.$el.remove();
            delete this;
        }
    });
    var LaunchesTableView = BaseWidgetView.extend({
        tpl: 'tpl-widget-filters-table',
        getData: function () {
            var contentData = this.model.getContent() || [];
            var data;
            if (!_.isEmpty(contentData) && !_.isEmpty(contentData.result)) {
                data = _.map(contentData.result, function (i) {
                    var stats = {};
                    var launchInfo = {
                        id: i.id,
                        name: i.name,
                        number: i.number,
                        startTime: i.startTime
                    };

                    _.forEach(i.values, function (v, k) {
                        var a = k.split('$');
                        var group = _.initial(a).join('$');
                        var defect = _.last(a);
                        var val = parseInt(v, 10);
                        if (k.indexOf('statistics$defects') >= 0) {
                            if (stats[group]) {
                                stats[group].total += val;
                            } else {
                                stats[group] = {};
                                stats[group].total = val;
                            }
                            stats[group][defect] = val;
                        } else {
                            stats[k] = v;
                        }
                    });
                    return _.extend(launchInfo, stats);
                }, this);
                return data;
            }
            return [];
        },
        getCriteria: function () {
            var criteria = {};
            var a;
            var type;
            _.each(this.model.getContentFields(), function (c) {
                var key = c;
                if (c.indexOf('statistics') >= 0 && !criteria[key]) {
                    a = c.split('$');
                    type = a[1];
                    key = type === 'defects' ? a[2] : _.last(a);
                }
                criteria[key] = true;
            });
            return criteria;
        },
        render: function () {
            var params;
            this.renderedItems = [];
            this.items = this.getData();

            params = {
                criteria: this.getCriteria(),
                noItems: !this.items.length
            };
            if (!this.isEmptyData(this.items)) {
                this.$el.html(Util.templates(this.tpl, params));
                this.renderItems();
                Util.hoverFullTime(this.$el);
                this.addResize();
                !this.isPreview && Util.setupBaronScroll($('.launches-table-panel', this.$el));
                this.updateWidget();
            } else {
                this.addNoAvailableBock();
            }
        },
        getLink: function () {
            var project = '#' + this.appModel.get('projectId');
            var filterId = this.model.get('filter_id');
            var arrLink = [project, 'launches', filterId];
            return arrLink.join('/');
        },
        renderItems: function () {
            _.each(this.items, function (launch) {
                var item = new LaunchesTableItem({
                    model: new Epoxy.Model(launch),
                    criteria: this.getCriteria(),
                    widgetId: this.id,
                    link: this.getLink(),
                    contentFields: this.model.getContentFields()
                });
                $('[data-js-items]', this.$el).append(item.$el);

                this.renderedItems.push(item);
            }, this);
        },
        activateAccordions: function () {
            _.each(this.renderedItems, function (view) {
                view.activateAccordion && view.activateAccordion();
            });
        },
        updateWidget: function () {
            if (this.$el.width() <= 768) {
                $('[data-js-launches-table]', this.$el).addClass('launches-table-mobile');
            } else {
                $('[data-js-launches-table]', this.$el).removeClass('launches-table-mobile');
            }
        },
        onDestroy: function () {
            $(window).off('resize.' + this.id);
            _.each(this.renderedItems, function (view) {
                view.destroy && view.destroy();
            });
        }
    });
    return LaunchesTableView;
});
