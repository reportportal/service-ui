/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var FilterSearchItemView = require('modals/addWidget/widgetSettings/SettingFilters/SettingFilterSearchItemView');
    var FilterModel = require('filters/FilterModel');
    var FilterListener = require('controlers/filterControler/FilterListener');

    var FilterSearchItem = Epoxy.View.extend({
        className: 'setting-filter-selected',
        template: 'tpl-modal-add-widget-setting-filter-selected',
        events: {
            'click [data-js-filter-edit]': 'onClickFilterEdit'
        },
        initialize: function (options) {
            var self = this;
            this.model = options.gadgetModel;
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.render();
            this.filterModel = new FilterModel({
                id: this.model.get('filter_id'),
                temp: true,
                active: true
            });
            this.$el.addClass('load');
            self.filterListener.trigger(self.filterEvents.ON_LOAD_FILTER,
                this.model.get('filter_id')
            );
            this.listenTo(this.filterModel, 'change:load', this.onChangeLoadFilter);
        },
        onChangeLoadFilter: function (model, load) {
            if (!load) {
                this.$el.removeClass('load');
                this.filterView && this.filterView.destroy();
                this.filterView = new FilterSearchItemView({ model: this.filterModel });
                $('[data-js-filter-info]', this.$el).html(this.filterView.$el);
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickFilterEdit: function () {
            // config.trackingDispatcher.trackEventNumber(321);
            this.trigger('edit');
        },
        validate: function () {
            return true;
        },
        onDestroy: function () {
            this.filterView && this.filterView.destroy();
            this.filterModel.destroy();
            this.$el.remove();
        }
    });


    return FilterSearchItem;
});
