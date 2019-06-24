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

    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var Localization = require('localization');
    var Moment = require('moment');
    var App = require('app');
    var FilterListener = require('controlers/filterControler/FilterListener');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var FilterEntities = require('filterEntities/FilterEntities');

    var FilterModel = Epoxy.Model.extend({
        defaults: {
            name: '',
            description: '',
            entities: '',
            selection_parameters: '{"is_asc": false, "sorting_column": "start_time,number"}',
            owner: '',
            share: '',
            id: '',
            type: 'launch',

            newEntities: '',
            newSelectionParameters: '',
            curPage: 1,
            isLaunch: false,
            active: false,
            url: '',
            temp: false,
            load: false
        },
        computeds: {
            optionsString: {
                deps: ['entities', 'selection_parameters'],
                get: function (entities, selection_params) {
                    var selectionParameters = this.getParametersObj();
                    var result = '(' + this.getFilterOptions(this.getEntitiesObj(), Localization.comparators) + ')';
                    var sortKey = selectionParameters && this.getLastKey(selectionParameters.sorting_column);

                    if (sortKey) {
                        result += Localization.favorites.sortedBy + ' ' + Localization.launchesHeaders[sortKey.split(',')[0]];
                    }

                    return result;
                }
            },
            notMyFilter: {
                deps: ['owner'],
                get: function (owner) {
                    return owner !== config.userModel.get('name');
                }
            },
            sharedByTitle: {
                deps: ['owner'],
                get: function (owner) {
                    return Localization.filters.sharedBy + ' ' + owner;
                }
            },
            isAskSorting: {
                deps: ['selection_parameters', 'newSelectionParameters'],
                get: function () {
                    var params = this.getParametersObj();
                    return params.is_asc;
                }
            },
            sortingColumn: {
                deps: ['selection_parameters', 'newSelectionParameters'],
                get: function () {
                    var params = this.getParametersObj();
                    return params.sorting_column;
                }
            },
            isLaunchString: {
                deps: ['isLaunch'],
                get: function (showOnLaunches) {
                    if (showOnLaunches) {
                        return Localization.ui.on;
                    }
                    return Localization.ui.off;
                }
            }
        },

        initialize: function (options) {
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.context = (options && options.context) || '';
            if (this.context === 'projectEvents') {
                this.set('selection_parameters', '{"is_asc": false, "sorting_column": "last_modified"}');
            }
            this.listenTo(this, 'change:id', this.computedsUrl);
            this.listenTo(appModel, 'change:projectId', this.computedsUrl.bind(this));
            this.listenTo(this, 'change:temp', this.onChangeTemp);
            this.computedsUrl();
            this.listenTo(this.filterListener, this.filterEvents.FILTER_LOAD_START, this.onLoadStartFilter);
            this.listenTo(this.filterListener, this.filterEvents.FILTER_LOAD_END, this.onLoadEndFilter);
            this.listenTo(this.filterListener, this.filterEvents.SET_FILTER, this.onSetFilter);
            this.listenTo(this.filterListener, this.filterEvents.ADD_FILTER, this.onAddFilter);
        },

        getLastKey: function (keyArray) {
            if (keyArray) {
                keyArray = keyArray.split('$');
                return keyArray.length > 1 ? keyArray[keyArray.length - 1] : keyArray[0];
            }
        },

        getFilterOptions: function (entities, text) {
            var self = this;

            if (!entities || !entities.length) {
                return '';
            }

            if (entities) {
                var mapped = _.map(entities, function (item) {
                    if (item.filtering_field === 'start_time' /* && item.value.split(',').length === 1*/) {
                        item.value = (new FilterEntities.EntityTimeRangeModel(item).getInfo().value);
                        if (~item.value.indexOf(',') || ~item.value.indexOf(';')) {
                            item.condition = '';
                        } else {
                            item.condition = 'eq';
                        }
                    }
                    var filterName = self.getSmartKey(item.filtering_field);
                    if (!filterName) {
                        return '<span style="color: #ff3222"><b>Invalid</b></span>';
                    }
                    if (item.value === '') {
                        return '';
                    }
                    return [filterName, ' ',
                        item.is_negative ? text.not : '',
                        text[item.condition] || '', ' ',
                        (item.filtering_field === 'tags') ? item.value : self.clearValue(item.value)].join('');
                }, {});
                return mapped.join(text.andb);
            }
        },

        clearValue: function (field) {
            var result = field;
            var time = result.split(',');
            var timeDynamic = result.split(';');
            var curTime;
            if (time.length === 2) {
                result = this.getTimeString(time[0], time[1]);
            } else if (timeDynamic.length === 3) {
                curTime = Moment().startOf('day').unix() * 1000;
                result = this.getTimeString(curTime + (parseInt(timeDynamic[0], 10) * 60000), curTime + (parseInt(timeDynamic[1], 10) * 60000)) + ' (dynamic)';
            }
            return result.escapeHtml();
        },

        getTimeString: function (startTime, endTime) {
            var result = '';
            var hum = config.dateRangeFullFormat;
            var from = Moment(parseInt(startTime, 10));
            var to = Moment(parseInt(endTime, 10));

            if (from.isValid() && to.isValid()) {
                result = Localization.ui.from + ' ' + from.format(hum) + ' ' + Localization.ui.to + ' ' + to.format(hum);
            }
            return result;
        },

        getSmartKey: function (string) {
            var defectTypeCollection = new SingletonDefectTypeCollection();
            var splitKey = string.split('$');
            var locator = splitKey.pop();
            var type = splitKey.shift();
            var defectTypeTotal = splitKey.pop();
            var defectType = defectTypeCollection.findWhere({ locator: locator });

            if (!string) {
                return '';
            }
            if (Localization.filterNameById[string]) {
                if (type === 'statistics') {
                    var searchDefectTypes = defectTypeCollection.where({ typeRef: defectTypeTotal.toUpperCase() });
                    if (searchDefectTypes.length === 1) {
                        return searchDefectTypes[0].get('longName');
                    }
                    return Localization.filterNameById[string];
                }
                return Localization.filterNameById[string];
            }
            if (defectType) {
                return defectType.get('longName');
            }
            var firstPartKey = type + '$' + splitKey[0] + '$' + defectTypeTotal;
            if (!Localization.filterNameById[firstPartKey]) {
                return false;
            }
            return locator.capitalizeName();
        },

        getEntitiesObj: function () {
            try {
                if (this.get('newEntities')) {
                    return JSON.parse(this.get('newEntities'));
                }
                return JSON.parse(this.get('entities'));
            } catch (err) {
                return [];
            }
        },
        getParametersObj: function () {
            var data;
            try {
                if (this.get('newSelectionParameters')) {
                    data = JSON.parse(this.get('newSelectionParameters'));
                    if (data.orders) {
                        data.is_asc = data.orders[0].is_asc;
                        data.sorting_column = _.map(data.orders, function (order) {
                            return order.sorting_column;
                        }).join(',');
                        delete data.orders;
                    }
                    return data;
                }
                data = JSON.parse(this.get('selection_parameters'));
                if (data.orders) {
                    data.is_asc = data.orders[0].is_asc;
                    data.sorting_column = _.map(data.orders, function (order) {
                        return order.sorting_column;
                    }).join(',');
                    delete data.orders;
                }
                return data;
            } catch (err) {
                return {};
            }
        },
        getOptions: function () {
            var data = [];
            var selectionParameters = this.getParametersObj();
            var sortDirection = 'ASC';
            _.each(this.getEntitiesObj(), function (entity) {
                if (entity.value) {
                    data.push('filter.' + entity.condition + '.' + entity.filtering_field +
                        '=' + encodeURIComponent(entity.value));
                }
            });
            if (!selectionParameters.is_asc) {
                sortDirection = 'DESC';
            }
            data.push('page.sort=' + selectionParameters.sorting_column + '%2C' + sortDirection);
            return data;
        },
        computedsUrl: function () {
            var contextUrlPart = (this.context === 'userdebug') ? '/userdebug/' : '/launches/';
            this.set({ url: '#' + appModel.get('projectId') + contextUrlPart + this.get('id') });
        },
        // onChangeFilterInfo: function () {
        //     if (!this.get('temp')) {
        //         call('PUT', urls.filterById(this.get('id')), this.getDataFromServer())
        //             .done(function () {
        //                 Util.ajaxSuccessMessenger('editFilter');
        //             })
        //             .fail(function (error) {
        //                 Util.ajaxFailMessenger(error, 'editFilter');
        //             });
        //     }
        // },
        getDataFromServer: function (changes) {
            var cloneModel = this.clone();
            var entities;
            var params;
            var result;
            var orders = [];
            changes && cloneModel.set(changes);
            entities = cloneModel.getEntitiesObj();
            params = cloneModel.getParametersObj();
            if (!entities.length) {
                entities.push({
                    condition: 'cnt',
                    filtering_field: 'name',
                    value: ''
                });
            }
            _.each(params.sorting_column.split(','), function (sortColumn) {
                orders.push({
                    is_asc: params.is_asc,
                    sorting_column: sortColumn
                });
            });
            result = {
                name: cloneModel.get('name'),
                entities: entities,
                share: cloneModel.get('share'),
                selection_parameters: {
                    orders: orders,
                    page_number: params.page_number
                },
                type: cloneModel.get('type')
            };
            if (cloneModel.get('description')) {
                result.description = cloneModel.get('description');
            }
            cloneModel.destroy();
            return result;
        },
        // editMainInfo: function () {
        //     var self = this;
        //     this.showPopupMyInfo(function (dataModel) {
        //         self.set({
        //             name: dataModel.get('name'),
        //             isShared: dataModel.get('isShared'),
        //             description: dataModel.get('description')
        //         });
        //     }, 'update');
        // },
        // onChangeTemp: function (model, temp) {
        //     var self = this;
        //     var data;
        //     if (temp || this.collection) {
        //         return;
        //     }
        //     data = model.getDataFromServer();
        //     data.type = 'launch';
        //     call('POST', Urls.saveFilter(), { elements: [data] })
        //         .done(function (response) {
        //             Util.ajaxSuccessMessenger('savedFilter');
        //             self.set({ id: response[0].id });
        //         })
        //         .fail(function (error) {
        //             Util.ajaxFailMessenger(error, 'savedFilter');
        //         });
        // },
        // saveFilter: function () {
        //     var self = this;
        //     if (this.get('temp')) {
        //         this.showPopupMyInfo(function (dataModel) {
        //             self.set({
        //                 name: dataModel.get('name'),
        //                 isShared: dataModel.get('isShared'),
        //                 description: dataModel.get('description'),
        //                 entities: self.get('newEntities') || self.get('entities'),
        //                 newEntities: '',
        //                 selection_parameters: self.get('newSelectionParameters') || self.get('selection_parameters'),
        //                 newSelectionParameters: ''
        //             });
        //             // for right work listeners
        //             self.set({ temp: false });
        //         }, 'save');
        //     } else {
        //         this.set({
        //             entities: this.get('newEntities') || this.get('entities'),
        //             newEntities: '',
        //             selection_parameters: this.get('newSelectionParameters') || this.get('selection_parameters'),
        //             newSelectionParameters: ''
        //         });
        //     }
        // },
        // showPopupMyInfo: function (callback, mode) {
        //     var modal = new ModalFilterEdit({
        //         mode: mode,
        //         filterModel: this
        //     });
        //     modal.show()
        //         .done(function (dataModel) {
        //             callback(dataModel);
        //         });
        // },
        // load: function () {
        //     var self = this;
        //     return call('GET', Urls.getFilters([this.get('id')]))
        //         .done(function (data) {
        //             var itemData;
        //             if (data.length) {
        //                 itemData = data[0];
        //                 itemData.entities = JSON.stringify(itemData.entities);
        //                 itemData.selection_parameters = JSON.stringify(itemData.selection_parameters);
        //                 self.set(itemData);
        //             }
        //         });
        // },

        // remove: function () {
        //     console.log('old method remove model');
        // },
        parseServerData: function (data) {
            this.set({
                name: data.name,
                description: data.description || '',
                entities: JSON.stringify(data.entities),
                share: data.share,
                selection_parameters: JSON.stringify(data.selection_parameters),
                owner: data.owner || this.get('owner'),
                type: data.type,

                newEntities: '',
                newSelectionParameters: ''
            });
        },
        onAddFilter: function (options) {
            if (this.cid === options.cid) {
                this.parseServerData(options.data);
                this.set({
                    id: options.id
                });
            }
        },
        onSetFilter: function (options) {
            if (this.get('id') === options.id) {
                this.parseServerData(options.data);
            }
        },
        onLoadStartFilter: function (id) {
            if (id === this.get('id')) {
                this.set({ load: true });
            }
        },
        onLoadEndFilter: function (id) {
            if (id === this.get('id')) {
                this.set({ load: false });
            }
        }
    });

    return FilterModel;
});
