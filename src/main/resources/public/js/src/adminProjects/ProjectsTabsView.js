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

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var ProjectsList = require('adminProjects/ProjectsListView');
    var Localization = require('localization');
    var DropDownComponent = require('components/DropDownComponent');

    var config = App.getInstance();

    var ProjectsListTabsView = Epoxy.View.extend({

        tpl: 'tpl-projects-list-shell',

        events: {
            'click [data-js-tab-action]': 'getTab',
            'click [data-js-sort-block] .rp-btn': 'changeSorting',
            'validation::change [data-js-filter-projects]': 'filterProjects',
            'click [data-js-view-type]': 'changeProjectsView',
            //'click [data-toggle="tab"]': 'updateTabs'
        },

        initialize: function (options) {
            this.tab = options.action;
            this.model = new Epoxy.Model({
                search: config.defaultProjectsSettings.search,
                sort: config.defaultProjectsSettings.sorting,
                direction: config.defaultProjectsSettings.sortingDirection,
                viewType: config.defaultProjectsSettings.listView
            });
            var self = this;
            this.model.on('change:sort change:direction change:search', function () {
                self.update(self.tab);
            });
            this.model.on('change:viewType', function () {
                self.tabView.updateView();
            });
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl, {tab: this.tab}));
            this.setupAnchors();
            this.setupSelectDropDown();
            this.fillContent();
        },

        update: function (tab, silent) {
            this.tab = tab || "internal";
            this.renderTabContent();
        },

        updateTabs: function (tab) {
            switch (tab) {
                case 'personal':
                    config.trackingDispatcher.trackEventNumber(446);
                    break;
                default:
                    config.trackingDispatcher.trackEventNumber(445);
            }
            config.router.navigate('#administrate/projects/' + tab);
            this.clearSearch();
            this.update(tab, true);
        },

        setupSelectDropDown: function () {
            this.tabSelector = new DropDownComponent({
                data: [
                    {name: 'INTERNAL PROJECTS', value: 'internal'},
                    {name: 'PERSONAL PROJECTS', value: 'personal'}
                ],
                multiple: false,
                defaultValue: this.tab,
            });
            $('[data-js-nav-tabs-mobile]', this.$el).html(this.tabSelector.$el);
            this.listenTo(this.tabSelector, 'change', this.updateTabs);
        },

        getTab: function (e) {
            e.preventDefault();
            this.updateTabs($(e.currentTarget).data('js-tab-action'));
        },

        renderTabContent: function () {
            this.tabView && this.tabView.destroy();

            this.tabView = this.getProjectsView();
            this.$tabContent.html(this.tabView.$el);

            $('[data-js-tab-action]', this.$el).closest('li.active').removeClass('active');
            $('[data-js-tab-action="' + this.tab + '"]', this.$el).closest('li').addClass('active');;
            this.tabSelector.activateItem(this.tab);

        },

        fillContent: function (options) {
            Util.bootValidator(this.$searchString, [{
                validator: 'minMaxNotRequired',
                type: 'addProjectName',
                min: 3,
                max: 256
            }]);

            this.renderTabContent();
            this.listenTo(this.tabView, 'loadProjectsReady', this.onLoadProjectsReady);
        },

        setupAnchors: function () {
            this.$sortBlock = $("[data-js-sort-block]", this.$el);
            this.$searchString = $("[data-js-filter-projects]", this.$el);
            this.$tabContent = $('[data-js-tab-content]', this.$el);
        },

        getProjectsView: function () {
            return new ProjectsList({
                projectsType: this.tab,
                total: $('[data-js-' + this.tab + '-qty]', this.$el),
                model: this.model
            });
        },

        changeProjectsView: function (event) {
            event.preventDefault();
            var $target = $(event.currentTarget),
                viewType = $target.data('js-view-type');
            switch (viewType) {
                case 'table':
                    config.trackingDispatcher.trackEventNumber(444);
                    break;
                default:
                    config.trackingDispatcher.trackEventNumber(443);
            }
            $('.projects-view.active').removeClass('active');
            $target.addClass('active');
            this.model.set('viewType', viewType);
        },

        changeSorting: function (e) {
            config.trackingDispatcher.trackEventNumber(442);
            var btn = $(e.currentTarget);
            if (btn.hasClass('active')) {
                btn.toggleClass('desc');
                this.model.set('direction', btn.hasClass('desc') ? 'desc' : 'asc');
            } else {
                $(".active, .desc", this.$sortBlock).removeClass('active').removeClass('desc');
                btn.addClass('active');
                this.model.set('direction', 'asc');
                this.model.set('sort', btn.data('type'));
            }
        },

        filterProjects: function (e, data) {
            var self = this;
            clearTimeout(this.searching);
            this.searching = setTimeout(function () {
                if (data.valid && self.model.get('search') !== data.value) {
                    config.trackingDispatcher.trackEventNumber(441);
                    self.model.set('search', data.value);
                }
            }, config.userFilterDelay);
        },

        clearSearch: function () {
            this.model.set('search', config.defaultProjectsSettings.search, {silent: true});
            this.$searchString.val('');
        },

        destroy: function () {
            this.tabView && this.tabView.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return ProjectsListTabsView;

});
