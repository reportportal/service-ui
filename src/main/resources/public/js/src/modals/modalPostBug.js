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


define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var SingletonAppModel = require('model/SingletonAppModel');
    var App = require('app');
    var Storage = require('storageService');
    var Service = require('coreService');
    var DropDownComponent = require('components/DropDownComponent');
    var config = App.getInstance();
    var BtsFieldsCommonView = require('bts/BtsFieldsCommonView');
    var PostBugFieldsView;
    var ModalPostBug;
    var Localization = require('localization');
    require('jquery-ui/widgets/datepicker');

    PostBugFieldsView = BtsFieldsCommonView.extend({
        template: 'tpl-dynamic-fields',
        initialize: function (options) {
            this.render(options);
        },
        render: function (options) {
            this.$el.html(Util.templates(this.template, {
                collection: options.collection,
                disabled: options.disabled,
                update: false,
                access: true,
                popup: true
            }));
        },
        onDestroy: function () {
        }
    });

    ModalPostBug = ModalView.extend({
        contentBody: 'tpl-modal-post-bug',
        authTpl: 'tpl-bts-auth-type',

        className: 'modal-post-bug',

        events: {
            'click [data-js-post]': 'submit',
            'keyup .required-value': 'clearRequiredError',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-is-included]': 'onClickIncludeData',
            'click [data-js-cancel]': 'onClickCancel',
            'change [data-js-is-included]': 'disableHideBackdrop',
            'click [data-js-dropdown-menu]': 'disableHideBackdrop',
            'click [data-id]': 'disableHideBackdrop'
        },
        initialize: function (options) {
            this.from = options.from;
            this.appModel = new SingletonAppModel();
            this.items = options.items;
            this.isMultiply = (this.items.length > 1);
            this.systems = this.appModel.getArr('externalSystem');
            this.settings = config.forSettings;
            this.systemSettings = this.settings['bts' + this.systems[0].systemType];
            this.user = {}; // only bts field use  WTF?
            this.systemType = this.systems[0].systemType;
            this.systemAuth = this.systems[0].systemAuth;
            this.dropdownComponents = [];
            this.setUserBts();
            this.render();
        },

        render: function () {
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.ui.post,
                    btnClass: 'rp-btn-submit',
                    label: 'data-js-post'
                }
            ];
            this.$el.html(Util.templates(this.contentBody, {
                isMultiply: this.isMultiply,
                source: Util.getExternalSystem(true),
                systems: this.systems,
                collapse: this.user.bts.hash[this.user.bts.current.id].submits > 0,
                showCredentialsSoft: this.settings['bts' + this.systemType].canUseRPAuthorization,
                footerButtons: footerButtons
            }));
            return this;
        },
        onShow: function () {
            this.setupDropdowns();
            this.setupAnchors();
            $('[data-js-is-included]', this.$includesBlock).attr('checked', 'checked');
            this.renderFields();
            this.renderCredentials();
            this.delegateEvents();
        },

        setupDropdowns: function () {
            var projectSelector = new DropDownComponent({
                data: _.map(this.systems, function (val) {
                    return { name: val.project, value: val.id, disabled: false };
                }),
                multiple: false,
                defaultValue: this.user.bts.current.id
            });
            var authTypeselector = new DropDownComponent({
                data: _.map(this.settings['bts' + this.systemType].authorizationType, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: this.settings['bts' + this.systemType].authorizationType[0].value
            });
            $('[data-js-project-selector]', this.$el).html(projectSelector.$el);
            $('[data-js-auth-selector]', this.$el).html(authTypeselector.$el);
            $('[data-js-dropdown]', projectSelector.$el).attr('id', 'targetProject');
            $('[data-js-dropdown]', authTypeselector.$el).attr('id', 'systemAuth');
            this.listenTo(projectSelector, 'change', this.updateFieldSet);
            this.dropdownComponents.push(projectSelector, authTypeselector);
        },

        setupAnchors: function () {
            this.$dynamicContent = $('#dynamicContent', this.$el);
            this.$includesBlock = $('#includesBlock', this.$el);
            this.$includeLogs = $('#include_logs > [data-js-is-included]', this.$includesBlock);
            this.$includeData = $('#include_data > [data-js-is-included]', this.$includesBlock);
            this.$includeComments = $('#include_comments > [data-js-is-included]', this.$includesBlock);
            this.$postToUrl = $('#postToUrl', this.$el);
            this.$actionBtn = $('[data-js-ok]', this.$el);
            this.$credentialsLink = $('#credentialsLink', this.$el);
            this.$collapseCredentials = $('#collapseCredentials', this.$el);
            this.$authorizationType = $('#authorizationType', this.$el);
            this.$requiredFieldsWarning = $('#requiredFields', this.$el);
            this.$credentialsSoftWarning = $('#credentialsSoft', this.$el);
            this.$credentialsWrongWarning = $('#credentialsWrong', this.$el);
        },

        setUserBts: function () {
            if (!this.user.bts) {
                this.user.bts = {
                    hash: {},
                    current: null
                };
                this.user.bts.current = this.systems[0];
                this.updateHash();
            } else if (!this.user.bts.current) {
                this.user.bts.current = this.systems[0];
            } else {
                this.user.bts.current = _.find(this.systems, { id: this.user.bts.current.id });
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

        updateFieldSet: function (value) {
            this.user.bts.current = _.find(this.systems, { id: value });
            this.updateHash();
            this.renderFields();
            this.renderCredentials();
            this.$postToUrl.text(this.user.bts.current.url);
            this.$requiredFieldsWarning.hide();

            this.$credentialsLink.removeClass('collapsed');
            this.$collapseCredentials.addClass('in');
        },
        renderFields: function () {
            this.postBugFieldsView = new PostBugFieldsView({
                collection: this.user.bts.current.fields,
                disabled: this.systemSettings.disabledForEdit
            });
            this.$dynamicContent.html(this.postBugFieldsView.$el);
            this.setupFieldsDropdowns(this.user.bts.current.fields);
            if (this.user.bts.current.fields) {
                this.postBugFieldsView.applyTypeForBtsFields(
                    this.user.bts.current.fields, this.$dynamicContent
                );
                this.$actionBtn.prop('disabled', false);
            } else {
                this.$actionBtn.prop('disabled', true);
            }
        },


        setupFieldsDropdowns: function (fields) {
            var self = this;
            $('[data-js-field-with-dropdown]', this.$el).each(function (i, elem) {
                var field = _.find(fields, function (item) {
                    return $(elem).attr('data-js-field-with-dropdown') === item.id;
                });
                var fieldWithDropdown = new DropDownComponent({
                    data: _.map(field.definedValues, function (val) {
                        return { name: val.valueName,
                            value: (val.valueId || val.valueName),
                            disabled: false
                        };
                    }),
                    multiple: false,
                    defaultValue: (field.value) ? (function () {
                        var defaultValue = _.find(field.definedValues, function (item) {
                            return (field.value[0] === item.valueId)
                                || (field.value[0] === item.valueName);
                        });
                        if (!defaultValue) {
                            return '';
                        }
                        return defaultValue.valueId || defaultValue.valueName;
                    }()) : (field.definedValues[0].valueId || field.definedValues[0].valueName || '')
                });
                $(this).html(fieldWithDropdown.$el);
                $('[data-js-dropdown]', $(this)).attr('id', $(this).attr('data-js-field-with-dropdown')).addClass('default-value');
                if (!config.userModel.hasPermissions()
                    || (config.forSettings.btsJIRA.disabledForEdit.indexOf(field.id) !== -1)) {
                    $('[data-js-dropdown]', $(this)).attr('disabled', 'disabled');
                }
                if (field.required) {
                    $('[data-js-dropdown]', $(this)).addClass('required-value');
                }
                self.dropdownComponents.push(fieldWithDropdown);
            });
        },

        renderCredentials: function () {
            var data = {
                systemAuth: this.systemAuth,
                access: true,
                post: true
            };
            var storedBts = Storage.getBtsCredentials() || {};
            var currentId = this.user.bts.current.id;
            _.extend(data, this.user.bts.hash[currentId], storedBts[currentId]);
            data.hasPassword = !!this.user.bts.hash[currentId].password;
            data.defaultPassword = this.settings.defaultPassword;
            this.$authorizationType.html(Util.templates(this.authTpl, data));
        },

        onKeySuccess: function () {
            $('[data-js-post]', this.$el).trigger('click');
        },

        onClickClose: function () {
            if (this.from === 'logs') {
                config.trackingDispatcher.trackEventNumber(215);
            } else {
                config.trackingDispatcher.trackEventNumber(170);
            }
        },

        onClickCancel: function () {
            if (this.from === 'logs') {
                config.trackingDispatcher.trackEventNumber(219);
            } else {
                config.trackingDispatcher.trackEventNumber(174);
            }
        },

        onClickIncludeData: function (e) {
            var type = $(e.currentTarget).closest('.rp-switcher-big').attr('id');
            if (this.from === 'logs') {
                switch (type) {
                case 'include_logs':
                    config.trackingDispatcher.trackEventNumber(217);
                    break;
                case 'include_comments':
                    config.trackingDispatcher.trackEventNumber(218);
                    break;
                default:
                    config.trackingDispatcher.trackEventNumber(216);
                }
            } else {
                switch (type) {
                case 'include_logs':
                    config.trackingDispatcher.trackEventNumber(172);
                    break;
                case 'include_comments':
                    config.trackingDispatcher.trackEventNumber(173);
                    break;
                default:
                    config.trackingDispatcher.trackEventNumber(171);
                }
            }
        },

        submit: function () {
            var data = this.getData();
            var self = this;
            var errorHandler = function (error) {
                if (error.status !== 401) {
                    self.parseError(error);
                }
                self.hideLoading();
            };
            if (data) {
                if (this.from === 'logs') {
                    config.trackingDispatcher.trackEventNumber(220);
                } else {
                    config.trackingDispatcher.trackEventNumber(175);
                }
                this.showLoading();
                this.inSubmit = true;
                Service.postBugToBts(data, this.user.bts.current.id)
                    .done(function (response) {
                        var issues = self.bindTicketToIssues(self.items, response);
                        Service.updateDefect({ issues: issues })
                            .done(function () {
                                _.each(self.items, function (item) {
                                    _.each(issues, function (issue) {
                                        if (item.id === issue.test_item_id) {
                                            self.addIssuesToItem(item, issue
                                                .issue.externalSystemIssues);
                                        }
                                    });
                                });
                                Util.ajaxSuccessMessenger('addTicket');
                                self.successClose();
                            })
                            .fail(function (error) {
                                errorHandler(error);
                            });
                        self.persistCredentials();
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
            var defectBadge;
            var chosenIssue;
            var issue;
            var val;
            var comment;
            _.forEach(items, function (item) {
                var itemIssue = item.getIssue();
                defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge');
                chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null;
                issue = {
                    issue_type: chosenIssue || itemIssue.issue_type,
                    comment: itemIssue.comment,
                    externalSystemIssues: itemIssue.externalSystemIssues || []
                };

                if ($('#replaceComments').prop('checked')) {
                    issue.comment = $('.markItUpEditor').val().length > 0 ? $('.markItUpEditor').val() : item.issue.comment;
                }

                if (item.id === $('.editor-row').closest('.selected').attr('id')) {
                    val = $('.markItUpEditor').val();
                    comment = item.issue.comment;
                    issue.comment = comment && (val.trim() === comment.trim()) ? comment : val;
                }
                issue.ignoreAnalyzer = itemIssue.ignoreAnalyzer;
                issue.autoAnalyzed = false;
                issue.externalSystemIssues.push({
                    ticketId: response.id,
                    systemId: this.user.bts.current.id,
                    url: response.url
                });
                issues.push({ issue: issue, test_item_id: item.id });
            }, this);
            return issues;
        },

        addIssuesToItem: function (item, issues) {
            var curIssue = item.getIssue();
            var newIds;
            var newExternalSystemIssues;
            if (!curIssue.externalSystemIssues) {
                curIssue.externalSystemIssues = [];
            }
            newIds = _.map(issues, function (issue) {
                return issue.ticketId;
            });

            newExternalSystemIssues = [];  // remove not unique item
            _.each(curIssue.externalSystemIssues, function (externalItem) {
                if (!_.contains(newIds, externalItem.ticketId)) {
                    newExternalSystemIssues.push(externalItem);
                }
            }, this);

            _.each(issues, function (issue) {
                newExternalSystemIssues.push({
                    systemId: issue.systemId,
                    ticketId: issue.ticketId,
                    url: issue.url
                });
            }, this);
            curIssue.externalSystemIssues = newExternalSystemIssues;
            item.setIssue(curIssue);
        },

        persistCredentials: function () {
            var currentHash = this.user.bts.hash[this.user.bts.current.id];
            var data;
            currentHash.submits += 1;
            data = { username: currentHash.username, id: currentHash.id };
            if (currentHash.domain) data.domain = currentHash.domain;

            Storage.setBtsCredentials(data);
        },

        parseError: function (error) {
            var responseObj;
            var bodyText;
            if (error.responseText) {
                this.$credentialsSoftWarning.hide();
                try {
                    responseObj = JSON.parse(error.responseText);
                    if (responseObj
                            .message
                            .indexOf(this.systemSettings.credentialsErrorPattern) !== -1) {
                        this.highlightCredentials(true);
                    }
                    if (config.patterns.htmlError.test(responseObj.message)) {
                        bodyText = responseObj
                            .message
                            .match(config.patterns.getBodyContent)
                            .map(function (val) {
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
            var hasError = false;
            var fields = [];
            var result;
            var isRally = this.systemType === config.btsEnum.rally;
            var element;
            var isMultiSelect;
            var required;
            var value;
            var tmp;
            var field;
            var currentHash;
                // get dynamic fields
            _.forEach($('.default-value, select', this.$dynamicContent), function (el) {
                element = $(el);
                isMultiSelect = false;

                if (element.hasClass('users-typeahead')) {
                    if (element.is('div')) {
                        return;
                    }
                    isMultiSelect = true;
                }

                required = element.hasClass('required-value');
                if (element.hasClass('rp-btn')) {
                    value = element.parent().find('ul.dropdown-menu > li > a.selected').data('value') || $('.select-value', element).text();
                } else {
                    value = element.val().trim();
                }
                if (isMultiSelect) {
                    tmp = value.split(',');
                    value = tmp[0] === '' ? [] : tmp;
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

                field = {
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
            currentHash = this.user.bts.hash[this.user.bts.current.id];
            if (currentHash.username) {
                result.username = currentHash.username;
                result.password = currentHash.password;
                if (currentHash.domain) {
                    result.domain = currentHash.domain;
                }
            }
            if (currentHash.accessKey) {
                result.token = currentHash.accessKey;
            }
            result.include_logs = this.isMultiply ? false : this.$includeLogs.is(':checked');
            result.include_data = this.isMultiply ? false : this.$includeData.is(':checked');
            result.include_comments = this.isMultiply ? false : this.$includeComments.is(':checked');
            return result;
        },

        validateCredentials: function () {
            var valid = false;
            var currentHash = this.user.bts.hash[this.user.bts.current.id];
            var inputs;
            var allEmpty;
            var allFilled;
            var apiKey;
            var clearBasic = function () {
                delete currentHash.username;
                delete currentHash.password;
                delete currentHash.domain;
            };
            this.$authorizationType.find('.has-error').removeClass('has-error');
            switch (this.systemAuth) {
            case 'BASIC':
            case 'NTLM':
                delete currentHash.accessKey;
                inputs = $('.bts-property', this.$authorizationType);
                allEmpty = _.every(inputs, function (inp) {
                    return !inp.value;
                });
                allFilled = _.every(inputs, function (inp) {
                    return inp.value;
                });
                if (allFilled || (allEmpty && currentHash.type !== 'JIRA')) {
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
                apiKey = $('#accessKey', this.$authorizationType);
                if (apiKey.val().length) {
                    currentHash.accessKey = apiKey.val();
                    valid = true;
                } else {
                    apiKey.parent().addClass('has-error');
                    this.$credentialsWrongWarning.text(this.$credentialsWrongWarning.data('fill')).show();
                }
                break;
            default :
                break;
            }
            if (valid) {
                this.$credentialsWrongWarning.hide();
            }
            return valid;
        },

        getLinks: function () {
            var backLinks = {};
            _.forEach(this.items, function (item) {
                backLinks[item.id] = encodeURI(
                    window.location.protocol + '//' + window.location.host + '/#' + config.project.projectId +
                    '/launches/all|page.page=1&page.size=50&page.sort=start_time/' + item.get('launchId') +
                    '|page.page=1&page.size=50&page.sort=start_time&filter.eq.has_childs=false&filter.eq.uniqueId=' +
                    item.get('uniqueId') +
                    '?page.page=1&page.size=50&page.sort=start_time&filter.eq.has_childs=false&filter.eq.uniqueId=' +
                    item.get('uniqueId') + '&log.item=' + item.get('id')
                );
            });
            return backLinks;
        },

        onDestroy: function () {
            _.each(this.dropdownComponents, function (item) {
                item.destroy();
            });
            this.postBugFieldsView.destroy();
        }
    });

    return ModalPostBug;
});
