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

    var Util = require('util');
    var $ = require('jquery');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var WidgetService = require('newWidgets/WidgetService');
    var DropDownComponent = require('components/DropDownComponent');
    var Localization = require('localization');

    var SettingCriteriaView = SettingView.extend({
        className: 'modal-add-widget-setting-action',
        template: 'tpl-modal-add-widget-setting-action',
        events: {
        },
        bindings: {
        },
        initialize: function () {
            this.curWidget = WidgetService.getWidgetConfig(this.model.get('gadget'));
            if (!this.curWidget.actions) {
                this.destroy();
                return false;
            }
            this.render();
            var actionData = _.map(this.curWidget.actions, function (value) {
                return { name: value.text, value: value.actions.join(',') };
            });
            var curWidgetOpt = this.model.getWidgetOptions();
            var curActions = curWidgetOpt.actionType || [];
            var defActions = [];
            _.each(curActions, function (action) {
                var def = _.find(actionData, function (d) { return _.contains(d.value.split(','), action); });
                if (def) {
                    defActions.push(def.value);
                }
            });
            this.selectAction = new DropDownComponent({
                data: actionData,
                placeholder: Localization.wizard.actionSelectTitle,
                multiple: true,
                defaultValue: _.uniq(defActions)
            });
            $('[data-js-select-action-container]', this.$el).html(this.selectAction.$el);
            this.listenTo(this.selectAction, 'change', this.onChangeSelectAction);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onChangeSelectAction: function (actions) {
            var values = [];
            var options = this.model.getWidgetOptions();
            _.each(actions, function (item) {
                values = values.concat(item.split(','));
            });
            options.actionType = values;
            this.model.setWidgetOptions(options);
            this.validate();
        },
        validate: function () {
            var options = this.model.getWidgetOptions();
            if (!options.actionType || _.isEmpty(options.actionType)) {
                this.selectAction.setErrorState(Localization.validation.selectAtLeastOneAction);
                return false;
            }
            return true;
        },
        onDestroy: function () {
            this.selectCriteria && this.selectCriteria.destroy();
        }
    });

    return SettingCriteriaView;
});
