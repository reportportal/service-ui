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
    var WidgetService = require('newWidgets/WidgetService');

    var WidgetView = Epoxy.View.extend({
        className: 'widget-view',
        initialize: function (options) {
            this.gadgetSize = options.gadgetSize;
            this.render(options);
        },
        render: function (options) {
            var gadget = this.model.get('gadget');
            var CurrentView = WidgetService.getWidgetView(gadget);
            if (CurrentView) {
                var widgetData = {
                    model: this.model,
                    isPreview: (options && options.preview) || false
                };
                this.widget && this.widget.destroy();
                this.widget = new CurrentView(widgetData);
                this.$el.append(this.widget.$el);
            }
        },
        onShow: function () {
            if (this.widget) {
                if (!this.widget.isPreview) {
                    this.widget.addSizeClasses(this.gadgetSize);
                }
                this.widget.onShow();
            }
        },
        resize: function (newGadgetSize) {
            this.widget && this.widget.updateSizeClasses(newGadgetSize);
        },
        onDestroy: function () {
            this.widget && this.widget.destroy();
            this.$el.remove();
        }
    });

    return WidgetView;
});
