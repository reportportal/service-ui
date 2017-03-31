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

    var Backbone = require('backbone');
    var $ = require('jquery');
    var _ = require('underscore');

    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var FilterModel = require('filters/FilterModel');

    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var SingletonUserStorage = require('storage/SingletonUserStorage');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var call = CallService.call;


    /*  TRIGGERS:
    *   loading(true or false) - start or end loading
    *   change:paging(pagingObj) - change paging object
    *
    * */

    var LaunchSuiteStepItemCollection = Backbone.Collection.extend({
        model: LaunchSuiteStepItemModel,

        initialize: function (options) {
            // this.appendData = lastModelCrumbs.toJSON();
            // this.level = lastModelCrumbs.get('level');
            this.listenTo(this, 'remove', this.onRemove);
            this.userStorage = new SingletonUserStorage();
            this.pagingPage = 1;
            this.pagingTotalPages = 1;
            this.pagingSize = this.userStorage.get('launchPageSize') || 50;
            this.noChildFilter = false;
            this.context = options.context;
        },
        update: function(launchModel, parentModel, optionsURL) {
            this.pagingPage = 1;
            this.pagingTotalPages = 1;
            var async = $.Deferred();
            this.launchModel = launchModel;
            this.parentModel = parentModel;
            var optionsURL = optionsURL || '';
            var filterData = this.calculateFilterOptions(optionsURL); // set this.logOptions
            var self = this;
            if(!launchModel && !parentModel) {
                var launchFilters = new SingletonLaunchFilterCollection();
                launchFilters.ready.done(function() {
                    var activeFilter = launchFilters.where({active: true})[0];
                    if(!activeFilter) {
                        activeFilter = new FilterModel({temp: true, id: 'all'});
                    }
                    self.setSelfModels(activeFilter)
                        .done(function() {
                            async.resolve(activeFilter);
                        })
                        .fail(function() {
                            async.reject(activeFilter);
                        })
                })
            } else {
                filterData.temp = true;
                var activeFilter = new FilterModel(filterData);

                if(!filterData.selection_parameters){
                    activeFilter.set('selection_parameters', '{"is_asc": true, "sorting_column": "start_time"}');
                }
                if(parentModel && !parentModel.get('has_childs')){
                    self.reset([{type: 'LOG'}]);
                    async.resolve(activeFilter);
                }else {
                    self.setSelfModels(activeFilter)
                        .done(function() {
                            async.resolve(activeFilter);
                        })
                        .fail(function() {
                            async.reject(activeFilter);
                        })
                }
            }
            return async.promise();
        },
        restorePath: function() {
            _.each(this.models, function(model) {
                model.restorePath();
            })
        },
        getPathByLogItemId: function(logItemId) {
            var options = this.getParamsFilter();
            options.push('log.item=' + logItemId);
            this.logOptions.history && options.push('log.history=' + this.logOptions.history);
            var mainHash = window.location.hash.split('?')[0];
            return mainHash + '?' + options.join('&');
        },
        setPaging: function(curPage, size) {
            this.pagingPage = curPage;
            this.pagingTotalPages = curPage;
            if(size) {
                this.pagingSize = size;
                this.userStorage.set('launchPageSize', size);
            }
            this.activateChangeParamsTrigger();
            this.load();
        },
        setLogItem: function(logItemId, silent) {
            if(!this.get(logItemId)) {
                console.log('log item not found');
                return;
            }
            this.logOptions = {item: logItemId, history: logItemId}; // reset log settings
            !silent && this.trigger('change:log:item', logItemId);
        },
        setSelfModels: function(filterModel) {
            this.stopListening(this.filterModel);

            this.filterModel = filterModel;
            this.listenTo(this.filterModel, 'change:newEntities', this.changeFilterOptions);
            this.listenTo(this.filterModel, 'change:newSelectionParameters', this.changeSelectionParameters);
            this.activateChangeParamsTrigger();
            return this.load();
        },
        activateLogsItem: function(itemId) {
            var parentItemModel = this.get(itemId);
            if(parentItemModel) {
                this.trigger('activate:log', parentItemModel);
            }
        },
        calculateFilterOptions: function(optionsUrl) {
            var options = optionsUrl.split('&');
            var filterEntities = [];
            this.noChildFilter = false;
            var answer = {};
            this.logOptions = {};
            this.historyOptions = {};
            _.each(options, function(option) {
                var optionSeparate = option.split('=');
                var keySeparate = optionSeparate[0].split('.');
                var keyFirstPart = keySeparate[0];
                if(keyFirstPart == 'filter') {
                    if(optionSeparate[0] == 'filter.eq.has_childs') {
                        this.noChildFilter = true;
                    }
                    filterEntities.push({
                        condition: keySeparate[1],
                        filtering_field: keySeparate[2],
                        value: decodeURIComponent(optionSeparate[1]),
                    });


                }
                if(keyFirstPart == 'page') {
                    if(keySeparate[1] == 'page') {
                        this.pagingPage = parseInt(optionSeparate[1]);
                    } else if (keySeparate[1] == 'size') {
                        this.pagingSize = parseInt(optionSeparate[1]);
                    } else if(keySeparate[1] == 'sort') {
                        var valueSeparate = optionSeparate[1].split('%2C');
                        answer.selection_parameters = JSON.stringify({
                            sorting_column: valueSeparate[0],
                            is_asc: (valueSeparate[1] == 'ASC'),
                        });
                    }
                }
                keySeparate.shift();
                var joinKey = keySeparate.join('.');
                if(keyFirstPart == 'log') {
                    this.logOptions[joinKey] = optionSeparate[1];
                }
                if(keyFirstPart == 'history') {
                    this.historyOptions[joinKey] = optionSeparate[1];
                }
            }, this);
            answer.entities = JSON.stringify(filterEntities);
            return answer;
        },
        changeSelectionParameters: function() {
            this.load();
            this.activateChangeParamsTrigger();
        },
        changeFilterOptions: function(model, value) {
            if(value != '' || !model.changed.entities) {
                this.pagingPage = 1;
                this.load();
            }
            this.activateChangeParamsTrigger();
        },
        getInfoByCollection: function() {
            var async = $.Deferred();
            var self = this;
            this.checkType()
                .done(function(type) {
                    async.resolve({
                        filterModel: self.filterModel,
                        parentModel: self.parentModel,
                        launchModel: self.launchModel,
                        type: type,
                    })
                })
            return async;
        },
        getInfoLog: function() {
            return this.logOptions;
        },
        setInfoLog: function(options) {
            this.logOptions = options;
        },
        checkType: function(models) {
            var models = models || this.toJSON();
            var async = $.Deferred();
            var self = this;
            if(this.logOptions.item){
                async.resolve('LOG');
                return async;
            }
            if(this.historyOptions.item){
                async.resolve('HISTORY');
                return async;
            }
            var types = {};
            _.each(models, function(model) {
                types[model.type] = true;
            });
            var typesMas = _.keys(types);
            if(typesMas.length == 0) {
                if(!this.launchModel) {
                    async.resolve('LAUNCH');
                } else if (this.noChildFilter) {
                    async.resolve('STEP');
                } else if(this.launchModel && !this.parentModel) {
                    async.resolve('SUITE');
                } else {
                    this.loadSuiteStepChildren()
                        .done(function(responce) {
                            if(responce.content.length) {
                                self.checkType(responce.content)
                                    .done(function(type) {
                                        async.resolve(type);
                                    })
                            } else {
                                async.resolve('STEP');
                            }
                        })
                }
            } else {
                if(typesMas.length == 1) {
                    async.resolve(typesMas[0] || 'LAUNCH');
                } else {
                    var levelPriority = ['SUITE', 'STORY', 'TEST', 'SCENARIO', 'STEP', 'BEFORE_CLASS', 'BEFORE_GROUPS', 'BEFORE_METHOD', 'BEFORE_SUITE', 'BEFORE_TEST', 'AFTER_CLASS', 'AFTER_GROUPS', 'AFTER_METHOD', 'AFTER_SUITE', 'AFTER_TEST'];
                    async.resolve(typesMas[0]);
                }
            }
            return async;
        },
        getParamsFilter: function(onlyPage) {
            var params = [];
            params.push('page.page=' + this.pagingPage);
            params.push('page.size=' + this.pagingSize);
            if(onlyPage) {
                return params;
            }
            params = params.concat(this.filterModel.getOptions());
            return params;
        },
        activateChangeParamsTrigger: function() {
            if (!this.historyOptions.item && !this.logOptions.item) {
                if(!this.launchModel) {
                    this.trigger('change:params', this.getParamsFilter(true).join('&'));
                }
                var params = this.getParamsFilter();
                if(this.launchModel) {
                    var logParams = [];
                    _.each(this.logOptions, function(value, key) {
                        logParams.push('log.' + key + '=' + value);
                    });
                    logParams = logParams.concat(params);
                    this.trigger('change:params', logParams.join('&'));
                }
            }
        },
        load: function(dynamicPge) {  // double load page if content = []
            var self = this;
            var path = Urls.getGridUrl('launch', (this.context == 'userdebug'));
            var params = this.getParamsFilter();
            if(this.launchModel) {
                path = Urls.getGridUrl('suit');
                !this.launchModel.get('failLoad') && params.push('filter.eq.launch=' + this.launchModel.get('id'));
                if(this.parentModel) {
                    this.noChildFilter && params.push('filter.in.path=' + this.parentModel.get('id'));
                    !this.noChildFilter && params.push('filter.eq.parent=' + this.parentModel.get('id'));
                } else {
                    !this.noChildFilter && params.push('filter.size.path=0');
                }
            }
            if(params && params.length) {
                path += '?' + params.join('&');
            }
            this.request && this.request.abort();

            this.trigger('loading', true);
            this.reset([]);
            var async = $.Deferred();
            this.request = call('GET', path)
                .done(function(data) {
                    if(!data.content.length && dynamicPge && data.page.totalPages != 0) {
                        self.setPaging(data.page.totalPages);
                        return false;
                    }
                    self.pagingData = data.page;
                    self.parse(data);
                    self.afterLoadActions();
                    async.resolve(data);
                })
                .fail(function(err, type) {
                    if (type == 'abort') {
                        async.resolve();
                    } else {
                        async.reject();
                    }
                    self.afterLoadActions();
                });
            return async;
        },
        afterLoadActions: function() {
            if(this.logOptions && this.logOptions.item) {
                this.trigger('set:log:item', this.logOptions.item);
            }
            this.trigger('loading', false);
        },
        loadSuiteStepChildren: function() {  // only for check type
            var path = Urls.getGridUrl('suit') + '?filter.eq.launch=' + this.launchModel.get('id') +
                    '&filter.eq.parent=' + this.parentModel.get('id');
            return call('GET', path)
        },
        onRemove: function() {
            this.load(this.lastParams);
        },
        validateForAllCases: function(){
            var entities = this.filterModel.getEntitiesObj(),
                allCasesEntity = _.find(entities, function(entity){
                    return entity.filtering_field == 'has_childs';
                });
            return !!allCasesEntity;
        },
        parse: function (response) {
            var self = this;
            _.each(response.content, function(modelData) {
                modelData.issue && (modelData.issue = JSON.stringify(modelData.issue));
                modelData.tags && (modelData.tags = JSON.stringify(modelData.tags));
                if (self.launchModel) {
                    modelData.parent_launch_owner = self.launchModel.get('owner');
                    modelData.parent_launch_status = self.launchModel.get('status');
                    modelData.parent_launch_isProcessing = self.launchModel.get('isProcessing');
                    modelData.parent_launch_number = self.launchModel.get('number');
                    modelData.parent_launch_investigate = self.launchModel.getToInvestigate();
                }
                else {
                    _.each(response.content, function(modelData) {
                        modelData.type = 'LAUNCH';
                    });
                }
            });
            if(this.validateForAllCases()){
                var sortedByParents = _(response.content).chain().sortBy(function (test) {
                    var keys = _.keys(test.path_names);
                    return test.path_names[keys[1]];
                }).sortBy(function (test) {
                    var keys = _.keys(test.path_names);
                    return test.path_names[keys[0]];
                }).value();
                this.reset(response.content);
            }
            else {
                this.reset(response.content);
            }
            // this.reset([{
            //         description: "dashboard_tests",
            //         end_time: 1472205024785,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "IN_PROGRESS",
            //         owner: 'Алешка',
            //     },
            //     {
            //         description: "dashboard_tests",
            //         end_time: null,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "IN_PROGRESS",
            //         tags: ['вот_это_тег', 'test-teg', 'second-test-teg14'],
            //     },
            //     {
            //         description: "dashboard_tests",
            //         end_time: 1472205024785,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "SKIPPED",
            //         owner: 'Superman',
            //         tags: ['trerty', 'mifril', 'green_stone'],
            //     },
            //     {
            //         description: "dashboard_tests",
            //         end_time: null,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "FAILED",
            //     },
            //     {
            //         description: "dashboard_tests",
            //         end_time: 1472205024785,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "STOPPED",
            //     },
            //     {
            //         description: "dashboard_tests",
            //         end_time: 1472205024785,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "INTERRUPTED",
            //     },
            //     {
            //         description: "dashboard_tests",
            //         end_time: 1472205024785,
            //         has_childs: true,
            //         launchId: "57c00fc79194be0001739df5",
            //         name: "dashboard_tests",
            //         path_names: {},
            //         start_time: 1472205000619,
            //         status: "FAILED",
            //     }
            // ])
        }
    });

    return LaunchSuiteStepItemCollection;
});
