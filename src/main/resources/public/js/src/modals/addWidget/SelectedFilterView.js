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
    var FilterSearchItemView = require('modals/addWidget/FilterSearchItemView');
    var FilterModel = require('filters/FilterModel');
    var FilterListener = require('controlers/filterControler/FilterListener');

    var FilterSearchItem = Epoxy.View.extend({
        className: 'modal-add-widget-selected-filter',
        template: 'tpl-modal-add-widget-selected-filter',
        events: {
            'click [data-js-filter-edit]': 'onClickFilterEdit'
        },
        initialize: function () {
            var self = this;
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.async = $.Deferred();
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
                this.async.resolve();
            }
        },
        getFilterModel: function () {
            return this.filterModel;
        },
        getAsync: function () {
            return this.async;
        },
        setFilterModel: function (model) {
            this.filterView && this.filterView.destroy();
            this.filterView = new FilterSearchItemView({ model: model });
            $('[data-js-filter-info]', this.$el).html(this.filterView.$el);
        },
        getSelectedFilterModel: function () {
            return this.filterModel;
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickFilterEdit: function () {
            this.trigger('edit', this.filterModel);
        },
        onDestroy: function () {
            this.filterView && this.filterView.destroy();
            this.filterModel.destroy();
            this.$el.remove();
        }
    });


    return FilterSearchItem;
});
