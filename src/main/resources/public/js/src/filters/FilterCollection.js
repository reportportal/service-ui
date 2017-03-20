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

    var Backbone = require('backbone');
    var _ = require('underscore');
    var FilterModel = require('filters/FilterModel');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');


    var FilterCollection = Backbone.Collection.extend({
        model: FilterModel,
        initialize: function() {
            this.launchFilterCollection = new SingletonLaunchFilterCollection();
            this.listenTo(this, 'change:isLaunch', this.onChangeIsLaunch);
        },
        onChangeIsLaunch: function(model, isLaunch) {
            if(isLaunch) {
                model.collection = this.launchFilterCollection;
                this.launchFilterCollection.add(model);
                return;
            }
            this.launchFilterCollection.remove(model);
        },
        parse: function(data) {
            var self = this;
            this.launchFilterCollection.ready.done(function() {
                self.reset(_.map(data, function(itemData) {
                    var launchModelClone = self.launchFilterCollection.where({id: itemData.id})[0];
                    if(launchModelClone) {
                        return launchModelClone;
                    }
                    itemData.entities = JSON.stringify(itemData.entities);
                    itemData.selection_parameters = JSON.stringify(itemData.selection_parameters);
                    return itemData;
                }))
            });
        },
    });

    return FilterCollection;
})
