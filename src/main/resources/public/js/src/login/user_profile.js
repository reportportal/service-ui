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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Components = require('core/components');
    var Util = require('util');
    var App = require('app');
    var Service = require('coreService');
    var Localization = require('localization');
    var urls = require('dataUrlResolver');

    // require('ace');
    // require('mode-properties');
    // require('aceProperties');
    require('bootstrap');

    var config = App.getInstance();

    var ContentView = Backbone.View.extend({

        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.vent = _.extend({}, Backbone.Events);
        },

        render: function () {
            this.createHeader();
            this.createBody();
            return this;
        },

        createHeader: function (model) {
            if (this.$header) {
                this.$header.destroy();
            }
            this.$header = new Header({
                header: this.context.getMainView().$header,
                vent: this.vent,
                context: this.context
            }).render();
        },

        createBody: function (model) {
            if (this.$body) {
                this.$body.destroy();
            }
            //do not call render method on body - since it is async data dependant and will do it after fetch
            this.$body = new UserPageView({
                body: this.context.getMainView().$body,
                vent: this.vent,
                context: this.context
            });
        },

        destroy: function () {
            this.$header.destroy();
            this.$body.destroy();
            this.undelegateEvents();
            this.unbind();
            delete this;
        }
    });

    var Header = Components.BaseView.extend({

        initialize: function (options) {
            this.$el = options.header;
            this.vent = options.vent;
            this.context = options.context;
        },

        tpl: 'tpl-user-page-header',

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            return this;
        },

        clearActives: function () {
            $("#main_content #topHeader").find(".active").removeClass('active');
        },

        destroy: function () {
            this.clearActives();
            this.undelegateEvents();
            delete this;
        }
    });

    var UserPageView = Components.BaseView.extend({

        initialize: function (options) {
            this.$el = options.body;
            this.context = options.context;
            this.user = config.userModel;
            this.model = new Backbone.Model({
               apiToken: null,
            });
            this.listenTo(this.model, 'change:apiToken', this.setEditorValue);
            var self = this;
            Service.getApiToken()
                .done(function(data) {
                    self.model.set({apiToken: data.access_token});
                })
                .fail(function() {
                    self.generateApiToken();
                });
            this.render();
        },

        tpl: 'tpl-user-page-view',
        tplUuid: 'tpl-uuid-tooltip',
        tplRegenerate: 'tpl-uuid-regenerate',
        tplInfo: 'tpl-user-edit-info',
        tplPass: 'tpl-user-change-pass',
        tplUuidWarning: 'tpl-uuid-warning',

        bindings: {
            '[data-js-block-is-token]': 'classes: {hide: not(apiToken)}',
            '[data-js-input-token]': 'value: apiToken',
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
                                self.$uploadSelect.hide();
                                self.$uploadSubmit.show();
                                self.$wrongImageMessage.hide().removeClass('shown');
                                self.$profileAvatar.parent().removeClass('active');
                            } else {
                                self.$uploadSelect.show();
                                self.$uploadSubmit.hide();
                                self.$wrongImageMessage.show().addClass('shown');
                            }
                        }
                    }
                } else {
                    this.$wrongImageMessage.show().addClass('shown');
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
            return (/\.(gif|jpg|jpeg|png)$/i).test(file.name)
        },

        submitUpload: function (e) {
            var formData = new FormData();
            formData.append('file', this.$imgSelector[0].files[0]);

            var xhr = new XMLHttpRequest();
            var self = this;
            var srcPhoto = '';

            xhr.onreadystatechange = function () {
                self.$uploadSelect.show();
                self.$uploadSubmit.hide();
                if (xhr.readyState === 4 && xhr.status === 200) {
                    srcPhoto = self.$profileAvatar.attr('src');
                    $("#profileImage").attr('src', srcPhoto);
                    config.userModel.set('photo_loaded', true);
                    self.$profileAvatar.parent().addClass('active');
                    self.$imgSelector.wrap('<form></form>').parent().trigger('reset').children().unwrap('<form></form>');
                    Util.setProfileUrl();
                    Util.ajaxSuccessMessenger('submitUpload');
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    Util.ajaxFailMessenger(null, 'submitUpload');
                }
            };
            xhr.open('POST', Util.updateImagePath(urls.uploadPhoto()), true);
            xhr.send(formData);
            e.preventDefault();
        },

        deleteImage: function () {
            var self = this;
            if (!this.deleteDialog) {

                this.deleteDialog = Util.getDialog({
                    name: "tpl-delete-dialog",
                    data: {
                        message: 'deleteImage'
                    }
                });
                this.deleteDialog.on('click', ".rp-btn-danger", function () {
                    Service.deletePhoto()
                        .done(function () {
                            config.userModel.set('photo_loaded', false);
                            Util.setProfileUrl();
                            $("#profileImage").attr('src', config.userModel.get('image'));
                            self.$profileAvatar.attr('src', config.userModel.get('image'));
                            self.$profileAvatar.parent().removeClass('active');
                            self.$wrongImageMessage.hide().removeClass('shown');

                            Util.ajaxSuccessMessenger("deletePhoto");
                            self.deleteDialog.modal("hide");
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, "deletePhoto");
                            self.deleteDialog.modal("hide");
                        });
                }).on('hidden.bs.modal', function () {
                    $(this).data('modal', null);
                    self.deleteDialog.off().remove();
                    self.deleteDialog = null;
                });
            }
            this.deleteDialog.modal("show");
        },

        events: {
            'click a.project': 'changeProject',
            'click #user_uuid': 'userTokenSelectAll',
            'click #update-uuid': 'updateUuid',
            'click ul.config-pills > li': 'changeLang',
            'change #imgSelector': 'previewPhoto',
            'submit #fileUploadForm': 'submitUpload',
            'click #remove-image': 'deleteImage',

            'click #editInfo:not(.disabled)': 'showEditInfo',
            'click #cancel_info': 'hideEditInfo',
            'click #submit_info:not(.disabled)': 'submitEditInfo',

            'click #changePassword:not(.disabled)': 'showChangePass',
            'click #cancel_change': 'hideChangePass',
            'click #submit_change:not(.disabled)': 'submitChangePass',

            'change #showPass': 'showPass',
            'validation::change #fullName': 'validateInfo',
            'validation::change #email': 'validateInfo',
            'validation::change #changePass': 'validatePass'
        },

        showPass: function (e) {
            var action = $(e.currentTarget).is(':checked') ? 'text' : 'password';
            $("#changePass  .form-control", this.$el).attr('type', action);
        },

        showChangePass: function () {
            this.modifyUpdateButtons('disable');
            this.modifyStaticInfo('hide');
            this.$staticInfo.after(Util.templates(this.tplPass, config.userModel.toJSON()));
            this.$passEditor = $("#changePass", this.$el);
            this.$confirmGroup = $("#confirmGroup", this.$el);
            this.$originalPass = $("#originalPass", this.$el);
            this.$newPass = $("#newPass", this.$passEditor);
            this.$submitChange = $("#submit_change", this.$passEditor);

            Util.confirmValidator({holder: this.$confirmGroup, min: 4, max: 25});
            // had to do this nightmare - since pass can contain white space at the end
            Util.configRegexValidation(this.$originalPass, 'originalPass');
        },

        hideChangePass: function () {
            this.$passEditor.hide().remove();
            this.$passEditor = null;
            this.modifyUpdateButtons();
            this.modifyStaticInfo();
        },

        submitChangePass: function () {
            var data = {
                oldPassword: this.$originalPass.val(),
                newPassword: this.$newPass.val()
            };
            var self = this;
            Service.submitPassChange(data)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitChangePass');
                    self.hideChangePass();
                })
                .fail(function (error) {
                    var type = error.responseText.indexOf('40010') > -1 ? 'submitChangePassInvalid' : 'submitChangePass';
                    if (type === 'submitChangePassInvalid') {
                        self.$originalPass.focus();
                        self.$originalPass.parent().addClass('has-error');
                    }
                    Util.ajaxFailMessenger(null, type);
                });
        },

        showEditInfo: function () {
            this.modifyUpdateButtons('disable');
            this.modifyStaticInfo('hide');
            this.$staticInfo.after(Util.templates(this.tplInfo, config.userModel.toJSON()));
            this.$infoEditor = $("#infoEditor", this.$el);
            this.$fullName = $("#fullName", this.$infoEditor);
            this.$email = $("#email", this.$infoEditor);
            this.$submitInfo = $("#submit_info", this.$infoEditor);

            Util.bootValidator(this.$email, [{
                    validator: 'matchRegex',
                    type: 'emailMatchRegex',
                    pattern: config.patterns.email
                },
                {
                    validator: 'remoteEmail',
                    remote: true,
                    message: Localization.validation.registeredEmail,
                    type: 'remoteEmail'
                },
                {validator: 'required'}]);
            Util.bootValidator(this.$fullName, [{
                validator: 'matchRegex',
                type: 'fullNameInfoRegex',
                pattern: config.patterns.fullName
            }, {validator: 'required'}]);
        },

        hideEditInfo: function () {
            this.$infoEditor.hide().remove();
            this.$infoEditor = null;
            this.modifyUpdateButtons();
            this.modifyStaticInfo();
        },

        submitEditInfo: function () {
            var data = {
                full_name: this.$fullName.val(),
                email: this.$email.val()
            };
            var self = this;
            var userImage = config.userModel.get('image');

            Service.submitProfileInfo(data)
                .done(function () {
                    Util.ajaxSuccessMessenger('submitProfileInfo');
                    self.user.set('fullName', data.full_name);
                    self.user.set('email', data.email);

                    if (!config.userModel.get('image')) {
                        config.userModel.set('image', userImage);
                    }
                    self.hideEditInfo();
                })
                .fail(function (error) {
                    var type = 'submitProfileInfo';
                    if (error.responseText.indexOf('4094') > -1) {
                        type = 'submitProfileInfoDuplication';
                    } else if (config.patterns.emailWrong.test(error.responseText)) {
                        type = 'submitProfileInfoWrongData';
                    }
                    if (type !== 'submitProfileInfoWrongData') {
                        self.$email.focus();
                        self.$email.parent().addClass('has-error');
                    }
                    Util.ajaxFailMessenger(null, type);
                });
        },

        validateInfo: function () {
            var action = (this.$email.data('valid') && this.$fullName.data('valid')
            && (this.$fullName.val() !== this.user.get('fullName') || this.$email.val() !== this.user.get('email')))
                ? 'remove' : 'add';
            this.$submitInfo[action + 'Class']('disabled');
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
            this.$submitChange[action + "Class"]('disabled');
        },

        userTokenSelectAll: function (ev) {
            $(ev.target).select();
        },

        modifyUpdateButtons: function (disable) {
            var action = disable ? 'add' : 'remove';
            $(".btn", this.$updateButtons)[action + 'Class']('disabled');
        },

        modifyStaticInfo: function (hide) {
            var action = hide ? 'hide' : 'show';
            this.$staticInfo[action]();
            if (!hide) {
                $(".profile_mail:first").text(this.user.get('email'));
                $(".profile_full_name:first").text(this.user.get('fullName'));
            }
        },

        updateUuid: function () {
            this.modal = null;
            this.modal = new Components.DialogWithCallBack({
                headerTxt: 'regenerateUUID',
                actionTxt: 'ok',
                actionStatus: true,
                contentTpl: this.tplUuidWarning,
                callback: function () {
                    this.modal.$loader.show();
                    this.generateApiToken();
                }.bind(this)
            }).render();
        },
        generateApiToken: function() {
            var self = this;
            Service.generateApiToken()
                .done(function (data) {
                    self.model.set({apiToken: data.access_token})
                    Util.ajaxSuccessMessenger('updateUuid');
                })
                .fail(function (error) {
                    if (error.status !== 401) {
                        Util.ajaxFailMessenger(error, 'updateUuid');
                    }
                })
                .always(function () {
                    if(self.modal) {
                        self.modal.$el.modal('hide');
                    }
                });
        },

        changeProject: function (e) {
            e.preventDefault();
        },

        // getParams: function () {
        //     return {
        //         defaultProject: this.user.get('defaultProject'),
        //         projects: this.user.get('projects'),
        //         projectsNumber: _.size(this.user.get('projects')),
        //         label: this.user.get('label'),
        //         userId: this.user.get('name').replace('_', ' '),
        //         userLogin: this.user.get('name'),
        //         email: this.user.get('email'),
        //         fullName: this.user.get('fullName'),
        //         account_type: this.user.get('account_type'),
        //         userImage: this.user.get('image')
        //     };
        // },

        render: function () {
            var self = this;

            this.user.ready.done(function () {

                var params = config.userModel.toJSON();
                params['certificateUrl'] = config.certificateUrl;

                params.image = Util.updateImagePath(params.image);

                self.$el.html(Util.templates(self.tpl, params));

                self.$el.tooltip({selector: '[data-toggle="tooltip"]', html: true});
                self.$staticInfo = $("#staticInfo", self.$el);
                self.$updateButtons = $("#updateButtons", self.$el);
                self.$uploadSelect = $(".btn-file:first", self.$el);
                self.$uploadSubmit = $("#submitPhoto", self.$el);
                self.$wrongImageMessage = $("#wrongImageMessage", self.$el);
                self.$imgSelector = $("#imgSelector", self.$el);
                self.$profileAvatar = $("#userProfileAvatar", self.$el);
                self.$certificate = $("#certificate", self.$el);

                self.initEditor(params);
            });

            this.resetScrollTop();

            return this;
        },

        resetScrollTop: function () {
            // TODO
        },

        initEditor: function (config) {
            this.$editor = $('#user-config');
            this.$editor.parent().height(470);
            this.setEditorValue();
        },

        setEditorValue: function () {
            if (this.$editor) {
                var value;
                var oldClientComment = Localization.userProfile.oldClientComment;

                switch (this.lang) {
                    case 'ruby':
                        value =
                            '<h1>COPY AND SAVE IT AS A REPORT_PORTAL.YML FILE</h1>' +
                             '<br>'+
                             '<div class="options">'+
                            // '<p>username: ' + this.user.get('name') + '</p>' +
                            '<p>password: ' + this.model.get('apiToken') + '</p>' +
                            '<p>endpoint: ' + document.location.origin + '/api/v1' + '</p>' +
                            '<p>project: ' + this.user.get('defaultProject') + '</p>' +
                            '<p>launch: ' + this.user.get('name') + '_TEST_EXAMPLE</p>' +
                            '<p>tags:  [tag1, tag2]</p>' +
                            '</div>'
                        break;
                    case 'soap':
                        value =
                            oldClientComment +
                            '<h1>SET THE FOLLOWS PROPERTIES INTO PROJECT PROPERTIES OR SET THEM TO SYSTEM VARIABLES</h1>' +
                             '<br>' +
                             '<div class="options">' +
                                // '<p>rp.username = ' + this.user.get('name') + '</p>' +
                                '<p>rp.uuid = ' + this.model.get('apiToken') + '</p>' +
                                '<p>rp.endpoint = ' + document.location.origin + '</p>' +
                                '<br>' +
                                '<p>rp.launch = ' + this.user.get('name') + '_TEST_EXAMPLE</p>' +
                                '<p>rp.project = ' + this.user.get('defaultProject') + '</p>' +
                                '<p>rp.tags = TAG1;TAG2</p>' +
                            '</div>';
                        break;
                    case '.net':
                        value =
                            '<h1>FOLLOW INSTALLER INSTRUCTIONS</h1>';
                        break;
                    default:
                        value =
                            oldClientComment +
                            '<h1>COPY AND SAVE IT AS A REPORTPORTAL.PROPERTIES FILE</h1>' +
                            '<h1>REQUIRED</h1>' +
                            '<div class="options">'+
                                '<p>rp.endpoint = ' + document.location.origin + '</p>' +
                                // '<p>rp.username = ' + this.user.get('name') + '</p>' +
                                '<p>rp.uuid = ' + this.model.get('apiToken') + '</p>' +
                                '<p>rp.launch = ' + this.user.get('name') + '_TEST_EXAMPLE</p>' +
                                '<p>rp.project = ' + this.user.get('defaultProject') + '</p>' +
                                '<p>rp.keystore.resource = reportportal-client-v2.jks</p>' +
                                '<p>rp.keystore.password = reportportal</p>' +
                            '</div>' +
                            '<h1>NOT REQUIRED</h1>' +
                             '<div class="options"'+
                                '<p>rp.enable = true</p>' +
                                '<p>rp.tags = TAG1;TAG2</p>' +
                                '<p>rp.convertimage = true</p>' +
                                '<p>rp.mode = DEFAULT</p>' +
                                '<p>rp.skipped.issue = true</p>' +
                                '<p>rp.batch.size.logs = 20</p>' +
                            '</div>';
                        break;
                }

                this.$editor.html(value);
                // this.editor.setValue(value, -1);
            }
        },

        changeLang: function (e) {
            e.preventDefault();
            var el = $(e.target);
            if (!el.parent().hasClass('active')) {
                var elem = el.attr("href") || el.find('a').attr('href');
                this.lang = _.last(elem.split('#'));
                el.closest('ul').children('li').removeClass('active');
                el.parent().addClass('active');
                this.setEditorValue();

                var action = this.lang === 'testng' ? 'show' : 'hide';
                this.$certificate[action]();
            }
        },

        destroy: function () {
            this.modal = null;
            this.undelegateEvents();
            this.$el.empty();
        }
    });

    return {
        ContentView: ContentView,
        UserPageView: UserPageView
    }
});
