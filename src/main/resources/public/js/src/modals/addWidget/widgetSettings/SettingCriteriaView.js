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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var _ = require('underscore');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var WidgetsConfig = require('widget/widgetsConfig');
    var DropDownComponent = require('components/DropDownComponent');
    var Localization = require('localization');

    var SettingCriteriaView = SettingView.extend({
        className: 'modal-add-widget-setting-criteria',
        template: 'modal-add-widget-setting-criteria',
        events: {
        },
        bindings: {
        },
        initialize: function() {
            this.widgetConfig = WidgetsConfig.getInstance();
            this.curWidget = this.widgetConfig.widgetTypes[this.model.get('gadget')];
            if (this.curWidget.noCriteria || !this.curWidget.criteria) {
                // if (this.curWidget.staticCriteria) {
                //     this.onChangeSelectCriteria(_.map(this.curWidget.staticCriteria, function(val, key) {
                //         return key;
                //     }));
                // }
                this.destroy();
                return false;
            }
            this.render();
            var criteriaData = this.getCriteriaData();
            this.selectCriteria = new DropDownComponent({
                data: criteriaData,
                placeholder: Localization.widgets.selectCriteria,
                multiple: (this.curWidget.criteriaSelectType == 'radio') ? false : true,
                defaultValue: this.getDefaultValue(),
            });
            $('[data-js-select-criteria-container]', this.$el).html(this.selectCriteria.$el);
            this.listenTo(this.selectCriteria, 'change', this.onChangeSelectCriteria);
        },
        getCriteriaData: function(){
            return _.map(this.curWidget.criteria, function (value, key) {
                if(typeof value == 'object') {
                    return {name: value.name, value: value.keys.join(',')}
                }
                return {name: value, value: key};
            });
        },
        getDefaultValue: function(){
            var gadget = this.model.get('gadget'),
                contentFields = this.model.getContentFields();
            if(gadget == 'launches_table'){
                var criteriaData = this.getCriteriaData(),
                    content = [];
                _.each(contentFields, function(field){
                    var criteria = _.find(criteriaData, function(c){ return c.value.indexOf(field)>=0; });
                    criteria && content.push(criteria.value);
                });
                return _.uniq(content);
            }
            return contentFields;
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
        onChangeSelectCriteria: function(content_fields) {
            var values = [];
            if(typeof content_fields == 'string') {
                values.push(content_fields);
            } else {
                _.each(content_fields, function(item) {
                    values = values.concat(item.split(','));
                });
            }
            if (this.curWidget.staticCriteria) {
                _.each(this.curWidget.staticCriteria, function(val, key){
                    values.push(key);
                });
            }
            this.model.setContentFields(_.uniq(values));
            this.validate();
        },
        validate: function() {
            if(!this.model.getContentFields().length) {
                this.selectCriteria.setErrorState(Localization.validation.selectAtLeastOneCriteria);
                return false;
            }
            return true;
        },
        onDestroy: function() {
            this.selectCriteria && this.selectCriteria.destroy();
        }
    });

    return SettingCriteriaView;
});
