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

    var Backbone = require('backbone');

    var DefectTypeModel = Backbone.Model.extend({
        defaults: {
            color: '',
            locator: '',
            longName: '',
            shortName: '',
            typeRef: '',
            mainType: false
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