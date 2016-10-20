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
    var Backbone = require('backbone');
    var Util = require('util');
    var Moment = require('moment');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');

    var Footer = Backbone.View.extend({
        el: "#pageFooter",
        tpl: 'tpl-footer',

        initialize: function () {
            this.viewModel = new SingletonRegistryInfoModel();
        },

        render: function () {
            var self = this;

            this.$el.html(Util.templates(this.tpl, {moment: Moment, util: Util})).show();
            this.viewModel.ready
                .done(function () {
                    $('#buildVersion', self.$el).text(self.viewModel.get('uiBuildVersion'));
                });
            Util.setupBaronScroll($('#ComponentsModal .modal-dialog', this.$el));
            return this;
        },

        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        }
    });

    return Footer;
});