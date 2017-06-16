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

define(function (require) {
    var _ = require('underscore');
    var EventReducer = require('controlers/_eventReducer');
    var CoreService = require('coreService');
    var CallService = require('callService');
    var call = CallService.call;
    var urls = require('dataUrlResolver');
    var Util = require('util');

    var FilterReducer = EventReducer.extend({
        initialize: function (listener) {
            this.listener = listener;
            this.events = this.listener.events;
            this.listenTo(this.listener, this.events.ON_LOAD_FILTERS, this.loadFilters);
            this.listenTo(this.listener, this.events.ON_REMOVE_FILTER, this.removeFilter);
            this.listenTo(this.listener, this.events.ON_SET_FILTER, this.setFilter);
            this.listenTo(this.listener, this.events.ON_ADD_FILTER, this.addFilter);
            this.listenTo(this.listener, this.events.ON_CHANGE_IS_LAUNCH, this.changeIsLaunch);
            this.listenTo(this.listener, this.events.ON_LOAD_FILTER, this.loadFilter);
        },
        loadFilter: function (id) {
            var self = this;
            self.listener.trigger(self.events.FILTER_LOAD_START, id);
            call('GET', urls.getFilters([id]))
                .always(function () {
                    self.listener.trigger(self.events.FILTER_LOAD_END, id);
                })
                .done(function (data) {
                    var itemData = data[0];
                    if (itemData) {
                        self.listener.trigger(self.events.SET_FILTER, {
                            id: id,
                            data: itemData
                        });
                    }
                });
        },
        changeIsLaunch: function (options) {
            this.listener.trigger(this.events.CHANGE_IS_LAUNCH, options);
        },
        addFilter: function (options) {
            var self = this;
            var data = options.data;
            call('POST', urls.saveFilter(), { elements: [options.data] })
                .done(function (response) {
                    Util.ajaxSuccessMessenger('savedFilter');
                    self.listener.trigger(self.events.ADD_FILTER, {
                        cid: options.cid,
                        id: response[0].id,
                        data: options.data
                    });
                    if (options.isLaunch) {
                        data.id = response[0].id;
                        self.listener.trigger(self.events.CHANGE_IS_LAUNCH, {
                            data: data,
                            isLaunch: true
                        });
                    }
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'savedFilter');
                });
        },
        setFilter: function (options) {
            var self = this;
            self.listener.trigger(self.events.FILTER_LOAD_START, options.id);
            call('PUT', urls.filterById(options.id), options.data)
                .always(function () {
                    self.listener.trigger(self.events.FILTER_LOAD_END, options.id);
                })
                .done(function () {
                    Util.ajaxSuccessMessenger('editFilter');
                    self.listener.trigger(self.events.SET_FILTER, {
                        id: options.id,
                        data: options.data
                    });
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'editFilter');
                });
        },
        loadFilters: function (data) {
            var self = this;
            self.listener.trigger(self.events.FILTERS_LOAD_START);
            CoreService.saveFilter(data)
                .always(function () {
                    self.listener.trigger(self.events.FILTERS_LOAD_END);
                })
                .done(function (response) {
                    self.listener.trigger(self.events.LOAD_FILTERS, response);
                });
        },
        removeFilter: function (id) {
            var self = this;
            self.listener.trigger(self.events.FILTER_LOAD_START, id);
            call('DELETE', urls.filterById(id))
                .always(function () {
                    self.listener.trigger(self.events.FILTER_LOAD_END, id);
                })
                .done(function () {
                    Util.ajaxSuccessMessenger('deleteFilter');
                    self.listener.trigger(self.events.REMOVE_FILTER, id);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'editFilter');
                });
        }


    });

    return FilterReducer;
});
