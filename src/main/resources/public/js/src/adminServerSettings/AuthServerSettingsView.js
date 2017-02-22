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
    var AdminService = require('adminService');
    var AuthServerSettingsModel = require('adminServerSettings/AuthServerSettingsModel');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');

    var config = App.getInstance();

    var AuthServerSettingsView = Epoxy.View.extend({

        template: 'tpl-auth-server-settings',
        orgTpl: 'tpl-auth-server-organizations',

        bindings: {
            //'[data-js-guest-enable]': 'checked: enableGuestAccount',
            '[data-js-github-enable]': 'checked: gitHubAuthEnabled',
            '[data-js-github-enable-mobile]': 'html: getGitHubAuthState',
            '[data-js-github-config]': 'classes: {hide: not(gitHubAuthEnabled)}',
            '[data-js-client-id]': 'value: clientId',
            '[data-js-client-secret]': 'value: clientSecret',
            '[data-js-onganizations]': 'updateOrganizations: organizations'
        },

        computeds: {
            getGitHubAuthState: {
                deps: ['gitHubAuthEnabled'],
                get: function(gitHubAuthEnabled) {
                    if (gitHubAuthEnabled) {
                        return 'ON';
                    }
                    return 'OFF';
                }
            },
            showAddOrg: {
                deps: ['organizations'],
                get: function(organizations){
                    var orgs = this.model.getOrganizations();
                    return (orgs && !_.isEmpty(orgs)) ? true : false;
                }
            }
        },

        bindingHandlers: {
            updateOrganizations: {
                set: function($el, val){
                    var orgs = this.view.model.getOrganizations();
                    $el.empty();
                    _.each(orgs, function(item){
                        $el.append(Util.templates(this.view.orgTpl, {name: item}));
                    }, this);
                }
            }
        },

        events: {
            'click [data-js-add-org-btn]': 'showAddOrganization',
            'click [data-js-delete-org]': 'confirmDeleteOrg',
            'click [data-js-remove-add-new-org]': 'hideAddOrganization',
            'click [data-js-submit-auth-settings]': 'submitAuthSettings'
        },

        initialize: function(options){
            this.model = new AuthServerSettingsModel();
            this.getAuthSettings();
        },

        render: function(){
            this.$el.html(Util.templates(this.template, {}));
            this.setupAnchors();
            this.bindValidators();
            this.applyBindings();
        },

        setupAnchors: function(){
            this.$addOrg = $('[data-js-add-org-btn]', this.$el);
            this.$addOrgForm = $('[data-js-add-org-form]', this.$el);
            this.$addOrgField = $('[data-js-new-org]', this.$el);
            this.$clientId = $('[data-js-client-id]', this.$el);
            this.$clientSecret = $('[data-js-client-secret]', this.$el);
        },

        bindValidators: function(){
            Util.hintValidator(this.$clientId, [
                {
                    validator: 'required'
                }
            ]);
            Util.hintValidator(this.$clientSecret, [
                {
                    validator: 'required'
                }
            ]);
        },

        updateModel: function(settings){
            this.model.set({
                clientId: settings.clientId,
                clientSecret: settings.clientSecret
            });
            this.model.setOrganizations(settings.restrictions && settings.restrictions.organizations ? settings.restrictions.organizations.split(',') : []);
        },

        showAddOrganization: function(e){
            e.preventDefault();
            this.$addOrg.addClass('hide');
            this.$addOrgForm.removeClass('hide');
        },

        hideAddOrganization: function(e){
            e && e.preventDefault();
            this.$addOrg.removeClass('hide');
            this.$addOrgForm.addClass('hide');
            this.$addOrgField.val('');
            this.$addOrgField.closest('[data-js-add-org-row]').removeClass('validate-error');
        },

        confirmDeleteOrg: function(e){
            e.preventDefault();
            var $el = $(e.currentTarget),
                field = $('[data-js-org-name]', $el.closest('[data-js-org-row]')),
                name = field.data('js-org-name');

            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteOrg,
                confirmText: Util.replaceTemplate(Localization.dialog.deleteOrg, name),
                bodyText: Util.replaceTemplate(Localization.dialog.msgDeleteOrg),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            });
            modal.show()
                .done(function() {
                    this.deleteOrganization(name);
                }.bind(this));
        },

        deleteOrganization: function(name){
            var orgs = _.without(this.model.getOrganizations(), name);
            this.model.setOrganizations(orgs);
            this.updateAuthSettings('delete_org');
        },

        deleteAuthSettings: function(){
            AdminService.deleteAuthSettings()
                .done(function(data){
                    this.updateModel(this.model.defaults);
                    Util.ajaxSuccessMessenger('deleteOAuthSettings');
                }.bind(this))
                .fail(function(error){
                    Util.ajaxFailMessenger(error, 'deleteOAuthSettings');
                });
        },

        updateAuthSettings: function(type){
            var orgs = this.model.getOrganizations(),
                authData = {};
            if(this.$addOrgField.val()){
                orgs.push(this.$addOrgField.val());
            }
            authData.restrictions = {organizations: orgs.join(',')};
            authData.clientId = this.model.get('clientId');
            authData.clientSecret = this.model.get('clientSecret');

            AdminService.setAuthSettings(authData)
                .done(function(data){
                    this.updateModel(data.github)
                    this.hideAddOrganization();
                    if(type == 'delete_org'){
                        Util.ajaxSuccessMessenger('deleteOrgOAuthSettings');
                    }
                    else {
                        Util.ajaxSuccessMessenger('setOAuthSettings');
                    }
                }.bind(this))
                .fail(function(error){
                    Util.ajaxFailMessenger(error, 'setOAuthSettings');
                });
        },

        submitAuthSettings: function(e){
            e.preventDefault();
            var gitHubAuthEnabled = this.model.get('gitHubAuthEnabled');
            if(gitHubAuthEnabled){
                if(this.validate()) {
                    this.updateAuthSettings();
                }
            }
            else {
                this.deleteAuthSettings();
            }
        },

        validate: function(){
            this.$clientId.trigger('validate');
            this.$clientSecret.trigger('validate');
            return !(this.$clientId.data('validate-error') || this.$clientSecret.data('validate-error'));
        },

        getAuthSettings: function () {
            AdminService.getAuthSettings()
                .done(function (data) {
                    this.model.set('gitHubAuthEnabled', true);
                    this.updateModel(data);
                }.bind(this))
                .fail(function(error){
                    this.model.set('gitHubAuthEnabled', false);
                }.bind(this))
                .always(function(){
                    this.render();
                }.bind(this));
        },

        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.remove();
            delete this;
        }
    });

    return AuthServerSettingsView;

});