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

    var Epoxy = require('backbone-epoxy');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Util = require('util');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var WidgetErrorView = require('newWidgets/WidgetErrorView');
    var $ = require('jquery');
    var _ = require('underscore');
    var Localization = require('localization');

    var BaseWidgetView = Epoxy.View.extend({
        initialize: function (options) {
            this.id = 'widget-' + this.model.get('id');
            this.isPreview = options.isPreview;
            this.unclickableChart = options.unclickableChart;
            this.appModel = new SingletonAppModel();
            this.defectsCollection = new SingletonDefectTypeCollection();
            this.afterInitialize && this.afterInitialize();
        },
        tpl: '',
        className: 'panel-body',
        getData: function () {
        },
        render: function () {
        },
        onShow: function () {
            var self = this;
            this.defectsCollection.ready.done(function () {
                self.render();
            });
        },
        isEmptyData: function (data) {
            if (_.isEmpty(data)) {
                return true;
            }
            if (data.result && !data.result.length) {
                return true;
            }
            return false;
        },
        addNoAvailableBock: function (el) {
            var $element = el ? $(el) : this.$el;
            var view = new WidgetErrorView({ message: Localization.widgets.noData });
            $element.after(view.$el);
        },
        getSeriesColor: function (name) {
            var defect = this.defectsCollection.getDefectType(name);
            var color = defect ? defect.color : Util.getDefaultColor(name);
            return color;
        },
        invalidDataMessage: function (numberOfCriteria) {
            return Util.templates('tpl-widget-invalid-data', {
                qty: numberOfCriteria
            });
        },
        linkToRedirectService: function (series, id) {
            var defectTypes = new SingletonDefectTypeCollection();
            var appModel = new SingletonAppModel();
            var project = '#' + appModel.get('projectId');
            var defaultFilter = '?page.page=1&page.size=50&page.sort=start_time&';
            var filterForAll = 'filter.eq.has_childs=false';
            var filterStatus = '';
            var getLink = function (filters) {
                var arrLink = [project, 'launches/all', id];
                return arrLink.join('/') + filters;
            };
            var getFilter = function (params) {
                var filter = filterForAll + '&' + params;
                return '|' + filter + defaultFilter + '&' + filter;
            };
            var getDefects = function (seria) {
                var typeArr = seria.split(' ');
                var type = _.map(typeArr, function (t) {
                    return t.toLowerCase();
                }).join('_');
                var subDefects = defectTypes.toJSON();
                return Util.getSubDefectsLocators(type, subDefects);
            };
            var types;
            var defects;
            var defect;

            switch (series) {
            case 'Total':
            case 'total':
            case 'Grow test cases':
            case 'grow_test_cases':
            case 'most_failed':
                filterStatus = getFilter('filter.in.type=STEP&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED');
                break;
            case 'Passed':
            case 'passed':
                filterStatus = getFilter('&filter.in.type=STEP&filter.in.status=PASSED');
                break;
            case 'Failed':
            case 'failed':
                filterStatus = getFilter('&filter.in.type=STEP&filter.in.status=FAILED');
                break;
            case 'Skipped':
            case 'skipped':
                filterStatus = getFilter('&filter.in.type=STEP&filter.in.status=SKIPPED');
                break;
            case 'To Investigate':
            case 'to_investigate':
            case 'toInvestigate':
                filterStatus = getFilter(['filter.in.issue$issue_type=', getDefects('To Investigate')].join(''));
                break;
            case 'System Issue':
            case 'systemIssue':
            case 'system_issue':
                filterStatus = getFilter(['filter.in.issue$issue_type=', getDefects('System Issue')].join(''));
                break;
            case 'Product Bug':
            case 'productBug':
            case 'product_bug':
                filterStatus = getFilter(['filter.in.issue$issue_type=', getDefects('Product Bug')].join(''));
                break;
            case 'No Defect':
            case 'noDefect':
            case 'no_defect':
                filterStatus = getFilter(['filter.in.issue$issue_type=', getDefects('No Defect')].join(''));
                break;
            case 'Automation Bug':
            case 'Auto Bug':
            case 'automationBug':
            case 'automation_bug':
                filterStatus = getFilter(['filter.in.issue$issue_type=', getDefects('Automation Bug')].join(''));
                break;
            case 'Investigated':
            case 'investigated':
                types = ['System Issue', 'Product Bug', 'No Defect', 'Automation Bug'];
                defects = [];
                _.each(types, function (d) {
                    defects = defects.concat(getDefects(d));
                });
                filterStatus = getFilter(['filter.in.issue$issue_type=', defects].join(''));
                break;
            case 'Duration':
            case 'duration':
                filterStatus = '';
                break;
            default :
                defect = _.find(defectTypes.toJSON(), function (d) {
                    return d.locator === series;
                });
                if (defect) {
                    filterStatus = getFilter(['filter.in.issue$issue_type=', defect.locator].join(''));
                } else {
                    filterStatus = '';
                }
            }
            return encodeURI(getLink(filterStatus));
        },
        addResize: function () {  // TODO remove this method from widgets. addSizeClasses - dublicat
            // var self = this;
            // var update = function (e) {
            //     if ($(e.target).is($(window))) {
            //         self.updateWidget();
            //     }
            // };
            // var resize = _.debounce(update, 500);
            // $(window).on('resize.' + this.id, resize);
        },
        updateWidget: function () {
        },
        addSizeClasses: function (gadgetSize) {
            var widthClasses = [];
            var heightClasses = [];
            for (var i = 12; i > gadgetSize.width; i--) {
                widthClasses.push('w-less-then-' + i);
            }
            for (var i = 10; i > gadgetSize.height; i--) {
                heightClasses.push('h-less-then-' + i);
            }
            this.$el.addClass(widthClasses.concat(heightClasses).join(' '));
        },
        updateSizeClasses: function (newGadgetSize) {
            var oldSizeClasses = _.filter(this.$el.attr('class').split(' '), function (item) {
                return (item.indexOf('less-then-') + 1);
            });
            this.$el.removeClass(oldSizeClasses.join(' '));
            this.addSizeClasses(newGadgetSize);
            this.afterUpdateSizeClasses();
        },
        afterUpdateSizeClasses: function () {
            this.updateWidget();
        },
        onDestroy: function () {
            $(window).off('resize.' + this.id);
            this.onBeforeDestroy && this.onBeforeDestroy();
        }
    });

    return BaseWidgetView;
});
