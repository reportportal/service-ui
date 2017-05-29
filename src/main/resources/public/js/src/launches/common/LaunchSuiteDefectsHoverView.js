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

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Localization = require('localization');
    var App = require('app');

    var config = App.getInstance();

    var LaunchSuiteDefectsTooltip = Epoxy.View.extend({
        template: 'tpl-launch-suite-defects-hover',
        initialize: function (options) {
            this.type = options.type;
            this.noLink = options.noLink;
            this.render();
        },
        events: {
            'click [data-js-defect-total]': 'onClickTotalStats',
            'click a': 'onClickLink'
        },
        render: function () {
            this.$el.html(Util.templates(this.template, this.getData()));
        },
        onClickLink: function () {
            this.model.trigger('drill:item', this.model);
        },
        onClickTotalStats: function () {
            if (this.model.get('type') === 'SUITE') {
                switch (this.type) {
                case ('product_bug'):
                    config.trackingDispatcher.trackEventNumber(126.2);
                    break;
                case ('automation_bug'):
                    config.trackingDispatcher.trackEventNumber(128.2);
                    break;
                case ('system_issue'):
                    config.trackingDispatcher.trackEventNumber(130.2);
                    break;
                default:
                    break;
                }
            } else {
                switch (this.type) {
                case ('product_bug'):
                    config.trackingDispatcher.trackEventNumber(55);
                    break;
                case ('automation_bug'):
                    config.trackingDispatcher.trackEventNumber(57);
                    break;
                case ('system_issue'):
                    config.trackingDispatcher.trackEventNumber(59);
                    break;
                default:
                    break;
                }
            }
        },
        getData: function () {
            var defects = this.getDefectByType();
            var defectsCollection = new SingletonDefectTypeCollection();
            var subDefects = [];

            var url = this.model.get('url');
            var appendFilter = 'filter.eq.has_childs=false&filter.in.issue$issue_type=';
            _.each(defects, function (value, key) {
                var subDefectModel = defectsCollection.getDefectByLocator(key);
                if (subDefectModel) {
                    subDefects.push({
                        color: subDefectModel.get('color'),
                        name: subDefectModel.get('longName'),
                        value: value,
                        url: url + '?' + appendFilter + subDefectModel.get('locator')
                    });
                }
            });
            var allSubDefects = defectsCollection.toJSON();
            var allDefects = Util.getSubDefectsLocators(this.type, allSubDefects).join('%2C');
            return {
                subDefects: subDefects,
                noSubDefects: this.isNoSubDefects(),
                noLink: this.noLink,
                total: {
                    color: defectsCollection.getMainColorByType(this.type),
                    name: Localization.infoLine[this.type],
                    value: defects.total,
                    url: url + '?' + appendFilter + allDefects
                } };
        },
        isNoSubDefects: function () {
            var defectsCollection = new SingletonDefectTypeCollection();
            return !defectsCollection.checkForSubDefects() || this.type === 'to_investigate';
        },
        getDefectByType: function () {
            var statistics = this.model.get('statistics');
            return statistics.defects[this.type];
        },
        onDestroy: function () {
            this.$el.remove();
            delete this;
        }
    });


    return LaunchSuiteDefectsTooltip;
});
