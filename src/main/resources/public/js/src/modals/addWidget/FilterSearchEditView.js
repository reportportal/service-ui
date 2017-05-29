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
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var FilterListener = require('controlers/filterControler/FilterListener');
    var App = require('app');

    var config = App.getInstance();

    var FilterSearchEditView = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search-edit',
        template: 'tpl-modal-add-widget-filter-search-edit',
        events: {
            'click [data-js-cancel-edit]': 'onClickCancel',
            'click [data-js-ok-edit]': 'onClickOk',
            'click [data-js-cancel]': 'onClick',
            'mouseenter [data-js-filter-name]': 'onHoverFilter'
        },
        bindings: {
            '[data-js-filter-name]': 'text: name'
        },
        initialize: function (options) {
            var self = this;
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.modalType = options.modalType;
            this.render();
            this.async = $.Deferred();
            this.listenTo(this.model, 'change:entities', function () {
                if (this.modalType === 'edit') {
                    config.trackingDispatcher.trackEventNumber(336);
                } else {
                    config.trackingDispatcher.trackEventNumber(307);
                }
            });
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-entities-container]', this.$el),
                filterLevel: 'launch',
                model: this.model
            });
            $('input', $('[data-js-entity-choice-list] [data-js-link]', this.filterEntities.$el)).on('click', function () {
                if (self.modalType !== 'edit') {
                    config.trackingDispatcher.trackEventNumber(308);
                }
            });
            this.filterSorting = new FilterSortingView({ model: this.model });
            $('[data-js-filter-sorting]', this.$el).append(this.filterSorting.$el);
            $('[data-js-sorting-list] a', this.filterSorting.$el).on('click', function () {
                if (self.modalType !== 'edit') {
                    config.trackingDispatcher.trackEventNumber(309);
                }
            });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClick: function (e) {
            e.stopPropagation();
        },
        onHoverFilter: function () {
            if (this.modalType !== 'edit') {
                config.trackingDispatcher.trackEventNumber(306);
            }
        },
        onClickCancel: function () {
            if (this.modalType === 'edit') {
                config.trackingDispatcher.trackEventNumber(337);
            } else {
                config.trackingDispatcher.trackEventNumber(310);
            }
            this.model.set({ newEntities: '' });
            this.async.reject();
        },
        onClickOk: function () {
            // var launchFilterCollection = new SingletonLaunchFilterCollection();
            // var self = this;
            if (this.modalType === 'edit') {
                config.trackingDispatcher.trackEventNumber(338);
            } else {
                config.trackingDispatcher.trackEventNumber(311);
            }

            this.filterListener.trigger(
                this.filterEvents.ON_SET_FILTER,
                {
                    id: this.model.get('id'),
                    data: this.model.getDataFromServer()
                }
            );
            // launchFilterCollection.ready.done(function () {
            //     self.setFilterModel(launchFilterCollection.get(self.model.get('filter_id')));
            // });
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
