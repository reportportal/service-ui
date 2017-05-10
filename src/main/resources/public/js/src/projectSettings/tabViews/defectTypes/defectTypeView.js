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
    var App = require('app');
    var D3 = require('d3');
    var NVD3 = require('nvd3');
    var DefectTypeModel = require('defectType/DefectTypeModel');

    var config = App.getInstance();

    var DefectTypeSubView = require('projectSettings/tabViews/defectTypes/defectTypeSubView');

    var DefectTypeView = Epoxy.View.extend({

        collection: {},
        name: '',
        diagrammParams: [],

        template: 'tpl-defect-type',
        subTemplate: 'tpl-defect-subType',

        events: {
            'click .add-item': 'addItem'
        },

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

            this.getDataForDiagramm(this.collection);
            this.getDataForGraph(this.diagrammParams);
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

        getDataForDiagramm: function (data) {
            var item;
            var temporaryArray = [];
            _.map(data.models, function (list) {
                if (list.get('typeRef').toLowerCase() !== this.name) {
                    return;
                }
                item = {
                    parent: list.get('typeRef').toLowerCase(),
                    child: {
                        itemLongName: list.get('longName').toLowerCase(),
                        itemShortName: list.get('shortName').toLowerCase(),
                        itemColor: list.get('color')
                    }
                };
                temporaryArray.push(item);
            }, this);
            this.diagrammParams = _.groupBy(temporaryArray, 'parent');
            return this.diagrammParams;
        },

        getDataForGraph: function (data) {
            _.map(data, function (param, key) {
                this.drawPieChart(param, key);
            }, this);
        },

        drawPieChart: function (params, selector) {
            var chart;
            var data = [];
            var pieWidth = 46;
            var pieHeight = 46;
            var id = '#diagramm_' + selector;
            _.map(params, function (param) {
                data.push({
                    key: param.child.itemLongName,
                    y: 1,
                    color: param.child.itemColor
                });
            }, this);

            chart = NVD3.models.pie()
                .x(function (d) {
                    return d.key;
                })
                .y(function (d) {
                    return d.y;
                })
                .width(pieWidth)
                .height(pieHeight)
                .showLabels(false)
                .donut(true)
                .donutRatio(0.40)
                .color(function (d) {
                    return d.data.color;
                })
                .valueFormat(D3.format('f'));

            D3.select(id)
                .datum([data])
                .transition()
                .duration(350)
                .attr('width', pieWidth)
                .attr('height', pieHeight)
                .call(chart);

            return chart;
        },

        updateDiagramm: function () {
            this.getDataForDiagramm(this.collection);
            this.getDataForGraph(this.diagrammParams);
        },

        onRemove: function () {
            this.updateControls();
            this.getDataForDiagramm(this.collection);
            this.getDataForGraph(this.diagrammParams);
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
            this.updateDiagramm();
        },

        onDestroy: function () {
            this.remove();
        }
    });

    return DefectTypeView;
});
