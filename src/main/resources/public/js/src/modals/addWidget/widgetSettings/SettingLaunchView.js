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
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Localization = require('localization');
    var Service = require('coreService');

    require('select2');

    var SettingLaunchView = SettingView.extend({
        className: 'modal-add-widget-setting-launch',
        template: 'modal-add-widget-setting-launch',
        events: {
            'change [data-js-data-launch-input]': 'onChange',
        },
        bindings: {

        },
        initialize: function() {
            this.widgetConfig = WidgetsConfig.getInstance();
            this.curWidget = this.widgetConfig.widgetTypes[this.model.get('gadget')];
            if (!this.curWidget.launchesFilter) {
                this.destroy();
                return false;
            }
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
        onChange: function(e) {
            var curOptions = this.model.getWidgetOptions();
            curOptions.launchNameFilter = [$(e.currentTarget).val()];
            this.model.setWidgetOptions(curOptions);
        },
        activate: function() {
            var self = this,
                curOptions = this.model.getWidgetOptions(),
                field = $('[data-js-data-launch-input]', this.$el);
            if(curOptions.launchNameFilter){
                field.val(curOptions.launchNameFilter);
            }
            Util.setupSelect2WhithScroll(field, {
                min: 1,
                minimumInputLength: 3,
                maximumInputLength: 256,
                maximumSelectionSize: 1,
                multiple: false,
                dropdownCssClass: 'rp-select2-separate-block',
                allowClear: false,
                placeholder: Localization.widgets.selectLaunch,
                initSelection: function (element, callback) {
                    callback({id: element.val(), text: element.val()});
                },
                query: function (query) {
                    Service.searchLaunches(query)
                        .done(function (response) {
                            var data = {results: []}
                            _.each(response, function (item) {
                                data.results.push({
                                    id: item,
                                    text: item
                                });
                            });
                            query.callback(data);
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error);
                        });
                }
            });
            field.on('change', function () {
                field.trigger('validate');
            });
            Util.hintValidator(field, {
                validator: 'required'
            });

        },
        validate: function(){
            return !$('[data-js-data-launch-input]', this.$el).trigger('validate').data('validate-error');
        }
    });

    return SettingLaunchView;
});