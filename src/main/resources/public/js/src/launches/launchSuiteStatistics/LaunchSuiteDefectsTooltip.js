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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');

    var config = App.getInstance();

    var LaunchSuiteDefectsTooltip = Epoxy.View.extend({
        template: 'tpl-launch-item-defects-tooltip',
        className: 'tooltip defects-tooltip',
        initialize: function(options) {
            this.type = options.type;
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, this.getData()));
        },
        getData: function(){
            var defect = this.getDefectByType(),
                defectsCollection = new SingletonDefectTypeCollection(),
                data = {};
            data.total = defect.total;
            data.color = this.getDefectColor();
            data.defects = [];
            data.item = this.model.toJSON({computed: true});
            data.noSubDefects = !defectsCollection.checkForSubDefects();
            data.type = this.type;
            data.url = this.allCasesUrl();
            _.each(defect, function(v, k){
                if(k !== 'total'){
                    var issueType = defectsCollection.getDefectType(k);
                    if(issueType){
                        issueType.val = parseInt(v);
                        data.defects.push(issueType);
                    }
                }
            }, this);
            return data;
        },
        getDefectByType: function(){
            var statistics = this.model.get('statistics');
            return statistics['defects'][this.type];
        },
        getDefectColor: function () {
            var sd = config.patterns.defectsLocator,
                defect = this.getDefectByType(),
                defects = new SingletonDefectTypeCollection(),
                defectType = _.findKey(defect, function(v, k){
                    return sd.test(k);
                });
            if(defectType){
                var issueType = defects.getDefectType(defectType);
                if(issueType){
                    return issueType.color;
                }
            }
            return Util.getDefaultColor(this.type);
        },
        allCasesUrl: function(){
            var url = this.model.get('url'),
                id = this.model.get('id'),
                owner = this.model.get('owner'),
                statusFilter = '&filter.in.issue$issue_type=',
                defectTypes = new SingletonDefectTypeCollection(),
                subDefects = defectTypes.toJSON(),
                defects = Util.getSubDefectsLocators(this.type, subDefects).join('%2C');

            return url + '?'
                + '&filter.eq.has_childs=false'
                + statusFilter
                + defects;
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
