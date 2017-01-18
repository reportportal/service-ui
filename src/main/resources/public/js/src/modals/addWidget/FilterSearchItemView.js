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

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');


    var FilterSearchItem = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search-item',
        template: 'tpl-modal-add-widget-filter-search-item',
        events: {
            'click [data-js-filter-edit]': 'onClickFilterEdit',
        },
        bindings: {
            '[data-js-filter-name]': 'html: getName',
            '[data-js-filter-options]': 'html: optionsString',
            '[data-js-filter-shared]': 'classes: {hide: any(not(isShared), notMyFilter)}',
            '[data-js-filter-not-my]': 'classes: {hide: not(notMyFilter)}, attr: {title: sharedByTitle}',
            '[data-js-filter-edit]': 'classes: {hide: notMyFilter}',
            '[data-js-filter-select]': 'checked: active',
        },
        computeds: {
            getName: {
                deps: ['name'],
                get: function(name){
                    var search = this.searchModel ? this.searchModel.get('search') : null;
                    return search ? Util.textWrapper(name, search) : name;
                }
            }
        },
        initialize: function(options) {
            this.searchModel = options.searchModel;
            this.render();
            var self = this;
            if(this.model.get('active')) {
                setTimeout(function() {
                    $('[data-js-filter-select]', self.$el)[0].checked = true;
                })

            }
        },
        onClickFilterEdit: function(e) {
            e.stopPropagation();
            this.model.trigger('edit', this.model);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        }
    });



    return FilterSearchItem;
});