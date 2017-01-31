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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var $ = require('jquery');
    var SettingView = require('modals/addWidget/widgetSettings/_settingView');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Filters = require('filterEntities/FilterEntities');
    var Localization = require('localization');

    var SettingUsersView = SettingView.extend({
        className: 'modal-add-widget-setting-users',
        template: 'modal-add-widget-setting-users',
        events: {
        },
        bindings: {

        },
        initialize: function() {
            this.widgetConfig = WidgetsConfig.getInstance();
            this.curWidget = this.widgetConfig.widgetTypes[this.model.get('gadget')];
            if (!this.curWidget.usersFilter) {
                this.destroy();
                return false;
            }
            this.render();
            this.usersModel = new Filters.Model({value: ''});
            this.userView = new Filters.UserTagEntityView({model: this.usersModel, type: 'autocompleteUserUrl'});
            $('[data-js-user-tags-container]', this.$el).html(this.userView.$el);
            this.listenTo(this.usersModel, 'change:value', this.onChangeValue);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}))
        },
        activate: function(){
            var curOptions = this.model.getWidgetOptions();
            if(curOptions.userRef){
                this.usersModel.set('value', curOptions.userRef.join(','));
            }
        },
        onChangeValue: function(model, value) {
            var curOptions = this.model.getWidgetOptions();
            if(value){
                curOptions.userRef = value.split(',');
            }
            else {
                delete curOptions.userRef;
            }
            this.model.setWidgetOptions(curOptions);
        }
    });

    return SettingUsersView;
});
