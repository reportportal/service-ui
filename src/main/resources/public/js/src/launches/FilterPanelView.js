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
define(function (require, exports, module) {
    'use strict';

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var Util = require('util');
    var App = require('app');

    var config = App.getInstance();

    var FilterPanelView = Epoxy.View.extend({
        template: 'tpl-launch-filter-panel',
        events: {
            'click [data-js-edit-filter]': 'onClickEdit',
            'click [data-js-discard-filter]': 'onClickDiscard',
            'click [data-js-save-filter]': 'onClickSave',
            'click [data-js-clone-filter]': 'onClickClone',
        },
        bindings: {
            '[data-js-filter-not-save-descr]': 'classes: {hide: all(not(temp), not(newEntities), not(newSelectionParameters))}',
            '[data-js-filter-shared-descr]': 'classes: {hide: not(isShared)}',
            '[data-js-save-filter]': 'attr: {disabled: any(all(not(newEntities), not(newSelectionParameters)), notMyFilter)}',
            '[data-js-discard-filter]': 'attr: {disabled: all(not(newEntities), not(newSelectionParameters))}',
            '[data-js-edit-filter]': 'attr: {disabled: any(temp, notMyFilter)}',
            '[data-js-clone-filter]': 'attr: {disabled: all(not(entities), not(newEntities))}',
            '[data-js-filter-not-my-descr]': 'classes: {hide: not(notMyFilter)}',
        },

        initialize: function(options) {
            this.render();
            this.createFilterEntities();
        },
        // changeFilterEntities: function(model) {
        //     // console.dir(JSON.stringify(model.changed));
        // },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickEdit: function() {
            this.model.editMainInfo();
        },
        onClickClone: function() {
            var newFilter = this.model.collection.generateTempModel({
                newEntities: this.model.get('newEntities') || this.model.get('entities'),
            });
            config.router.navigate(newFilter.get('url'), {trigger: true});
        },
        onClickDiscard: function() {
            this.model.set({newEntities: '', newSelectionParameters: ''});
            this.createFilterEntities();
        },
        createFilterEntities: function() {
            this.filterEntities && this.filterEntities.destroy();
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-filter-entities]', this.$el),
                filterLevel: 'launch',
                model: this.model
            });
            // this.listenTo(this.filterEntities.collection, 'change', this.changeFilterEntities);
        },
        onClickSave: function() {
            this.model.saveFilter();
        },
        destroy: function () {
            this.filterEntities.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });


    return FilterPanelView;
});
