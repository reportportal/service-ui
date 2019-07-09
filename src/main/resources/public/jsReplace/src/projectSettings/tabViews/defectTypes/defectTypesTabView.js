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
    var Localization = require('localization');
    var d3 = require('d3');
    var c3 = require('c3');
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
        canEdit: true,

        className: 'defect-types-project-settings',
        template: 'tpl-defect-type-main-view',
        item: 'tpl-defect-type-item',
        events: {
            'click #reset-color': 'onResetColors'
        },

        initialize: function () {
            var self = this;
            this.appModel = new SingletonAppModel();
            this.drawOrder = this.showOrder.slice(0, this.showOrder.length).reverse();
            this.settings = config.project;
            this.roles = config.userModel.get('projects')[this.appModel.get('projectId')];
            this.userRole = config.userModel.get('userRole') || 'ADMINISTRATOR';

            if (this.userRole === 'ADMINISTRATOR') {
                this.canEdit = true;
            } else {
                this.canEdit = _.include(this.editAccess, this.roles.projectRole);
            }
            this.defectTypes = new SingletonDefectTypeCollection();
            this.defectTypes.on('reset', function () {
                this.renderTypes();
            }, this);
            this.defectTypes.on('change remove add', _.debounce(self.updateControls, 100), this);

            this.render();
        },
        updateControls: function () {
            this.drawStackedAreaChart();
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
            _.each(this.showOrder, function (value) {
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
                if (id === fstId && itemSection === section) {
                    color = item.get('color');
                }
            });
            return color;
        },
        getChartData: function () {
            var chartData = {
                columns: [],
                colors: {}
            };
            _.each(this.drawOrder, function (item) {
                _.each(this.defectTypes.models, function (model) {
                    if (model.get('typeRef').toLowerCase() !== item) {
                        return;
                    }
                    chartData.columns.push([model.get('locator')]
                        .concat([
                            _.random(5, 10),
                            _.random(2, 6),
                            _.random(5, 10),
                            _.random(2, 6),
                            _.random(5, 10)
                        ]));
                    chartData.colors[model.get('locator')] = model.get('color');
                }, this);
            }, this);
            return chartData;
        },
        drawStackedAreaChart: function () {
            var self = this;
            var data = this.getChartData();
            var $el = $('[data-js-colors-chart]', this.$el);

            d3.selectAll($('.c3-area', $el)).on('click', null);
            this.chart && (this.chart = this.chart.destroy());

            this.chart = c3.generate({
                bindto: $el[0],
                data: {
                    columns: data.columns,
                    type: 'area-spline',
                    order: null,
                    groups: [_.map(data.columns, function (column) { return column[0]; })],
                    colors: data.colors
                },
                point: {
                    show: false
                },
                axis: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false,
                        padding: {
                            top: 0
                        }
                    }
                },
                legend: {
                    show: false
                },
                size: {
                    height: 150
                },
                onrendered: function () {
                    $el.css('max-height', 'none');
                    d3.selectAll($('.c3-area', $el))
                        .on('click', function (d) {
                            var shown = _.map(self.chart.data.shown(), function (dataItem) {
                                return dataItem.id;
                            });
                            (shown.length > 1) ? self.chart.hide(_.without(shown, d.id)) : self.chart.show();
                        });
                }
            });
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
                okButtonText: Localization.uiCommonElements.reset
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
            var disable;
            _.each(this.defectTypes.models, function (type) {
                if (type.get('mainType')) {
                    defaultColors.push(type.get('color'));
                }
            });
            disable = _.every(this.defectTypes.models, function (type) {
                return _.contains(defaultColors, type.get('color'));
            }, this);
            if (disable) {
                $('#reset-color', this.$el).addClass('disabled').attr('title', Localization.project.noCustomColors);
                return;
            }
            $('#reset-color', this.$el).removeClass('disabled').removeAttr('title');
        },
        onDestroy: function () {
            d3.selectAll($('[data-js-colors-chart].c3-area', this.$el)).on('click', null);
            this.chart && (this.chart = this.chart.destroy());
        }
    });

    return DefectTabView;
});
