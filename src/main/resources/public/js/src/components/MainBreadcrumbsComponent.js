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

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');

    var MainBreadcrumbsModel = Epoxy.Model.extend({
        defaults: {
            name: '',
            link: '',
        }
    });
    var MainBreadcrumbsCollection = Backbone.Collection.extend({
        model:  MainBreadcrumbsModel
    });
    var MainBreadcrumbsItem = Epoxy.View.extend({
        tagName: 'li',
        template: 'tpl-component-main-breadcrumbs-item',

        bindings: {
            '[data-js-link]': 'attr: {href: link}, text: name',
            '[data-js-name]': 'text: name',
        },

        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        }
    });

    var MainBreadcrumbsComponent = Epoxy.View.extend({
        tagName: 'ul',
        className: 'main-breadcrumbs',
        events: {
        },

        initialize: function(options) {
            this.renderedViews = [];
            this.collection = new MainBreadcrumbsCollection();
            this.listenTo(this.collection, 'reset', this.render);
            this.listenTo(this.collection, 'add', this.addItem);
            this.listenTo(this.collection, 'remove', this.render);
            options.data && this.collection.reset(options.data);
        },
        render: function() {
            _.each(this.renderedViews, function(view) {
                view.destroy();
            });
            this.renderedViews = [];
            var self = this;
            _.each(this.collection.models, function(model) {
                self.addItem(model);
            })
        },
        addItem: function(model) {
            var view = new MainBreadcrumbsItem({model: model});
            this.renderedViews.push(view);
            this.$el.append(view.$el);
        },

        destroy: function () {
            this.collection.reset([]);
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });


    return MainBreadcrumbsComponent;
});
