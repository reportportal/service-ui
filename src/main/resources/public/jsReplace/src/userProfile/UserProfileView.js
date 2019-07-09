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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Components = require('core/components');
    var Service = require('coreService');
    var Localization = require('localization');
    var ModalChangePassword = require('modals/modalChangePassword');
    var ModalRegenerateUUID = require('modals/modalRegenerateUUID');
    var ModalEditUserInfo = require('modals/modalEditUserInfo');
    var ModalConfirm = require('modals/modalConfirm');
    var RegenerateUUIDTooltipView = require('tooltips/RegenerateUUIDTooltipView');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var DropDownComponent = require('components/DropDownComponent');
    var SingletonAppStorage = require('storage/SingletonAppStorage');
    var ModalForceUpdate = require('modals/modalForceUpdate');
    var CallService = require('callService');
    var Urls = require('dataUrlResolver');
    var Util = require('util');
    var App = require('app');

    var config = App.getInstance();

    var UserProfileView = Components.BaseView.extend({
        tpl: 'tpl-user-profile-view',
        bindings: {
            '[data-js-user-name]': 'text: fullName',
            '[data-js-user-email]': 'text: email',
            '[data-js-user-login]': 'text: user_login',
            '[data-js-change-password]': 'attr: {disabled: isDemo}',
            '[data-js-upload-photo-form]': 'classes: {hide: isDemo}',
            '[data-js-edit-name]': 'classes: {hide: isDemo}',
            '[data-js-edit-email]': 'classes: {hide: isDemo}'
        },
        computeds: {
            isDemo: function () {
                return this.infoModel.get('isDemo');
            }
        },
        events: {
            'click [data-js-config-tab] li > a ': 'changeLangConfig',
            'click [data-js-change-password]': 'showChangePass',
            'click [data-js-edit-name]': 'onEditUserName',
            'click [data-js-edit-email]': 'onEditUserEmail',
            'click [data-js-select-photo]': 'onClickUploadPhoto',
            'change [data-js-select-photo]': 'previewPhoto',
            'submit [data-js-upload-photo-form]': 'uploadPhoto',
            'click [data-js-remove-photo]': 'removePhoto',
            'click [data-js-input-token]': 'selectToken',
            'click [data-js-update-token]': 'updateToken',
            'click [data-js-force-update]': 'forceUpdate'
        },
        initialize: function (options) {
            this.$el = options.body;
            this.context = options.context;
            this.model = config.userModel;
            this.infoModel = new SingletonRegistryInfoModel();
            this.apiTokenModel = new Backbone.Model({
                apiToken: null
            });
            this.listenTo(this.apiTokenModel, 'change:apiToken', this.setEditorValue);
            this.render();
            this.appStorage = new SingletonAppStorage();
            this.dropDown = new DropDownComponent({
                data: [
                    { name: '<span class="en-flag"></span>' + Localization.userProfile.english, value: 'en' },
                    { name: '<span class="ru-flag"></span>' + Localization.userProfile.russian, value: 'ru' }
                ],
                multiple: false,
                defaultValue: this.appStorage.get('appLanguage') || 'en'
            });
            $('[data-js-language-container]', this.$el).before(this.dropDown.$el);
            this.listenTo(this.dropDown, 'change', this.onChangeLanguage);
        },
        render: function () {
            this.model.ready.done(function () {
                var params = this.getParams();
                this.$el.html(Util.templates(this.tpl, params));
                this.setupAnchors();
                this.setApiToken();
                this.initEditor();
                this.loadRegenerateUUIDTooltip();
            }.bind(this));
            return this;
        },
        setApiToken: function () {
            var self = this;
            var apiToken = this.model.get('apiToken');
            if (apiToken) {
                self.apiTokenModel.set({ apiToken: apiToken.split('bearer ')[1] });
                self.$apiToken.val(apiToken.split('bearer ')[1]);
            } else {
                Service.getApiToken()
                    .done(function (data) {
                        self.model.set('apiToken', 'bearer ' + data.access_token);
                        self.apiTokenModel.set({ apiToken: data.access_token });
                        self.$apiToken.val(data.access_token);
                    })
                    .fail(function () {
                        self.generateApiToken();
                    });
            }
        },
        onChangeLanguage: function (lang) {
            config.trackingDispatcher.trackEventNumber(575);
            this.appStorage.set('appLanguage', lang);
            $('[data-js-disclamer]', this.$el).removeClass('hide');
        },
        getParams: function () {
            var params = this.model.toJSON();
            params.image = Util.updateImagePath(params.image);
            params.apiToken = this.apiTokenModel.get('apiToken');
            return params;
        },
        setupAnchors: function () {
            this.$editPhotoBlock = $('[data-js-edit-photo]', this.$el);
            this.$uploadPhotoBlock = $('[data-js-upload-block]', this.$el);
            this.$wrongImageMessage = $('[data-js-photo-error]', this.$el);
            this.$imgSelector = $('[data-js-select-photo]', this.$el);
            this.$profileAvatar = $('[data-js-user-img]', this.$el);
            this.$editor = $('[data-js-editor]', this.$el);
            this.$certificate = $('[data-js-certificate]', this.$el);
            this.$apiToken = $('[data-js-input-token]', this.$el);
        },
        selectToken: function (ev) {
            $(ev.target).select();
        },
        loadRegenerateUUIDTooltip: function () {
            var el = $('[data-js-update-token]', this.$el);
            Util.appendTooltip(function () {
                var tooltip = new RegenerateUUIDTooltipView({});
                return tooltip.$el.html();
            }, el, el);
        },
        updateToken: function () {
            config.trackingDispatcher.trackEventNumber(365);
            var self = this;
            (new ModalRegenerateUUID()).show().done(function () {
                return self.generateApiToken();
            });
        },
        forceUpdate: function (e) {
            e.preventDefault();
            var type = (this.model.get('account_type')).toLowerCase();
            if (type !== 'internal' && type !== 'ldap') {
                Service.externalForceUpdate(type)
                    .done(function (data) {
                        this.showForceUpdateModal(data);
                    }.bind(this))
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'forceUpdateGitHub');
                    });
            }
        },
        showForceUpdateModal: function (data) {
            var self = this,
                msg = data && data.msg ? data.msg : Localization.userProfile.infoSynchronized;
            (new ModalForceUpdate({ model: self.model, msg: msg })).show().done(function () {
                self.model.logout();
            });
        },
        showChangePass: function () {
            config.trackingDispatcher.trackEventNumber(360);
            var modal = new ModalChangePassword({
                model: this.model
            });
            modal.show();
        },
        onEditUserName: function () {
            config.trackingDispatcher.trackEventNumber(361);
            this.showEditUserInfo();
        },
        onEditUserEmail: function () {
            config.trackingDispatcher.trackEventNumber(362);
            this.showEditUserInfo();
        },
        showEditUserInfo: function () {
            var modal = new ModalEditUserInfo();
            modal.show();
        },
        onClickUploadPhoto: function () {
            config.trackingDispatcher.trackEventNumber(363);
        },
        generateApiToken: function () {
            var self = this;
            Service.generateApiToken()
                .done(function (data) {
                    self.model.set('apiToken', 'bearer ' + data.access_token);
                    self.apiTokenModel.set({ apiToken: data.access_token });
                    self.$apiToken.val(data.access_token);
                    Util.ajaxSuccessMessenger('updateUuid');
                })
                .fail(function (error) {
                    if (error.status !== 401) {
                        Util.ajaxFailMessenger(error, 'updateUuid');
                    }
                })
                .always(function () {
                    if (self.modalToken) {
                        self.modalToken.$el.modal('hide');
                    }
                });
        },
        previewPhoto: function (e) {
            var file = e.currentTarget.files[0],
                self = this;

            if (file) {
                if (this.validateFileExtension(file)) {
                    var reader = new FileReader();
                    var image = new Image();
                    reader.readAsDataURL(file);
                    reader.onload = function (_file) {
                        image.src = _file.target.result;
                        image.onload = function () {
                            if (self.validateImageSize(image, file)) {
                                self.$profileAvatar.attr('src', _file.target.result);
                                self.$editPhotoBlock.hide();
                                self.$uploadPhotoBlock.show();
                                self.$wrongImageMessage.hide().removeClass('shown');
                                // self.$profileAvatar.parent().removeClass('active');
                            } else {
                                self.$editPhotoBlock.show();
                                self.$uploadPhotoBlock.hide();
                                self.$wrongImageMessage.show().addClass('shown');
                            }
                        };
                    };
                } else {
                    this.$wrongImageMessage.show();
                }
            }
        },
        validateImageSize: function (image, file) {
            var width = image.width,
                height = image.height,
                size = ~~(file.size / 1024);
            return size <= 1000
                && width <= 300
                && height <= 500;
        },
        validateFileExtension: function (file) {
            return (/\.(gif|jpg|jpeg|png)$/i).test(file.name);
        },
        uploadPhoto: function (e) {
            var formData = new FormData();
            formData.append('file', this.$imgSelector[0].files[0]);

            var xhr = new XMLHttpRequest();
            var self = this;
            var srcPhoto = '';

            xhr.onreadystatechange = function () {
                self.$editPhotoBlock.show();
                self.$uploadPhotoBlock.hide();
                if (xhr.readyState === 4 && xhr.status === 200) {
                    srcPhoto = self.$profileAvatar.attr('src');
                    $('#profileImage').attr('src', srcPhoto);
                    config.userModel.set('photo_loaded', true);
                    self.$profileAvatar.parent().addClass('active');
                    self.$imgSelector.wrap('<form></form>').parent().trigger('reset').children().unwrap('<form></form>');
                    Util.setProfileUrl();
                    Util.ajaxSuccessMessenger('submitUpload');
                    // config.trackingDispatcher.profilePhotoUploaded();
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    Util.ajaxFailMessenger(null, 'submitUpload');
                }
            };
            xhr.open('POST', Util.updateImagePath(Urls.uploadPhoto()), true);
            xhr.send(formData);
            e.preventDefault();
        },
        removePhoto: function (e) {
            config.trackingDispatcher.trackEventNumber(364);
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteImage,
                bodyText: Localization.dialog.deleteImage,
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete,
                confirmFunction: function () {
                    config.trackingDispatcher.trackEventNumber(372);
                    return CallService.call('DELETE', Urls.uploadPhoto()).done(function () {
                        config.userModel.set('photo_loaded', false);
                        Util.setProfileUrl();

                        $('#profileImage').attr('src', config.userModel.get('image'));
                        self.$profileAvatar.attr('src', config.userModel.get('image'));
                        self.$profileAvatar.parent().removeClass('active');
                        self.$wrongImageMessage.hide().removeClass('shown');
                        Util.ajaxSuccessMessenger('deletePhoto');
                    }).fail(function (error) {
                        Util.ajaxFailMessenger(error, 'deletePhoto');
                    });
                }
            });
            $('[data-js-close]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(370);
            });
            $('[data-js-cancel]', modal.$el).on('click', function () {
                config.trackingDispatcher.trackEventNumber(371);
            });
            modal.show();
        },
        changeLangConfig: function (e) {
            config.trackingDispatcher.trackEventNumber(366);
            e.preventDefault();
            var el = $(e.target);
            if (!el.parent().hasClass('active')) {
                var elem = el.attr('href') || el.find('a').attr('href');
                this.lang = _.last(elem.split('#'));
                $('li', el.closest('ul')).removeClass('active');
                el.parent().addClass('active');
                this.setEditorValue();

                var action = this.lang === 'testng' ? 'show' : 'hide';
                this.$certificate[action]();
            }
        },
        initEditor: function () {
            this.setEditorValue();
        },
        setEditorValue: function () {
            if (this.$editor) {
                var value;
                // var oldClientComment = Localization.userProfile.oldClientComment;

                switch (this.lang) {
                case 'ruby':
                    value =
                            '<h1>' + Localization.userProfile.rubyConfigTitle + '</h1>' +
                            '<br>' +
                            '<div class="options">' +
                                // '<p>username: ' + this.user.get('name') + '</p>' +
                            '<p>uuid: ' + this.apiTokenModel.get('apiToken') + '</p>' +
                            '<p>endpoint: ' + document.location.origin + '/api/v1' + '</p>' +
                            '<p>project: ' + this.model.appModel.get('projectId') + '</p>' +
                            '<p>launch: ' + this.model.get('name') + '_TEST_EXAMPLE</p>' +
                            '<p>tags:  [tag1, tag2]</p>' +
                            '</div>';
                    break;
                case 'soap':
                    value =
                            '<h1>' + Localization.userProfile.soapConfigTitle + '</h1>' +
                            '<br>' +
                            '<div class="options">' +
                                // '<p>rp.username = ' + this.model.get('name') + '</p>' +
                            '<p>rp.uuid = ' + this.apiTokenModel.get('apiToken') + '</p>' +
                            '<p>rp.endpoint = ' + document.location.origin + '</p>' +
                            '<br>' +
                            '<p>rp.launch = ' + this.model.get('name') + '_TEST_EXAMPLE</p>' +
                            '<p>rp.project = ' + this.model.appModel.get('projectId') + '</p>' +
                            '<p>rp.tags = TAG1;TAG2</p>' +
                            '<p>rp.description = My awesome launch</p>' +
                            '</div>';
                    break;
                case '.net':
                    value =
                            '<h1>' + Localization.userProfile.dotnetConfigTitle + '</h1>';
                    break;
                case 'nodeJS':
                    value =
                        '<h1>' + Localization.userProfile.nodeJSConfigTitle +
                        ' <a href="https://github.com/reportportal/client-javascript">' + Localization.userProfile.nodeJSConfigLink + '</a></h1>' +
                        '<h1>' + Localization.userProfile.nodeJSConfigExample + '</h1>' +
                        '<br>' +
                        '<div class="options">' +
                        '<p>uuid: ' + this.apiTokenModel.get('apiToken') + '</p>' +
                        '<p>endpoint: ' + document.location.origin + '/api/v1</p>' +
                        '<p>launch: ' + this.model.get('name') + '_TEST_EXAMPLE</p>' +
                        '<p>project: ' + this.model.appModel.get('projectId') + '</p>' +
                        '</div>';
                    break;
                default:
                    value =
                            '<h1>' + Localization.userProfile.defaultConfigTitle + '</h1>' +
                            '<h1>' + Localization.userProfile.required + '</h1>' +
                            '<div class="options">' +
                            '<p>rp.endpoint = ' + document.location.origin + '</p>' +
                                // '<p>rp.username = ' + this.model.get('name') + '</p>' +
                            '<p>rp.uuid = ' + this.apiTokenModel.get('apiToken') + '</p>' +
                            '<p>rp.launch = ' + this.model.get('name') + '_TEST_EXAMPLE</p>' +
                            '<p>rp.project = ' + this.model.appModel.get('projectId') + '</p>' +
                            '</div>' +
                            '<h1>' + Localization.userProfile.notRequired + '</h1>' +
                            '<div class="options">' +
                            '<p>rp.enable = true</p>' +
                            '<p>rp.description = My awesome launch</p>' +
                            '<p>rp.tags = TAG1;TAG2</p>' +
                            '<p>rp.convertimage = true</p>' +
                            '<p>rp.mode = DEFAULT</p>' +
                            '<p>rp.skipped.issue = true</p>' +
                            '<p>rp.batch.size.logs = 20</p>' +
                            '<p>rp.keystore.resource = &lt;PATH_TO_YOUR_KEYSTORE&gt;</p>' +
                            '<p>rp.keystore.password = &lt;PASSWORD_OF_YOUR_KEYSTORE&gt;</p>' +
                            '</div>';
                    break;
                }
                this.$editor.html(value);
            }
        },
        onDestroy: function () {
            this.dropDown && this.dropDown.destroy();
            this.$el.html('');
        }
    });

    return UserProfileView;
});
