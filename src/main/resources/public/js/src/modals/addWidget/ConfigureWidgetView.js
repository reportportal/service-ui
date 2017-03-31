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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var FilterSearchView = require('modals/addWidget/FilterSearchView');
    var WidgetSettingsView = require('modals/addWidget/WidgetSettingsView');


    var ConfigureWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-configure-widget',
        template: 'tpl-modal-add-widget-configure-widget',
        initialize: function() {

            this.render();
            this.filterSearch = new FilterSearchView({model: this.model});
            $('[data-js-filter-search]', this.$el).html(this.filterSearch.$el);
            this.listenTo(this.filterSearch, 'disable:navigation', this.onChangeDisableNavigation);
            this.widgetCriteria = new WidgetSettingsView({model: this.model});
            $('[data-js-enter-criteria]', this.$el).html(this.widgetCriteria.$el);
        },
        onChangeDisableNavigation: function(state) {
            this.trigger('disable:navigation', state);
            if(state) {
                $('[data-js-enter-criteria]', this.$el).addClass('hide');
            } else {
                $('[data-js-enter-criteria]', this.$el).removeClass('hide');
            }
        },
        getSelectedFilterModel: function() {
            return this.filterSearch.getSelectedFilterModel();
        },
        activate: function() {
            this.filterSearch.activate();
            this.widgetCriteria.activate();
        },
        validate: function() {
            return this.widgetCriteria.validate();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
    });

    return ConfigureWidgetView;
});
