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

// TODO - rewrite


define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Components = require('core/components');
    var Util = require('util');
    var SingletonAppModel = require('model/SingletonAppModel');
    var App = require('app');
    var Helpers = require('helpers');
    var Storage = require('storageService');
    var UserModel = require('model/UserModel');
    var Service = require('coreService');


    var config = App.getInstance();

    var ModalPostBug = ModalView.extend({
        contentBody: 'tpl-modal-post-bug',
        fieldsTpl: 'tpl-dynamic-fields',
        authTpl: 'tpl-bts-auth-type',

        className: 'modal-post-bug',

        events: {
            'click .option-selector': 'handleDropDown',
            'click .auth-type': 'handleDropDown',
            'click [data-js-post]': 'submit',
            'keyup .required-value': 'clearRequiredError',
            'click .project-name': 'updateFieldSet'
        },

        initialize: function (options) {
            this.appModel = new SingletonAppModel();
            this.items = options.items;
            this.isMultiply = (this.items.length > 1);
            this.systems = this.appModel.getArr('externalSystem');
            this.settings = config.forSettings;
            this.systemSettings = this.settings['bts' + this.systems[0].systemType];
            this.user = {}; // only bts field use  WTF?
            this.systemType = this.systems[0].systemType;
            this.systemAuth = this.systems[0].systemAuth;
            this.setUserBts();
            this.render();
        },

        handleDropDown: function (e) {
            Util.dropDownHandler(e);
        },

        render: function () {
            this.$el.html(Util.templates(this.contentBody, {
                isMultiply: this.isMultiply,
                source: Util.getExternalSystem(true),
                systems: this.systems,
                authorizationTypes: this.settings['bts' + this.systemType].authorizationType,
                collapse: this.user.bts.hash[this.user.bts.current.id].submits > 0,
                showCredentialsSoft: this.settings['bts' + this.systemType].canUseRPAuthorization,
                current: this.user.bts.current
            }));

            this.setupAnchors();
            //Util.switcheryInitialize(this.$includesBlock);
            $('[data-js-is-included]', this.$includesBlock).attr('checked', 'checked');

            this.renderFields();
            this.renderCredentials();

            this.delegateEvents();
            return this;
        },



        setupAnchors: function () {
            this.$dynamicContent = $("#dynamicContent", this.$el);
            this.$includesBlock = $("#includesBlock", this.$el);
            this.$includeLogs = $("#include_logs > [data-js-is-included]", this.$includesBlock);
            this.$includeData = $("#include_data > [data-js-is-included]", this.$includesBlock);
            this.$includeComments = $("#include_comments > [data-js-is-included]", this.$includesBlock);
            this.$postToUrl = $("#postToUrl", this.$el);
            this.$actionBtn = $("[data-js-ok]", this.$el);
            this.$credentialsLink = $("#credentialsLink", this.$el);
            this.$collapseCredentials = $("#collapseCredentials", this.$el);
            this.$authorizationType = $("#authorizationType", this.$el);
            this.$requiredFieldsWarning = $("#requiredFields", this.$el);
            this.$credentialsSoftWarning = $("#credentialsSoft", this.$el);
            this.$credentialsWrongWarning = $("#credentialsWrong", this.$el);
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

        onKeySuccess: function () {
            $('[data-js-post]', this.$el).trigger('click');
        },

        submit: function () {
            var data = this.getData(),
                self = this,
                errorHandler = function (error) {
                    if (error.status !== 401) {
                        self.parseError(error);
                    }
                    self.hideLoading();
                };
            if (data) {
                this.showLoading();
                this.inSubmit = true;
                Service.postBugToBts(data, this.user.bts.current.id)
                    .done(function (response) {
                        var issues = self.bindTicketToIssues(self.items, response);
                        Service.updateDefect({issues: issues})
                            .done(function () {
                                _.each(self.items, function (item) {
                                    _.each(issues, function (issue) {
                                        if (item.id == issue.test_item_id) {
                                            self.addIssuesToItem(item, issue.issue.externalSystemIssues);
                                        }
                                    });
                                });
                                Util.ajaxSuccessMessenger("addTicket");
                                self.successClose();
                            })
                            .fail(function (error) {
                                errorHandler(error);
                            });
                        self.persistCredentials();
                        // config.trackingDispatcher.jiraTicketPost(data.include_data, data.include_logs);
                    })
                    .fail(function (error) {
                        errorHandler(error);
                    })
                    .always(function () {
                        self.inSubmit = false;
                    });
            }
        },

        bindTicketToIssues: function (items, response) {
            var issues = [];
            _.forEach(items, function (item, i) {
                var defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge'),
                    chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null,
                    issue = {
                        issue_type: chosenIssue ? chosenIssue : JSON.parse(item.get('issue')).issue_type,
                        comment: item.get('issue').comment,
                        externalSystemIssues: item.getIssue().externalSystemIssues || []
                    };

                if ($('#replaceComments').prop('checked')) {
                    issue.comment = $('.markItUpEditor').val().length > 0 ? $('.markItUpEditor').val() : item.issue.comment;
                }

                if (item.id == $('.editor-row').closest('.selected').attr('id')) {
                    var val = $('.markItUpEditor').val(),
                        comment = item.issue.comment;
                    issue.comment = comment && (val.trim() === comment.trim()) ? comment : val;
                }
                issue.externalSystemIssues.push({
                    ticketId: response.id,
                    systemId: this.user.bts.current.id,
                    url: response.url
                });
                issues.push({issue: issue, test_item_id: item.id});
            }, this);
            return issues;
        },

        addIssuesToItem: function(item, issues) {
            var self = this;
            var curIssue = item.getIssue();
            if(!curIssue.externalSystemIssues) {
                curIssue.externalSystemIssues = [];
            }
            var newIds = _.map(issues, function(issue) {
                return issue.ticketId;
            });

            var newExternalSystemIssues = [];  // remove not unique item
            _.each(curIssue.externalSystemIssues, function(externalItem) {
                if(!_.contains(newIds, externalItem.ticketId)){
                    newExternalSystemIssues.push(externalItem);
                }
            }, this);

            _.each(issues, function(issue) {
                newExternalSystemIssues.push({
                    systemId: issue.systemId,
                    ticketId: issue.ticketId,
                    url: issue.url,
                })
            }, this);
            curIssue.externalSystemIssues = newExternalSystemIssues;
            item.setIssue(curIssue);
        },

        persistCredentials: function () {
            var currentHash = this.user.bts.hash[this.user.bts.current.id];
            currentHash.submits += 1;
            var data = {username: currentHash.username, id: currentHash.id};
            if (currentHash.domain) data.domain = currentHash.domain;

            Storage.setBtsCredentials(data);
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
                        console.log(error.responseText);
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

        getData: function () {

            var hasError = false,
                fields = [],
                result,
                isRally = this.systemType === config.btsEnum.rally;
            // get dynamic fields
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
                item: this.items[0].id,
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
            result['include_logs'] = this.isMultiply ? false : this.$includeLogs.is(':checked');
            result['include_data'] = this.isMultiply ? false : this.$includeData.is(':checked');
            result['include_comments'] = this.isMultiply ? false : this.$includeComments.is(':checked');
            return result;
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
                    var inputs = $(".bts-property", this.$authorizationType),
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
                                $(input).closest('.rp-form-group').addClass('has-error');
                            } else {
                                $(input).closest('.rp-form-group').removeClass('has-error');
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

        getLinks: function () {
            var backLink = {},
                backlinkFirstPart = window.location.protocol + '//' + window.location.host + '/ui/#' + this.appModel.get('projectId') + '/launches/all',
                backlinkMiddlePart;
            if (this.items.length > 1) {
                _.forEach(this.items, function (item) {
                    backlinkMiddlePart = '/' + item.get('launchId');

                    for (var key in item.get('path_names')) {
                        backlinkMiddlePart += '/' + key;
                    }

                    backLink[item.id] = backlinkFirstPart + backlinkMiddlePart + '?log.item=' + item.id;
                });
            } else {
                var id = this.items[0].id;

                backlinkMiddlePart = '/' + this.items[0].get('launchId');

                for (var key in this.items[0].get('path_names')) {
                    backlinkMiddlePart += '/' + key;
                }

                backLink[id] = backlinkFirstPart + backlinkMiddlePart + '?log.item=' + id;
            }
            return backLink;
        },
    });

    return ModalPostBug;
});
