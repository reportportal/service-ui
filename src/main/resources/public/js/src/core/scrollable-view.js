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

define([
    'backbone',
    'components'
], function (Backbone, Components) {
    'use strict';

    var scrollFn,
        triggerPoint;

    var View = Components.BaseView.extend({

        initialize: function (options) {
            this.$el = options.holder;
            this.renderFn = options.renderFn;
            this.items = options.items;
            this.currentItems = null;
            this.rendered = 0;
            this.amount = options.amount;
            this.trashHold = options.trashHold;
        },

        render: function () {
            this.$el.empty();
            this.processToRender();
            scrollFn = this.triggerScroll.bind(this);
            $.subscribe("scroll:change", scrollFn);
            return this;
        },

        triggerScroll: function (e, data) {
            if (this.rendered >= this.items.length) {
                this.clearScrollTracker();
                return;
            }
            if (data.top > triggerPoint) {
                this.processToRender('append');
            }
        },

        processToRender: function () {
            this.currentItems = this.items.slice(this.rendered, this.rendered + this.amount);
            this.renderFn(this.currentItems, 'append');
            this.rendered += this.currentItems.length;
            triggerPoint = this.$el.height() - $(window).height() - this.trashHold;
        },

        clearScrollTracker: function () {
            this.rendered = 0;
            this.currentItems = null;
            this.items = null;
            triggerPoint = 0;
            $.unsubscribe("scroll:change", scrollFn);
            scrollFn = null;
        },

        destroy: function () {
            this.clearScrollTracker();
            Components.BaseView.prototype.destroy.call(this);
        }

    });

    return {
        View: View
    }

});