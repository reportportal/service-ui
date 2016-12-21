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

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Components = require('core/components');
    var Util = require('util');
    var MainBreadcrumbsComponent = require('components/MainBreadcrumbsComponent');
    var CoreService = require('coreService');
    var FilterCollection = require('filters/FilterCollection');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');

    var config = App.getInstance();
    var appModel = new SingletonAppModel();

    var FilterSearchItem = Epoxy.View.extend({
        className: 'modal-add-widget-filter-search-item',
        template: 'tpl-modal-add-widget-filter-search-item',
        bindings: {
            '[data-js-filter-name]': 'text: name',
            '[data-js-filter-options]': 'html: optionsString',
            '[data-js-filter-shared]': 'classes: {hide: any(not(isShared), notMyFilter)}',
            '[data-js-filter-not-my]': 'classes: {hide: not(notMyFilter)}, attr: {title: sharedByTitle}',
            '[data-js-filter-edit]': 'classes: {hide: notMyFilter}',
        },
        initialize: function() {
            this.render();
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