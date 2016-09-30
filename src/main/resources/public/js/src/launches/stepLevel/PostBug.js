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

    var $ = require('jquery');
    var Util = require('util');
    var App = require('app');
    var Components = require('core/components');
    var Localization = require('localization');
    var Storage = require('storageService');
    var Helpers = require('helpers');
    var CoreService = require('coreService');

    var config = App.getInstance();

    var PostBug = Components.DialogShell.extend({

        initialize: function (options) {
            options['headerTxt'] = 'postBug';
            options['actionTxt'] = 'submit';
            options['actionStatus'] = true;
            Components.DialogShell.prototype.initialize.call(this, options);
            var systems = config.project.configuration.externalSystem;

            this.items = options.items ? options.items : [this.model];
            this.selected = this.items.length || 1;
            this.systems = _.sortBy(systems, 'project');
            this.editor = options.editor;
            this.settings = config.forSettings;
            this.systemSettings = this.settings['bts' + systems[0].systemType];
            this.user = config.userModel.toJSON();
            this.systemType = systems[0].systemType;
            this.systemAuth = systems[0].systemAuth;
            this.setUserBts();
        },

        setupAnchors: function () {
            this.$dynamicContent = $("#dynamicContent", this.$el);
            this.$includesBlock = $("#includesBlock", this.$el);
            this.$includeLogs = $("#include_logs", this.$includesBlock);
            this.$includeData = $("#include_data", this.$includesBlock);
            this.$includeComments = $("#include_comments", this.$includesBlock);
            this.$postToUrl = $("#postToUrl", this.$el);

            this.$credentialsLink = $("#credentialsLink", this.$el);
            this.$collapseCredentials = $("#collapseCredentials", this.$el);
            this.$authorizationType = $("#authorizationType", this.$el);

            this.$requiredFieldsWarning = $("#requiredFields", this.$el);
            this.$credentialsSoftWarning = $("#credentialsSoft", this.$el);
            this.$credentialsWrongWarning = $("#credentialsWrong", this.$el);
        },

        contentBody: 'tpl-bts-post-bug',
        fieldsTpl: 'tpl-dynamic-fields',
        authTpl: 'tpl-bts-auth-type',

        render: function () {
            Components.DialogShell.prototype.render.call(this, {isBeta: true});
            this.$content.html(Util.templates(this.contentBody, {
                selected: this.selected,
                source: Util.getExternalSystem(true),
                systems: this.systems,
                authorizationTypes: this.settings['bts' + this.systemType].authorizationType,
                collapse: this.user.bts.hash[this.user.bts.current.id].submits > 0,
                showCredentialsSoft: this.settings['bts' + this.systemType].canUseRPAuthorization,
                current: this.user.bts.current
            }));

            this.setupAnchors();
            Util.switcheryInitialize(this.$includesBlock);

            this.renderFields();
            this.renderCredentials();
            this.attachKeyActions();
            this.delegateEvents();
            return this;
        },
        renderFields: function () {
            this.$dynamicContent.html(Util.templates(this.fieldsTpl, {
                collection: this.user.bts.current.fields,
                disabled: this.systemSettings.disabledForEdit,
                update: false,
                access: true,
                popup: true,
            }));
            if (this.user.bts.current.fields) {
                Helpers.applyTypeForBtsFields(this.user.bts.current.fields, this.$dynamicContent);
                this.$actionBtn.prop("disabled", false);
            } else {
                this.$actionBtn.prop("disabled", true);
            }
        },

        renderCredentials: function () {
            var data = {
                systemAuth: this.systemAuth,
                access: true,
                post: true,
            };
            var storedBts = Storage.getBtsCredentials() || {},
                currentId = this.user.bts.current.id;
            _.extend(data, this.user.bts.hash[currentId], storedBts[currentId]);
            data.hasPassword = !!this.user.bts.hash[currentId].password;
            data.defaultPassword = this.settings.defaultPassword;
            this.$authorizationType.html(Util.templates(this.authTpl, data));
        },

        updateFieldSet: function (e) {
            e.preventDefault();
            if ($(e.currentTarget).parent().hasClass('active')) return;
            Util.dropDownHandler(e);
            this.user.bts.current = _.find(this.systems, {id: $(e.currentTarget).attr('id')});
            this.updateHash();
            this.renderFields();
            this.renderCredentials();
            this.$postToUrl.text(this.user.bts.current.url);
            this.$requiredFieldsWarning.hide();

            this.$credentialsLink.removeClass('collapsed');
            this.$collapseCredentials.addClass('in');
        },

        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'click .option-selector': 'handleDropDown',
                'click .auth-type': 'handleDropDown',
                'keyup .required-value': 'clearRequiredError',
                'click .project-name': 'updateFieldSet'
            });
        },
        
        attachKeyActions: function(){
            this.$el.on('keydown', function(e){
                if(e.ctrlKey && e.keyCode === 13){
                    this.submit();
                }
            }.bind(this))
        },

        handleCredentials: function (e) {
            Util.dropDownHandler(e);
            var type = $(e.currentTarget).parent().attr('id');
            if (this.systemAuth !== type) {
                this.systemAuth = type;
                this.renderCredentials();
            }
        },

        handleDropDown: function (e) {
            Util.dropDownHandler(e);
        },

        clearRequiredError: function (e) {
            var $el = $(e.currentTarget);
            if ($el.val()) {
                $el.closest('.rp-form-group').removeClass('has-error');
                $el.closest('.has-error').removeClass('has-error');

                var allFiled = true;
                $('#basicBlock input').each(function() {
                    if (!$(this).val()) {
                        allFiled = false;
                    }
                });

                if (allFiled) {
                    this.$credentialsWrongWarning.hide();
                }
            }
            if (!$(".has-error", this.$dynamicContent).length) {
                this.$requiredFieldsWarning.hide();
            }
        },

        submit: function () {
            var data = this.getData(),
                self = this,
                errorHandler = function (error) {
                    if (error.status !== 401) {
                        self.parseError(error);
                    }
                    self.$loader.hide();
                };
            if (data) {
                this.$loader.show();
                this.inSubmit = true;
                CoreService.postBugToBts(data, this.user.bts.current.id)
                    .done(function (response) {
                        var issues = self.bindTicketToIssues(response);
                        CoreService.updateDefect({issues: issues})
                            .done(function (resp) {
                                self.updateItems(resp);
                                Util.ajaxSuccessMessenger("addTicket");
                                self.trigger("bug::attached");
                                self.done();
                            })
                            .fail(function (error) {
                                errorHandler(error);
                            });
                        self.persistCredentials();
                        config.trackingDispatcher.jiraTicketPost(data.include_data, data.include_logs);
                    })
                    .fail(function (error) {
                        errorHandler(error);
                    })
                    .always(function () {
                        this.inSubmit = false;
                    });
            }
        },

        updateItems: function(data){
            var btsIssue = data[0];
            _.each(this.items, function(item){
                var issue = item.getIssue();
                issue.externalSystemIssues = btsIssue.externalSystemIssues;
                item.setIssue(issue);
            });
        },

        persistCredentials: function () {
            var currentHash = this.user.bts.hash[this.user.bts.current.id];
            currentHash.submits += 1;
            var data = {username: currentHash.username, id: currentHash.id};
            if (currentHash.domain) data.domain = currentHash.domain;

            Storage.setBtsCredentials(data);
        },

        bindTicketToIssues: function (response) {
            var issues = [];
            _.forEach(this.items, function (item, i) {
                var defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge'),
                    chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null,
                    itemIssue = item.getIssue(),
                    issue = {
                        issue_type: chosenIssue ? chosenIssue : itemIssue.issue_type,
                        comment: itemIssue.comment,
                        externalSystemIssues: itemIssue.externalSystemIssues || []
                    };

                if ($('#replaceComments').prop('checked')) {
                    issue.comment = $('.markItUpEditor').val().length > 0 ? $('.markItUpEditor').val() : itemIssue.comment;
                }

                if (item.id == $('.editor-row').closest('.selected').attr('id')) {
                    issue.comment = $('.markItUpEditor').val();
                }
                issue.externalSystemIssues.push({
                    ticketId: response.id,
                    systemId: this.user.bts.current.id,
                    url: response.url
                });
                issues.push({issue: issue, test_item_id: item.get('id')});
            }, this);
            return issues;
        },

        setUserBts: function () {
            if (!this.user.bts) {
                this.user.bts = {
                    hash: {},
                    current: null
                };
                this.user.bts.current = this.systems[0];
                this.updateHash();
            } else {
                if (!this.user.bts.current) {
                    this.user.bts.current = this.systems[0];
                } else {
                    this.user.bts.current = _.find(this.systems, {id: this.user.bts.current.id});
                }
            }
        },

        updateHash: function () {
            if (!this.user.bts.hash[this.user.bts.current.id]) {
                this.user.bts.hash[this.user.bts.current.id] = {
                    type: this.systemType,
                    id: this.user.bts.current.id,
                    submits: 0
                };
            }
        },

        parseError: function (error) {
            if (error.responseText) {
                this.$credentialsSoftWarning.hide();
                try {
                    var responseObj = JSON.parse(error.responseText);
                    if (responseObj.message.indexOf(this.systemSettings.credentialsErrorPattern) !== -1) {
                        this.highlightCredentials(true);
                    }
                    if (config.patterns.htmlError.test(responseObj.message)) {
                        var bodyText = responseObj.message.match(config.patterns.getBodyContent).map(function (val) {
                            return val.replace(config.patterns.replaceBodyTag, '');
                        });
                        this.$credentialsWrongWarning.html(bodyText[0]).show();
                        this.validateBtsHomeLink();
                    } else {
                        this.$credentialsWrongWarning.text(this.$credentialsWrongWarning.data('general') + error.responseText).show();
                    }
                } catch (e) {
                    this.$credentialsWrongWarning.text(this.$credentialsWrongWarning.data('general') + error.responseText).show();
                }
                return;
            }
            this.$el.modal('hide');
            Util.ajaxFailMessenger(null, 'postTicketToBts');
        },

        validateBtsHomeLink: function () {
            if (Util.getExternalSystem() === config.btsEnum.jira) {
                var link = $("a", this.$credentialsWrongWarning),
                    abstractLink = document.createElement('a');

                abstractLink.href = this.user.bts.current.url;

                var abstractRoot = abstractLink.protocol + "//" + abstractLink.host,
                    currentUrl = link.attr('href');
                link.attr('href', abstractRoot + currentUrl);
                link.attr('target', '_blank');
            }
        },

        highlightCredentials: function (direction, el) {
            var action = direction ? 'add' : 'remove';
            if (el) {
                el.closest(".rp-form-group")[action + "Class"]('has-error');
            } else {
                $("#authorizationType .col-sm-12", this.$collapseCredentials)[action + "Class"]('has-error');
            }
            direction && this.$credentialsSoftWarning.hide();
        },

        validateCredentials: function () {
            var valid = false,
                currentHash = this.user.bts.hash[this.user.bts.current.id],
                clearBasic = function () {
                    delete currentHash.username;
                    delete currentHash.password;
                    delete currentHash.domain;
                }.bind(this);
            this.$authorizationType.find('.has-error').removeClass('has-error');
            switch (this.systemAuth) {
                case 'BASIC':
                case 'NTLM':
                    delete currentHash.accessKey;
                    var inputs = $(".form-control", this.$authorizationType),
                        allEmpty = _.every(inputs, function (inp) {
                            return !inp.value;
                        }),
                        allFilled = _.every(inputs, function (inp) {
                            return inp.value;
                        });
                    if (allFilled || (allEmpty && currentHash.type != "JIRA")) {
                        valid = true;
                        if (allEmpty) clearBasic();
                        if (inputs[0].value) {
                            _.forEach(inputs, function (input) {
                                if (input.id === 'password' && input.value === this.settings.defaultPassword) {
                                    return;
                                }
                                currentHash[input.id] = input.value;
                            }.bind(this));
                        }
                    } else {
                        clearBasic();
                        _.forEach(inputs, function (input) {
                            if (!input.value) {
                                $(input).closest('.col-sm-12').addClass('has-error');
                            } else {
                                $(input).closest('.col-sm-12').removeClass('has-error');
                            }
                        });
                        this.$credentialsWrongWarning.text(this.$credentialsWrongWarning.data('fill')).show();
                    }
                    break;
                case 'APIKEY':
                    clearBasic();
                    var apiKey = $("#accessKey", this.$authorizationType);
                    if (apiKey.val().length) {
                        currentHash.accessKey = apiKey.val();
                        valid = true;
                    } else {
                        apiKey.parent().addClass('has-error');
                        this.$credentialsWrongWarning.text(this.$credentialsWrongWarning.data('fill')).show();
                    }
                default :
                    break;

            }
            if (valid) {
                this.$credentialsWrongWarning.hide();
            }
            return valid;
        },

        getData: function () {

            var hasError = false,
                fields = [],
                result,
                isRally = this.systemType === config.btsEnum.rally;

            _.forEach($(".default-value, select", this.$dynamicContent), function (el) {
                var element = $(el), isMultiSelect = false;

                if (element.hasClass('users-typeahead')) {
                    if (element.is('div')) {
                        return;
                    }
                    isMultiSelect = true;
                }

                var required = element.hasClass('required-value'),
                    value = element.hasClass('rp-btn') ? $(".select-value", element).text() : element.val().trim();
                if (isMultiSelect) {
                    var tmp = value.split(',');
                    value = tmp[0] === "" ? [] : tmp;
                } else {
                    value = value ? [value] : [];
                }

                if (required && !value.length) {
                    hasError = true;
                    element.closest('.rp-form-group').addClass('has-error');
                }
                if (!required && !hasError) {
                    hasError = element.closest('.rp-form-group').hasClass('has-error');
                }

                var field = {
                    value: value,
                    required: required,
                    id: element.attr('id'),
                    fieldType: element.data('type')
                };
                if (isRally) {
                    field.fieldName = element.data('name');
                }
                fields.push(field);
            });

            if (!this.validateCredentials() || hasError) {
                hasError && this.$requiredFieldsWarning.show();
                return;
            }
            this.$requiredFieldsWarning.hide();

            // get static fields
            result = {
                fields: fields,
                backLinks: this.getLinks(),
                item: this.items[0].get('id'),
                log_quantity: this.systemSettings.logsAmount
            };
            var currentHash = this.user.bts.hash[this.user.bts.current.id];
            if (currentHash.username) {
                result['username'] = currentHash.username;
                result['password'] = currentHash.password;
                if (currentHash.domain) {
                    result['domain'] = currentHash.domain;
                }
            }
            if (currentHash.accessKey) {
                // todo find out why you have to configure system with accessKey BUT submit with token???
                result['token'] = currentHash.accessKey;
            }

            var includes = this.selected === 1;
            result['include_logs'] = includes ? this.$includeLogs.bootstrapSwitch('state') : false;
            result['include_data'] = includes ? this.$includeData.bootstrapSwitch('state') : false;
            result['include_comments'] = includes ? this.$includeComments.bootstrapSwitch('state') : false;
            return result;
        },

        getLinks: function () {
            var backLink = {},
                location = window.location.href;
            if (this.items.length > 1) {
                _.forEach(this.items, function (item) {
                    backLink[item.get('id')] = location + '/log-for-' + item.get('id');
                });
            } else {
                var id = this.items[0].get('id');
                if (location.indexOf('/log-for-') > 0) {
                    backLink[id] = location;
                } else {
                    backLink[id] = location + '/log-for-' + id;
                }
            }
            return backLink;
        },

        destroy: function () {
            this.items = null;
            this.selected = null;
            this.systems = null;
            this.settings = null;
            this.systemSettings = null;
            this.user = null;
            Components.DialogShell.prototype.destroy.call(this);
        }

    });

    return PostBug;
});