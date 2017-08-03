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

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var Util = require('util');
    var App = require('app');
    var ModalFilterEdit = require('modals/modalFilterEdit');
    var FilterListener = require('controlers/filterControler/FilterListener');
    var FilterSortingView = require('filterSelectionParameters/FilterSortingView');

    var config = App.getInstance();

    var FilterPanelView = Epoxy.View.extend({
        template: 'tpl-launch-filter-panel',
        events: {
            'click [data-js-edit-filter]': 'onClickEdit',
            'click [data-js-discard-filter]': 'onClickDiscard',
            'click [data-js-save-filter]': 'onClickSave',
            'click [data-js-clone-filter]': 'onClickClone'
        },
        bindings: {
            '[data-js-filter-not-save-descr]': 'classes: {hide: all(not(temp), not(newEntities), not(newSelectionParameters))}',
            '[data-js-filter-shared-descr]': 'classes: {hide: any(not(share), notMyFilter)}',
            '[data-js-save-filter]': 'attr: {disabled: any(all(not(newEntities), not(newSelectionParameters)), notMyFilter)}',
            '[data-js-discard-filter]': 'attr: {disabled: all(not(newEntities), not(newSelectionParameters))}',
            '[data-js-edit-filter]': 'attr: {disabled: any(temp, notMyFilter)}',
            '[data-js-clone-filter]': 'attr: {disabled: all(not(entities), not(newEntities))}',
            '[data-js-filter-not-my-descr]': 'classes: {hide: not(notMyFilter)}',
            '[data-js-add-widget]': 'classes: {disabled: temp}'
        },

        initialize: function () {
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.render();
            this.createFilterEntities();
            this.listenTo(this.model, 'change:entities change:selection_parameters', this.createFilterEntities);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickEdit: function () {
            var self = this;
            config.trackingDispatcher.trackEventNumber(15);
            (new ModalFilterEdit({ mode: 'edit', filterModel: self.model })).show()
                .done(function (dataModel) {
                    self.filterListener.trigger(self.filterEvents.ON_SET_FILTER, {
                        id: self.model.get('id'),
                        data: self.model.getDataFromServer(dataModel.attributes)
                    });
                });
        },
        onClickClone: function () {
            var newFilter = this.model.collection.generateTempModel({
                newEntities: this.model.get('newEntities') || this.model.get('entities')
            });
            config.router.navigate(newFilter.get('url'), { trigger: true });
            config.trackingDispatcher.trackEventNumber(14);
        },
        onClickDiscard: function () {
            config.trackingDispatcher.trackEventNumber(13);
            this.model.set({ newEntities: '', newSelectionParameters: '' });
            this.createFilterEntities();
            this.model.trigger('discard');
        },
        createFilterEntities: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-filter-entities]', this.$el),
                filterLevel: 'launch',
                model: this.model
            });
            this.filterSorting && this.filterSorting.destroy();
            this.filterSorting = new FilterSortingView({ model: this.model });
            $('[data-js-filter-sorting]', this.$el).html(this.filterSorting.$el);
        },
        onClickSave: function () {
            var self = this;
            config.trackingDispatcher.trackEventNumber(16);
            if (this.model.get('temp')) {
                (new ModalFilterEdit({ mode: 'save', filterModel: self.model })).show()
                    .done(function (dataModel) {
                        self.filterListener.trigger(self.filterEvents.ON_ADD_FILTER, {
                            cid: self.model.cid,
                            data: self.model.getDataFromServer(dataModel.attributes),
                            isLaunch: true
                        });
                    });
            } else {
                self.filterListener.trigger(
                    self.filterEvents.ON_SET_FILTER,
                    {
                        id: self.model.get('id'),
                        data: self.model.getDataFromServer()
                    }
                );
            }
        },
        onDestroy: function () {
            this.filterSorting && this.filterSorting.destroy();
            this.filterEntities && this.filterEntities.destroy();
            this.$el.html('');
        }
    });


    return FilterPanelView;
});
