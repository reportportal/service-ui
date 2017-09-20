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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var WidgetSettingsView = require('modals/addWidget/WidgetSettingsView');


    var ConfigureWidgetView = Epoxy.View.extend({
        className: 'modal-add-widget-configure-widget',
        template: 'tpl-modal-add-widget-configure-widget',
        initialize: function (options) {
            this.render();
            this.widgetSettingsView = new WidgetSettingsView({ model: this.model, lastFilterId: options.lastFilterId });
            $('[data-js-enter-criteria]', this.$el).html(this.widgetSettingsView.$el);
            this.listenTo(this.widgetSettingsView, 'change:view', this.onChangeSettingsViewMode);
            this.listenTo(this.widgetSettingsView, 'send:event', this.sendEvent);
        },
        activate: function () {
            this.widgetSettingsView.activate();
        },
        validate: function (options) {
            if (options && options.forPreview) {
                return this.widgetSettingsView.validate({ forPreview: options.forPreview });
            }
            return this.widgetSettingsView.validate();
        },
        sendEvent: function (eventOptions) {
            this.trigger('send:event', eventOptions);
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onChangeSettingsViewMode: function (options) {
            if (options.mode === 'expandedSettingView') {
                this.$el.addClass('expanded-setting-view-mode');
                $('[data-js-cancel]', this.$el).add('[data-js-save]', this.$el).attr('disabled', 'disabled');
                return;
            }
            $('[data-js-cancel]', this.$el).add('[data-js-save]', this.$el).removeAttr('disabled');
            this.$el.removeClass('expanded-setting-view-mode');
        },
        onDestroy: function () {
            this.widgetSettingsView && this.widgetSettingsView.destroy();
        }
    });

    return ConfigureWidgetView;
});
