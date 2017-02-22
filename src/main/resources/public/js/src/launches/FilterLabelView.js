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
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();


    var FilterLabelView = Epoxy.View.extend({
        tagName: 'a',
        className: 'filter-item',
        template: 'tpl-launch-filter-label',

        events: {
            'click [data-js-filter-close]': 'onClickRemove',
        },
        bindings: {
            '[data-js-filter-shared]': 'classes: {hide: not(isShared)}',
            '[data-js-filter-name]': 'text: name',
            '[data-js-filter-comment]': 'classes: {hide: not(description)}',
            '[data-js-filter-not-my]': 'classes: {hide: not(notMyFilter)}',
            '[data-js-filter-not-save]': 'classes: {hide: all(not(temp), not(newEntities), not(newSelectionParameters))}',
            ':el': 'attr: {href: url}, classes: {active: active}',
        },
        initialize: function() {
            this.render();
            this.setTooltip();
            this.listenTo(this.model, 'change', this.update);
        },
        setTooltip: function () {
            if (this.model.get('description')) {
                Util.appendTooltip(this.model.get('description'), $('[data-js-filter-comment]', this.$el), this.$el,
                function() { config.trackingDispatcher.trackEventNumber(18); });
            }
            Util.appendTooltip(Localization.launches.filterIsSharedByOtherUser, $('[data-js-filter-not-my]', this.$el), this.$el,
                function() { config.trackingDispatcher.trackEventNumber(19); });
            Util.appendTooltip(Localization.launches.filterIsShared, $('[data-js-filter-shared]', this.$el), this.$el,
                function() { config.trackingDispatcher.trackEventNumber(20); });
            Util.appendTooltip(Localization.filters.notSaveDescription, $('[data-js-filter-not-save]', this.$el), this.$el,
                function() { config.trackingDispatcher.trackEventNumber(21); });



        },
        update: function () {
            this.setTooltip();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function() {
            this.model.collection.remove(this.model);
            this.destroy();
        },
        destroy: function () {
            this.undelegateEvents();
            this.unbind();
            this.$el.remove();
            delete this;
        },
    });


    return FilterLabelView;
});
