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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var FilterSortingView = require('filterSelectionParameters/FilterSortingView');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var FilterModel = require('filters/FilterModel');
    var App = require('app');

    var config = App.getInstance();


    var FilterSearchAddView = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search-add',
        template: 'tpl-modal-add-widget-filter-search-add',
        events: {
            'click [data-js-cancel-edit]': 'onClickCancel',
            'click [data-js-ok-edit]': 'onClickOk',
            'click [data-js-cancel]': 'onClick',
        },
        bindings: {
            '[data-js-filter-name]': 'text: name',
        },
        initialize: function() {
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.render();
            this.async = $.Deferred();
        },
        activate: function() {
            var self = this;
            this.launchFilterCollection.ready.done(function() {
                self.model = new FilterModel({
                    temp: true,
                    active: true,
                    owner: config.userModel.get('name'),
                });
                var filterNames = _.map(self.launchFilterCollection.models, function(model) {
                    return model.get('name');
                });
                self.trigger('change:filter', self.model);
                Util.hintValidator($('[data-js-name-input]', self.$el), [{
                    validator: 'minMaxRequired',
                    type: 'filterName',
                    min: 3,
                    max: 128
                }, {validator: 'noDuplications', type: 'filterName', source: filterNames}]);
                self.filterEntities = new FilterEntitiesView({
                    el: $('[data-js-entities-container]', self.$el),
                    filterLevel: 'launch',
                    model: self.model
                });
                self.filterSorting = new FilterSortingView({model: self.model});
                $('[data-js-filter-sorting]', self.$el).append(self.filterSorting.$el);
                self.listenTo(self.model, 'change:id', self.onChangeId);
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClick: function(e) {
            e.stopPropagation();
        },
        onClickCancel: function() {
            this.model.set({newEntities: ''});
            this.launchFilterCollection.remove(this.model);
            this.async.reject();
        },
        onClickOk: function() {
            var $filterName = $('[data-js-name-input]', this.$el);
            $filterName.trigger('validate');
            if(!$filterName.data('validate-error')) {
                this.model.set({
                    name: $filterName.val(),
                    isShared: false,
                    description: '',
                    entities: this.model.get('newEntities') || this.model.get('entities'),
                    newEntities: '',
                    selection_parameters: this.model.get('newSelectionParameters') || this.model.get('selection_parameters'),
                    newSelectionParameters: '',
                });
                // for right work listeners
                this.model.set({temp: false});

            }
        },
        onChangeId: function() {
            this.trigger('change:filter', this.model);
            this.async.resolve();
        },
        getReadyState: function() {
            return this.async;
        },
        destroy: function() {
            this.filterEntities && this.filterEntities.destroy();
            this.filterSorting && this.filterSorting.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        }
    });



    return FilterSearchAddView;
});