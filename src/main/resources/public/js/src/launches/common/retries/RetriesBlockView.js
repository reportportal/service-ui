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
define(function (require) {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Backbone = require('backbone');
    var LaunchSuiteStepItemModel = require('launches/common/LaunchSuiteStepItemModel');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var ItemStartTimeView = require('launches/common/ItemStartTimeView');
    var RetriesItemLogView = require('launches/common/retries/RetriesItemLogView');

    var RetriesBlockItemView = Epoxy.View.extend({
        template: 'tpl-retries-block-item',
        className: 'retries-block-item-view',
        events: {
            click: 'onClickItem'
        },
        bindings: {
            ':el': 'classes: {active: select}',
            '[data-js-number]': 'text: number',
            '[data-js-status-text]': 'text: status_loc'
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            $('[data-js-status]', this.$el).addClass('status-' + this.model.get('status'));
            this.renderDuration();
            this.renderStartTime();
        },
        onClickItem: function () {
            this.model.set({ select: true });
        },
        renderDuration: function () {
            this.duration && this.duration.destroy();
            this.duration = new ItemDurationView({
                model: this.model
            });
            $('[data-js-duration-container]', this.$el).html(this.duration.$el);
        },
        renderStartTime: function () {
            this.startTime && this.startTime.destroy();
            this.startTime = new ItemStartTimeView({
                model: this.model
            });
            $('[data-js-time]', this.$el).html(this.startTime.$el);
        },
        onDestroy: function () {
            this.duration && this.duration.destroy();
            this.startTime && this.startTime.destroy();
        }
    });
    var RetriesBlockCollection = Backbone.Collection.extend({
        model: LaunchSuiteStepItemModel
    });

    var RetriesBlockView = Epoxy.View.extend({
        template: 'tpl-retries-block',
        className: 'retries-block-view',
        events: {
        },
        bindings: {
        },
        initialize: function () {
            var curNumber = 1;
            var clonedRetries = _.clone(this.model.get('retries'));
            var retries;
            this.render();
            this.collection = new RetriesBlockCollection();
            clonedRetries.push(this.model.attributes);
            retries = _.map(clonedRetries, function (item) {
                item.number = curNumber;
                curNumber += 1;
                return item;
            });
            this.collection.reset(retries);
            this.renderedItems = [];
            this.renderItems();
            this.listenTo(this.collection, 'change:select', this.onChangeSelect);
            this.collection.models[this.collection.models.length - 1].set({ select: true });
        },
        onChangeSelect: function (model, value) {
            if (value) {
                _.each(this.collection.models, function (curModel) {
                    if (curModel.id !== model.id) {
                        curModel.set({ select: false });
                    }
                });
                this.logView && this.logView.destroy();
                this.logView = new RetriesItemLogView({
                    model: model,
                    lastRetryModel: this.model
                });
                $('[data-js-log-container]', this.$el).html(this.logView.$el);
            }
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                retries: this.model.get('retries')
            }));
        },
        renderItems: function () {
            var self = this;
            _.each(_.clone(this.collection.models).reverse(), function (model) {
                var itemView = new RetriesBlockItemView({
                    model: model
                });
                $('[data-js-retries-container]', self.$el).append(itemView.$el);
                self.renderedItems.push(itemView);
            });
        },
        onDestroy: function () {
            _.each(this.renderedItems, function (view) {
                view.destroy();
            });
            this.$el.empty();
            delete this;
        }
    });

    return RetriesBlockView;
});
