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
    var Util = require('util');
    var Components = require('components');
    var urls = require('dataUrlResolver');
    var App = require('app');
    var Localization = require('localization');
    var Service = require('coreService');
    var Helpers = require('helpers');
    var D3 = require('d3');
    var NVD3 = require('nvd3');
    var colorPickerCustomCfg = require('colorpickerConfig');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var DefectTypeModel = require('defectType/DefectTypeModel');
    var SingletonAppModel = require('model/SingletonAppModel');
    var DemoDataSettingsView = require('DemoDataSettingsView');

    require('colorpicker');

    var config = App.getInstance();

    var ContentView = Backbone.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.subContext = options.subContext;
        },
        render: function () {
            this.$header = new Header({
                header: this.context.getMainView().$header
            }).render();
            //do not call render method on body - since it is async data dependant and will do it after fetch
            this.$body = new Body({
                context: this.context,
                body: this.context.getMainView().$body,
                tab: this.subContext
            }).render();
            return this;
        },
        update: function (options) {
            this.$body.update(options.subContext);
        },
        destroy: function () {
            this.$header.destroy();
            this.$body.destroy();

            this.undelegateEvents();
            this.unbind();
            $('.select2-drop-active').remove();

            delete this;
        }
    });

    var Header = Components.BaseView.extend({
        tpl: 'tpl-projects-header',
        initialize: function (options) {
            this.$el = options.header;
        },
        render: function () {
            this.$el.html(Util.templates(this.tpl));
            return this;
        }
    });

    var Body = Components.BaseView.extend({
        initialize: function (options) {
            this.context = options.context;
            this.$el = options.body;
            this.tab = options.tab;
        },
        render: function () {
            this.projectSettings = new SettingsView({
                holder: this.$el,
                projectId: config.project.projectId,
                tab: this.tab
            }).render();
            return this;
        },
        update: function (tab) {
            this.tab = tab;
            this.projectSettings.update(this.tab);
        },
        destroy: function () {
            this.projectSettings && this.projectSettings.destroy();
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var ProjectSettings = Backbone.Model.extend({
        defaults: {
            interruptedJob: config.forSettings.interruptedJob[0].value,
            isAutoAnalyzerEnabled: true,
            keepLogs: config.forSettings.keepLogs[0].value,
            keepScreenshots: config.forSettings.keepScreenshots[0].value,
            projectSpecific: config.forSettings.projectSpecific[0].value
        },
        getProjectSettings: function () {
            var data = {
                interruptedJob: this.get('interruptedJob'),
                isAutoAnalyzerEnabled: this.get('isAutoAnalyzerEnabled'),
                keepLogs: this.get('keepLogs'),
                keepScreenshots: this.get('keepScreenshots'),
                projectSpecific: this.get('projectSpecific')
            };
            return {
                configuration: data
            };
        }
    });

    var NotificationsSettings = Backbone.Model.extend({
        defaults: {
            emailEnabled: false,
            fromAddress: 'reportportal@epam.com',
            emailCases: []
        },
        getProjectSettings: function (deletedRules) {
            var emailCases = JSON.parse(JSON.stringify(this.get('emailCases')));
            emailCases = $.grep(emailCases, function (value) {
                return $.inArray(value.id, deletedRules) == -1;
            });
            _.each(emailCases, function (elem) {
                delete elem.id;
            });

            var data = {
                emailEnabled: this.get('emailEnabled'),
                fromAddress: this.get('fromAddress'),
                emailCases: emailCases
            };

            return {
                configuration: data
            };
        }
    });

    var SettingsView = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.holder;
            this.adminPage = options.adminPage;
            this.projectId = options.projectId;
            this.tab = options.tab || "general";
            this.appModel = new SingletonAppModel();
        },
        tpl: 'tpl-project-settings-shell',
        render: function () {
            this.$el.html(Util.templates(this.tpl, {
                tab: this.tab,
                projectId: this.projectId,
                generateDemoDataAccess: Util.isInPrivilegedGroup() || Util.isPersonalProjectOwner(),
                adminPage: this.adminPage
            }));
            this.$generalHolder = $("#generalSettings", this.$el);
            this.$notificationsHolder = $("#notificationsSettings", this.$el);
            this.$btslHolder = $("#btsSettings", this.$el);
            this.$defect = $("#defectTypes", this.$el);
            this.$demoDataHolder = $("[data-js-demo-data]", this.$el);

            this[this.tab + "Render"]();

            return this;
        },
        update: function (tab, silent) {
            $('.users-typeahead.launches').select2('close');
            $('.users-typeahead.tags').select2('close');
            $('.users-typeahead.recipients').select2('close');
            this.tab = tab || "general";
            if (!silent) {
                $('[data-action=' + this.tab + ']', this.$el).tab('show');
            }
            this[this.tab + "Render"]();
        },
        generalRender: function () {
            if (!this.generalSettings) {
                this.generalSettings = new GeneralView({
                    holder: this.$generalHolder
                }).render();
            }
        },
        notificationsRender: function () {
            if (!this.notificationsView) {
                this.notificationsView = new NotificationsView({
                    holder: this.$notificationsHolder
                }).render();
            }
        },
        btsRender: function () {
            if (!this.btsView) {
                this.btsView = new BtsView({
                    holder: this.$btslHolder,
                    externalSystems: config.project.configuration.externalSystem,
                    settings: config.forSettings,
                    access: Util.isInPrivilegedGroup()
                }).render();
            }
        },
        defectRender: function () {
            var roles = config.userModel.get('projects');
            if (!this.defectView) {
                this.defectView = new DefectView({
                    holder: this.$defect,
                    settings: config.project,
                    roles: roles[this.appModel.get('projectId')],
                    userRole: config.userModel.get('userRole')
                }).render();
            }
        },
        demoDataRender: function(){
            if (!this.demoDataView) {
                this.demoDataView = new DemoDataSettingsView({
                    holder: this.$demoDataHolder
                }).render();
            }
        },
        events: {
            'click .tab.settings': 'renderTab'
        },
        renderTab: function (e) {
            var $el = $(e.currentTarget),
                tab = $el.data('action');
            config.router.navigate($el.attr('href'), {
                silent: true
            });
            this.update(tab, true);
        },
        destroy: function () {
            this.generalSettings && this.generalSettings.destroy();
            this.generalSettings = null;

            this.notificationsView && this.notificationsView.destroy();
            this.notificationsView = null;

            this.btsView && this.btsView.destroy();
            this.btsView = null;

            this.defectView && this.defectView.destroy();
            this.defectView = null;

            this.demoDataView && this.demoDataView.destroy();
            this.demoDataView = null;

            Backbone.Events.off(null, null, this);
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var GeneralView = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.holder;
            this.model = new ProjectSettings(config.project.configuration);
        },

        tpl: 'tpl-project-settings-general',

        render: function () {
            var params = _.merge(this.model.toJSON(), {
                edit: config.project && config.project.projectId,
                currentProject: config.project.projectId,
                access: config.userModel.hasPermissions(),
                settings: config.forSettings
            });
            this.$el.html(Util.templates(this.tpl, params));
            return this;
        },

        events: {
            'click #submit-settings': 'submitSettings',
            'click .dropdown-menu a': 'selectProp'
        },

        selectProp: function (e) {
            e.preventDefault();
            var link = $(e.target),
                btn = link.closest('.open').find('.dropdown-toggle'),
                val = (link.data('value')) ? link.data('value') : link.text(),
                id = btn.attr('id');
            if (id === 'isAutoAnalyzerEnabled') {
                val = (val === 'ON');
            }
            this.model.set(id, val);
            $('.select-value', btn).text(link.text());
        },

        clearFormErrors: function () {
            if ($('div.error-block', this.$el).is(':visible')) {
                $('.rp-form-group', this.$el).removeClass('has-error');
                $('div.error-block', this.$el).empty().hide();
            }
        },

        showFormErrors: function (el, message) {
            var cont = el.closest('.rp-form-group');
            cont.addClass('has-error');
            $('div.error-block', cont).empty().html(message).show();
        },

        hideFormsErrors: function (el) {
            var cont = el.closest('.rp-form-group');
            cont.removeClass('has-error');
            $('div.error-block', cont).empty().hide();
        },

        submitSettings: function (e) {
            var externalSystemData = this.model.getProjectSettings();
            this.clearFormErrors();
            Service.updateProject(externalSystemData)
                .done(function (response) {
                    _.merge(config.project.configuration, externalSystemData.configuration);
                    Util.ajaxSuccessMessenger('updateProjectSettings');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateProjectSettings');
                });
        },

        destroy: function () {
            $("body > #select2-drop-mask, body > .select2-sizer").remove();
            Components.RemovableView.prototype.destroy.call(this);
        }
    });

    var NotificationsView = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.holder;
            this.updateIds();
            this.model = new NotificationsSettings(config.project.configuration.emailConfiguration);
            this.users = [];
            this.isValidEmail = true;
        },
        emailCaseId: 0,
        tpl: 'tpl-project-settings-notifications',
        tplItem: 'tpl-project-settings-notifications-item',

        updateIds: function (data) {
            var conf = data || config.project.configuration.emailConfiguration.emailCases;
            for (var i = 0; i < conf.length; i++) {
                conf[i].id = this.emailCaseId;
                this.emailCaseId++;
            }
        },

        render: function () {
            var params = _.merge(this.model.toJSON(), {
                edit: config.project && config.project.projectId,
                currentProject: config.project.projectId,
                access: config.userModel.hasPermissions(),
                settings: config.forSettings
            });
            this.$el.html(Util.templates(this.tpl, params));
            this.$notificationArray = $("#notificationArray", this.$el);
            this.$notificationArray.html(Util.templates(this.tplItem, params));
            this.$emailBlock = $("#emailNotificationsSettings", this.$el);

            if (this.model.get('emailEnabled')) {
                this.$emailBlock.show();
            }

            this.renderEmailCases();
            return this;
        },

        initValidators: function () {
            var self = this;
            Util.bootValidator($("#from", this.$el), [
                {
                    validator: 'required'
                },
                {
                    validator: 'matchRegex',
                    type: 'emailMatchRegex',
                    pattern: config.patterns.email
                },
                {
                    validator: 'minMaxRequired',
                    min: 5,
                    max: 256
                }
            ]);
            $("#from", this.$el).on('validation::change', function (e, data) {
                if (data.valid) {
                    self.model.set('fromAddress', data.value);
                }
            });
        },

        renderEmailCases: function () {
            var self = this;

            $('.email-case-item').each(function (index, elem) {
                if (Util.isCustomer() && !Util.isAdmin()) {
                    self.setupDisabledRecipients(index);
                } else {
                    self.getMembers(index);
                }
                if (self.model.get('emailEnabled')) {
                    self.filterLaunches(index);
                    self.filterTags(index);
                }
            });
            self.initValidators();
            self.updateRules();
            self.validateRecipients();
        },

        setupDisabledRecipients: function (index) {
            var self = this,
                recipients = self.getRecipients(index);

            self.$recipients = $('input.recipients');
            self.$launchOwner = $('input.launchOwner');

            if (self.$recipients && self.$recipients.length) {
                Util.setupSelect2WhithScroll(self.$recipients.eq(index), {
                    tags: recipients
                });
                self.$recipients.eq(index).select2('val', _.pluck(recipients, 'id'));
                self.$recipients.eq(index).prop("disabled", true);
            }
            self.$launchOwner.eq(index).prop("disabled", true);
        },

        events: {
            'click #submit-notifications': 'submitNotifications',
            'click .dropdown-menu a': 'selectProp',
            'click .launchOwner': 'selectOwner',
            'click #add-notification-rule': 'addRule',
            'click .remove-email-item': 'removeRule',
            'click .email-case-label': 'removeRule'
        },

        addRule: function () {
            var self = this,
                params = _.merge(this.model.toJSON(), {
                    edit: config.project && config.project.projectId,
                    currentProject: config.project.projectId,
                    access: config.userModel.hasPermissions(),
                    settings: config.forSettings
                });

            params.addRule = true;

            var cases = this.model.get('emailCases'),
                newCase = {
                    launchNames: [],
                    recipients: ['OWNER'],
                    sendCase: "ALWAYS",
                    tags: [],
                    id: self.emailCaseId
                };

            params.newCase = newCase;
            cases.push(newCase);
            this.model.set('emailCases', cases);
            this.$notificationArray.append(Util.templates(this.tplItem, params));

            self.updateRules();
            self.emailCaseId++;

            var index = $('input.recipients').length - 1,
                recipients = $('.email-case-item').last().find('input.recipients');

            this.filterMembers(true, index);
            this.filterLaunches(index);
            this.filterTags(index);
        },

        updateRules: function () {

            var allLength = $('.email-case-item', this.$el).length,
                checkedLength = $('.email-case-item', this.$el).find('.remove-email-case:checked').length;
            if (!config.userModel.hasPermissions()) {
                return;
            }
            if ($('.email-case-item', this.$el).length > 1 && (allLength - checkedLength) > 1) {
                $('.remove-email-case', this.$el).prop('disabled', false)
                $('.email-case-item', this.$el).prop('disabled', true).removeClass('the-only');
            } else {
                $('.remove-email-case:not(:checked)', this.$el).prop('disabled', true).closest('.email-case-item').addClass('the-only');
                if(allLength == 1 && checkedLength == 1){
                    var emailCase = $('.email-case-item', this.$el);

                    this.updateEmailCase(emailCase, 'remove');
                    $('.remove-email-case', emailCase).prop('disabled', true)
                    emailCase.addClass('the-only');
                }
            }
        },

        rulesToDelete: [],

        updateEmailCase: function(emailCase, type){
            var emailCheckbox = emailCase.find('.remove-email-case'),
                label = $('.ruleName', emailCase),
                errorBlock = $('.duplicate-error', emailCase);
            if(type == 'add'){
                label.text(Localization.project.deleteRule);
                errorBlock.text(Localization.project.ruleDeleted).show();
                emailCheckbox.closest('.remove-email-item').addClass('checked');
                emailCase.addClass('will-delete');
                emailCheckbox.attr('checked', 'checked').prop('checked', true);
                this.rulesToDelete.push(emailCase.data('email-case-id'));
            }
            else {
                emailCheckbox.closest('.remove-email-item').removeClass('checked');
                emailCase.removeClass('will-delete');
                emailCheckbox.attr('checked', false).prop('checked', false);
                label.text(Localization.project.rule);
                errorBlock.empty().hide();
                this.rulesToDelete = $.grep(this.rulesToDelete, function (value) {
                    return value != emailCase.data('email-case-id');
                });
            }
        },

        removeRule: function (event) {
            var self = this,
                emailCase = $(event.target).closest('.email-case-item');

            if (!config.userModel.hasPermissions()) {
                return;
            }
            if (emailCase.hasClass('local-item')) {
                var newRules = _.reject(this.model.get('emailCases'), function (eCase) {
                    return eCase.id == emailCase.data('email-case-id')
                });
                this.model.set('emailCases', newRules);
                emailCase.fadeOut(function () {
                    emailCase.remove();
                    self.updateRules();
                });
                var externalSystemData = self.model.getProjectSettings();
                config.project.configuration.emailConfiguration = externalSystemData.configuration;
                this.checkCases();
            } else {
                if (!emailCase.hasClass('the-only')) {
                    var emailCheckbox = emailCase.find('.remove-email-case'),
                        label = $('.ruleName', emailCase),
                        errorBlock = $('.duplicate-error', emailCase);
                    if (emailCheckbox.is(':checked')) {
                        this.updateEmailCase(emailCase, 'add');
                        this.checkCases();
                        this.updateRules();
                    } else {
                        this.updateEmailCase(emailCase, 'remove');
                        this.updateRules();
                        this.checkCases();
                    }
                }
            }
        },

        getMembers: function(index){
            var users = this.getRecipients(index),
                self = this;

            if(_.isEmpty(users)){
                self.filterMembers(true, index);
            }
            else {
                _.each(users, function(u){
                    var email = u.email;
                    Service.getUserByEmail(email)
                        .done(function(data){
                            self.parseUsers(data);
                            self.filterMembers(true, index);
                        })
                        .fail(function(error){
                            Util.ajaxFailMessenger(error, 'getUsers');
                        });
                });
            }

        },

        filterMembers: function (getAnyway, index, callback) {
            this.$recipients = $('input.recipients');
            this.$launchOwner = $('input.launchOwner');

            if (Util.isInPrivilegedGroup()) {
                this.$recipients.prop("disabled", false);
                this.$launchOwner.prop("disabled", false);
            }

            var caseItem = $('.email-case-item').eq(index || 0),
                recipients = caseItem.find('input.recipients'),
                remoteUsers = [],
                users = this.getRecipients(index),
                resultFound = false,
                self = this;

            if (getAnyway || !recipients.hasClass('select2-offscreen')) {
                Util.setupSelect2WhithScroll(recipients, {
                    multiple: true,
                    minimumInputLength: 3,
                    formatInputTooShort: function (input, min) {
                        return Localization.ui.minPrefix + '3' + Localization.ui.minSufixAuto
                    },
                    formatResultCssClass: function (state) {
                        if ((remoteUsers.length == 0 || _.indexOf(remoteUsers, state.text) < 0) && $('.users-typeahead.recipients:not(input)').eq(index).find('input').val() == state.text) {
                            return 'exact-match';
                        }
                    },
                    allowClear: true,
                    createSearchChoice: function (term, data) {
                        if ($(data).filter(function () {
                                return this.text.localeCompare(term) === 0;
                            }).length === 0) {
                            return {
                                id: term,
                                text: term,
                                email: term
                            };
                        }
                    },
                    initSelection: function (element, callback) {
                        callback({
                            id: element.val(),
                            text: element.val()
                        });
                    },
                    query: function (query) {
                        resultFound = false;
                        var queryLength = query.term.length,
                            data = {
                                results: []
                            };

                        if (queryLength >= 3) {
                            if (queryLength > 256) {
                                self.validateRecipients();
                            } else {
                                if (queryLength == 256) {
                                    self.validateRecipients();
                                }
                                query.term = query.term.replace(/[@#.?*+^$[\]\\(){}|-]/g, "\\$&");
                                Service.getProjectUsers(query.term)
                                    .done(function (response) {
                                        remoteUsers = [];
                                        _.each(response.content, function (item) {
                                            if (item.full_name == query.term) {
                                                resultFound = true;
                                            }
                                            remoteUsers.push(item);
                                            data.results.push({
                                                id: item.userId,
                                                text: item.full_name,
                                                email: item.email
                                            });
                                        });
                                        query.callback(data);
                                    })
                                    .fail(function (error) {
                                        Util.ajaxFailMessenger(error);
                                    });
                            }
                        } else {
                            remoteUsers = [];
                            data.results.push({
                                id: query.term,
                                text: query.term,
                                email: item.email
                            });
                            query.callback(data);
                        }
                    }
                });
                this.$recipients.eq(index).on('select2-open', function () {
                        $('.select2-drop-mask').remove();
                    })
                    .on("select2-loaded", function (e) {
                        $('.select2-drop-active').removeClass("select2-drop-above");
                        self.$recipients.eq(index).select2('positionDropdown');
                    })
                    .on('change', function () {
                        var data = $(this).select2('data');
                        self.onChangeRicipients(data, $(this).closest('.email-case-item'));
                    }).select2("data", users);

                $('#notificationsSettings')
                    .on('mousedown.recipients', function () {
                        $('.users-typeahead.recipients').select2('close');
                        $('.select2-container.recipients').each(function () {
                            var $this = $(this);
                            if ($this.find('.select2-input').val().length <= 256) {
                                self.validateRecipients();
                            }
                        })
                    });
            }
        },

        parseUsers: function (data) {
            var users = _.map(data.content, function (user) {
                return {
                    id: user.userId,
                    text: user.full_name,
                    email: user.email
                };
            });
            this.users = this.users.concat(users);
        },

        onChangeRicipients: function (value, eci) {
            var recips = _.map(value, function(v){ return v.email; }),
                checked = eci.find(".launchOwner").is(':checked'),
                emails = [];

            this.hideFormsErrors(eci.find('.select2-container.recipients'));
            this.isValidEmail = true;
            if (_.isEmpty(recips) && !checked) {
                this.showFormErrors(eci.find('.select2-container.recipients'), Localization.project.emptyRecipients);
            }
            _.each(recips, function (v) {
                var user = _.find(this.users, function (u) {
                    return u.id === v;
                });
                if (user) {
                    emails.push(user.email);
                    this.isValidEmail = true;
                } else {
                    if (!Util.validateEmail(v)) {
                        this.showFormErrors(eci.find('.select2-container.recipients'), Localization.project.incorectEmail);
                        this.isValidEmail = false;
                    }
                    emails.push(v);
                }

            }, this);
            if (checked) {
                emails.push(eci.find(".launchOwner").val());
            }
            var emailCase = _.findWhere(this.model.get('emailCases'), {
                id: eci.data('email-case-id')
            });
            if (emailCase) {
                emailCase.recipients = emails;
            }

            this.checkCases();
        },

        onChangeLaunchNames: function (value, eci) {
            var launches = (value) ? value.trim().split(',') : [];

            var emailCase = _.findWhere(this.model.get('emailCases'), {
                id: eci.data('email-case-id')
            });
            emailCase.launchNames = launches;

            this.checkCases();
        },

        onChangeTags: function (value, eci) {
            var tags = (value) ? value.trim().split(',') : [];

            this.validateTags(tags);
            var emailCase = _.findWhere(this.model.get('emailCases'), {
                id: eci.data('email-case-id')
            });
            emailCase.tags = tags;

            this.checkCases();
        },

        getRecipients: function (index) {
            if (this.model) {
                if (index != undefined) {
                    this.$launchOwner = $('.launchOwner');
                    var emailCase = this.model.get('emailCases')[index],
                        recipients = emailCase.recipients || [],
                        val = [],
                        rejected = _.reject(recipients, function (r) {
                            return r === this.$launchOwner.eq(index).val()
                        }, this);

                    _.each(rejected, function (m) {
                        var em = _.find(this.users, function (e) {
                            return e.email === m
                        });
                        if (em) {
                            val.push(em);
                        } else {
                            val.push({
                                id: m,
                                text: m,
                                email: m
                            });
                        }
                    }, this);
                    return val;
                } else {
                    var recipients = this.model.get('recipients'),
                        val = [],
                        rejected = _.reject(recipients, function (r) {
                            return r === this.$launchOwner.val()
                        }, this);
                    _.each(rejected, function (m) {
                        var em = _.find(this.users, function (e) {
                            return e.email === m
                        });
                        if (em) {
                            val.push(em);
                        } else {
                            val.push({
                                id: m,
                                text: m,
                                email: m
                            });
                        }
                    }, this);
                    return val;
                }
            }
        },

        filterTags: function (index) {
            var self = this,
                tags = [],
                remoteTags = [],
                resultFound = false;

            _.each(this.model.get('emailCases')[index].tags, function (item) {
                tags.push({
                    id: item,
                    text: item
                });
            });

            this.$tagsContainer = $('input.users-typeahead.tags');
            if (this.$tagsContainer.eq(index)) {
                Util.setupSelect2WhithScroll(this.$tagsContainer.eq(index), {
                    multiple: true,
                    minimumInputLength: 1,
                    formatInputTooShort: function (input, min) {
                        return Localization.ui.enterChars
                    },
                    formatResultCssClass: function (state) {
                        if ((remoteTags.length == 0 || _.indexOf(remoteTags, state.text) < 0) && $('.users-typeahead.tags:not(input)').eq(index).find('input').val() == state.text) {
                            return 'exact-match';
                        }
                    },
                    tags: true,
                    initSelection: function (item, callback) {
                        var tags = item.val().split(','),
                            data = _.map(tags, function (tag) {
                                tag = tag.trim();
                                return {
                                    id: tag,
                                    text: tag
                                };
                            });
                        callback(data);
                    },
                    createSearchChoice: function (term, data) {
                        if ($(data).filter(function () {
                                return this.text.localeCompare(term) === 0;
                            }).length === 0) {
                            return {
                                id: term,
                                text: term
                            };
                        }
                    },
                    query: function (query) {
                        resultFound = false;
                        var queryLength = query.term.length,
                            data = {
                                results: []
                            };

                        if (queryLength >= 1) {
                            if (queryLength > 256) {
                                self.validateTags(null, true);
                            } else {
                                if (queryLength == 256) {
                                    self.validateTags(null, true);
                                }
                                //    self.hideFormsErrors($('this.$tagsContainer.eq(index)'));
                                Service.searchTags(query)
                                    .done(function (response) {
                                        remoteTags = [];
                                        _.each(response, function (item) {
                                            if (item == query.term) {
                                                resultFound = true;
                                            }
                                            remoteTags.push(item);
                                            data.results.push({
                                                id: item,
                                                text: item
                                            });
                                        });
                                        query.callback(data);
                                    })
                                    .fail(function (error) {
                                        Util.ajaxFailMessenger(error);
                                    });
                            }
                        } else {
                            remoteTags = [];
                            data.results.push({
                                id: query.term,
                                text: query.term
                            });
                            query.callback(data);
                        }
                    }
                });
                this.$tagsContainer.eq(index).on("select2-loaded", function (e) {
                        $('.select2-drop-active').removeClass("select2-drop-above");
                        self.$tagsContainer.eq(index).select2('positionDropdown');
                    })
                    .on('select2-open', function () {
                        $('.select2-drop-mask').remove();
                    })
                    .on('change', function () {
                        self.onChangeTags($(this).val(), $(this).closest('.email-case-item'));
                    }).select2("data", tags);
            }

            $('#notificationsSettings')
                .on('mousedown.tags', function () {
                    $('.users-typeahead.tags').select2('close');
                    var input = $('.users-typeahead.tags').find('.select2-input');

                    if (input && input.length) {
                        if (input.val().length <= 256) {
                            self.validateTags();
                        }
                    }
                });

            if (!Util.isInPrivilegedGroup() && this.$tagsContainer) {
                this.$tagsContainer.select2('disable');
            }
        },

        filterLaunches: function (index) {
            var self = this,
                remoteLaunches = [],
                launches = [],
                resultFound = false;

            _.each(this.model.get('emailCases')[index].launchNames, function (item) {
                launches.push({
                    id: item,
                    text: item
                });
            });

            this.$launchContainer = $('input.users-typeahead.launches');
            if (this.$launchContainer.eq(index)) {
                // todo : extract to helpers
                Util.setupSelect2WhithScroll(this.$launchContainer.eq(index), {
                    multiple: true,
                    minimumInputLength: 3,
                    formatInputTooShort: function (input, min) {
                        return Localization.ui.minPrefix + '3' + Localization.ui.minSufixAuto
                    },
                    formatResultCssClass: function (state) {
                        if ((remoteLaunches.length == 0 || _.indexOf(remoteLaunches, state.text) < 0) && $('.users-typeahead.launches:not(input)').eq(index).find('input').val() == state.text) {
                            return 'exact-match';
                        }
                    },
                    allowClear: true,
                    createSearchChoice: function (term, data) {
                        if ($(data).filter(function () {
                                return this.text.localeCompare(term) === 0;
                            }).length === 0) {
                            return {
                                id: term,
                                text: term
                            };
                        }
                    },
                    initSelection: function (element, callback) {
                        callback({
                            id: element.val(),
                            text: element.val()
                        });
                    },
                    query: function (query) {
                        resultFound = false;
                        var queryLength = query.term.length,
                            data = {
                                results: []
                            };

                        if (queryLength >= 3) {
                            if (queryLength > 256) {
                                self.toggleLaunchNamesErrors(true, false, self.$launchContainer.eq(index));
                            } else {
                                if (queryLength == 256) {
                                    self.toggleLaunchNamesErrors(false, false, self.$launchContainer.eq(index));
                                }
                                query.term = query.term.replace(/[@#.?*+^$[\]\\(){}|-]/g, "\\$&");
                                Service.searchLaunches(query)
                                    .done(function (response) {
                                        remoteLaunches = [];
                                        _.each(response, function (item) {
                                            if (item == query.term) {
                                                resultFound = true;
                                            }
                                            remoteLaunches.push(item);
                                            data.results.push({
                                                id: item,
                                                text: item
                                            });
                                        });
                                        query.callback(data);
                                    })
                                    .fail(function (error) {
                                        Util.ajaxFailMessenger(error);
                                    });
                            }
                        } else {
                            remoteLaunches = [];
                            data.results.push({
                                id: query.term,
                                text: query.term
                            });
                            query.callback(data);
                        }
                    }
                });
                this.$launchContainer.eq(index).on('select2-open', function () {
                        $('.select2-drop-mask').remove();
                    })
                    .on("select2-loaded", function (e) {
                        $('.select2-drop-active').removeClass("select2-drop-above");
                        self.$launchContainer.eq(index).select2('positionDropdown');
                    })
                    .on('change', function () {
                        self.onChangeLaunchNames($(this).val(), $(this).closest('.email-case-item'));
                    }).select2("data", launches);
            }


            $('#notificationsSettings')
                .on('mousedown.launches', function () {
                    $('.users-typeahead.launches').select2('close');
                    $('.select2-container.launches').each(function () {
                        var $this = $(this);
                        if ($this.find('.select2-input').val().length <= 256) {
                            self.toggleLaunchNamesErrors(false, true, $this);
                        }
                    })
                });

            if (!Util.isInPrivilegedGroup() && this.$launchContainer) {
                this.$launchContainer.select2('disable');
            }
        },

        validateTags: function (tags, lengthExceeded) {
            var valid = true,
                self = this;

            $('.email-case-item').each(function (index, elem) {
                var tagContainer = $(elem).find('.select2-container.tags'),
                    findTags = _.findWhere(self.model.get('emailCases'), {
                        id: $(elem).data('email-case-id')
                    }),
                    tags = tags || (!!findTags ? findTags['tags'] : []);

                if (lengthExceeded && ($.inArray($(elem).data('email-case-id'), self.rulesToDelete) == -1)) {
                    self.showFormErrors(tagContainer, Localization.ui.maxPrefix + '256' + Localization.ui.maxSufix);
                    $('.select2-drop-active').hide();
                    $('.select2-input.select2-active').removeClass('select2-active');
                    valid = false;
                    return false;
                }
                self.hideFormsErrors(tagContainer);
                return true;
            });

            return valid;
        },

        checkCases: function () {
            var duplicates = false,
                cases = this.model.get('emailCases');

            $('.email-case-item').removeClass('duplicate');

            if (cases.length == 1) {
                return false;
            }

            for (var i = 0; i < cases.length; i++) {
                var currentCase = cases[i];
                for (var j = i + 1; j < cases.length; j++) {
                    if (this.isCasesEqual(currentCase, cases[j])) {
                        var caseEqual = $('.email-case-item[data-email-case-id=' + cases[j].id + ']'),
                            firstCaseEqual = $('.email-case-item[data-email-case-id=' + currentCase.id + ']');

                        if (!caseEqual.hasClass('will-delete') && !firstCaseEqual.hasClass('will-delete')) {
                            caseEqual.addClass('duplicate');
                            duplicates = true;
                        }
                    }
                }
            }
            return duplicates;
        },

        isCasesEqual: function (caseOne, caseTwo) {
            if (caseOne.sendCase != caseTwo.sendCase) {
                return false;
            }

            if (caseOne.tags.length != caseTwo.tags.length) {
                return false;
            }

            if (caseOne.launchNames.length != caseTwo.launchNames.length) {
                return false;
            }

            if (caseOne.recipients.length != caseTwo.recipients.length) {
                return false;
            }

            if (_.sortBy(caseOne.tags).equals(_.sortBy(caseTwo.tags)) && _.sortBy(caseOne.launchNames).equals(_.sortBy(caseTwo.launchNames)) && _.sortBy(caseOne.recipients).equals(_.sortBy(caseTwo.recipients))) {
                return true;
            }

            return false;
        },

        selectOwner: function (e) {
            var $el = $(e.target),
                emailCase = $el.closest('.email-case-item'),
                val = $el.val(),
                emailCaseObj = _.findWhere(this.model.get('emailCases'), {
                    id: emailCase.data('email-case-id')
                }),
                sendCase = emailCaseObj['recipients'] || [];

            if ($el.is(':checked')) {
                sendCase.push(val);
                sendCase.length && this.hideFormsErrors(emailCase.find('.select2-container.recipients'));
                this.validateRecipients();
            } else {
                sendCase = _.reject(sendCase, function (s) {
                    return s === val;
                });
                if (emailCaseObj) {
                    emailCaseObj.recipients = sendCase;
                }
                !sendCase.length && this.showFormErrors(emailCase.find('.select2-container.recipients'), Localization.project.emptyRecipients);
                this.validateRecipients();
            }
            sendCase.recipients = sendCase;

            this.checkCases();
        },

        selectProp: function (e) {
            e.preventDefault();
            var self = this,
                link = $(e.target),
                btn = link.closest('.open').find('.dropdown-toggle'),
                val = (link.data('value')) ? link.data('value') : link.text(),
                id = btn.attr('id');

            if (id === 'emailEnabled') {
                val = (val === 'ON');
                var blockAction = val ? 'show' : 'hide';
                this.$emailBlock[blockAction]();
                if (val) {
                    self.model.set('emailEnabled', true);
                    $('.email-case-item').each(function (index, elem) {
                        self.filterLaunches(index);
                        self.filterTags(index);
                    });

                } else {
                    self.model.set('emailEnabled', false);
                }
                this.model.set(id, val);
                this.updateRules();
            } else {
                var emailCase = _.findWhere(this.model.get('emailCases'), {
                    id: btn.closest('.email-case-item').data('email-case-id')
                });
                if (emailCase) {
                    emailCase.sendCase = val;
                }
                this.checkCases();
            }
            $('.select-value', btn).text(link.text());
        },

        setEmailToDefault: function () {
            var self = this;
            $('.email-case-item').each(function (index, elem) {
                var emailCase = _.findWhere(self.model.get('emailCases'), {id: $(elem).data('email-case-id')});

                var inCase = config.forSettings.emailInCase[0];
                $(elem).find('.launchOwner').attr('checked', 'checked').prop('checked', 'checked');
                $(elem).find('.select-value').text(inCase.name).val(inCase.value);
                $(elem).find('.recipients').val('');
                emailCase.recipients = [$(elem).find('.launchOwner').val()];
                emailCase.sendCase = inCase.value;
            });
        },

        clearFormErrors: function () {
            if ($('div.error-block', this.$el).is(':visible')) {
                $('.rp-form-group', this.$el).removeClass('has-error');
                $('div.error-block', this.$el).empty().hide();
            }
        },

        showFormErrors: function (el, message) {
            var cont = el.closest('.rp-form-group');
            cont.addClass('has-error');
            $('div.error-block', cont).empty().html(message).show();
        },

        hideFormsErrors: function (el) {
            var cont = el.closest('.rp-form-group');
            cont.removeClass('has-error');
            $('div.error-block', cont).empty().hide();
        },

        validateRecipients: function () {
            var self = this,
                recipients = false,
                validAllRecipients = true;

            $('.email-case-item').each(function (index, elem) {
                var validRecipients = true,
                    emailCase = _.findWhere(self.model.get('emailCases'), {
                        id: $(elem).data('email-case-id')
                    }),
                    emailCaseToDelete = $.inArray($(elem).data('email-case-id'), self.rulesToDelete) != -1;

                if (!recipients && emailCase && !emailCaseToDelete) {
                    recipients = _.isEmpty(emailCase.recipients);
                }
                if (emailCase && _.isEmpty(emailCase.recipients) && !emailCaseToDelete) {
                    self.showFormErrors($(elem).find('input.recipients'), Localization.project.emptyRecipients);
                }

                if (emailCase && !emailCaseToDelete) {
                    _.each(emailCase.recipients, function (item) {
                        if (validRecipients) {
                            validRecipients = Util.validateEmail(item) || item === 'OWNER';

                            if (validAllRecipients) {
                                validAllRecipients = validRecipients;
                            }
                        }
                    });

                    if (!validRecipients) {
                        self.showFormErrors($(elem).find('input.recipients'), Localization.project.invalidRecipients);
                    }
                }


            });
            return this.model.get('emailEnabled') && (recipients || !validAllRecipients);
        },

        toggleLaunchNamesErrors: function (show, click, elem) {
            var launches = elem;
            if (show) {
                this.showFormErrors(launches, Localization.ui.maxPrefix + '256' + Localization.ui.maxSufix);
                $('.select2-drop-active').hide();
                $('.select2-input.select2-active').removeClass('select2-active')
            } else {
                this.hideFormsErrors(launches);
                if (!click) {
                    $('.select2-drop-active').last().show();
                    launches.find('.select2-input').addClass('select2-active');
                }
            }
        },

        checkTagsAndLaunches: function (data) {
            var conf = data.configuration;
            if (conf.launchNames && conf.launchNames.length == 0) {
                delete conf.launchNames;
            }

            if (conf.tags && conf.tags.length == 0) {
                delete conf.tags;
            }

            data.configuration = conf;
            return data;
        },

        submitNotifications: function (e) {
            var self = this,
                emailField = $('#from', this.$el),
                externalSystemData = this.model.getProjectSettings(this.rulesToDelete);

            if (this.model.get('emailEnabled')) {
                if (!this.validateTags()) {
                    return false;
                }
                if (this.validateRecipients()) {
                    return false;
                } else if ($('.email-case-item:not(.will-delete)').find('.has-error').length > 0) {
                    return false;
                } else if (this.checkCases()) {
                    return false;
                }
                this.clearFormErrors();
                if (!Util.validateEmail(emailField.val())) {
                    emailField.trigger('validate');
                    return false;
                }
            } else {
                var defaultEmailCase = [
                    {
                        launchNames: [],
                        recipients: ['OWNER'],
                        sendCase: "ALWAYS",
                        tags: [],
                        id: 0
                    }
                ];
                self.model.set('emailEnabled', false);
                self.model.set('emailCases', defaultEmailCase);
                $('.email-case-item').remove();
                self.model.set('fromAddress', 'reportportal@example.com');
                externalSystemData = self.model.getProjectSettings();
            }
            externalSystemData = this.checkTagsAndLaunches(externalSystemData);
            Service.updateEmailProjectSettings(externalSystemData)
                .done(function (response) {

                    config.project.configuration.emailConfiguration = externalSystemData.configuration;
                    self.emailCaseId = 0;
                    self.rulesToDelete.length = 0;
                    self.updateIds();
                    self.model = new NotificationsSettings(config.project.configuration.emailConfiguration);
                    self.render();
                    Util.ajaxSuccessMessenger('updateProjectSettings');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateProjectSettings');
                });
        },

        destroy: function (view) {
            this.$recipients = $('input.recipients');
            this.$launchContainer = $('input.launchNames');
            this.$tagsContainer = $('input.tags');

            if (this.$recipients && this.$recipients.length) {
                this.$recipients.select2('destroy');
                this.$recipients = null;
            }
            if (this.$launchContainer && this.$launchContainer.length) {
                this.$launchContainer.select2('destroy');
                this.$launchContainer = null;
            }
            if (this.$tagsContainer && this.$tagsContainer) {
                this.$tagsContainer.select2('destroy');
                this.$tagsContainer = null;
            }

            this.undelegateEvents();

            $("body > #select2-drop-mask, body > .select2-sizer").remove();
            Components.RemovableView.prototype.destroy.call(this);
        }
    });

    var BtsProperties = Backbone.Model.extend({
        defaults: {
            id: 0,
            url: "",
            project: "",
            systemType: config.forSettings.btsList[0].value,
            systemAuth: "",
            username: "",
            password: config.forSettings.defaultPassword,
            accessKey: "",
            fields: [],
            domain: "",

            mode: '',
            modelCache: null,
            restorable: ['url', 'project', 'domain']
        },
        initialize: function () {
            var params;
            if (!this.get('systemAuth')) {
                params = config.forSettings['bts' + this.get('systemType')].authorizationType[0].value;
                this.set('systemAuth', params);
            }
        },
        isValid: function () {
            var general = !!this.get('url') && !!this.get('project');
            var credentials;

            if (this.validForBasic()) {
                if (!!this.get('id')) {
                    credentials = this.hasCredentials();
                } else {
                    credentials = this.hasCredentials() && this.get('password') !== config.forSettings.defaultPassword;
                }
            } else {
                credentials = !!this.get('accessKey');
            }
            if (this.isTFS()) {
                general = general && !!this.get('domain');
            }
            return general && credentials;
        },
        hasCredentials: function () {
            return !!this.get('username') && !!this.get('password');
        },
        shouldClearPassword: function (pass) {
            return !this.get('url') && pass === config.forSettings.defaultPassword;
        },
        isEdit: function () {
            return !!this.get('mode');
        },
        setupEdit: function () {
            this.set('mode', 'edit');
            this.set('modelCache', this.toJSON());
        },
        cancelEdit: function () {
            var cache = this.get('modelCache');
            this.set('modelCache', null);
            this.set(cache);
            this.set('mode', '');
        },
        discardEdit: function () {
            if (this.isEdit()) {
                this.set('modelCache', null);
                this.set('mode', '');
            }
        },
        resetCredentials: function () {
            this.set('username', "");
            this.set('password', "");
            this.set('token', "");
        },
        validForApiKey: function () {
            return this.get('systemAuth') === 'APIKEY';
        },
        validForBasic: function () {
            var type = this.get('systemAuth');
            return type === 'BASIC' || type === 'NTLM';
        },
        isRally: function () {
            return this.get('systemType') === 'RALLY';
        },
        isTFS: function () {
            return this.get('systemType') === 'TFS';
        },
        fieldsWereSelected: function () {
            return this.get('id') && this.get('fields').length;
        },
        toJSON: function () {
            var m = Backbone.Model.prototype.toJSON.call(this);
            if (!this.isTFS()) {
                delete m.domain;
            }
            return m;
        },
        getBtsSettings: function () {
            var model = this.toJSON(),
                clearBasicCredentials = function () {
                    delete model.username;
                    delete model.password;
                };
            delete model.mode;
            delete model.modelCache;
            delete model.restorable;
            delete model.links;
            delete model.access;
            delete model.text;
            delete model.defaultPassword;
            delete model.hasPassword;
            if (model.id && model.password && model.password === config.forSettings.defaultPassword) {
                clearBasicCredentials();
            }
            if (this.validForApiKey()) {
                clearBasicCredentials();
            }
            if (this.validForBasic()) {
                delete model.accessKey;
            }
            if (!model.id) {
                delete model.fields;
            }
            return model;
        }
    });

    var BtsView = Components.BaseView.extend({
        defaultFields: null,

        initialize: function (options) {
            this.$el = options.holder;
            this.settings = options.settings;
            this.access = options.access;
            this.systems = options.externalSystems;
            this.model = new BtsProperties(options.externalSystems[0]);
            this.systemAt = 0;
        },

        wrapperTpl: 'tpl-bts-wrapper',
        instanceTpl: 'tpl-bts-instance',
        multiTpl: 'tpl-bts-multi-selector',
        authTpl: 'tpl-bts-auth-type',

        render: function () {
            this.$el.html(Util.templates(this.wrapperTpl, {
                settings: this.settings,
                systemType: this.model.get('systemType'),
                access: this.access
            }));
            this.$instanceHead = $("#instanceHead", this.$el);
            this.$instanceBoby = $("#instanceBody", this.$el);

            this.renderMultiSelector();
            this.renderInstance();

            return this;
        },

        renderMultiSelector: function () {
            this.$instanceHead.empty();
            var selectedSystemType = this.model.get('systemType');
            if (this.systemWithMultipleProjects(selectedSystemType)) {
                var systems = (this.systems.length && selectedSystemType === this.systems[0].systemType) ? this.systems : [];
                this.$instanceHead.html(Util.templates(this.multiTpl, {
                    systems: systems,
                    index: this.systemAt,
                    access: this.access
                }));
            }
        },

        renderInstance: function () {
            this.$instanceBoby.empty();

            var params = this.model.toJSON();
            params['authorizationTypes'] = this.settings['bts' + this.model.get('systemType')].authorizationType;
            params['access'] = this.access;
            params['settings'] = this.settings;
            params['projectType'] = this.model.isRally() ? 'projectId' : 'projectName';

            this.$instanceBoby.html(Util.templates(this.instanceTpl, params));
            this.setupAnchors();
            this.setAuthBlock(params);
            this.bindValidators();
            if (this.access) {
                this.setupValidityState();
            }
            this.renderFields();
        },

        validateForAuthenticationType: function () {
            if (Util.hasValidBtsSystem()) {
                this.model.set('systemAuth', this.settings['bts' + this.model.get('systemType')].authorizationType[0].value);
            }
        },

        systemWithMultipleProjects: function (system) {
            return this.settings['bts' + system].multiple;
        },

        changeBts: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            var value = el.text();

            if (el.hasClass('active')) {
                return;
            }
            Util.flipActiveLi(el);
            this.validateBtsChange(value);
        },

        validateBtsChange: function (value) {
            var system = this.checkIfSystemDefined(value) ? this.systems[this.systemAt] : {
                systemType: value
            };
            this.model = new BtsProperties(system);
            this.validateForChangeBtsWarning();
            this.renderMultiSelector();
            this.renderInstance();
        },

        validateForChangeBtsWarning: function () {
            var action = this.systems.length && !!!this.model.get('id') ? 'show' : 'hide';
            this.$tbsChangeWarning[action]();
        },

        checkIfSystemDefined: function (val) {
            return _.any(this.systems, function (system) {
                return system.systemType === val;
            });
        },

        focusOnFields: function () {
            $('html, body').animate({
                scrollTop: this.$fieldsWrapper.offset().top
            }, 1000);
        },

        renderFields: function () {
            if (this.model.get('id')) {
                if (this.model.get('fields').length) {
                    this.fieldsView && this.fieldsView.destroy();
                    this.fieldsView = new FieldsView({
                        holder: this.$dynamicFieldsWrapper,
                        fields: this.model.get('fields'),
                        editable: true
                    }).render();
                    this.$fieldsWrapper.show();
                } else {
                    this.fieldsView = new FieldsView({
                        holder: this.$dynamicFieldsWrapper,
                        fields: [],
                        editable: true
                    });
                    this.loadDefaultBtsFields();
                }
            }
        },

        setupAnchors: function () {
            this.$tbsChangeWarning = $("#tbsChangeWarning", this.$el);
            this.$authDropDown = $("#systemAuth", this.$el);
            this.$authType = $("#authorizationType", this.$el);
            this.$fieldsLoader = $("#fieldsLoader", this.$el);

            this.$submitBlock = $("#submitPropertiesBlock", this.$el);
            this.$editBtn = $("#editBtsProperties", this.$el);
            this.$deleteBtn = $("#deleteInstance", this.$el);
            this.$cancelBtn = $("#cancelBtsProperties", this.$el);
            this.$propertiesWrapper = $("#propertiesWrapper", this.$el);
            this.$resetFieldsWarning = $("#resetFieldsWarning", this.$el);
            this.$externalSystemWarning = $("#externalError", this.$el);

            this.$fieldsWrapper = $("#fieldsWrapper", this.$el);
            this.$dynamicFieldsWrapper = $("#dynamicFields", this.$el);
            this.$fieldsControls = $(".fields-controls", this.$el);
            this.$updateFieldsBtn = $("#updateFields", this.$fieldsControls);
            this.$cancelFieldsBtn = $("#cancelFields", this.$fieldsControls);
        },

        events: {
            'click .bts-option': 'changeBts',
            'click .auth-type': 'updateAuthType',
            'keyup .bts-property': 'updateModel',
            'blur .bts-property': 'updateModel',
            'click #submitBtsProperties': 'saveProperties',
            'click #editBtsProperties': 'editProperties',
            'click #deleteInstance': 'deleteInstance',
            'click #cancelBtsProperties': 'cancelEditProperties',

            'click .bts-instance': 'selectBtsInstance',
            'click .close-add-action': 'discardAddNew',

            'click #submitFields': 'submitFields',
            'click #updateFields': 'loadDefaultBtsFields',
            'click #cancelFields': 'cancelFieldsUpdate'
        },

        discardAddNew: function (e) {
            e.preventDefault();
            $(e.currentTarget).closest('li').removeClass('activated').removeClass('active');
            $(e.currentTarget).closest('ul').find('[data-index=' + this.systemAt + ']').parent().addClass('active');
            $(e.currentTarget).closest('ul').find('.bts-instance-action').removeClass('disabled');

            this.model = new BtsProperties(this.systems[this.systemAt]);
            this.renderInstance();
            e.stopPropagation();
        },

        selectBtsInstance: function (e) {
            e.preventDefault();
            var $tab;
            var $parent;
            var type;
            var url;

            $tab = $(e.currentTarget);
            $parent = $tab.parent();

            if ($parent.hasClass('active') || $parent.hasClass('disabled')) {
                return false;
            }

            if ($tab.hasClass('add-new')) {
                $parent.closest('ul').find('.active').removeClass('active');
                $parent.addClass('disabled');
                $parent.closest('ul').find('.bts-name-new-project').addClass('active').addClass('activated');

                type = this.model.get('systemType');
                url = this.systems[0].url;

                this.model = new BtsProperties({
                    systemType: type,
                    url: url
                });
                this.renderInstance();
            } else {
                this.systemAt = $tab.data('index');
                this.model = new BtsProperties(this.systems[this.systemAt]);
                this.renderMultiSelector();
                this.renderInstance();
            }
        },

        submitFields: function () {
            var result = [],
                source = this.defaultFields ? this.defaultFields : this.model.get('fields');
            _.forEach(this.fieldsView.getDefaultValues(), function (value, key) {
                var field = _.find(source, {
                    id: key
                });
                if (field) {
                    if (field.fieldType === 'array') {
                        value = value.split(',')
                    } else {
                        value = [value];
                    }
                    field['value'] = value;
                    result.push(field);
                }
            });
            this.model.set('fields', result);
            this.saveProperties();
            this.systems[this.systemAt].fields = result;
        },

        loadDefaultBtsFields: function () {
            var self = this;
            this.$fieldsLoader.show();
            Service.getBtsFields(this.model.get('id'))
                .done(function (data) {
                    self.$fieldsLoader.hide();

                    self.defaultFields = _.cloneDeep(data);
                    _.forEach(self.model.get('fields'), function (field) {
                        var item = _.find(data, {
                            id: field.id
                        });
                        item['value'] = field.value;
                        item['checked'] = true;
                    });
                    self.fieldsView.update(data);

                    self.$updateFieldsBtn.hide();
                    self.model.fieldsWereSelected() && self.$cancelFieldsBtn.show();

                    self.$fieldsWrapper.show();
                    self.$externalSystemWarning.hide();

                    self.focusOnFields();
                })
                .fail(function (error) {
                    self.handleBtsFailure(error);
                    self.$fieldsLoader.hide();
                });
        },

        cancelFieldsUpdate: function () {
            this.fieldsView.render();
            this.$updateFieldsBtn.show();
            this.$cancelFieldsBtn.hide();
        },

        preventDefault: function (e) {
            e.preventDefault();
        },

        saveProperties: function () {
            if (this.model.isValid()) {
                if (this.validateForSystemsClearance()) {
                    config.userModel.set('bts', null);
                    Service.clearExternalSystem()
                        .done(function () {
                            this.saveBts(true);
                        }.bind(this))
                        .fail(function () {
                            Util.ajaxSuccessMessenger("clearExternalSystem");
                        });
                } else {
                    this.saveBts();
                }
            } else {
                $("input:visible, textarea:visible", this.$propertiesWrapper).trigger('validate');
            }
        },

        saveBts: function (clear) {
            this.$fieldsLoader.show();

            if (clear) {
                while (this.systems.length) {
                    this.systems.pop();
                }
            }

            var self = this,
                call = this.model.get('id') ? 'updateExternalSystem' : 'createExternalSystem';

            var externalSystemData = this.model.getBtsSettings();
            if (this.checkIfLinkOrProjectNameChanged(externalSystemData)) {
                this.model.set('fields', []);
                externalSystemData.fields = [];
            }

            Service[call](externalSystemData)
                .done(function (response) {

                    self.setupValidityState();
                    self.$fieldsWrapper.show();

                    if (response.id) {
                        self.updateCredentials(externalSystemData, response.id);
                        self.systems.push(externalSystemData);
                        self.systemAt = self.systems.length - 1;
                        self.renderMultiSelector();
                    } else {
                        _.merge(self.systems[self.systemAt], externalSystemData);
                        self.model.discardEdit();
                    }
                    self.renderInstance();
                    self.renderMultiSelector();
                    self.$tbsChangeWarning.hide();
                })
                .fail(function (error) {
                    self.handleBtsFailure(error);
                    self.$fieldsWrapper.hide();
                    self.$fieldsLoader.hide();
                })
                .always(function () {
                    self.model.get('fields').length && self.$fieldsLoader.hide();
                });
        },

        handleBtsFailure: function (error) {
            var message = this.$externalSystemWarning.data('casual');
            if (error.status == 403) {
                message = Localization.failMessages.noPermissions;
            } else if (error.responseText && error.responseText.indexOf(this.settings.projectNotFoundPattern) !== -1) {
                message = this.$externalSystemWarning.data('noproject').replace('%%%', this.model.get('project'));
            }
            this.$externalSystemWarning.text(message).show();
        },

        updateCredentials: function (system, id) {
            this.model.set('id', id);
            system["id"] = id;
            if (this.model.validForBasic()) {
                this.model.set('password', this.settings.defaultPassword);
                system["password"] = this.settings.defaultPassword;
            } else if (this.model.validForApiKey()) {
                system["accessKey"] = this.model.get('accessKey');
            }
        },

        validateForSystemsClearance: function () {
            return this.systems.length && this.model.get('systemType') !== this.systems[0].systemType;
        },

        deleteInstance: function () {
            Util.confirmDeletionDialog({
                callback: function () {
                    var self = this;
                    Service.deleteExternalSystem(this.model.get('id'))
                        .done(function () {
                            self.systems.splice(self.systemAt, 1);
                            if (self.systems.length) {
                                self.model = new BtsProperties(self.systems[0]);
                            } else {
                                var type = config.forSettings.btsList[0].value;
                                self.model = new BtsProperties({
                                    systemType: type
                                });
                            }
                            self.systemAt = 0;
                            self.setPristineBTSForm();
                            self.renderInstance();
                            self.renderMultiSelector();
                            Util.ajaxSuccessMessenger("deleteBts");
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, "deleteBts");
                        });
                }.bind(this),
                message: 'deleteBts',
                format: [
                    this.model.get('systemType'),
                    this.model.get('project')
                ]
            });
        },

        setPristineBTSForm: function (el) {
            var defaultParam = config.forSettings.btsList[0].value;
            $('#btsSettings').find('#systemType').find('.select-value').text(defaultParam);
            this.renderMultiSelector();
            this.renderInstance();
        },

        checkIfLinkOrProjectNameChanged: function (system) {
            var current = _.find(this.systems, {
                id: system.id
            });
            return current && (current.url !== system.url || current.project !== system.project);
        },

        editProperties: function () {
            this.model.setupEdit();
            this.setupValidityState();
            this.$cancelBtn.show();
        },

        cancelEditProperties: function () {
            var model = this.model.get('modelCache'),
                self = this;
            _.forEach(model.restorable, function (id) {
                $('#' + id, self.$propertiesWrapper).val(model[id]);
            });
            var type = $("#" + model.systemAuth, this.$propertiesWrapper);
            type.closest('.dropdown-menu').find('.active').removeClass('active');
            type.addClass('active');
            $("#systemAuth", this.$el).find('.select-value').text(type.text());

            this.setAuthBlock(model);
            $('.has-error', this.$propertiesWrapper).removeClass('has-error');

            this.model.cancelEdit();
            this.$resetFieldsWarning.hide();
            this.setupValidityState();

            if (this.$externalSystemWarning.is(':visible')) {
                this.$externalSystemWarning.hide();
                this.$fieldsWrapper.show();
            }
        },

        updateModel: function (e) {
            var $el = $(e.currentTarget),
                value = $el.val().trim(),
                id = $el.attr('id');
            if (value !== this.model.get(id)) {
                (id !== 'password') && $el.trigger('validate');
                value = $el.data('valid') ? value : "";
                if (this.model.isEdit() && this.checkIfCanResetFields(id)) {
                    this.model.fieldsWereSelected() && this.$resetFieldsWarning.show();
                    $("#username, #password, #accessKey", this.$el).val("");
                    this.model.set({
                        username: '',
                        password: '',
                        accessKey: ''
                    });
                }
                if (id === 'username') {
                    var pass = $("#password", this.$propertiesWrapper);
                    if (pass.val() === this.settings.defaultPassword) {
                        pass.val("");
                        this.model.set('password', '');
                    }
                }
                this.model.set(id, value);
            }
        },

        bindValidators: function () {
            Util.bootValidator($("#url", this.$propertiesWrapper), [
                {
                    validator: 'required',
                    type: 'btsLink'
                },
                {
                    validator: 'matchRegex',
                    type: 'btsLinkRegex',
                    pattern: '(http|https)://[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-\.,@\?^=%&;:/~\+#]*[a-z0-9\-@\?^=%&;/~\+#])?',
                    arg: 'i'
                }
            ]);
            Util.bootValidator($("#project", this.$propertiesWrapper), {
                validator: 'minMaxRequired',
                type: 'projectName',
                min: 1,
                max: 55
            });
            if (this.model.isRally()) {
                Util.bootValidator($("#accessKey", this.$propertiesWrapper), {
                    validator: 'required',
                    type: 'accessKey'
                });
            }
        },

        setupValidityState: function () {
            if (this.model.isValid() && !this.model.isEdit()) {
                this.$submitBlock.hide();
                this.$editBtn.show();
                this.$deleteBtn.show();
                $("input, textarea", this.$propertiesWrapper).prop('disabled', true);
                this.$authDropDown.prop('disabled', true);
            } else {
                this.$submitBlock.show();
                this.$editBtn.hide();
                this.$deleteBtn.hide();
                $("input, textarea", this.$propertiesWrapper).prop('disabled', false);
                this.$authDropDown.prop('disabled', false);
            }
        },

        setAuthBlock: function (data) {
            data['access'] = this.access;
            data['hasPassword'] = !!this.model.get('id');
            data['defaultPassword'] = this.settings.defaultPassword;
            this.$authType.html(Util.templates(this.authTpl, data));
            if (this.model.validForBasic()) {
                Util.bootValidator($("#username", this.$propertiesWrapper), {
                    validator: 'required'
                });

                Util.bootValidator($("#password", this.$propertiesWrapper), {
                    validator: 'required'
                });
                if (this.model.isTFS()) {
                    Util.bootValidator($("#domain", this.$propertiesWrapper), {
                        validator: 'minMaxRequired',
                        type: 'tfsDomain',
                        min: 1,
                        max: 255
                    });
                }
            } else if (this.model.validForApiKey()) {
                Util.bootValidator($("#accessKey", this.$propertiesWrapper), {
                    validator: 'minMaxRequired',
                    type: 'apiKey',
                    min: 4,
                    max: 128
                });
            } else {
                Util.bootValidator($("#accessKey", this.$propertiesWrapper), {
                    validator: 'required'
                });
            }
        },

        updateAuthType: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget).parent(),
                type = $el.attr('id');
            if ($el.hasClass('active')) {
                return;
            }
            Util.flipActiveLi($el);

            this.model.set('systemAuth', type);
            this.setAuthBlock();
        },

        checkIfCanResetFields: function (id) {
            return id === 'url' || id === 'project';
        },

        destroy: function () {
            if (this.defaultFields) {
                this.defaultFields = null;
            }
            this.fieldsView && this.fieldsView.destroy();
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var FieldsView = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.holder;
            this.editable = options.editable;
            this.fields = options.fields;
            this.disabled = config.forSettings.btsJIRA.disabledForEdit;
        },
        fieldsTpl: 'tpl-dynamic-fields',
        events: {
            'click .option-selector': 'handleDropDown'
        },
        handleDropDown: function (e) {
            Util.dropDownHandler(e);
        },
        render: function () {
            this.$el.html(Util.templates(this.fieldsTpl, {
                collection: this.fields,
                disabled: this.disabled,
                update: true,
                editable: this.editable,
                access: config.userModel.hasPermissions()
            }));
            this.setupMultiSelect(this.fields);
            return this;
        },
        setupMultiSelect: function (fields) {
            Helpers.applyTypeForBtsFields(fields, this.$el);
        },
        update: function (fields) {
            this.$el.html(Util.templates(this.fieldsTpl, {
                collection: fields,
                update: true,
                disabled: this.disabled,
                access: config.userModel.hasPermissions()
            }));
            this.setupMultiSelect(fields);
            return this;
        },
        updateData: function (fields) {
            this.fields = fields;
            this.render();
        },
        getDefaultValues: function () {
            var result = {};
            _.forEach($(".default-selector:checked", this.$el), function (el) {
                var checkbox = $(el),
                    element, value;
                if (checkbox.data('type') === 'array') {
                    element = checkbox.closest('.rp-form-group').find('input.default-value:first');
                    value = element.val();
                } else {
                    var select = checkbox.closest('.rp-form-group').find('select:first');
                    if (select.length) {
                        element = select;
                    } else {
                        element = checkbox.closest('.rp-form-group').find('.default-value:first');
                    }
                    value = element.is('button')
                        ? element.parent().find('.select-value:first').text()
                        : element.val();
                }
                result[element.attr('id')] = value.trim();
            });
            return result;
        }
    });

    var DefectSubTypeView = Components.BaseView.extend({
        model: {},
        static: 'tpl-defect-type-item',
        editor: 'tpl-defect-type-item-edit',
        confirmModal: 'tpl-modal-with-confirm',
        el: '',
        parent: {},
        name: '',
        events: {
            'click .delete-item': 'deleteItem',
            'click .edit-item': 'editItem',
            'click .save-item': 'saveItem',
            'click .cancel-item': 'cancelItem',
            'focusout .rp-input': 'liveValidate',
            'focus .rp-input': 'focusInput',
            'focus .check-color-input': 'onFocusColor',
            'click .check-color-input': 'onFocusColor'
        },
        initialize: function (options) {
            _.extend(this, options);
            this.on('initClrPicker', this.initColorPicker, this);
            // this.initListeners();
            this.editModel = new DefectTypeModel();
            this.listenTo(this.model, 'change:locator', this.onChangeLocator);
            this.listenTo(this.model, 'change', this.render);
        },
        onChangeLocator: function(model, locator) {
            this.$el.attr({id: locator});
        },
        render: function () {
            var id = this.model.get('locator');
            var template = this.static;
            var data = this.setTemplateData();
            $(this.el).html(Util.templates(template, data));
            if (id === 'newItem') {
                var $el = $('#' + id);
                this.trigger('initClrPicker', $el);
            }
        },
        setTemplateData: function () {
            var data = {
                model: this.model.toJSON(),
                color: this.parent.color,
                edit: this.edit
            };
            data['first'] = this.model.get('mainType');

            return data;
        },
        editItem: function (event) {
            if(event) { event.preventDefault(); }
            this.el.html(Util.templates(this.editor, this.model.toJSON()));
            this.editModel.set(this.model.toJSON());
            var itemId;
            var mainHolder;

            itemId = this.model.get('locator');

            mainHolder = $('#' + itemId);
            this.trigger('initClrPicker', mainHolder);
        },
        saveItem: function (event) {
            event.preventDefault();

            if (!this.editModel.isValid()) {
                $('[data-type="longName"]', this.$el).focusout();
                $('[data-type="shortName"]', this.$el).focusout();
                return;
            }

            this.model.set(this.editModel.toJSON());
            this.el.html(Util.templates(this.static, this.setTemplateData()));

            if(this.model.get('locator') === 'newItem') {
                this.model.collection.add(this.model);
            }
        },
        deleteItem: function (event) {
            event.preventDefault();
            var self = this;
            var id = $(event.target).closest('.dt-body-item').attr('id');
            var subType = $(event.target).closest('.dt-body-item').attr('data-defect-type');
            var nameParentType = this.model.get('typeRef').replace("_", " ").capitalize();
            var fullNameSubType = this.model.get('longName');

            var updateMsgForModalDialog = Util.replaceOccurrences.call(null, [fullNameSubType, nameParentType]);

            if (id === subType.toUpperCase() + '0') {
                return;
            };

            var modalDialog = {
                paramModal: {
                    additionalClass: 'dialog-delete-defect-type',
                    sizeModal: 'md',
                    withConfirm: true,
                    isFormatText: true
                },
                dialogHeader: {
                    title: Localization.dialogHeader.titleDeleteDefectType
                },
                dialogBody: {
                    txtMessageTop: updateMsgForModalDialog(Localization.dialog.msgMessageTop),
                    txtMessage: Localization.dialog.msgDeleteDefectType
                },
                dialogFooter: {
                    cancelButton: Localization.uiCommonElements.cancel,
                    dangerButton: Localization.uiCommonElements.delete
                }
            };

            this.deleteDialog = Util.getDialog({
                name: this.confirmModal,
                data: modalDialog,
            });

            this.deleteDialog
                .on('click', ".rp-btn-danger", function () {
                    self.model.collection.remove(self.model);
                    self.destroy();
                    self.deleteDialog.modal("hide");
                    Util.ajaxSuccessMessenger('deleteOneSubType');
                })
                .on('click', ".rp-btn-cancel", function () {
                    // TODO
                    // options.cancelCallback && options.cancelCallback();
                })
                .on('click', "input[type='checkbox'].confirm", function (event) {
                    var elem = event.target;
                    var btnDelete = $(elem).closest('.modal-body').find('.rp-btn-danger');
                    if (elem.checked) {
                        $(btnDelete.selector).removeAttr('disabled');
                    } else {
                        $(btnDelete.selector).attr("disabled", "disabled");
                    }
                })
                .on('hidden.bs.modal', function () {
                    $(this).data('modal', null);
                    self.deleteDialog.off().remove();
                    self.deleteDialog = null;
                });

            this.deleteDialog.modal("show");
        },
        cancelItem: function (event) {
            event.preventDefault();
            if (this.model.get('locator') === 'newItem') {
                var model = this.model;
                this.destroy();
                model.collection.trigger('cancel:add', model.get('typeRef'));
                return;
            }
            this.el.html(Util.templates(this.static, this.setTemplateData()));
        },
        getData: function (subTypeEl) {
            var data = {
                longName: $(subTypeEl).find('[data-type=longName]').val(),
                shortName: $(subTypeEl).find('[data-type=shortName]').val().toUpperCase(),
                color: $(subTypeEl).find('[data-type=color]').val()
            };

            return data;
        },
        onFocusColor: function() {
            $('.check-color-picker', this.$el).colorpicker('show');
        },
        initColorPicker: function (mainHolder) {
            // this.off('initClrPicker:' + this.name, this.onHideColorPicker);

            var elem = $('.check-color-picker', this.$el);
            var currentPoint = $('.point-color-picker', this.$el);
            var holderColorPicker = $('.holder-color-picker', this.$el);
            var currentInput = holderColorPicker.find('input');
            var currentColor = currentInput.val();
            var changeRow = elem.find('.rp-toggle-content');
            changeRow.removeClass('hide-content');
            changeRow.addClass('show-content');

            elem
                .colorpicker(colorPickerCustomCfg)
                .on('changeColor', function (e) {
                    currentInput.val(e.color.toHex());
                    currentInput.trigger('focusout');
                    currentPoint.css('backgroundColor', e.color.toHex());
                    $(this).find('.colorpicker-current-color > span').html(e.color.toHex());
                    currentColor = e.color.toHex();
                })
                .on('showPicker', function (e) {
                    changeRow.removeClass('show-content');
                    changeRow.addClass('hide-content');
                    e.color.setColor(currentColor);
                    $(this).find('.colorpicker-current-color > span').html(e.color.toHex());
                })
                .on('hidePicker', function () {
                    changeRow.removeClass('hide-content');
                    changeRow.addClass('show-content');
                });
            elem.colorpicker('setValue', this.model.get('color'));
        },
        focusInput: function (e) {
            var subTypeEl = $(e.target).closest('.dt-body-item');
            var row = $(e.target).attr('data-type');
            this.clearErrMessages([row], subTypeEl);
        },
        liveValidate: function (e) {
            var subTypeEl = $(e.target).closest('.dt-body-item');
            var row = $(e.target).attr('data-type');
            var value = $.trim($(e.target).val());
            $(e.target).val(value);

            this.editModel.set(row, value);

            if (!this.editModel.isValid()) {
                var errorsList = this.uniteErrors(this.editModel.validationError, {});

                _.each(errorsList, function (el, key) {
                    if (key !== row) {
                        delete errorsList[key];
                    }
                });

                this.showErrors({
                    data: errorsList
                }, subTypeEl, [row]);

                return;
            }
        },
        uniteErrors: function (modelErr, uniqErr) {
            var errors = {};
            _.each(modelErr, function (err) {
                if (!err.valid) {
                    errors[err.key] = err.reason;
                }
            });

            _.each(uniqErr, function (err) {
                if (err.valid == true) {
                    return;
                }

                if (_.has(errors, err.key)) {
                    _.each(err.reason, function (reason) {
                        errors[err.key].push(reason);
                    }, this);

                    return;
                }

                errors[err.key] = err.reason;
            });

            return errors;
        },
        showErrors: function (errors, element, rows) {
            this.clearErrMessages(rows, element);
            this.addErrMessage(errors, element);
        },
        addErrMessage: function (errors, element) {
            _.each(errors.data, function (el, key) {
                var currentInput = $(element).find('[data-type=' + key + ']');
                currentInput.attr('required', true);
                var noteErr = Localization.validation[el];

                if (currentInput.closest('div').find('p')) {
                    currentInput.closest('div').append('<p>' + noteErr + '</p>');
                }

                if (currentInput.closest('div').find('.check-color-picker')) {
                    currentInput.closest('div').find('.check-color-picker').addClass('data-failed');
                }
            }, this);
        },
        clearErrMessages: function (rows, element) {
            _.each(rows, function (el) {
                if (el === 'color') {
                    return
                };
                var currentInput = $(element).find('[data-type=' + el + ']');
                currentInput.removeAttr('required');
                currentInput.closest('div').find('p').remove();
                currentInput.closest('div').find('.check-color-picker').removeClass('data-failed')
            });
        },
        destroy: function () {
            this.$el.remove();
            Backbone.Events.off(null, null, this);
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var DefectTypeView = Components.BaseView.extend({
        collection: {},
        name: '',
        diagrammParams: [],
        template: 'tpl-defect-type',
        subTemplate: 'tpl-defect-subType',
        initialize: function (options) {
            _.extend(this, options);
            this.el = $(this.el);
            this.updateControls();
            this.collection.on('AddNew:' + this.name, this.updateControls, this);
            this.collection.on('Remove:' + this.name, this.updateControls, this);
            this.collection.on('cancel:add', this.lockAddButton, this);
            this.collection.on('change', this.updateControls, this);
            this.collection.on('remove', this.updateControls, this);

        },
        events: {
            'click .add-item': 'addItem'
        },
        render: function () {
            var data;
            data = {
                name: this.name,
                color: this.color,
                addLeft: this.addLeft,
                edit: this.edit
            };
            this.el.html(Util.templates(this.template, data));
            this.updateControls();
            this.renderSubTypes();
        },
        renderSubTypes: function () {
            if (this.collection.length == 0) {
                return;
            }

            _.each(this.collection.models, function (model, key) {
                if (model.get('typeRef').toLowerCase() !== this.name) {
                    return;
                };
                var data = {
                    model: model,
                    parent: this,
                    edit: this.edit
                };
                this.renderItem(data);
                if (this.name === 'to_investigate') {
                    $(this.el).find('.controll-panel').remove();
                }

            }, this);

            this.getDataForDiagramm(this.collection);
            this.getDataForGraph(this.diagrammParams);
        },
        renderItem: function(data) {
            var id = data.model.get('locator');
            var template = Util.templates(this.subTemplate, {
                id: id,
                type: data.model.get('typeRef'),
                edit: data.edit
            });
            $('.controll-panel', this.el).before(template);
            data.el = $('#' + id, this.el);
            var view = new DefectSubTypeView(data);
            view.render();
            return view;
        },
        addItem: function(event) {
            event.preventDefault();
            var editModel = new DefectTypeModel({
                locator: 'newItem',
                typeRef: this.name.toUpperCase(),
                color: this.color
            });
            editModel.collection = this.collection
            $(event.currentTarget).attr('disabled', 'disabled');
            var data = {
                model: editModel,
                parent: this,
                edit: this.edit
            };
            var view = this.renderItem(data);
            view.editItem();
        },
        getDataForDiagramm: function (data) {
            var item;
            var temporaryArray = [];
            _.map(data.models, function (list) {
                if (list.get('typeRef').toLowerCase() !== this.name) {
                    return;
                }
                item = {
                    parent: list.get('typeRef').toLowerCase(),
                    child: {
                        itemLongName: list.get('longName').toLowerCase(),
                        itemShortName: list.get('shortName').toLowerCase(),
                        itemColor: list.get('color')
                    }
                };
                temporaryArray.push(item);
            }, this);
            this.diagrammParams = _.groupBy(temporaryArray, 'parent');
            return this.diagrammParams;
        },
        getDataForGraph: function (data) {
            _.map(data, function (param, key) {
                this.drawPieChart(param, key);
            }, this);
        },
        drawPieChart: function (params, selector) {
            var chart;
            var data = [];
            var pieWidth = 46;
            var pieHeight = 46;
            var id = "#diagramm_" + selector;

            _.map(params, function (param, k) {
                data.push({
                    key: param.child.itemLongName,
                    y: 1,
                    color: param.child.itemColor
                })
            }, this);

            chart = NVD3.models.pie()
                .x(function (d) {
                    return d.key;
                })
                .y(function (d) {
                    return d.y;
                })
                .width(pieWidth)
                .height(pieHeight)
                .showLabels(false)
                .donut(true)
                .donutRatio(0.40)
                .color(function (d) {
                    return d.data.color;
                })
                .valueFormat(D3.format('f'));

            D3.select(id)
                .datum([data])
                .transition()
                .duration(350)
                .attr('width', pieWidth)
                .attr('height', pieHeight)
                .call(chart);

            return chart;
        },

        // setParent: function () {
        //     var data = {
        //         name: this.name,
        //         color: this.color
        //     };
        //
        //     if (this.validateErrors) {
        //         data['validateErrors'] = this.validateErrors;
        //     }
        //     return data;
        // },
        updateDiagramm: function () {
            this.getDataForDiagramm(this.collection);
            this.getDataForGraph(this.diagrammParams);
        },
        onRemove: function () {
            this.updateControls();
            this.getDataForDiagramm(this.collection);
            this.getDataForGraph(this.diagrammParams);
        },
        lockAddButton: function () {
            var collectionLength = this.getCollectionLength();
            if (collectionLength >= 10 || $('#newItem', this.$el).length) {
                $(this.el).find('.add-item').prop('disabled', true);
                return;
            }
            $(this.el).find('.add-item').prop('disabled', false);
        },
        getCollectionLength: function () {
            var length = 0;
            _.each(this.collection.models, function (el) {
                var typeRef = el.get('typeRef').toLowerCase();
                if (typeRef === this.name) {
                    length++;
                }
            }, this);

            return length;
        },
        recountAddLeft: function () {
            var collectionLength = this.getCollectionLength();
            this.addLeft = 10 - collectionLength;

            var parent = this.$el.find('.add-item').parent();
            if (this.addLeft > 0) {
                $(parent).find('p:first span').html(this.addLeft);
                $(parent).find('p:last').hide();
                $(parent).find('p:first').show();
                return;
            };

            $(parent).find('p:first').hide();
            $(parent).find('p:last').show();
        },
        updateControls: function () {
            this.recountAddLeft();
            this.lockAddButton();
            this.updateDiagramm();
        },
        destroy: function () {
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var DefectView = Components.BaseView.extend({
        defectTypes: {},
        items: {},
        showOrder: ['product_bug', 'automation_bug', 'system_issue', 'no_defect', 'to_investigate'],
        editAccess: ['PROJECT_MANAGER', 'LEAD'],
        template: 'tpl-defect-type-main-view',
        confirmModal: 'tpl-modal-with-confirm',
        item: 'tpl-defect-type-item',
        events: {
            'click #reset-color': 'onResetColors'
        },
        canEdit: true,
        initialize: function (options) {
            this.$el = options.holder;
            this.drawOrder = this.showOrder.slice(0, this.showOrder.length).reverse();
            this.settings = options.settings;
            this.roles = options.roles;
            this.userRole = options.userRole || 'ADMINISTRATOR';
            if (this.userRole === "ADMINISTRATOR") {
                this.canEdit = true
            } else {
              this.canEdit = _.include(this.editAccess, this.roles.projectRole);
            }
            var self = this;
            this.defectTypes = new SingletonDefectTypeCollection();
            this.defectTypes.on('reset', function () {
                this.render();
            }, this);
            this.defectTypes.on('change remove add', _.debounce(self.updateControls, 100), this);
            // this.defectTypes.on('updated', this.onColUpdate, this);
        },
        updateControls: function() {
            this.drawChart();
            this.disableReset();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                order: this.showOrder,
                edit: this.canEdit
            }));
            this.renderTypes();
            return this;
        },
        renderTypes: function () {
            _.each(this.showOrder, function (value, key) {
                var currentColor = this.getColor(value);
                var view = new DefectTypeView({
                    name: value,
                    color: currentColor,
                    collection: this.defectTypes,
                    el: '#' + value,
                    edit: this.canEdit
                });
                view.render();
            }, this);

            this.updateControls();
        },
        getColor: function (section) {
            var color;
            _.each(this.defectTypes.models, function (item) {
                var id = item.get('locator');
                var itemSection = item.get('typeRef').toLowerCase();
                var fstId = item.get('shortName') + '001';
                if (id === fstId && itemSection == section) {
                    color = item.get('color');
                }
            })
            return color;
        },
        drawChart: function () {
            var data = this.getChartData();
            this.chart = NVD3.addGraph(function () {

                var chart = NVD3.models.stackedAreaChart()
                    .margin({
                        left: 0
                    })
                    .margin({
                        right: 0
                    })
                    .margin({
                        top: 0
                    })
                    .margin({
                        bottom: 0
                    })
                    .style('stack_percent')
                    .x(function (d) {
                        return d[0]
                    })
                    .y(function (d) {
                        return d[1]
                    })
                    .useInteractiveGuideline(false)
                    .rightAlignYAxis(true)
                    .showControls(false)
                    .clipEdge(true)
                    .height(150)
                    .showXAxis(false)
                    .showYAxis(false)
                    .showLegend(false);

                D3.select('#chart svg')
                    .datum(data)
                    .call(chart);

                chart.stacked.dispatch.on("areaClick", null);
                chart.stacked.dispatch.on("areaClick.toggle", null);

                NVD3.utils.windowResize(chart.update);

                return chart;
            });
        },
        getChartData: function () {
            var data = [];
            _.each(this.drawOrder, function (item, key) {
                _.each(this.defectTypes.models, function (model, i) {
                    if (model.get('typeRef').toLowerCase() !== item) {
                        return;
                    }
                    data.push({
                        key: model.get('typeRef'),
                        color: model.get('color'),
                        values: this.generateChartValues(i, key)
                    })
                }, this);
            }, this)

           return data;
        },
        generateChartValues: function (modelNo, key) {
            var data = [];
            var val;
            // magic formuls. I do not understand what is going on here
            for (var i = 1; i < 6; i++) {
                if (i == 0) {
                    val = 20 + (key + modelNo + i) * 3
                } else {
                    val = (i & 1) ?
                        ((modelNo & 1) ?
                            Math.random() * (50 - (10 + key + modelNo * 3)) + 10 :
                            Math.random() * (10 - key + modelNo) + 10) :
                        ((key & 1) ?
                            Math.random() * (10 - key + modelNo) + 10 :
                            Math.random() * (20 - (1 + key + modelNo * 3)) + 10);
                }
                data.push([i, val]);
            }
            return data;
        },
        onResetColors: function (event) {
            event.preventDefault();
            if ($(event.target).hasClass('disabled')) {
                return;
            } else {
                this.showModalResetColors();
            }
        },
        showModalResetColors: function () {
            var self = this;
            var modalDialog = {
                paramModal: {
                    additionalClass: 'dialog-reset-colors',
                    sizeModal: 'md',
                    withConfirm: false
                },
                dialogHeader: {
                    title: Localization.dialogHeader.titleEditDefectType
                },
                dialogBody: {
                    txtMessage: Localization.dialog.msgResetColorsDefectType
                },
                dialogFooter: {
                    cancelButton: Localization.uiCommonElements.cancel,
                    dangerButton: Localization.uiCommonElements.reset
                }
            };

            this.modalConfirmReset = Util.getDialog({
                name: this.confirmModal,
                data: modalDialog
            });

            this.modalConfirmReset
                .on('click', ".rp-btn-danger", function () {
                    self.resetColors();
                    self.modalConfirmReset.modal("hide");
                    Util.ajaxSuccessMessenger('changedColorDefectTypes');
                })
                .on('click', "input[type='checkbox'].confirm", function (event) {
                    var elem = event.target;
                    var btnDelete = $(elem).closest('.modal-body').find('.rp-btn-danger');
                    if (elem.checked) {
                        $(btnDelete.selector).removeAttr('disabled');
                    } else {
                        $(btnDelete.selector).attr("disabled", "disabled");
                    }
                })
                .on('hidden.bs.modal', function () {
                    $(this).data('modal', null);
                    self.modalConfirmReset.off().remove();
                    self.modalConfirmReset = null;
                });

            this.modalConfirmReset.modal("show");
        },
        resetColors: function () {
            this.defectTypes.trigger('resetColors');
        },
        disableReset: function () {
            var defaultColors = [];
            _.each(this.defectTypes.models, function(type){
                if(type.get('mainType')){
                    defaultColors.push(type.get('color'));
                }
            });
            var disable = _.every(this.defectTypes.models, function (type) {
                return _.contains(defaultColors, type.get('color'));
            }, this);
            if (disable) {
                $('#reset-color').addClass('disabled');
                $('#reset-color').attr('title', Localization.project.noCustomColors);
                return;
            }
            $('#reset-color').removeClass('disabled');
            $('#reset-color').removeAttr('title');
        },
        destroy: function () {
            this.defectTypes.off('reset');
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    return {
        ContentView: ContentView,
        SettingsView: SettingsView,
        NotificationsView: NotificationsView,
        BtsView: BtsView,
        BtsProperties: BtsProperties,
        DefectView: DefectView
    };
});