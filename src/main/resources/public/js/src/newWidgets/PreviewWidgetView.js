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
define(function (require) {
    'use strict';

    var Epoxy = require('backbone-epoxy');
    var _ = require('underscore');
    var Util = require('util');
    var Service = require('coreService');
    var GadgetModel = require('dashboard/GadgetModel');
    var WidgetModel = require('newWidgets/WidgetModel');
    var WidgetView = require('newWidgets/WidgetView');
    var WidgetService = require('newWidgets/WidgetService');
    var PreviewWidgetService = require('newWidgets/PreviewWidgetService');

    var PreviewWidgetView = Epoxy.View.extend({
        className: 'preview-widget-view',
        initialize: function (options) {
            var self = this;
            var gadget;
            var filterOptions;
            this.filterModel = options.filterModel;
            if (options.sharedWidgetModel) {
                this.model = new GadgetModel({ gadget: options.sharedWidgetModel.get('gadget') });
            }

            gadget = this.model.get('gadget');
            if ((!this.filterModel && !options.sharedWidgetModel) || gadget === 'activity_stream' || gadget === 'launches_table' ||
                gadget === 'unique_bug_table' || gadget === 'most_failed_test_cases' || gadget === 'passing_rate_summary' || gadget === 'passing_rate_per_launch') {
                this.$el.css('background-image', 'url(' + this.model.get('gadgetPreviewImg') + ')');
                return true;
            }
            this.$el.html('<div class="preloader" style="display: block; padding-top: 50px;">' +
                '<i class="material-icons loader-animation">refresh</i>' +
                '</div>');

            if (options.sharedWidgetModel) {
                Service.getSharedWidgetData(options.sharedWidgetModel.get('id'))
                    .done(function (data) {
                        self.model.parseData(data);
                        self.widgetView && self.widgetView.destroy();
                        self.widgetView = new WidgetView({
                            model: (new WidgetModel(self.model.get('widgetData'), { parse: true })),
                            preview: true
                        });
                        self.$el.html(self.widgetView.$el);
                        self.widgetView.onShow();
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'sharedWidgetData');
                    });
            } else {
                filterOptions = this.filterModel.getOptions();

                filterOptions.push('filter.!in.status=IN_PROGRESS');
                filterOptions.push('page.page=1');
                filterOptions.push('page.size=' + this.model.get('itemsCount'));
                this.request = Service.getWidgetData(this.filterModel.get('type'), filterOptions.join('&'))
                    .done(function (data) {
                        self.renderWidgetPreview(data);
                    })
                    .fail(function () {
                        // Util.ajaxFailMessenger(null, 'widgetPreviewData');
                    });
            }
        },
        parseWidgetPreviewData: function (data, model) {
            return PreviewWidgetService.parseData(data, model);
        },
        getContentParameters: function () {
            var params = {
                gadget: this.model.get('gadget'),
                itemsCount: this.model.get('itemsCount'),
                widgetOptions: this.model.getWidgetOptions(),
                content_fields: this.model.getContentFields()
            };
            return params;
        },
        renderWidgetPreview: function (data) {
            var widgetModel = new WidgetModel({
                id: _.uniqueId('preview-'),
                content_parameters: this.getContentParameters(),
                content: this.parseWidgetPreviewData(data, this.model)
            }, { parse: true });
            var CurrentView;

            this.widget && this.widget.destroy();
            this.$el.html('');
            CurrentView = WidgetService.getWidgetView(this.model.get('gadget'));
            this.widget = new CurrentView({
                model: widgetModel,
                isPreview: true
            });
            this.$el.append(this.widget.$el);
            this.widget.onShow();
        },
        destroy: function () {
            this.request && this.request.abort();
            this.widget && this.widget.destroy();
            this.$el.remove();
        }
    });

    return PreviewWidgetView;
});
