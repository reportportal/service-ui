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
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');
    var Localization = require('localization');

    var OverallStatisticsWidget = BaseWidgetView.extend({
        tpl: 'tpl-widget-statistics-panel',
        getData: function () {
            var contentData = this.model.getContent();
            if (!_.isEmpty(contentData.result) && !_.isEmpty(contentData.result[0].values)) {
                var contentFields = this.model.getContentFields();
                var values = contentData.result[0].values;
                var data = {
                    executions: [],
                    defects: []
                };
                this.invalid = 0;

                _.each(contentFields, function (i) {
                    var a = i.split('$');
                    var type = a[1];
                    var seriesId = _.last(a);
                    var name = Localization.launchesHeaders[seriesId];
                    var value = values[seriesId];
                    if (!name) {
                        var subDefect = this.defectsCollection.getDefectType(seriesId);
                        name = subDefect.longName;
                        if (!subDefect) {
                            name = Localization.widgets.invalidCriteria;
                            seriesId = 'invalid';
                            this.invalid++;
                        }
                    }
                    data[type].push({
                        key: name,
                        seriesId: seriesId,
                        type: type,
                        color: this.getSeriesColor(seriesId),
                        value: value
                    });
                }, this);

                return data;
            }
            return [];
        },
        render: function () {
            var params = {
                statistics: this.getData(),
                invalidDataMessage: this.invalidDataMessage(this.invalid),
                invalid: this.invalid
            };
            this.$el.html(Util.templates(this.tpl, params));
            !this.isPreview && Util.setupBaronScroll($('.statistics-panel', this.$el));
        }
    });

    return OverallStatisticsWidget;
});
