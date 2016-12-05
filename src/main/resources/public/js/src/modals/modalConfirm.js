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

    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var $ = require('jquery');

    var ModalConfirm = ModalView.extend({
        template: 'tpl-modal-confirm',
        className: 'modal-confirm',

        events: {
            'change [data-js-select]': 'onChangeCheckbox',
            'click [data-js-ok]': 'onClickSuccess'
        },

        initialize: function(options) {
            /*  options = {
               headerText: '',
               bodyText: '',
               confirmText: '',   //optional
               cancelButtonText: '',   //optional
               okButtonDanger: false, //optional
               okButtonText: '',  //optional
               confirmFunction: function() { return $.Deferred()},
            }*/
            this.render(options);
            this.confirmFunction = options.confirmFunction;
        },
        render: function(options) {
            this.$el.html(Util.templates(this.template, options));
        },
        onChangeCheckbox: function(e) {
            if($(e.currentTarget).is(':checked')) {
                $('[data-js-ok]', this.$el).removeClass('disabled');
            } else {
                $('[data-js-ok]', this.$el).addClass('disabled');
            }
        },

        onKeySuccess: function () {
            var confirmBtn = $('[data-js-ok]',this.$el);
            if (!confirmBtn.hasClass('disabled')) {
                confirmBtn.trigger('click')
            }
        },

        onClickSuccess: function() {
            var self = this;
            if(!this.confirmFunction) {
                self.successClose();
                return;
            }
            this.showLoading();
            this.confirmFunction().done(function() {
                self.closeAsync && self.closeAsync.resolve();
            }).fail(function(err) {
                self.closeAsync && self.closeAsync.resolve(err);
            }).always(function() {
                self.hide();
            })
        }
    });

    return ModalConfirm;
});