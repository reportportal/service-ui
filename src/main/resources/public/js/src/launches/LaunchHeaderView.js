/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var FilterLabelView = require('launches/FilterLabelView');
    var FilterPanelView = require('launches/FilterPanelView');
    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var FilterModel = require('filters/FilterModel');
    var App = require('app');

    var config = App.getInstance();

    var LaunchHeaderView = Epoxy.View.extend({
        events: {
            'click [data-js-add-filter]': 'onClickAddFilter',
            'click [data-js-all-link]': 'onClickAllLink',
        },

        bindings: {
            '[data-js-filters-overflow]': 'classes: {"padding-bottom": not(active)}',
            '[data-js-all-link]': 'attr: {href: url}, classes: {active: active}',
        },

        template: 'tpl-launch-header',
        initialize: function(options) {
            this.ready = $.Deferred();
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.model = new FilterModel({id: 'all', active: true, name: 'All Launches', owner: config.userModel.get('name')});
            this.listenTo(this.launchFilterCollection, 'add', this.onAddFilter);
            this.listenTo(this.launchFilterCollection, 'change:activeFilter', this.onChangeActiveFilter);
            this.listenTo(this.launchFilterCollection, 'change:id', this.onChangeIdFilter);
            this.render();
        },
        render: function() {
            this.launchFilterCollection.ready.done(function() {
                this.listenTo(this.launchFilterCollection, 'reset', this.renderFilterList);
                this.$el.html(Util.templates(this.template));
                this.applyBindings();
                this.renderFilterList();
                this.ready.resolve();
            }.bind(this));
        },
        onChangeActiveFilter: function(filterModel) {
            if(filterModel) {
                this.activateFilter(filterModel)
                this.renderActiveFilter(filterModel);
            } else {
                this.model.set({active: true});
                this.renderActiveFilter(this.model);
                if(this.filterPanel) {
                    this.filterPanel.destroy();
                }
            }
        },
        renderActiveFilter: function(model) {
            var $container = $('[data-js-active-filter]', this.$el);
            $container.html('');
            var mobileFilterActive = new FilterLabelView({model: model});
            $container.append(mobileFilterActive.$el);
        },
        setState: function(level) {
            $('.launches-header-block', this.$el).attr('data-js-state', level);
        },
        activateFilter: function(filterModel) {
            this.model.set({active: false});
            if(this.filterPanel) {
                this.filterPanel.destroy();
            }
            this.filterPanel = new FilterPanelView({model: filterModel});
            $('[data-js-filter-panel]', this.$el).html(this.filterPanel.$el);
        },
        onAddFilter: function(model) {
            var filter = new FilterLabelView({model: model});
            $('[data-js-filter-list]', this.$el).append(filter.$el);
            var mobileFilter = new FilterLabelView({model: model});
            $('[data-js-filter-list-mobile]', this.$el).append(mobileFilter.$el);
        },
        renderFilterList: function() {
            $('[data-js-filter-list]', this.$el).html('');
            $('[data-js-filter-list-mobile]', this.$el).html('');
            var mobileFilter = new FilterLabelView({model: this.model});
            $('[data-js-filter-list-mobile]', this.$el).append(mobileFilter.$el);
            _.each(this.launchFilterCollection.models, function(model){
                this.onAddFilter(model);
            }, this)
        },
        onClickAddFilter: function() {
            config.trackingDispatcher.trackEventNumber(12);
            var newFilter = this.launchFilterCollection.generateTempModel();
            config.router.navigate(newFilter.get('url'), {trigger: true});
        },
        onClickAllLink: function() {
            config.trackingDispatcher.trackEventNumber(22);
        },
        onChangeIdFilter: function(filterModel) {
            config.router.navigate(filterModel.get('url'), {trigger: false});
        },
        destroy: function () {
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return LaunchHeaderView;
});
