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
    var Service = require('coreService');
    var DefectTypeModel = require('defectType/DefectTypeModel');
    var SingletonAppModel = require('model/SingletonAppModel');
    var App = require('app');

    var config = App.getInstance();

    var DefectTypeCollection = Backbone.Collection.extend({
        model: DefectTypeModel,

        initialize: function () {
            this.Util = require('util');
            this.appModel = new SingletonAppModel();
            this.ready = $.Deferred();
            this.listenTo(this.appModel, 'change:projectId', this.update);
            if (this.appModel.get('projectId')) {
                this.update();
            }
            this.on('add', this.onAdd);
            this.on('remove', this.onRemove);
            this.on('change', this.onChange);
            this.on('resetColors', this.onResetColors);
        },
        update: function () {
            var self = this;
            return Service.getDefectTypes(this.appModel.get('projectId'))
                .done(function (response) {
                    self.reset(self.parse(response));
                    self.ready.resolve();
                })
        },
        getDefectType: function(type){
            var defect = null,
                subTypes = this.toJSON();
            if(!_.isEmpty(subTypes)){
                defect = _.find(subTypes, function(d){ return d.locator === type});
            }
            return defect;
        },
        checkForSubDefects: function(){
            return this.length > 5;
        },
        parse: function (response) {
            var answer = [];
            if (!response.subTypes) {
                return answer;
            }
            for (var type in response.subTypes) {
                _.each(response.subTypes[type], function (value, index) {
                    if (index == 0) {
                        value.mainType = true;
                    }
                    answer.push(value);
                })
            }
            return answer;
        },
        onAdd: function (model) {
            var data = model.toUpdateItem();
            var self = this;
            Service.postDefectTypes(this.appModel.get('projectId'), data)
                .done(function (response) {
                    var action = data.typeRef.toLowerCase() + ':added';
                    model.set({locator: response.id});
                    self.trigger(action, response);
                    self.Util.ajaxSuccessMessenger(response.msg);
                })
                .error(function (err) {
                    self.update();
                    self.Util.ajaxFailMessenger(err);
                });

        },
        onRemove: function (model) {
            Service.deleteDefectType(this.appModel.get('projectId'), model.get('locator'));
        },
        onResetColors: function(){
            var defaults = {},
                self = this,
                sd = config.patterns.defectsLocator,
                ids = [];

            _.each(this.models, function (defectType, key) {
                var model = defectType.toUpdateItem();
                if (sd.test(model.id)) {
                    defaults[model.typeRef.toLowerCase()] = model.color;
                    return;
                }
                if (model.color === defaults[model.typeRef.toLowerCase()]) {
                    return;
                }
                model.color = defaults[model.typeRef.toLowerCase()];
                ids.push(model);
            }, this);

            if(!_.isEmpty(ids)){
                $.when(this.updateDefectTypes(ids)).done(function(){
                    self.update();
                });
            }
        },
        onChange: function (model) {
            if(!model.changed.locator) {
                this.updateDefectTypes([model.toUpdateItem()]);
            }
        },
        updateDefectTypes: function(ids){
            var self = this,
                def = $.Deferred();
            Service.putDefectType(this.appModel.get('projectId'), {ids: ids})
                .done(function (response) {
                    self.Util.ajaxSuccessMessenger(response.msg);
                })
                .error(function (err) {
                    self.update();
                    self.Util.ajaxFailMessenger(err);
                })
                .always(function(){
                    def.resolve()
                });
            return def;
        }
    });

    return DefectTypeCollection;
});