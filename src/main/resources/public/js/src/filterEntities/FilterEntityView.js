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

    var Epoxy = require('backbone-epoxy');
    var App = require('app');

    var config = App.getInstance();

    var FilterEntityView = Epoxy.View.extend({
        className: 'filter-entity-wrapper',
        initialize: function (options) {
            this.filterLevel = options.filterLevel;
            this.render();
            this.listenTo(this.model, 'change:visible', this.onChangeVisible);
            this.listenTo(this.model, 'change:value', this.onChangeValue);
        },
        onChangeVisible: function (model, visible) {
            if (!visible) {
                model.set({ value: model.defaults.value });
                this.destroy();
            }
        },
        onChangeValue: function (model) {
            if (model.get('id') === 'name' && model.get('value')) {
                if (this.filterLevel === 'suit') {
                    config.trackingDispatcher.trackEventNumber(96);
                } else if (this.filterLevel === 'test') {
                    config.trackingDispatcher.trackEventNumber(135);
                }
            }
        },
        render: function () {
            var view = new this.model.view({ model: this.model });
            this.$el.html(view.$el);
        },
        destroy: function () {
            this.undelegateEvents();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });


    return FilterEntityView;
});
