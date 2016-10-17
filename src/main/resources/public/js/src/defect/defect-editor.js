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

define([
    'jquery',
    'backbone',
    'components',
    'util',
    'app',
    'coreService',
    'helpers',
    'storageService',
    'markitup',
    'markitupset'
], function ($, Backbone, Components, Util, App, Service, Helpers, Storage, Markitup, MarkitupSettings) {
    'use strict';

    var config = App.getInstance();

    var Editor = Backbone.View.extend({

        defectEditorTpl: 'tpl-launch-grid-defect-editor',
        presentation: null,
        fieldValidators: [],
        postBugView: undefined,
        selectedIssue: null,

        initialize: function (options) {
            this.$el = options.element;
            this.$origin = options.origin;
            this.item = options.item;
            this.items = options.items;
            this.selected = _.keys(this.items).length || 1;
            this.navigationInfo = options.navigationInfo;
            this.defectCallBack = options.defectCallBack;
            this.selectedIssue = options.item.issue.issue_type;
            this.isLog = this.navigationInfo.getLevelGridType() === 'log';
            this.bindGridEvents();
            this.inProcess = false;
        },

        bindGridEvents: function () {
            if (!this.isLog) {
                var that = this,
                    updateAmount = function () {
                        that.$multipleEditAmount && that.$multipleEditAmount.text(that.selected);
                        that.performAmountUpdate();
                    };
                this.listenTo(this.navigationInfo, "increase::edited", function (item) {
                    that.selected += 1;
                    that.items[item.id] = item;
                    updateAmount();
                });
                this.listenTo(this.navigationInfo, "decrease::edited", function (id) {
                    that.selected -= 1;
                    delete that.items[id];
                    updateAmount();
                });
                this.listenTo(this.navigationInfo, "all::edited", function (items) {
                    that.items = _.indexBy(items, 'id');
                    that.selected = _.size(items);
                    updateAmount();
                });
            }
        },

        performAmountUpdate: function () {
            if (this.selected > 1) {
                this.$multipleEditHolder.show();
            } else {
                this.$multipleEditHolder.hide();
            }
        },

        attachTickets: function () {
            var tickets = this.$origin.find('.tickets-container');
            if (tickets.length) {
                var clone = tickets.clone();
                $(".btn-group:first", this.$el).after(clone);
            }
            $('.tooltip.in', this.$el).remove();
        },

        getSubDefects: function(defectTypes){
            var def = {},
                defectTypes = this.navigationInfo.defectTypes.toJSON();
            _.each(defectTypes, function(d){
                var type = d.typeRef;
                if(def[type]){
                    def[type].push(d);
                }
                else {
                    def[type] = [d];
                }
            });
            return def;
        },

        render: function () {
            var link,
                defectTypes = this.navigationInfo.defectTypes,
                defectsGroup = ['TO_INVESTIGATE', 'PRODUCT_BUG', 'AUTOMATION_BUG', 'SYSTEM_ISSUE', 'NO_DEFECT'];

            this.$el.append(Util.templates(this.defectEditorTpl, {
                item: this.item,
                selected: this.selected,
                logs: this.isLog,
                defectsGroup: defectsGroup,
                subDefects: this.getSubDefects(),
                noSubDefects: !defectTypes.checkForSubDefects(),
                defectTypes: defectTypes,
                canPost: Util.canPostToJira(),
                canLoad: Util.hasValidBtsSystem(),
                isDebug: this.navigationInfo.isDebug()
            }));

            this.attachTickets();
            this.setupAnchors();

            link = _.filter(MarkitupSettings.markupSet, {name: 'Link'})[0];
            link.openWith = '"[![Title]!]":';
            link.closeWith = '[![Link:!:http://]!]';
            link.placeHolder = ' ';

            this.$textarea.markItUp(_.extend({
                customPlaceholder: 'true',
                afterInsert: function () {
                    this.validateForSubmition();
                }.bind(this)
            }, MarkitupSettings));

            this.$origin.hide();
            this.$el.show();
            return this;
        },

        events: {
            'keyup textarea': 'validateForSubmition',
            'click [data-js-event="postBug"]:not(.disabled)': 'openPostBug',
            'click [data-js-event="loadBug"]': 'openLoadBug',
            'click [data-js-event="submitDefect"]:not(.disabled)': 'updateDefectType',
            'click [data-js-event="selectIssueType"]': 'updateSelectedIssue',
            'click [data-js-event="closeEditor"]': 'closeEditor'
        },

        updateSelectedIssue: function (e) {
            var el = $(e.currentTarget),
                menu = el.closest('.dropdown-menu'),
                text = el.data('issueName'),
                color = el.data('issueColor');

            $('label', menu).removeClass('selected');
            el.addClass('selected');
            this.selectedIssue = el.data('id');
            this.$type.text(text).attr('class', el.find('.badge').attr('class'));
            this.$type.closest('.pr-defect-type-badge').data('id', this.selectedIssue)
            $('.pr-defect-type-badge i', this.$el).css('background', color);
            this.validateForSubmition();
        },

        validateForSubmition: function () {
            if (this.$textarea.val() !== (this.item.issue.comment || '') || this.selectedIssue !== this.item.issue.issue_type) {
                this.$submitBtn.removeClass('disabled');
            } else {
                this.$submitBtn.addClass('disabled');
            }
        },

        setupAnchors: function () {
            this.$submitBtn = $(".submit:first", this.$el);
            this.$textarea = $("textarea:first", this.$el);
            this.$type = $(".pr-defect-type-badge span", this.$el);
            this.$multipleEditHolder = $(".rp-defect-multiple-edit:first", this.$el);
            this.$multipleEditAmount = $("#inProgressAmount", this.$el);
            this.$replaceComments = $("#replaceComments", this.$el);
        },

        openPostBug: function () {
            this.postBugView && this.postBugView.destroy();
            this.postBugView = new PostBug({
                settings: config.forSettings,
                user: config.userModel.toJSON(),
                systems: config.project.configuration.externalSystem,
                items: _.values(this.items),
                selected: this.selected,
                editor: this
            }).render();
            this.listenTo(this.postBugView, "defect::updated", this.destroyPostBug);
        },

        openLoadBug: function () {
            this.loadBugView && this.loadBugView.destroy();
            this.loadBugView = new LoadBug({
                items: _.values(this.items),
                systems: config.project.configuration.externalSystem,
                editor: this
            }).render();
            this.listenTo(this.loadBugView, "bug::loaded", this.destroyPostBug);
        },

        destroyPostBug: function () {
            this.navigationInfo.trigger(this.defectCallBack);
        },

        updateDefectType: function (callback) {
            if (this.inProcess) {
                return;
            }
            this.inProcess = true;
            var self = this;
            var getDefaultIssue = function(){
                return {comment: $.trim(self.$textarea.val()), issue_type: self.selectedIssue}
            };
            var issues = [];
            var replaceComments = this.$replaceComments.is(':checked');
            var editorItemId = this.item.id;
            var getIssueForReplace = function (item) {
                if (item.id === editorItemId) {
                    return getDefaultIssue();
                };
                return {issue_type: getDefaultIssue().issue_type, comment: item.issue.comment};
            };

            if (!this.items) {
                var set = {};
                set[this.item.id] = this.item;
                this.items = set;
            };
            _.forEach(this.items, function (item, key) {
                var issue = getDefaultIssue();
                if (item.id != editorItemId) {
                    issue.comment = issue.comment.length > 0 ? issue.comment : this.items[key].issue.comment; // here is the problem
                }
                var target = replaceComments ? issue : getIssueForReplace(item);
                issues.push({
                    test_item_id: key,
                    issue: target
                });
            }, this);
            
            Service.updateDefect({issues: issues})
                .done(function () {
                    var issue = getDefaultIssue();
                    if (this.item.issue.issue_type !== issue.issue_type) {
                        config.trackingDispatcher.defectStateChange(this.item.issue.issue_type, issue.issue_type);
                    }
                    config.commentAnchor = this.item.id;
                    this.navigationInfo.trigger(this.defectCallBack);
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "updateDefect");
                }).always(function () {
                    this.inProcess = false;
                }.bind(this));
        },

        closeEditor: function () {
            this.navigationInfo.trigger('deselect::rows');
            this.destroy();
        },

        destroy: function () {
            this.items = null;
            this.$origin.show();
            $('.tooltip.in', this.$origin).remove();
            if (this.postBugView) {
                this.postBugView.destroy();
            }
            Components.RemovableView.prototype.destroy.call(this);
        }
    });

    var PostBug = Components.DialogShell.extend({

        initialize: function (options) {
            options['headerTxt'] = 'postBug';
            options['actionTxt'] = 'submit';
            options['actionStatus'] = true;
            Components.DialogShell.prototype.initialize.call(this, options);

            this.items = options.items;
            this.selected = options.selected;
            this.systems = _.sortBy(options.systems, 'project');
            this.url = options.url;
            this.editor = options.editor;
            this.settings = options.settings;
            this.systemSettings = this.settings['bts' + options.systems[0].systemType];
            this.user = options.user;
            this.systemType = options.systems[0].systemType;
            this.systemAuth = options.systems[0].systemAuth;
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
                Service.postBugToBts(data, this.user.bts.current.id)
                    .done(function (response) {
                        var issues = self.bindTicketToIssues(self.items, response);
                        Service.updateDefect({issues: issues})
                            .done(function () {
                                Util.ajaxSuccessMessenger("addTicket");
                                self.trigger("defect::updated");
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

        persistCredentials: function () {
            var currentHash = this.user.bts.hash[this.user.bts.current.id];
            currentHash.submits += 1;
            var data = {username: currentHash.username, id: currentHash.id};
            if (currentHash.domain) data.domain = currentHash.domain;
            
            Storage.setBtsCredentials(data);
        },

        bindTicketToIssues: function (items, response) {
            var issues = [];
            _.forEach(items, function (item, i) {
                var defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge'),
                    chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null,
                    issue = {
                        issue_type: chosenIssue ? chosenIssue : item.issue.issue_type,
                        comment: item.issue.comment,
                        externalSystemIssues: item.issue.externalSystemIssues || []
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
                    backLink[item.id] = location + '/log-for-' + item.id;
                });
            } else {
                var id = this.items[0].id;
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
            this.url = null;
            this.settings = null;
            this.systemSettings = null;
            this.user = null;
            Components.DialogShell.prototype.destroy.call(this);
        }

    });

    var LoadBug = Components.DialogShell.extend({

        initialize: function (options) {

            options['headerTxt'] = 'loadBug';
            options['actionTxt'] = 'add';
            options['actionStatus'] = true;
            Components.DialogShell.prototype.initialize.call(this, options);

            this.items = options.items;
            this.editor = options.editor;
            this.systems = _.sortBy(config.project.configuration.externalSystem, 'project');
            this.systemId = config.session.lastLoadedTo || this.systems[0].id;
            this.type = Util.getExternalSystem();
        },

        contentBody: 'tpl-load-bug',
        rowTpl: 'tpl-load-bug-row',

        render: function () {
            Components.DialogShell.prototype.render.call(this, {isBeta: true});
            var current = _.find(this.systems, {id: this.systemId});
            this.$content.html(Util.templates(this.contentBody, {
                systems: this.systems,
                current: current || this.systems[0]
            }));
            this.$rowsHolder = $("#rowHolder", this.$content);
            this.$postToUrl = $("#postToUrl", this.$el);
            this.renderRow();
            this.delegateEvents();
            return this;
        },
        renderRow: function () {
            this.$rowsHolder.append(Util.templates(this.rowTpl));
            Util.bootValidator($(".issue-row:last .issue-id", this.$rowsHolder), {
                validator: 'minMaxRequired',
                type: 'issueId',
                min: 1,
                max: 128
            });
            Util.bootValidator($(".issue-row:last .issue-link", this.$rowsHolder), [
                {
                    validator: 'matchRegex',
                    type: 'issueLinkRegex',
                    pattern: config.patterns.urlT,
                    arg: 'i'
                }
            ]);
        },
        addRow: function () {
            this.renderRow();
            this.$rowsHolder.addClass('multi');
        },
        removeRow: function (e) {
            $(e.currentTarget).closest('.issue-row').remove();
            if ($(".issue-row", this.$rowsHolder).length === 1) this.$rowsHolder.removeClass('multi');
        },
        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'click .project-name': 'updateProject',
                'click #addRow': 'addRow',
                'click .remove-row': 'removeRow',
                'blur .issue-link': 'autoFillId'
            });
        },
        autoFillId: function (e) {
            if (this.canAutoFill()) {
                var $link = $(e.currentTarget),
                    $id = $link.closest('.issue-row').find('.issue-id'),
                    link = $link.val(),
                    autoValue;
                if (!link || !$link.data('valid') || $.trim($id.val())) return;
                if (this.isJiraBts()) {
                    autoValue = link.split('/');
                    autoValue = autoValue[autoValue.length - 1];
                }
                if (this.isTfsBts()) {
                    autoValue = link.split('id=')[1];
                    autoValue = autoValue ? autoValue.split('&')[0] : '';
                }
                $id.val(autoValue).trigger('validate');
            }
        },
        canAutoFill: function () {
            return this.type && (this.isJiraBts() || this.isTfsBts());
        },
        isJiraBts: function () {
            return this.type === config.btsEnum.jira;
        },
        isTfsBts: function () {
            return this.type === config.btsEnum.tfs;
        },
        updateProject: function (e) {
            Util.dropDownHandler(e);
            this.systemId = $(e.currentTarget).attr('id');
            var system = _.find(this.systems, {id: this.systemId});
            this.$postToUrl.text(system.url);
        },

        updateIssues: function (items, response) {
            var issues = [];
            _.forEach(items, function (item, i) {
                var defectBadge = $('.inline-editor .rp-defect-type-dropdown .pr-defect-type-badge'),
                    chosenIssue = defectBadge.length > 0 ? defectBadge.data('id') : null,
                    issue = {
                        issue_type: chosenIssue ? chosenIssue : item.issue.issue_type,
                        comment: item.issue.comment,
                        externalSystemIssues: item.issue.externalSystemIssues || []
                    };

                if ($('#replaceComments').prop('checked')) {
                    issue.comment = $('.markItUpEditor').val().length > 0 ? $('.markItUpEditor').val() : this.items[i].issue.comment;
                }

                if (item.id == $('.editor-row').closest('.selected').attr('id')) {
                    issue.comment = $('.markItUpEditor').val();
                }
                _.each(response.issues, function(is){
                    issue.externalSystemIssues.push({
                        ticketId: is.ticketId,
                        systemId: response.systemId,
                        url: is.url
                    });
                });
                issues.push({issue: issue, test_item_id: item.id});
            }, this);
            return issues;
        },

        submit: function () {
            $('.form-control', this.$rowsHolder).trigger('validate');
            if (!$('.has-error', this.$rowsHolder).length) {
                var data = {},
                    self = this;
                data.systemId = this.systemId;
                data.testItemIds = _.map(this.items, 'id');
                data.issues = _.map($('.issue-row', this.$rowsHolder), function (row) {
                    var id = $(row).find('.issue-id').val(),
                        url = $(row).find('.issue-link').val();
                    return {
                        ticketId: id,
                        url: url
                    }
                });
                this.inSubmit = true;
                Service.loadBugs(data)
                    .done(function (response) {
                        var issues = self.updateIssues(self.items, data);
                        Service.updateDefect({issues: issues})
                            .done(function () {
                                Util.ajaxSuccessMessenger("submitKeys");
                                self.trigger("bug::loaded");
                            })
                            .fail(function (error) {
                                errorHandler(error);
                            })
                            .always(function () {
                                self.done();
                            });
                        config.session.lastLoadedTo = self.systemId;
                        config.trackingDispatcher.jiraTicketLoad(data.issues.length);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "submitKeys");
                    })
                    .always(function () {
                        self.inSubmit = false;
                    });
            }
        }
    });

    var removeTicket = function (badge, item, row, callback) {
        var ticketId = badge.data('ticket-id').toString();

        badge.tooltip('hide').tooltip('destroy');
        badge.remove();
        item.issue.externalSystemIssues = _.reject(item.issue.externalSystemIssues, function (tk) {
            return tk.ticketId === ticketId;
        });

        Service.removeTicket({issues: [{issue: item.issue, test_item_id: item.id}]})
            .done(function (data) {
                if (row) {
                    $("[data-ticket-id='" + ticketId + "']", row).remove();
                }
                if (_.isFunction(callback)) callback();
                Util.ajaxSuccessMessenger("removeTicket");
            })
            .fail(function (error) {
                Util.ajaxFailMessenger(error);
            });
    };

    var TicketManager = {
        tpl: "tpl-launch-grid-defect-ticket",
        attachListener: function (holder) {
            var that = this,
                callInProcess = {},
                hoveredId = null,
                hideOtherTips = function ($el) {
                    $el.parent().find('.tooltip.in').remove();
                },
                updateContent = function ($el, ticket) {
                    var newHtml = Util.templates(that.tpl, ticket);
                    $el.attr('data-original-title', newHtml).tooltip('fixTitle');
                    if (ticket.status) {
                        $el.addClass(ticket.status.toLocaleLowerCase().replaceAll(' ', '_'));
                    }
                    if (hoveredId == ticket.id || _.isUndefined(ticket.id)) { // intentional type cast to correct data- autocasting
                        $el.tooltip('show');
                    } else {
                        $el.tooltip('hide');
                    }
                    delete callInProcess[ticket.id];
                    $el.addClass('loaded');
                };
            holder.off('show.bs.tooltip');
            holder.on('show.bs.tooltip', ".external-ticket:not(.loaded)", function (e) {

                var $el = $(e.currentTarget),
                    ticketId = $el.data('ticket-id'),
                    systemId = $el.data('system-id');

                hoveredId = ticketId;
                if (callInProcess[ticketId]) return;

                callInProcess[ticketId] = true;
                Service.getBtsTicket(ticketId, systemId)
                    .then(function (ticket) {
                        updateContent($el, ticket);
                    },
                    function () {
                        updateContent($el, {status: 'Error', id: ticketId});
                    });
            }).on('show.bs.tooltip', ".external-ticket.loaded", function (e) {
                var $el = $(e.currentTarget);
                hoveredId = $el.data('ticket-id');
                hideOtherTips($el);
            });
        }
    };

    return {
        Editor: Editor,
        PostBug: PostBug,
        LoadBug: LoadBug,
        removeTicket: removeTicket,
        TicketManager: TicketManager
    }
});