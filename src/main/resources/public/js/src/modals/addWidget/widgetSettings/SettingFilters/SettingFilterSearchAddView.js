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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var FilterSortingView = require('filterSelectionParameters/FilterSortingView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var FilterModel = require('filters/FilterModel');
    var App = require('app');
    var FilterListener = require('controlers/filterControler/FilterListener');

    var config = App.getInstance();

    var FilterSearchAddView = Epoxy.View.extend({
        className: 'setting-filter-search-add',
        template: 'tpl-modal-add-widget-setting-filter-search-add',
        events: {
            'click [data-js-cancel-edit]': 'onClickCancel',
            'click [data-js-ok-edit]': 'onClickOk',
            'click [data-js-cancel]': 'onClick'
        },
        bindings: {
            '[data-js-filter-name]': 'text: name'
        },
        initialize: function () {
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.render();
            this.async = $.Deferred();
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
        },
        activate: function () {
            var self = this;
            this.launchFilterCollection.ready.done(function () {
                self.model = new FilterModel({
                    temp: true,
                    active: true,
                    owner: config.userModel.get('name')
                });
                var filterNames = _.map(self.launchFilterCollection.models, function (model) {
                    return model.get('name');
                });
                Util.hintValidator($('[data-js-name-input]', self.$el), [{
                    validator: 'minMaxRequired',
                    type: 'filterName',
                    min: 3,
                    max: 128
                }, { validator: 'noDuplications', type: 'filterName', source: filterNames }]);
                self.filterEntities = new FilterEntitiesView({
                    el: $('[data-js-entities-container]', self.$el),
                    filterLevel: 'launch',
                    model: self.model
                });
                $('input', $('[data-js-entity-choice-list] [data-js-link]', self.filterEntities.$el)).on('click', function () {
                    self.trigger('send:event', {
                        view: 'filter',
                        action: 'entity choice click'
                    });
                });
                self.filterSorting = new FilterSortingView({ model: self.model });
                $('[data-js-filter-sorting]', self.$el).append(self.filterSorting.$el);
                self.listenTo(self.model, 'change:id', self.onChangeId);
                $('[data-js-sorting-list] a', self.filterSorting.$el).on('click', function () {
                    self.trigger('send:event', {
                        view: 'filter',
                        action: 'sorting list click'
                    });
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
                action: 'cancel add click'
            });
            this.model.set({ newEntities: '' });
            this.launchFilterCollection.remove(this.model);
            this.trigger('returnToFiltersList');
            this.async.reject();
        },
        onClickOk: function () {
            var $filterName = $('[data-js-name-input]', this.$el);
            this.trigger('send:event', {
                view: 'filter',
                action: 'ok add click'
            });
            $filterName.trigger('validate');
            if (!$filterName.data('validate-error')) {
                this.filterListener.trigger(this.filterEvents.ON_ADD_FILTER, {
                    cid: this.model.cid,
                    data: this.model.getDataFromServer({ name: $filterName.val() })
                });
                this.trigger('returnToFiltersList');
            }
        },
        onChangeId: function () {
            this.trigger('change:filter', this.model);
            this.async.resolve();
        },
        getReadyState: function () {
            return this.async;
        },
        onDestroy: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.filterSorting && this.filterSorting.destroy();
            this.model && this.model.destroy();
            this.$el.remove();
        }
    });


    return FilterSearchAddView;
});
