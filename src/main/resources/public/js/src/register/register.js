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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Components = require('components');
    var Util = require('util');
    var App = require('app');
    var Service = require('memberService');
    var Main = require('mainview');
    var Localization = require('localization');
    var urls = require('dataUrlResolver');
    var UserModel = require('model/UserModel');
    require('validate');

    var config = App.getInstance();

    var RegisterView = Backbone.View.extend({

        initialize: function (options) {
            this.$el = options.el;
            this.id = options.id.slice(5, options.id.length);
            this.context = options.context;

            this.setupAnchors();
        },

        setupAnchors: function () {
            this.$header = $("#topHeader", this.$el);
            this.$body = $("#mainContainer", this.$el);
            this.$side = $("#pageSidebar", this.$el);
        },

        sideBarTpl: 'tpl-register-side-bar',

        headerTpl: 'tpl-register-top',

        render: function (options) {
            this.$side.html(Util.templates(this.sideBarTpl, {})).show();
            // Util.setupScrollTracker();
            this.$header.html(Util.templates(this.headerTpl)).show();
            this.footerView = new Main.Footer().render();
            this.contentView = new ContentView({
                el: this.$body,
                id: this.id,
                context: this.context
            }).render(options);
            return this;
        },
        
        destroy: function(){
            this.contentView.destroy();
            this.$header.off().empty().hide();
            this.$side.off().empty().hide();
            this.footerView.destroy();
            this.$el.off();
            delete this;
        }
        
    });
    
   var ContentView = Backbone.View.extend({
       
        initialize: function (options) {
            this.$el = options.el;
            this.id = options.id;
            this.context = options.context;
            this.user = new UserModel();
        },
        
        bodyTpl: 'tpl-register-body',
        headerTpl: 'tpl-register-header',
        messagesTpl: 'tpl-register-messages',
        
        render: function () {
            this.$el.html(Util.templates(this.bodyTpl));
            this.$header = $("#contentHeader", this.$el);
            this.$header.html(Util.templates(this.headerTpl));
            this.$container = $("#contentBody", this.$el);
            this.getViewForPage();
            return this;
        },
        
        renderForm: function(options){
            this.body = new registerForm({
                container: this.$container,
                id: this.id,
                email: options.email,
                context: this.context
            }).render();
        },
        
        expiredMessage: function(e){
            e && e.preventDefault();
            this.$container.append(Util.templates(this.messagesTpl, {type: 'expired'}));
        },

       goLogin: function(e, that){
           e && _.isFunction(e.preventDefault) && e.preventDefault();
           var self = (that) ? that : this;
           self.context.destroyViews();
           self.user.isAuth()
               .done(function(){
                   self.user.logout();
               })
               .fail(function(){
                   config.router.navigate('#login', {trigger: true});
               });
           // Ui.ui.showLandingPage();
           // config.fullUser.showLoginView();
           // Ui.ui.showLogin();
       },
        
        getViewForPage: function () {
            var self = this;
            Service.validateRegisterBid(this.id)
                .done(function(data){
                    if(data.isActive){
                        self.renderForm(data);
                    }
                    else {
                        self.expiredMessage();
                        _.delay(self.goLogin, 3000, null, self);
                    }
                })
                .fail(function(error){
                    Util.ajaxFailMessenger(error, 'validateRegisterBid');
                });
        },
        
        destroy: function () {
            if(this.body){                
                this.body.destroy();
            }
            this.$el && this.$el.off().empty();
        }
    });
    
    var registerForm = Components.BaseView.extend({
        
        initialize: function(options){
            this.$container = options.container;
            this.id = options.id;
            this.email = options.email;
            this.context = options.context;
            this.errorClass = 'has-error';
            this.user = new UserModel();
        },
        
        registerTmpl: 'tpl-register-form',
        messagesTpl: 'tpl-register-messages',
        
        render: function () {
            this.$container.empty().append(this.$el.html(Util.templates(this.registerTmpl, { email: this.email})));
            this.setupValidation();
            this.setupAnchors();
            return this;
        },
        
        events: {
            'click #go-login': 'goLogin',
            'click #cancelForm': 'resetForm',
            'click #showPassword': 'togglePassword'
        },
        
        goLogin: function(e, that){
            e && _.isFunction(e.preventDefault) && e.preventDefault();
            var self = (that) ? that : this;
            self.context.destroyViews();
            self.user.isAuth()
                .done(function(){
                    self.user.logout();
                })
                .fail(function(){
                    config.router.navigate('#login', {trigger: true});
                });
            // Ui.ui.showLandingPage();
            // config.fullUser.showLoginView();
            // Ui.ui.showLogin();
        },
        
        setupValidation: function(){
            var self = this;
            $.validator.setDefaults({
                debug: true,
                success: "valid"
            });
            this.validator = $("#registerUser").validate({
                errorClass: this.errorClass,
                label: $('div.form-group'),
                rules: {
                    username: {
                        required: true,
                        rangelength: config.forms.nameRange,
                        remote: this.remoteValidation(),
                        symbols: /^[0-9a-zA-Z-_]+$/
                    },
                    fullName: {
                        required: true,
                        rangelength: config.forms.fullNameRange,
                        symbols: /^[0-9a-zA-Zа-яА-Я-_. ]+$/
                    },
                    email: {
                        required: true,
                        email: true,
                        remote: this.remoteValidation()
                    },
                    password: {
                        required: true,
                        rangelength: config.forms.passwordRange
                    },
                    confirmPassword: {
                        required: true,
                        equalTo: "#password",                   
                        rangelength: config.forms.passwordRange     
                    }
                },
                messages: {
                    username: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.loginSize,
                        remote: Localization.validation.registeredLogin,
                        symbols: Localization.validation.projectNameRegex
                    },
                    fullName: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.fullNameSize,
                        symbols: Localization.validation.fullNameRegex
                    },
                    email: {
                        required: Localization.validation.requiredDefault,
                        email: Localization.validation.incorrectEmail,
                        remote: Localization.validation.registeredEmail
                    },
                    password: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.passwordSize
                    },
                    confirmPassword: {
                        required: Localization.validation.requiredDefault,
                        rangelength: Localization.validation.passwordSize,
                        equalTo: Localization.validation.confirmPassword
                    }
                },
                submitHandler: function() {
                    self.registerMember();
                },
                errorPlacement: function(error, element) {
                    error.appendTo($('.help-inline', element.parent()));
                },
                highlight: function(element, errorClass) {
                    $(element).closest('div.rp-form-group').addClass(errorClass);
                },
                unhighlight: function(element, errorClass){
                    $(element).closest('div.rp-form-group').removeClass(errorClass);
                }
            });            
        },
        
        togglePassword: function(e){
            var el = $(e.target);
            if(el.prop('checked')){
                this.$password.add(this.$confirm).attr('type', 'text');
            }
            else {
                this.$password.add(this.$confirm).attr('type', 'password');
            }
        },
        
        setupAnchors: function(){
            this.$password = $('#password',this.$el);
            this.$confirm = $('#confirmPassword', this.$el);
        },
        
        remoteValidation: function(){
            return {
                type: "GET",
                url: urls.userInfoValidation(),
                data: {},
                dataFilter: function (response) {
                    var data = JSON.parse(response);
                    return !data.is;
                }
            }    
        }, 
        
        getData: function(){
            var login = $('#username').val(),
                email = $('#email').val(),
                fullName = $('#fullName').val(),
                password = $('#password').val();
            return {
                login: login,
                email: email,
                full_name: fullName,
                password: password
            }
        },

        showSuccess: function(){
            this.$el.hide();
            this.$container.append(Util.templates(this.messagesTpl, {type: 'success'}));
        },
        
        registerMember: function(){
            var data = this.getData(),
                self = this;
            if(data){                
                Service.registerUser(data, this.id)
                    .done(function (data) {
                        self.showSuccess();
                        Util.ajaxSuccessMessenger('registerMember');                        
                        _.delay(self.goLogin, 3000, null, self);
                    })
                    .fail(function(error){
                        Util.ajaxFailMessenger(error, 'registerMember');
                    });
            }
        },
        
        resetForm: function(e){
            e.preventDefault();
            $('#registerUser', this.$el)[0].reset();
            $('div.form-group', this.$el).removeClass(this.errorClass);            
            this.validator.resetForm();            
        }
        
    });
    
    return {
        RegisterView: RegisterView
    };

});