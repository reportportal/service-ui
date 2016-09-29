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
    var FilterModel = require('filters/FilterModel');
    var FilterEntities = require('filterEntities/FilterEntities');
    var LogItemCollection = require('launches/logLevel/LogItemCollection');
    var Components = require('core/components');
    var LogItemLogsItem = require('launches/logLevel/LogItemLogsItem');

    var LogItemLogsTable = Epoxy.View.extend({
        template: 'tpl-launch-log-item-logs-table',

        events: {
            'change [data-js-attachments-filter]': 'onChangeFilter',
            'click .rp-grid-th[data-sorter]': 'onClickSorter',
        },

        initialize: function(options) {
            this.itemModel = options.itemModel;
            this.filterModel = new FilterModel({
                temp: true,
                selection_parameters: '{"is_asc": false, "sorting_column": "time"}',
            });
            this.pagingModel = new Backbone.Model();


            this.collection = new LogItemCollection({
                filterModel: this.filterModel,
                itemModel: this.itemModel,
            });
            this.render();
            this.collection.load();
            this.listenTo(this.collection, 'reset', this.onResetCollection);
            this.listenTo(this.selectModel, 'change:condition change:value', this.onChangeFilter);
            this.listenTo(this.nameModel, 'change:value', this.onChangeFilter);
            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.onChangeSelectionParameters);
            this.onChangeSelectionParameters();
        },

        render: function() {
            this.$el.html(Util.templates(this.template), {});

            this.selectModel = new FilterEntities.EntitySelectModel({
                id: 'level',
                condition: 'in',
                values: [
                    {name: 'All', value: 'All'},
                    {name:'Trace', value: 'TRACE'},
                    {name: 'Debug', value: 'DEBUG'},
                    {name: 'Info', value: 'INFO'},
                    {name: 'Warn', value: 'WARN'},
                    {name: 'Error', value: 'ERROR'},
                ],
                value: 'All'
            });
            this.nameModel = new FilterEntities.EntityInputModel({
                id: 'message',
                condition: 'cnt',
                valueMinLength: 3,
                valueOnlyDigits: false,
            });
            $('[data-js-select-filter]', this.$el).html((new this.selectModel.view({model: this.selectModel})).$el);
            $('[data-js-name-filter]', this.$el).html((new this.nameModel.view({model: this.nameModel})).$el);
            this.paging = new Components.PagingToolbar({
                el: $('[data-js-paginate-container]', this.$el),
                model: this.pagingModel,
            });
        },
        onChangeFilter: function() {
            var newEntities = [];
            newEntities.push(this.selectModel.getInfo());
            newEntities.push(this.nameModel.getInfo());
            if($('[data-js-attachments-filter]', this.$el).is(':checked')) {
                newEntities.push({
                    condition: 'ex',
                    filtering_field: 'binary_content',
                    value: 'true',
                });
            }
            this.filterModel.set({newEntities: JSON.stringify(newEntities)});
        },
        onClickSorter: function(e) {
            var sorter = $(e.currentTarget).data('sorter');
            var filterParams = this.filterModel.getParametersObj();
            if(filterParams.sorting_column == sorter) {
                filterParams.is_asc = !filterParams.is_asc;
            } else {
                filterParams.is_asc = true;
                filterParams.sorting_column = sorter;
            }
            this.filterModel.set({newSelectionParameters: JSON.stringify(filterParams), curPage: 1});
        },
        onChangeSelectionParameters: function() {
            $('[data-sorter]', this.$el).removeClass('sorting-asc sorting-desc');
            var filterParams = this.filterModel.getParametersObj();
            var $element = $('[data-sorter="' + filterParams.sorting_column + '"]', this.$el);
            if($element && $element.length) {
                $element.addClass((filterParams.is_asc) ? 'sorting-asc' : 'sorting-desc');
            }
        },

        onResetCollection: function() {
            var $container = $('[data-js-table-container]', this.$el);
            $container.html('');
            _.each(this.collection.models, function(model) {
                $container.append((new LogItemLogsItem({model: model})).$el);
            })
        },

        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    })

    return LogItemLogsTable;
});