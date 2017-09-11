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
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var FilterSortingView = require('filterSelectionParameters/FilterSortingView');
    var FilterListener = require('controlers/filterControler/FilterListener');

    var FilterSearchEditView = Epoxy.View.extend({
        className: 'setting-filter-search-edit',
        template: 'tpl-modal-add-widget-setting-filter-search-edit',
        events: {
            'click [data-js-cancel-edit]': 'onClickCancel',
            'click [data-js-ok-edit]': 'onClickOk',
            'click [data-js-cancel]': 'onClick'
        },
        bindings: {
            '[data-js-filter-name]': 'text: name'
        },
        initialize: function () {
            var self = this;
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.render();
            this.async = $.Deferred();
            this.listenTo(this.model, 'change:entities', function () {
                self.trigger('send:event', {
                    view: 'filter',
                    action: 'edit entity'
                });
            });
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-entities-container]', this.$el),
                filterLevel: 'launch',
                model: this.model
            });
            $('input', $('[data-js-entity-choice-list] [data-js-link]', this.filterEntities.$el)).on('click', function () {
                self.trigger('send:event', {
                    view: 'filter',
                    action: 'edit entity choice click'
                });
            });
            this.filterSorting = new FilterSortingView({ model: this.model });
            $('[data-js-filter-sorting]', this.$el).append(this.filterSorting.$el);
            $('[data-js-sorting-list] a', this.filterSorting.$el).on('click', function () {
                self.trigger('send:event', {
                    view: 'filter',
                    action: 'edit entity sorting list click'
                });
            });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClick: function (e) {
            e.stopPropagation();
        },
        onClickCancel: function () {
            this.trigger('send:event', {
                view: 'filter',
                action: 'cancel edit filter'
            });
            this.model.set({ newEntities: '' });
            this.trigger('returnToFiltersList');
            this.async.reject();
        },
        onClickOk: function () {
            this.trigger('send:event', {
                view: 'filter',
                action: 'ok edit filter'
            });

            this.filterListener.trigger(
                this.filterEvents.ON_SET_FILTER,
                {
                    id: this.model.get('id'),
                    data: this.model.getDataFromServer()
                }
            );
            this.trigger('returnToFiltersList');
            this.async.resolve();
        },
        getReadyState: function () {
            return this.async;
        },
        onDestroy: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.filterSorting && this.filterSorting.destroy();
            this.$el.remove();
        }
    });


    return FilterSearchEditView;
});
