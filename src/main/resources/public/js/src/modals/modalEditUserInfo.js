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
            'click [data-js-ok]': 'submitEditInfo',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel',
        },

        initialize: function() {
            this.userModel = config.userModel;
            this.model = new Backbone.Model({
                fullName: this.userModel.get('fullName'),
                email: this.userModel.get('email')
            });
            this.listenTo(this.model, 'change:fullName', this.onChangeName);
            this.listenTo(this.model, 'change:email', this.onChangeEmail);
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

        setupAnchors: function(){
            this.$fullName = $('[data-js-full-name]', this.$el);
            this.$email = $('[data-js-user-email]', this.$el);
            this.$submitInfo = $('[data-js-ok]', this.$el);
        },

        setupValidation: function(){
            Util.hintValidator(this.$email, [
                {
                    validator: 'matchRegex',
                    type: 'emailMatchRegex',
                    message: Localization.validation.submitProfileInfoEmail,
                    pattern: config.patterns.email
                },
                {validator: 'required'}
            ]);
            Util.hintValidator(this.$fullName, [
                {
                    validator: 'matchRegex',
                    type: 'fullNameInfoRegex',
                    pattern: config.patterns.fullName
                },
                {validator: 'required'}
            ]);
        },

        onClickCancel: function(){
            config.trackingDispatcher.trackEventNumber(376);
        },
        onChangeName: function(){
            config.trackingDispatcher.trackEventNumber(374);
        },
        onChangeEmail: function(){
            config.trackingDispatcher.trackEventNumber(375);
        },
        onClickClose: function(){
            config.trackingDispatcher.trackEventNumber(373);
        },
        submitEditInfo: function(){
            config.trackingDispatcher.trackEventNumber(377);
            $('input', this.$el).trigger('validate');
            if (!$('.validate-error', this.$el).length) {
                var data = {
                    full_name: this.model.get('fullName'),
                    email: this.model.get('email')
                };
                var self = this;
                this.showLoading();
                Service.submitProfileInfo(data)
                    .done(function () {
                        Util.ajaxSuccessMessenger('submitProfileInfo');
                        self.userModel.set({
                            fullName: self.model.get('fullName'),
                            email: self.model.get('email'),
                        });
                        // if (!config.userModel.get('image')) {
                        //     config.userModel.set('image', userImage);
                        // }
                        self.successClose();
                    })
                    .fail(function (error) {
                        self.hideLoading();
                        var type = 'submitProfileInfo',
                            message = '';
                        if (error.responseText.indexOf('4094') >= 0) {
                            type = 'submitProfileInfoDuplication';
                        } else if (config.patterns.emailWrong.test(error.responseText)) {
                            type = 'submitProfileInfoWrongData';
                        }
                        if (type !== 'submitProfileInfoWrongData') {
                            self.$email.focus();
                            self.$email.closest('label').addClass('validate-error');
                            message = Localization.validation.registeredEmail;
                        }
                        else {
                            message = Localization.failMessages.submitProfileInfoWrongData;
                        }
                        $('.help-line', self.$email.closest('.rp-form-group')).text(message);
                        Util.ajaxFailMessenger(null, type);
                    });
            }
        }
    });

    return ModalEditUserInfo;
})
