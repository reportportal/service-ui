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
define(function(require, exports, module) {
    'use strict';

    var Epoxy = require('backbone-epoxy');
    var CallService = require('callService');
    var urls = require('dataUrlResolver');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Helpers = require('helpers');
    var Localization = require('localization');
    var Util = require('util');
    var Components = require('core/components');
    var ModalFilterEdit = require('modals/modalFilterEdit');
    var App = require('app');
    var Urls = require('dataUrlResolver');

    var config = App.getInstance();
    var call = CallService.call;
    var appModel = new SingletonAppModel();


    var FilterModel = Epoxy.Model.extend({
        defaults: {
            name: '',
            description: '',
            entities: '',
            selection_parameters: '{"is_asc": false, "sorting_column": "start_time"}',
            owner: '',
            isShared: '',
            id: '',
            type: 'launch',

            newEntities: '',
            newSelectionParameters: '',
            curPage: 1,
            isLaunch: false,
            active: false,
            url: '',
            temp: false,
        },
        computeds: {
            optionsString: {
                deps: ['entities', 'selection_parameters'],
                get: function(entities, selection_params) {
                    var selection_parameters = this.getParametersObj();
                    var result = '(' + Helpers.getFilterOptions(this.getEntitiesObj(), Localization.comparators) + ')';
                    var sortKey = selection_parameters &&  Helpers.getLastKey(selection_parameters.sorting_column);
                    if(sortKey) {
                        result += Localization.favorites.sortedBy + ' ' + Localization.launchesHeaders[sortKey];
                    }
                    return result;
                }
            },
            notMyFilter: {
                deps: ['owner'],
                get:function(owner) {
                    return owner != config.userModel.get('name');
                }
            },
            sharedByTitle: {
                deps: ['owner'],
                get: function(owner) {
                    return Localization.filters.sharedBy + ' ' + owner;
                }
            },
            isAskSorting: {
                deps: ['selection_parameters', 'newSelectionParameters'],
                get: function() {
                    var params = this.getParametersObj();
                    return params.is_asc;
                }
            },
            sortingColumn: {
                deps: ['selection_parameters', 'newSelectionParameters'],
                get: function() {
                    var params = this.getParametersObj();
                    return params.sorting_column;
                }
            },
            isLaunchString: {
                deps: ['isLaunch'],
                get: function(showOnLaunches){
                    if(showOnLaunches) {
                        return Localization.ui.on;
                    }
                    return Localization.ui.off;
                }
            },
        },

        initialize: function(options) {
            this.context = options.context;
            this.listenTo(this, 'change:name change:isShared change:description change:entities change:selection_parameters', this.onChangeFilterInfo);
            this.listenTo(this, 'change:id', this.computedsUrl);
            this.listenTo(appModel, 'change:projectId', this.computedsUrl.bind(this));
            this.listenTo(this, 'change:temp', this.onChangeTemp);
            this.computedsUrl();
        },
        getEntitiesObj: function() {
            try {
                if(this.get('newEntities')) {
                    return JSON.parse(this.get('newEntities'));
                }
                return JSON.parse(this.get('entities'));
            } catch(err) {
                return [];
            }
        },
        getParametersObj: function() {
            try {
                if(this.get('newSelectionParameters')) {
                    var data = JSON.parse(this.get('newSelectionParameters'));
                    return data;
                }
                var data = JSON.parse(this.get('selection_parameters'));
                return data;
            } catch(err) {
                return {};
            }
        },
        getOptions: function() {
            var data = [];
            _.each(this.getEntitiesObj(), function(entity){
                if(entity.value) {
                    data.push('filter.' + entity.condition + '.' + entity.filtering_field +
                        '=' + encodeURIComponent(entity.value));
                }
            });
            var selectionParameters = this.getParametersObj();
            var sortDirection = 'ASC';
            if (!selectionParameters.is_asc) {
                sortDirection = 'DESC';
            }
            data.push('page.sort=' + selectionParameters.sorting_column + '%2C' + sortDirection);
            return data;
        },
        computedsUrl: function() {
            var contextUrlPart = (this.context == 'userdebug') ? '/userdebug/' : '/launches/';
            this.set({url: '#' + appModel.get('projectId') + contextUrlPart + this.get('id')});
        },
        onChangeFilterInfo: function() {
            if(!this.get('temp')) {
                call('PUT', urls.filterById(this.get('id')), this.getDataFromServer())
                    .done(function() {
                        Util.ajaxSuccessMessenger("editFilter");
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "editFilter");

                    })
            }
        },
        getDataFromServer: function() {
            var entities = this.getEntitiesObj();
            if(!entities.length) {
                entities.push({
                    condition: 'cnt',
                    filtering_field: 'name',
                    value: '',
                })
            }
            return {
                name: this.get('name'),
                description: this.get('description') || null,
                entities: entities,
                share: this.get('isShared'),
                selection_parameters: this.getParametersObj(),
                type: this.get('type'),
            }
        },
        editMainInfo: function() {
            var self = this;
            this.showPopupMyInfo(function (dataModel) {
                self.set({
                    name: dataModel.get('name'),
                    isShared: dataModel.get('isShared'),
                    description: dataModel.get('description'),
                });
            }, 'update')
        },
        onChangeTemp: function(model, temp) {
            if(temp || this.collection) {
                return;
            }
            var data = model.getDataFromServer();
            data.type = 'launch';
            var self = this;
            call('POST', Urls.saveFilter(), {elements: [data]})
                .done(function(data) {
                    Util.ajaxSuccessMessenger('savedFilter');
                    self.set({id: data[0].id});
                })
                .fail(function(error) {
                    Util.ajaxFailMessenger(error, 'savedFilter');
                })
        },
        saveFilter: function() {
            var self = this;
            if (this.get('temp')) {
                this.showPopupMyInfo(function (dataModel) {
                    self.set({
                        name: dataModel.get('name'),
                        isShared: dataModel.get('isShared'),
                        description: dataModel.get('description'),
                        entities: self.get('newEntities') || self.get('entities'),
                        newEntities: '',
                        selection_parameters: self.get('newSelectionParameters') || self.get('selection_parameters'),
                        newSelectionParameters: '',
                    });
                    // for right work listeners
                    self.set({temp: false});
                }, 'save')
           } else {
                 this.set({
                     entities: this.get('newEntities') || this.get('entities'),
                     newEntities: '',
                     selection_parameters: this.get('newSelectionParameters') || this.get('selection_parameters'),
                     newSelectionParameters: '',
                 })
            }
        },
        showPopupMyInfo: function(callback, mode) {
            var modal = new ModalFilterEdit({
                mode: mode,
                filterModel: this,
            });
            modal.show()
                .done(function(dataModel) {
                    callback(dataModel)
                });
        },
        load: function() {
            var self = this;
            return call('GET', Urls.getFilters([this.get('id')]))
                .done(function(data) {
                    var itemData = data[0];
                    itemData.entities = JSON.stringify(itemData.entities);
                    itemData.selection_parameters = JSON.stringify(itemData.selection_parameters);
                    self.set(itemData);
                })
        },

        remove: function() {
            var self = this;
            return call('DELETE', urls.filterById(this.get('id')))
                .done(function() {
                    Util.ajaxSuccessMessenger("deleteFilter");
                    if(self.collection) {
                        self.collection.remove(self);
                    }
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "editFilter");
                })
        }
    });

    return FilterModel;
})
