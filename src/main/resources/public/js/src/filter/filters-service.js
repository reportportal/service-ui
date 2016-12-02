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
    var Urls = require('dataUrlResolver');
    var Commponents = require('core/components');
    var CallService = require('callService');

    var call = CallService.call;

    var convertFiltersToServerRequestObject = function (requestParameters) {
        // convert each filter and sorter of requestParams to server acceptable data
        var filters = [];
        _.each(requestParameters, function (state) {
            var sorting = state.requestParams.getSortInfo(),
                sortingColumn = sorting.dataIndex.replaceAll('.', '$');
            var filter = {
                name: state.name,
                entities: [],
                type: state.type,
                share: state.isShared,
                selection_parameters: {
                    sorting_column: sortingColumn,
                    is_asc: sorting.direction === "ASC",
                    // quantity: state.requestParams.getPageSize()
                }
            };

            if (state.id.indexOf('tmp_') === -1) {
                filter['id'] = state.id;
            }

            _.each(state.requestParams.getFilters(), function (criteria) {
                var idSplit = criteria.id.split('.');
                filter.entities.push({
                    value: criteria.value,
                    filtering_field: idSplit[2],
                    condition: idSplit[1],
                    is_negative: (idSplit[1].indexOf('!') === 0)
                });
            });
            filters.push(filter);
        });
        return filters;
    };

    var loadFilterIntoRequestParams = function (requestParams, filter) {
        requestParams.setTab(filter.id);

        var tmp_filters = [];
        _.each(filter.entities, function (entrie) {
            var negative = entrie.is_negative ? "!" : "";
            tmp_filters.push({
                id: 'filter.' + negative + entrie.condition + "." + entrie.filtering_field,
                value: entrie.value
            });
        });
        tmp_filters.length && requestParams.setFilters(tmp_filters);

        requestParams.setPage(filter.selection_parameters.page_number || 1);
        requestParams.setPageSize(filter.selection_parameters.quantity || 50);
        var direction = filter.selection_parameters.is_asc ? "ASC" : "DESC";
        requestParams.setSortInfo(filter.selection_parameters.sorting_column, direction);
    };

    var getFilters = function (ids) {
        return call('GET', Urls.getFilters(ids)).then(function (response) {

            // convert data to filters + sorting objects on requestParams because server side params are not directly applicable on UI

            _.each(response, function (tab) {
                var requestParams = new Commponents.RequestParameters();
                loadFilterIntoRequestParams(requestParams, tab);
                tab['requestParams'] = requestParams;
                tab['url'] = Urls.tabUrl(requestParams.toURLSting());
            });
            return response;
        });
    };

    var saveFilters = function (requestParameters) {
        return call('POST', Urls.saveFilter(), {elements: convertFiltersToServerRequestObject(requestParameters)});
    };

    var updateFilters = function (filters) {
        return call('PUT', Urls.saveFilter(), {elements: convertFiltersToServerRequestObject(filters)});
    };

    var updateTabsPreferences = function (data) {
        return call('PUT', Urls.getPreferences(), data);
    };

    var deleteFilter = function (id) {
        return call('DELETE', Urls.filterById(id));
    };

    var shareFilter = function (id, shared) {
        return call('PUT', Urls.filterById(id), {share: shared});
    };

    var updateFilter = function (id, name) {
        return call('PUT', Urls.filterById(id), {name: name});
    };

    return {
        getFilters: getFilters,
        saveFilters: saveFilters,
        updateFilters: updateFilters,
        updateTabsPreferences: updateTabsPreferences,
        loadFilterIntoRequestParams: loadFilterIntoRequestParams,

        deleteFilter: deleteFilter,
        shareFilter: shareFilter,
        updateFilter: updateFilter
    }
});
