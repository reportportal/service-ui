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

    var Backbone = require('backbone');
    var FilterModel = require('filters/FilterModel');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var $ = require('jquery');
    var _ = require('underscore');
    var App = require('app');
    var Util = require('util');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var FilterListener = require('controlers/filterControler/FilterListener');

    var config = App.getInstance();
    var call = CallService.call;


    var LaunchFilterCollection = Backbone.Collection.extend({
        model: FilterModel,
        initialize: function () {
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            // this.listenTo(this, 'add', this.onAddFilter);
            // this.listenTo(this, 'change:temp', this.onChangeTemp);
            this.listenTo(this.filterListener, this.filterEvents.REMOVE_FILTER, this.onRemoveFilter);
            this.listenTo(this.filterListener, this.filterEvents.CHANGE_IS_LAUNCH, this.onChangeIsLaunch);
            this.ready = $.Deferred();
        },
        onChangeIsLaunch: function (options) {
            var id = options.data.id;
            if (options.isLaunch) {
                if (!this.get(id)) {
                    this.add(options.data);
                } else {
                    this.get(id).set({ temp: false });
                }
            } else {
                this.remove(id);
            }
            call('PUT', Urls.getPreferences(), { filters: this.getFiltersId() })
                .done(function () {
                    Util.ajaxSuccessMessenger('savedLaunchFilter');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'savedLaunchFilter');
                });
        },
        onRemoveFilter: function (id) {
            var model = this.get(id);
            if (model) {
                this.remove(model);
                if (!model.get('temp') && model.get('owner')) {
                    call('PUT', Urls.getPreferences(), { filters: this.getFiltersId() });
                }
            }
        },

        getFiltersId: function () {
            var ids = [];
            _.each(this.models, function (model) {
                if (model.id && !model.get('temp')) {
                    ids.push(model.id);
                }
            });
            return ids;
        },
        // onChangeTemp: function (model, temp) {
        //     var self = this;
        //     if (!temp) {
        //         this.saveFilter(model, function (data) {
        //             model.set({ id: data[0].id });
        //             self.onAddFilter(model);
        //         });
        //     }
        // },
        saveFilter: function (model, callback) {
            var data = model.getDataFromServer();
            data.type = 'launch';
            call('POST', Urls.saveFilter(), { elements: [data] })
                .done(function (data) {
                    callback(data);
                });
        },
        onChangeLaunchFilter: function (model) {
            // console.log('change launch filter');
            // console.dir(model);
        },
        parse: function (ids) {
            var self = this;
            if (!ids) {
                this.reset([]);
                this.ready.resolve();
                return this.ready;
            }
            return this.update(ids)
                .always(function () {
                    self.ready.resolve();
                });
        },
        update: function (ids) {
            var async = $.Deferred();
            var self = this;
            if (!ids) {
                ids = _.map(this.models, function (model) {
                    return model.get('id');
                });
            }
            call('GET', Urls.getFilters(ids))
                .done(function (data) {
                    (new SingletonDefectTypeCollection()).ready.done(function () {
                        self.destroyModels();
                        self.reset(_.map(data, function (item) {
                            item.isLaunch = true;
                            item.type = 'launch';
                            item.entities = JSON.stringify(item.entities);
                            item.selection_parameters = JSON.stringify(item.selection_parameters);
                            return item;
                        }));
                        async.resolve();
                    });
                });
            return async;
        },
        generateTempModel: function (opts) {
            var data = opts || {};
            var startName = 'New_filter';
            var modelName = startName;
            var randomCounter = 1;
            while (this.findWhere({ name: modelName })) {
                modelName = startName + randomCounter;
                randomCounter++;
            }
            data.id = modelName;
            data.name = modelName;
            data.temp = true;
            data.isLaunch = true;
            data.owner = config.userModel.get('name');
            return this.add(data);
        },
        activateFilter: function (filterId) {
            var answer = $.Deferred();
            var self = this;
            this.ready.done(function () {
                _.each(self.models, function (model) {
                    model.set({ active: false });
                });
                var activeModel = self.findWhere({ id: filterId });
                if (activeModel) {
                    activeModel.set({ active: true });
                    answer.resolve(activeModel);
                } else {
                    answer.reject();
                }
                self.trigger('change:activeFilter', activeModel);
            });
            return answer.promise();
        }

    });

    return LaunchFilterCollection;
});
