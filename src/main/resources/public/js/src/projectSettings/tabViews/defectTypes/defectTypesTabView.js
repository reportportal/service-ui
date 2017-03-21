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
    "use strict";
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var D3 = require('d3');
    var NVD3 = require('nvd3');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var ModalConfirm = require('modals/modalConfirm');
    var DefectTypeView = require('projectSettings/tabViews/defectTypes/defectTypeView');
    var config = App.getInstance();

    var DefectTabView = Epoxy.View.extend({

        defectTypes: {},
        items: {},
        showOrder: ['product_bug', 'automation_bug', 'system_issue', 'no_defect', 'to_investigate'],
        editAccess: ['PROJECT_MANAGER', 'LEAD'],
        confirmModal: 'tpl-modal-with-confirm',
        item: 'tpl-defect-type-item',
        canEdit: true,

        className: 'defect-types-project-settings',

        template: 'tpl-defect-type-main-view',

        events: {
            'click #reset-color': 'onResetColors'
        },

        initialize: function (options) {
            this.appModel = new SingletonAppModel();
            this.drawOrder = this.showOrder.slice(0, this.showOrder.length).reverse();
            this.settings = config.project;
            this.roles = config.userModel.get('projects')[this.appModel.get('projectId')];
            this.userRole = config.userModel.get('userRole') || 'ADMINISTRATOR';

            if (this.userRole === "ADMINISTRATOR") {
                this.canEdit = true
            } else {
                this.canEdit = _.include(this.editAccess, this.roles.projectRole);
            }
            var self = this;
            this.defectTypes = new SingletonDefectTypeCollection();
            this.defectTypes.on('reset', function () {
                this.renderTypes();
            }, this);
            this.defectTypes.on('change remove add', _.debounce(self.updateControls, 100), this);

            this.render();
        },

        updateControls: function () {
            this.drawChart();
            this.disableReset();
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {
                order: this.showOrder,
                edit: this.canEdit
            }));
            return this;
        },

        onShow: function () {
            this.renderTypes();
        },

        renderTypes: function () {
            var self = this;
            _.each(this.showOrder, function (value, key) {
                var currentColor = this.getColor(value);
                var view = new DefectTypeView({
                    name: value,
                    color: currentColor,
                    collection: this.defectTypes,
                    edit: this.canEdit
                });
                $('#' + value, self.$el).html(view.$el);
                view.onShow && view.onShow();
            }, this);

            this.updateControls();
        },

        getColor: function (section) {
            var color;
            _.each(this.defectTypes.models, function (item) {
                var id = item.get('locator');
                var itemSection = item.get('typeRef').toLowerCase();
                var fstId = item.get('shortName') + '001';
                if (id === fstId && itemSection == section) {
                    color = item.get('color');
                }
            });
            return color;
        },

        drawChart: function () {
            var data = this.getChartData();
            this.chart = NVD3.addGraph(function () {

                var chart = NVD3.models.stackedAreaChart()
                    .margin({
                        left: 0
                    })
                    .margin({
                        right: 0
                    })
                    .margin({
                        top: 0
                    })
                    .margin({
                        bottom: 0
                    })
                    .style('stack_percent')
                    .x(function (d) {
                        return d[0]
                    })
                    .y(function (d) {
                        return d[1]
                    })
                    .useInteractiveGuideline(false)
                    .rightAlignYAxis(true)
                    .showControls(false)
                    .clipEdge(true)
                    .height(150)
                    .showXAxis(false)
                    .showYAxis(false)
                    .showLegend(false);

                D3.select('#chart svg')
                    .datum(data)
                    .call(chart);

                chart.stacked.dispatch.on("areaClick", null);
                chart.stacked.dispatch.on("areaClick.toggle", null);

                NVD3.utils.windowResize(chart.update);

                return chart;
            });
        },

        getChartData: function () {
            var data = [];
            _.each(this.drawOrder, function (item, key) {
                _.each(this.defectTypes.models, function (model, i) {
                    if (model.get('typeRef').toLowerCase() !== item) {
                        return;
                    }
                    data.push({
                        key: model.get('typeRef'),
                        color: model.get('color'),
                        values: this.generateChartValues(i, key)
                    })
                }, this);
            }, this);

            return data;
        },

        generateChartValues: function (modelNo, key) {
            var data = [];
            var val;
            // magic formuls. I do not understand what is going on here
            for (var i = 1; i < 6; i++) {
                if (i == 0) {
                    val = 20 + (key + modelNo + i) * 3
                } else {
                    val = (i & 1) ?
                        ((modelNo & 1) ?
                            Math.random() * (50 - (10 + key + modelNo * 3)) + 10 :
                            Math.random() * (10 - key + modelNo) + 10) :
                        ((key & 1) ?
                            Math.random() * (10 - key + modelNo) + 10 :
                            Math.random() * (20 - (1 + key + modelNo * 3)) + 10);
                }
                data.push([i, val]);
            }
            return data;
        },

        onResetColors: function (event) {
            event.preventDefault();
            if ($(event.target).hasClass('disabled')) {
                return;
            }
            this.showModalResetColors();
            config.trackingDispatcher.trackEventNumber(422);
        },
        showModalResetColors: function () {
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.titleResetDefectColors,
                bodyText: Localization.dialog.msgResetColorsDefectType,
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.uiCommonElements.reset,
            });
            $('[data-js-close]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(423);
            });
            $('[data-js-cancel]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(424);
            });
            modal.show().done(function () {
                config.trackingDispatcher.trackEventNumber(425);
                self.resetColors();
                Util.ajaxSuccessMessenger('changedColorDefectTypes');
            });
        },

        resetColors: function () {
            this.defectTypes.trigger('resetColors');
        },

        disableReset: function () {
            var defaultColors = [];
            _.each(this.defectTypes.models, function (type) {
                if (type.get('mainType')) {
                    defaultColors.push(type.get('color'));
                }
            });
            var disable = _.every(this.defectTypes.models, function (type) {
                return _.contains(defaultColors, type.get('color'));
            }, this);
            if (disable) {
                $('#reset-color', this.$el).addClass('disabled').attr('title', Localization.project.noCustomColors);
                return;
            }
            $('#reset-color', this.$el).removeClass('disabled').removeAttr('title');
        },

        onDestroy: function () {

        }
    });

    return DefectTabView;
});
