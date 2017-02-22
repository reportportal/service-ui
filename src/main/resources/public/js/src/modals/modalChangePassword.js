/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');

    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var Service = require('coreService');

    var config = App.getInstance();

    var ModalChangePassword = ModalView.extend({
        tpl: 'tpl-modal-change-password',
        className: 'modal-change-password',
        events: {
            'click [data-js-ok]:not(.disabled)': 'submitChangePassword',
            'change [data-js-show-password]': 'showPassword',
            'validation::change [data-js-change-password]': 'validatePass'
        },

        initialize: function(options) {
            this.render();
            Util.confirmValidator({holder: this.$confirmGroup, min: 4, max: 25});
            Util.configRegexValidation(this.$originalPass, 'originalPass');
        },

        render: function() {
            this.$el.html(Util.templates(this.tpl));
            this.setupAnchors();
        },
        setupAnchors: function(){
            this.$originalPass = $('[data-js-origin-password]', this.$el);
            this.$newPass = $('[data-js-new-password]', this.$el);
            this.$confirmPass = $('[data-js-confirm-password]', this.$el);
            this.$submitBtn = $('[data-js-ok]', this.$el);
            this.$confirmGroup = $('[data-js-confirm-group]', this.$el);
        },
        onKeySuccess: function () {
            if (!this.$submitBtn.hasClass('disabled')) {
                this.submitChangePassword();
            }
        },
        validatePass: function (e, data) {
            var action;
            if (!data.valid) {
                action = 'add';
            } else {
                action = this.$originalPass.val() && this.$originalPass.data('valid')
                && this.$newPass.val() && !this.$confirmGroup.hasClass('has-error')
                    ? 'remove' : 'add';
            }
            this.$submitBtn[action + "Class"]('disabled');
        },
        showPassword: function (e) {
            var action = $(e.currentTarget).is(':checked') ? 'text' : 'password';
            this.$originalPass.add(this.$newPass).add(this.$confirmPass).attr('type', action);
        },
        submitChangePassword: function(){
            var data = {
                oldPassword: this.$originalPass.val(),
                newPassword: this.$newPass.val()
            };
            var self = this;
            Service.submitPassChange(data)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitChangePass');
                    // config.trackingDispatcher.profilePasswordChanged();
                    self.hide();
                })
                .fail(function (error) {
                    var type = error.responseText.indexOf('40010') > -1 ? 'submitChangePassInvalid' : 'submitChangePass';
                    if (type === 'submitChangePassInvalid') {
                        self.$originalPass.focus();
                        self.$originalPass.closest('.rp-form-group').addClass('has-error');
                    }
                    Util.ajaxFailMessenger(null, type);
                });
        }
    });

    return ModalChangePassword;

});
