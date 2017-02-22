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
    var FilterModel = require('filters/FilterModel');
    var LogItemCollection = require('launches/logLevel/LogItemCollection');


    var LogItemInfoStackTraceItemView = Epoxy.View.extend({
        className: 'stack-trace-item',

        bindings: {
            ':el': 'text: message'
        },
        initialize: function() {
        },
    });

    var LogItemInfoStackTraceView = Epoxy.View.extend({
        template: 'tpl-launch-log-item-info-stack-trace',

        events: {
            'click [data-js-close]': 'onClickClose',
            'click [data-js-go-to-log]': 'onClickGoToLog',
        },

        initialize: function(options) {
            this.render();
            this.isLoad = false;
            this.itemModel = options.itemModel;
            this.parentModel = options.parentModel;
            this.listenTo(this.parentModel, 'change:stackTrace', this.onShow);
            var filterModel = new FilterModel({
                temp: true,
                entities: '[{"filtering_field":"level","condition":"in","value":"ERROR"}]',
                selection_parameters: '{"is_asc": false, "sorting_column": "time"}',
            });
            this.collection = new LogItemCollection({
                filterModel: filterModel,
                itemModel: this.itemModel,
            });
            this.listenTo(this.collection, 'loading:true', this.onStartLoading);
            this.listenTo(this.collection, 'loading:false', this.onStopLoading);
            this.listenTo(this.collection, 'reset', this.onResetCollection);
        },
        onClickClose: function() {
            this.parentModel.set({stackTrace: false});
        },

        render: function() {
            this.$el.html(Util.templates(this.template), {});
        },
        onShow: function(model, show) {
            if(show && !this.isLoad) {
                this.isLoad = true;
                this.load();
            }
        },
        onResetCollection: function() {
            if(!this.collection.models.length) {
                $('[data-js-stack-trace-container]', this.$el).html('');
                $('[data-js-stack-trace-wrapper]', this.$el).addClass('not-found');
            } else {
                $('[data-js-stack-trace-wrapper]', this.$el).removeClass('not-found');
                $('[data-js-stack-trace-container]', this.$el).append((new LogItemInfoStackTraceItemView({model: this.collection.models[0]})).$el);
            }
        },
        onStartLoading: function() {
            $('[data-js-stack-trace-wrapper]', this.$el).addClass('load');
        },
        onStopLoading: function() {
            $('[data-js-stack-trace-wrapper]', this.$el).removeClass('load');
        },
        onClickGoToLog: function() {
            $('[data-js-stack-trace-wrapper]', this.$el).addClass('load-go-to-log');
            this.trigger('goToLog', this.collection.models[0].get('id'))
        },
        endGoToLog: function() {
            $('[data-js-stack-trace-wrapper]', this.$el).removeClass('load-go-to-log');
        },
        load: function() {
            this.collection.setPaging(1, 1); // call loading
        },

        destroy: function() {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    })

    return LogItemInfoStackTraceView;
});
