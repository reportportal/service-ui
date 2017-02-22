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

    var ModalView = require('modals/_modalView');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Service = require('coreService');

    var ModalFilterEdit = ModalView.extend({
        template: 'tpl-modal-filter-edit',
        className: 'modal-filter-edit',

        bindings: {
            '[data-js-name-input]': 'value: updateName',
            '[data-js-is-shared]': 'checked: isShared',
            '[data-js-description]': 'value: description',
        },
        events: {
            'click [data-js-ok]': 'onClickOk',
        },

        computeds: {
            updateName: {
                deps: ['name'],
                get: function(name){
                    return name.trim();
                },
                set: function(value){
                    this.model.set('name', value.trim());
                }
            }
        },

        initialize: function(options) {
            var filterNames = [],
                self = this,
                filterModel = options.filterModel;
            this.model = new Epoxy.Model({
                name: filterModel.get('name'),
                isShared: filterModel.get('isShared'),
                description: filterModel.get('description'),
            });
            this.render(options);
            Service.getFilterNames()
                .done(function(data){
                    _.each(data, function(filter){
                        if(filter.name !== self.model.get('name')){
                            filterNames.push(filter.name);
                        }
                    });
                })
                .always(function(){
                    self.addValidators(filterNames);
                });
        },
        addValidators: function(filterNames){
            Util.hintValidator($('[data-js-name-input]', this.$el), [{
                validator: 'minMaxRequired',
                type: 'filterName',
                min: 3,
                max: 128
            }, {validator: 'noDuplications', type: 'filterName', source: filterNames, isCaseSensitive: true}]);
            Util.hintValidator($('[data-js-description]', this.$el), {
                validator: 'maxRequired',
                type: 'filterDescription',
                max: 256
            });
        },
        render: function(options) {
            this.$el.html(Util.templates(this.template, options));
        },
        onKeySuccess: function () {
            $('[data-js-ok]', this.$el).focus().trigger('click');
        },
        validate: function(){
            return !($('[data-js-description]', this.$el).trigger('validate').data('validate-error') || $('[data-js-name-input]', this.$el).trigger('validate').data('validate-error'));
        },
        onClickOk: function() {
            if (!this.validate()) return;
            this.successClose(this.model);
        }

    });

    return ModalFilterEdit;
});
