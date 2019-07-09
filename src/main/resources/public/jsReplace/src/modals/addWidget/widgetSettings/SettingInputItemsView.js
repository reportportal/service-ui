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
    var Service = require('coreService');
    var Localization = require('localization');

    var actionTypes = {};

    var SettingInputItemsView = SettingView.extend({
        className: 'modal-add-widget-setting-input-items',
        template: 'tpl-modal-add-widget-setting-input-items',
        bindings: {
            '[data-js-label-name]': 'html:label',
            '[data-js-label-input]': 'value:value'
        },
        initialize: function (data) {
            var options = _.extend({
                label: '',
                placeholder: '',
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
            if (options.action && actionTypes[options.action]) {
                this.setValue = actionTypes[options.action].setValue;
                this.getValue = actionTypes[options.action].getValue;
            }
            options.setValue && (this.setValue = options.setValue);
            options.getValue && (this.getValue = options.getValue);
            options.validate && (this.validate = options.validate.bind(this));
            this.model.set({ value: this.getValue(this.gadgetModel, this) });
            this.listenTo(this.model, 'change:value', this.onChangeValue);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        getFunctions: function () {
            switch (this.model.get('entity')) {
            case 'filter':
                return {
                    query: function (query) {
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
                    },
                    getDataByIds: function (values, callback) {
                        Service.getFilterData(values)
                            .done(function (data) {
                                callback(_.map(data, function (filter) {
                                    return { id: filter.id, text: filter.name };
                                }));
                            });
                    }
                };
            case 'launchName':
                return {
                    query: function (query) {
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
                    },
                    getDataByIds: function (values, callback) {
                        callback(_.map(values, function (launch) {
                            return { id: launch, text: launch };
                        }));
                    }
                };
            case 'user':
                return {
                    query: function (query) {
                        Service.getProjectUsersById(query.term)
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
                    },
                    getDataByIds: function (values, callback) {
                        callback(_.map(values, function (user) {
                            return { id: user, text: user };
                        }));
                    }
                };
            default:
                return function (query) {
                    query.callback([]);
                };
            }
        },
        activate: function () {
            var self = this;
            Util.setupSelect2WhithScroll($('[data-js-label-input]', this.$el), {
                min: this.model.get('minItems'),
                minimumInputLength: this.model.get('minItemLength'),
                maximumInputLength: this.model.get('maxItemLength'),
                maximumSelectionSize: this.model.get('maxItems'),
                multiple: (this.model.get('maxItems') >= 2),
                dropdownCssClass: 'rp-select2-separate-block',
                allowClear: false,
                placeholder: this.model.get('placeholder'),
                tags: false,
                initSelection: function (element, callback) {
                    self.getFunctions()
                        .getDataByIds(self.getValue(self.gadgetModel, self), callback);
                },
                query: this.getFunctions().query
            });
            $('[data-js-label-input]', this.$el)
                .on('select2-open', this.onEnterInput)
                .on('select2-close', this.onOverInput);
            this.activated = true;
        },
        onChangeValue: function (model, value) {
            this.setValue(value.split(','), this.gadgetModel, this);
            this.hideErrorState();
        },
        onOverInput: function () {
            $('[data-js-validate-hint]', this.$el).hide();
        },
        onEnterInput: function () {
            if ($('[data-js-input-wrapper]', this.$el).hasClass('validate-error')) {
                $('[data-js-validate-hint]', this.$el).show();
            }
        },
        validate: function (options) {
            if (this.model.get('minItems') > 0 && !this.model.get('value').length) {
                if (options && options.silent) {
                    return false;
                }
                this.showErrorState(Localization.validation.moreAtItem);
                return false;
            }
            return true;
        },
        showErrorState: function (message) {
            $('[data-js-input-wrapper]', this.$el).addClass('validate-error');
            $('[data-js-validate-hint]', this.$el).html(message);
        },
        hideErrorState: function () {
            $('[data-js-input-wrapper]', this.$el).removeClass('validate-error');
            $('[data-js-validate-hint]', this.$el).html('').hide();
        },
        onDestroy: function () {
            this.selectCriteria && this.selectCriteria.destroy();
        }
    });

    return SettingInputItemsView;
});
