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

    var Epoxy = require('backbone-epoxy');

    var DefectTypeModel = Epoxy.Model.extend({
        defaults: {
            color: '',
            locator: '',
            longName: '',
            shortName: '',
            typeRef: '',
            mainType: false
        },
        computeds: {
            reverseColor: {
                deps: ['lightColor'],
                get: function(lightColor) {
                    if(lightColor < 50) {
                        return '#fff'
                    }
                    return '#464547'
                }
            },
            lightColor: {
                deps: ['color'],
                get: function(color) {
                    var result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(color);
                    var rgb = result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                    if(!rgb) {
                        return 0;
                    }
                    return (rgb.r * 0.8 + rgb.g + rgb.b * 0.2) / 510 * 100;
                }
            }
        },
        validate: function (attr, options) {
            var errors = [];
            _.each(attr, function (row, key) {
                var data = {
                    key: key,
                    valid: true,
                    reason: []
                };
                if (key === 'links' || key === 'locator' || key === 'mainType') {
                    return;
                }
                if (!row.length) {
                    data.valid = false;
                    data.reason.push('fieldRequired');
                    errors.push(data);
                    return;
                }
                if (key === 'longName' && (row.length < 3 || row.length > 55)) {
                    data.valid = false;
                    data.reason.push('defectName');
                }
                if (key === 'shortName' && (row.length > 4)) {
                    data.valid = false;
                    data.reason.push('defectShortName');
                }

                // if (key === 'color' && !this.isColorUniq(row, this.cid)){
                //     data.valid = false;
                //     data.reason.push('defectColor');
                // };
                if (!data.valid) {
                    errors.push(data);
                }
            }, this)

            if (errors.length) {
//                console.log("Validate!", errors);
                return errors;
            }
        },
        toUpdateItem: function(){
            var data = this.toJSON();
            delete data['links'];
            delete data['mainType'];
            if (data.locator !== 'newItem'){
                data['id'] = data.locator;
            }
            delete data['locator'];
            return data;
        }

    });

    return DefectTypeModel;
});