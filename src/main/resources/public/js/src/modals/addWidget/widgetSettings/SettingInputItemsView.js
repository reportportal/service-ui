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

    var Util = require('util');
    var Epoxy = require('backbone-epoxy');
    var $ = require('jquery');
    var _ = require('underscore');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var Localization = require('localization');
    var Service = require('coreService');

    var SettingInputItemsView = SettingView.extend({
        className: 'modal-add-widget-setting-input-items',
        template: 'modal-add-widget-setting-input-items',
        bindings: {
            '[data-js-label-name]': 'html:label',
            '[data-js-label-input]': 'value:value'
        },
        initialize: function (data) {
            var options = _.extend({
                label: '',
                inputPlaceholder: '',
                minItemLength: 3,
                maxItemLength: 256,
                minItems: 0,
                maxItems: 50,
                entity: '',
                value: ''
            }, data.options);
            this.gadgetModel = data.gadgetModel;
            this.options = data.options;
            this.model = new Epoxy.Model(options);
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        getQueryFunc: function () {
            switch (this.model.get('entity')) {
            case 'filter':
                return function (query) {
                    Service.saveFilter('?page.sort=name&page.page=1&page.size=50&filter.cnt.name=' + query.term)
                            .done(function (response) {
                                var data = { results: [] };
                                _.each(response.content, function (item) {
                                    data.results.push({
                                        id: item.id,
                                        text: item.name
                                    });
                                });
                                query.callback(data);
                            })
                            .fail(function (error) {
                                Util.ajaxFailMessenger(error);
                            });
                };
            case 'launch':
                return function (query) {
                    Service.searchLaunches(query)
                        .done(function (response) {
                            var data = { results: [] };
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
                };
            default:
                return function (query) {
                    query.callback([]);
                };
            }
        },
        activate: function () {
            Util.setupSelect2WhithScroll($('[data-js-label-input]', this.$el), {
                min: this.model.get('minItems'),
                minimumInputLength: this.model.get('minItemLength'),
                maximumInputLength: this.model.get('maxItemLength'),
                maximumSelectionSize: this.model.get('maxItems'),
                multiple: (this.model.get('maxItems') >= 2),
                dropdownCssClass: 'rp-select2-separate-block',
                allowClear: false,
                placeholder: this.model.get('inputPlaceholder'),
                initSelection: function (element, callback) {
                    callback({ id: element.val(), text: element.val() });
                },
                query: this.getQueryFunc()
            });
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

    return SettingInputItemsView;
});
