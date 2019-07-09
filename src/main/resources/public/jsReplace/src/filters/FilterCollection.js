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
    var _ = require('underscore');
    var FilterModel = require('filters/FilterModel');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var FilterListener = require('controlers/filterControler/FilterListener');


    var FilterCollection = Backbone.Collection.extend({
        model: FilterModel,
        initialize: function () {
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.defectTypeCollection = new SingletonDefectTypeCollection();
            this.listenTo(this.filterListener, this.filterEvents.REMOVE_FILTER, this.onRemoveFilter);
        },
        onRemoveFilter: function (id) {
            var model = this.get(id);
            if (model) {
                this.remove(model);
            }
        },
        parse: function (data) {
            var self = this;
            this.launchFilterCollection.ready.done(function () {
                self.defectTypeCollection.ready.done(function () {
                    self.reset(_.map(data, function (itemData) {
                        var modelData = itemData;
                        var launchFilterModel = self.launchFilterCollection.get(itemData.id);
                        if (launchFilterModel) {
                            modelData.isLaunch = true;
                        }
                        modelData.entities = JSON.stringify(itemData.entities);
                        modelData.selection_parameters = JSON.stringify(itemData.selection_parameters);
                        return modelData;
                    }));
                });
            });
        }
    });

    return FilterCollection;
});
