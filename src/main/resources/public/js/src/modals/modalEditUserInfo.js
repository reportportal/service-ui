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
    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');

    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Util = require('util');
    var Localization = require('localization');
    var Service = require('coreService');

    var config = App.getInstance();

    var ModalEditUserInfo = ModalView.extend({
        tpl: 'tpl-modal-edit-user-info',
        className: 'modal-edit-user-info',

        bindings: {
            '[data-js-full-name]': 'value: fullName',
            '[data-js-user-email]': 'value: email'
        },

        events: {
            'click [data-js-cancel]': 'resetUserInfo',
            'click [data-js-ok]:not(.disabled)': 'submitEditInfo',
            'validation::change [data-js-full-name]': 'validateUserInfo',
            'validation::change [data-js-user-email]': 'validateUserInfo',
        },

        initialize: function(options) {
            this.oldName = this.model.get('fullName');
            this.oldEmail = this.model.get('email');
            this.isSubmit = false;
            this.render();
        },

        render: function() {
            this.$el.html(Util.templates(this.tpl));
            this.setupAnchors();
            this.setupValidation();
        },
        onKeySuccess: function () {
            if (!this.$submitInfo.hasClass('disabled')) {
                this.submitEditInfo();
            }
        },
        validateUserInfo: function () {
            var action = (this.$email.data('valid') && this.$fullName.data('valid')
            && (this.$fullName.val() !== this.oldName || this.$email.val() !== this.oldEmail))
                ? 'remove' : 'add';
            this.$submitInfo[action + 'Class']('disabled');
        },

        setupAnchors: function(){
            this.$fullName = $('[data-js-full-name]', this.$el);
            this.$email = $('[data-js-user-email]', this.$el);
            this.$submitInfo = $('[data-js-ok]', this.$el);
        },

        setupValidation: function(){
            Util.bootValidator(this.$email, [
                {
                    validator: 'matchRegex',
                    type: 'emailMatchRegex',
                    message: Localization.validation.submitProfileInfoEmail,
                    pattern: config.patterns.email
                },
                {
                    validator: 'remoteEmail',
                    remote: true,
                    message: Localization.validation.registeredEmail,
                    type: 'remoteEmail'
                },
                {validator: 'required'}
            ]);
            Util.bootValidator(this.$fullName, [
                {
                    validator: 'matchRegex',
                    type: 'fullNameInfoRegex',
                    pattern: config.patterns.fullName
                },
                {validator: 'required'}
            ]);
        },

        resetUserInfo: function(){
            this.model.set('fullName', this.oldName);
            this.model.set('email', this.oldEmail);
        },

        submitEditInfo: function(){

            var data = {},
                self = this,
                userImage = config.userModel.get('image'),
                name = this.$fullName.val(),
                email = this.$email.val();

            data.full_name = name;
            this.model.set('fullName', name);
            data.email = email;
            this.model.set('email', email);
            this.isSubmit = true;

            Service.submitProfileInfo(data)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitProfileInfo');
                    if (!config.userModel.get('image')) {
                        config.userModel.set('image', userImage);
                    }
                    self.isSubmit = false;
                    self.hide();
                    // config.trackingDispatcher.profileInfoEdit();
                })
                .fail(function (error) {
                    var type = 'submitProfileInfo',
                        message = '';
                    if (error.responseText.indexOf('4094') >= 0) {
                        type = 'submitProfileInfoDuplication';
                    } else if (config.patterns.emailWrong.test(error.responseText)) {
                        type = 'submitProfileInfoWrongData';
                    }
                    if (type !== 'submitProfileInfoWrongData') {
                        self.$email.focus();
                        self.$email.closest('.rp-form-group').addClass('has-error');
                        message = Localization.validation.registeredEmail;
                    }
                    else {
                        message = Localization.failMessages.submitProfileInfoWrongData;
                    }
                    $('.help-line', self.$email.closest('.rp-form-group')).text(message)
                    self.isSubmit = false;
                    self.resetUserInfo();
                    Util.ajaxFailMessenger(null, type);
                });
        }
    });

    return ModalEditUserInfo;
})
