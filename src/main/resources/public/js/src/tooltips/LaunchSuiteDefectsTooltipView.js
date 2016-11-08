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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Localization = require('localization');


    var LaunchSuiteDefectsTooltip = Epoxy.View.extend({
        template: 'tpl-launch-suite-defects-tooltip',
        className: 'defects-tooltip',
        initialize: function(options) {
            this.type = options.type;
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, this.getData()));
        },
        getData: function(){
            var defects = this.getDefectByType();
            var defectsCollection = new SingletonDefectTypeCollection();
            var subDefects = [];
            _.each(defects, function(value, key) {
                var subDefectModel = defectsCollection.getDefectByLocator(key);
                if(subDefectModel) {
                    subDefects.push({
                        color: subDefectModel.get('color'),
                        name: subDefectModel.get('longName'),
                        value: value
                    })
                }
            });
            return {
                subDefects: subDefects,
                total: {
                    color: defectsCollection.getMainColorByType(this.type),
                    name: Localization.infoLine[this.type],
                    value: defects.total
                }}
        },
        getDefectByType: function(){
            var statistics = this.model.get('statistics');
            return statistics['defects'][this.type];
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        },
    });


    return LaunchSuiteDefectsTooltip;
});
