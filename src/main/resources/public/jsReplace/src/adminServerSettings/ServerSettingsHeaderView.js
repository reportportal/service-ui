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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var MainBreadcrumbsComponent = require('components/MainBreadcrumbsComponent');

    var config = App.getInstance();

    var ServerSettingsHeaderView = Epoxy.View.extend({

        tpl: 'tpl-server-settings-header',

        initialize: function (options) {
            this.mainBreadcrumbs = new MainBreadcrumbsComponent({
                data: this.getHeaderData()
            });
            this.render();
        },

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            $('[data-js-main-breadcrumbs]', this.$el).append(this.mainBreadcrumbs.$el);
        },

        getHeaderData: function(){
            var data = [{name: Localization.admin.serverSettings, link: '#administrate/settings'}];
            return data;
        },

        destroy: function(){
            this.mainBreadcrumbs && this.mainBreadcrumbs.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return ServerSettingsHeaderView;

});