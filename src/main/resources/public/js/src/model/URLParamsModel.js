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
'use strict';

define(function(require, exports, module) {
    var Backbone = require('backbone'),
        App = require('app');

    var config = App.getInstance();

    var URLParamsModel = Backbone.Model.extend({
        default: {},
        initialize: function(){
            this.listenTo(this, 'change', this.onChange);
            this.parseURL();
        },
        parseURL: function(){
            var hashSplit =  decodeURI(window.location.hash).split('?');
            this.mainHash = hashSplit[0];
            var paramsString = hashSplit[1];
            if(!paramsString) {
                this.clear({silent: true});
                return false;
            }
            var self = this;
            var parameters = paramsString.split('&');
            parameters.forEach(function(parameter){
                var splitParam = parameter.split('=');
                self.set(splitParam[0], splitParam[1], {silent: true});
            });
        },
        delaySet: function(data){
            var self = this;
            setTimeout(function(){
               self.set(data)
            }, 0);
        },
        _getQueryString: function(){
            var queryMas = [];
            var params = this.toJSON();
            for(var key in params){
                if(params[key] != null){
                    queryMas.push(key + '=' + encodeURIComponent(params[key]));
                }
            }
            return queryMas.join('&');
        },
        onChange: function(model, attribute){
            if(this.mainHash != window.location.hash.split('?')[0]){
                console.log('URLParamsModel: error, main hash it was changed')
                return;
            }
            var queryString = this._getQueryString();
            if(!config.router) return;
            config.router.navigate(this.mainHash + '?' + queryString, {trigger: false});
        }
    });

    return URLParamsModel;
})