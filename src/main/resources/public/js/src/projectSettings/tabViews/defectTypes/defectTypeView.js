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

    var $ = require('jquery');
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var d3 = require('d3');
    var c3 = require('c3');
    var DefectTypeModel = require('defectType/DefectTypeModel');
    var DefectTypeSubView = require('projectSettings/tabViews/defectTypes/defectTypeSubView');
    var App = require('app');
    var config = App.getInstance();

    var DefectTypeView = Epoxy.View.extend({
        template: 'tpl-defect-type',
        subTemplate: 'tpl-defect-subType',
        events: {
            'click .add-item': 'addItem'
        },

        collection: {},
        name: '',

        initialize: function (options) {
            _.extend(this, options);
            this.collection.on('AddNew:' + this.name, this.updateControls, this);
            this.collection.on('Remove:' + this.name, this.updateControls, this);
            this.collection.on('cancel:add', this.lockAddButton, this);
            this.collection.on('change', this.updateControls, this);
            this.collection.on('remove', this.onRemove, this);
            this.render();
        },
        render: function () {
            var data;
            data = {
                name: this.name,
                color: this.color,
                addLeft: this.addLeft,
                edit: this.edit
            };
            this.$el.html(Util.templates(this.template, data));
            this.updateControls();
        },
        onShow: function () {
            this.renderSubTypes();
        },
        renderSubTypes: function () {
            if (this.collection.length === 0) {
                return;
            }
            _.each(this.collection.models, function (model) {
                var data;
                if (model.get('typeRef').toLowerCase() !== this.name) {
                    return;
                }
                data = {
                    model: model,
                    parent: this,
                    edit: this.edit
                };
                this.renderItem(data);
                if (this.name === 'to_investigate') {
                    $('.controll-panel', this.$el).remove();
                }
            }, this);
            this.drawDonutChart(this.getChartData());
        },
        renderItem: function (args) {
            var data = args;
            var id = data.model.get('locator');
            var template = Util.templates(this.subTemplate, {
                id: id,
                type: data.model.get('typeRef'),
                edit: data.edit
            });
            var view;
            $('.controll-panel', this.$el).before(template);
            data.el = $('#' + id, this.$el);
            view = new DefectTypeSubView(data);
            view.render();

            return view;
        },
        addItem: function (event) {
            var editModel;
            var data;
            var view;
            config.trackingDispatcher.trackEventNumber(421);
            event.preventDefault();
            editModel = new DefectTypeModel({
                locator: 'newItem',
                typeRef: this.name.toUpperCase(),
                color: this.color
            });
            editModel.collection = this.collection;
            $(event.currentTarget).attr('disabled', 'disabled');
            data = {
                model: editModel,
                parent: this,
                edit: this.edit
            };
            view = this.renderItem(data);
            view.editItem();
        },
        getChartData: function () {
            var data = {
                columns: [],
                colors: {}
            };
            _.each(this.collection.models, function (model) {
                if (model.get('typeRef') !== this.name.toUpperCase()) {
                    return;
                }
                data.columns.push([model.get('locator'), 1]);
                data.colors[model.get('locator')] = model.get('color');
            }, this);
            return data;
        },
        drawDonutChart: function (data) {
            var $el = $('[data-js-chart-container]', this.$el);
            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: data.columns,
                    type: 'donut',
                    order: null,
                    colors: data.colors
                },
                size: {
                    width: 56,
                    height: 56
                },
                interaction: {
                    enabled: true
                },
                legend: {
                    show: false
                },
                donut: {
                    width: 12,
                    label: {
                        show: false
                    }
                },
                tooltip: {
                    show: false
                }
            });
        },
        updateChart: function () {
            var data = this.getChartData();
            this.chart && this.chart.data.colors(data.colors);
            this.chart && this.chart.load({
                columns: data.columns
            });
        },
        onRemove: function (model) {
            this.chart && this.chart.unload({
                ids: [model.get('locator')]
            });
            this.updateControls();
        },
        lockAddButton: function () {
            var collectionLength = this.getCollectionLength();
            if (collectionLength >= 10 || $('#newItem', this.$el).length) {
                $('.add-item', this.$el).prop('disabled', true);
                return;
            }
            $('.add-item', this.$el).prop('disabled', false);
        },
        getCollectionLength: function () {
            var length = 0;
            _.each(this.collection.models, function (el) {
                var typeRef = el.get('typeRef').toLowerCase();
                if (typeRef === this.name) {
                    length += 1;
                }
            }, this);

            return length;
        },
        recountAddLeft: function () {
            var collectionLength = this.getCollectionLength();
            var parent = this.$el.find('.add-item').parent();
            this.addLeft = 10 - collectionLength;
            if (this.addLeft > 0) {
                $(parent).find('p:first span').html(this.addLeft);
                $(parent).find('p:last').hide();
                $(parent).find('p:first').show();
                return;
            }
            $(parent).find('p:first').hide();
            $(parent).find('p:last').show();
        },
        updateControls: function () {
            this.recountAddLeft();
            this.lockAddButton();
            this.updateChart();
        },
        onDestroy: function () {
            this.chart && (this.chart = this.chart.destroy());
            this.remove();
        }
    });

    return DefectTypeView;
});
