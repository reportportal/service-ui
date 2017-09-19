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

    var _ = require('underscore');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var Epoxy = require('backbone-epoxy');

    var types = {
        criteria: {
            getValue: function (model, self) {
                var contentFields;
                if (typeof self.model.get('fields') === 'function') {
                    self.model.set('fields', self.model.get('fields')());
                }
                contentFields = model.getContentFields();
                if (contentFields.length) {
                    return contentFields;
                }
                return self.model.get('fields');
            },
            setValue: function (value, model) {
                model.setContentFields(_.uniq(value.concat(model.getContentFields())));
            }
        },
        limit: {
            getValue: function (model, self) {
                if (model.get('itemsCount')) {
                    return model.get('itemsCount');
                }
                return self.model.get('value');
            },
            setValue: function (value, model) {
                model.set('itemsCount', value);
            }
        },
        metadata_fields: {
            getValue: function (model, self) {
                if (model.get('metadata_fields')) {
                    return model.get('metadata_fields');
                }
                return self.model.get('fields');
            },
            setValue: function (value, model) {
                model.set('metadata_fields', value);
            }
        }
    };

    var SettingStaticData = SettingView.extend({
        initialize: function (data) {
            var options = _.extend({
                fields: [],
                value: 0
            }, data.options);
            this.model = new Epoxy.Model(options);
            this.gadgetModel = data.gadgetModel;
            if (options.action && types[options.action]) {
                this.setValue = types[options.action].setValue;
                this.getValue = types[options.action].getValue;
            }
            options.setValue && (this.setValue = options.setValue);
            options.getValue && (this.getValue = options.getValue);
        },
        activate: function () {
            this.activated = true;
            return true;
        },
        validate: function () {
            return true;
        },
        onDestroy: function () {
        }
    });

    return SettingStaticData;
});
