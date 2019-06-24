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
    var Util = require('util');
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var FilterModel = require('filters/FilterModel');
    var ProjectEventsTableView = require('projectEvents/projectEventsTableView');
    var App = require('app');
    var config = App.getInstance();

    var ProjectEventsView = Epoxy.View.extend({

        className: 'project-events',
        template: 'tpl-project-events',

        events: {
            'click [data-js-refresh]': 'update'
        },

        initialize: function () {
            var filterData = this.calculateFilterOptions(window.location.hash.split('?')[1]);
            this.filterModel = new FilterModel({
                temp: true,
                context: 'projectEvents',
                entities: filterData.entities,
                selection_parameters: filterData.selection_parameters
            });
            this.render();
            this.listenTo(this.filterModel, 'change:newSelectionParameters change:newEntities', this.changeUrl);
            this.listenTo(this.eventsTable, 'changePaging', this.changeUrl);
            this.listenTo(this.eventsTable.eventsCollection, 'loading', this.handleRefreshButton);
        },
        calculateFilterOptions: function (optionsUrl) {
            var options;
            var filterEntities = [];
            var answer = {};

            if (optionsUrl) {
                options = optionsUrl.split('&');
                _.each(options, function (option) {
                    var optionSeparate = option.split('=');
                    var keySeparate = optionSeparate[0].split('.');
                    var keyFirstPart = keySeparate[0];
                    var valueSeparate;

                    if (keyFirstPart === 'filter') {
                        filterEntities.push({
                            condition: keySeparate[1],
                            filtering_field: keySeparate[2],
                            value: decodeURIComponent(optionSeparate[1])
                        });
                    }
                    if (keyFirstPart === 'page') {
                        if (keySeparate[1] === 'page') {
                            this.pagingPage = parseInt(optionSeparate[1], 10);
                        } else if (keySeparate[1] === 'size') {
                            this.pagingSize = parseInt(optionSeparate[1], 10);
                        } else if (keySeparate[1] === 'sort') {
                            valueSeparate = optionSeparate[1].split('%2C');
                            answer.selection_parameters = JSON.stringify({
                                is_asc: (valueSeparate[1] === 'ASC'),
                                sorting_column: valueSeparate[0]
                            });
                        }
                    }
                    keySeparate.shift();
                }, this);
                answer.entities = JSON.stringify(filterEntities);
            }
            return answer;
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.renderEntities();
            this.renderTable();
            return this;
        },
        update: function () {
            this.eventsTable && this.eventsTable.update();
        },
        changeUrl: function () {
            var mainHash = window.location.hash.split('?')[0];
            var params = this.eventsTable.eventsCollection.getParamsFilter();
            var query = '?' + params.join('&');
            config.router.navigate(mainHash + query, { trigger: false, replace: true });
        },
        handleRefreshButton: function (isLoading) {
            (isLoading) ? $('[data-js-refresh]', this.$el).addClass('disabled') : $('[data-js-refresh]', this.$el).removeClass('disabled');
        },
        renderEntities: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-refine-entities]', this.$el),
                filterLevel: 'projectEvents',
                model: this.filterModel
            });
        },
        renderTable: function () {
            this.eventsTable && this.eventsTable.destroy();
            this.eventsTable = new ProjectEventsTableView({
                filterModel: this.filterModel,
                pagingPage: this.pagingPage ? this.pagingPage : null,
                pagingSize: this.pagingSize ? this.pagingSize : null
            });
            $('[data-js-events-table-container]', this.$el).html(this.eventsTable.el);
        },
        onDestroy: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.eventsTable && this.eventsTable.destroy();
        }
    });

    return ProjectEventsView;
});
