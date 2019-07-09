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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var Service = require('coreService');
    var _ = require('underscore');
    var SingletonAppModel = require('model/SingletonAppModel');
    var DropDownComponent = require('components/DropDownComponent');

    var config = App.getInstance();

    var NotificationsSettings = require('projectSettings/tabViews/notifications/notificationSettingsModel');

    var NotificationsTabView = Epoxy.View.extend({

        emailCaseId: 0,

        id: 'notificationsSettings',
        className: 'notifications-project-settings',

        tpl: 'tpl-project-settings-notifications',
        tplItem: 'tpl-project-settings-notifications-item',

        events: {
            'click #submit-notifications': 'submitNotifications',
            'click .launchOwner': 'selectOwner',
            'click #add-notification-rule': 'addRule',
            'click .remove-email-item': 'removeRule',
            'click .email-case-label': 'removeRule'
        },

        initialize: function () {
            this.appModel = new SingletonAppModel();
            this.dropdownComponents = [];
            this.updateIds();
            this.model = new NotificationsSettings(this.appModel.get('configuration').emailConfiguration);
            this.users = [];
            this.isValidEmail = true;
            this.listenTo(this.model, 'change:emailEnabled', function () {
                config.trackingDispatcher.trackEventNumber(387);
            });
            this.listenTo(this.model, 'change:fromAddress', function () {
                config.trackingDispatcher.trackEventNumber(388);
            });
            this.render();
        },

        updateIds: function (data) {
            var i;
            var conf = data || this.appModel.get('configuration').emailConfiguration.emailCases;
            for (i = 0; i < conf.length; i += 1) {
                conf[i].id = this.emailCaseId;
                this.emailCaseId += 1;
            }
        },

        render: function () {
            var params = _.merge(this.model.toJSON(), {
                access: config.userModel.hasPermissions(),
            });
            this.$el.html(Util.templates(this.tpl, params));
            var emailNotificationsSwitcher = new DropDownComponent({
                data: [
                    { name:  Localization.ui.on, value: 'ON' },
                    { name:  Localization.ui.off, value: 'OFF' }
                ],
                multiple: false,
                defaultValue: this.model.get('emailEnabled') ? 'ON' : 'OFF'
            });
            this.dropdownComponents.push(emailNotificationsSwitcher);
            $('[data-js-email-notifications-switcher]', this.$el).html(emailNotificationsSwitcher.$el);
            $('[data-js-email-notifications-switcher] [data-js-dropdown]', this.$el).attr('id', 'emailEnabled');
            if (!config.userModel.hasPermissions()) {
                $('[data-js-email-notifications-switcher] [data-js-dropdown]', this.$el).attr('disabled', 'disabled');
            }
            this.listenTo(emailNotificationsSwitcher, 'change', this.selectProp);

            this.$notificationArray = $('#notificationArray', this.$el);
            this.$notificationArray.html(Util.templates(this.tplItem, params));
            this.$emailBlock = $('#emailNotificationsSettings', this.$el);

            if (this.model.get('emailEnabled')) {
                this.$emailBlock.show();
            }
            return this;
        },
      
        onShow: function () {
            this.renderEmailCases();
            this.validateRecipients();
        },

        initValidators: function () {
            var self = this;
            Util.bootValidator($('#from', this.$el), [
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
                    type: 'emailNotification',
                    min: 5,
                    max: 256
                }
            ]);
            $('#from', this.$el).on('validation::change', function (e, data) {
                if (data.valid) {
                    self.model.set('fromAddress', data.value);
                }
            });
        },

        renderEmailCases: function () {
            var self = this;
            $('.email-case-item', this.$el).each(function (index) {
                var casesDropdown = new DropDownComponent({
                    data: _.map(config.forSettings.emailInCase, function (val) {
                        return { name: val.name, value: val.value, disabled: false };
                    }),
                    multiple: false,
                    defaultValue: self.model.get('emailCases')[index].sendCase
                });
                $('[data-js-case-dropdown]', $(this)).html(casesDropdown.$el);
                if (!config.userModel.hasPermissions()) {
                    $('[data-js-dropdown]', $(this)).attr('disabled', 'disabled');
                }
                self.listenTo(casesDropdown, 'change', self.selectProp);

                if (Util.isCustomer() && !Util.isAdmin()) {
                    self.setupDisabledRecipients(index);
                } else {
                    self.filterMembers(true, index);
                }
                if (self.model.get('emailEnabled')) {
                    self.filterLaunches(index);
                    self.filterTags(index);
                }
                self.dropdownComponents.push(casesDropdown);
            });
            self.initValidators();
            self.updateRules();
            self.validateRecipients();
        },

        setupDisabledRecipients: function (index) {
            var self = this;
            var recipients = self.getRecipients(index);

            self.$recipients = $('input.recipients', this.$el);
            self.$launchOwner = $('input.launchOwner', this.$el);

            if (self.$recipients && self.$recipients.length) {
                Util.setupSelect2WhithScroll(self.$recipients.eq(index), {
                    tags: recipients
                });
                self.$recipients.eq(index).select2('val', _.pluck(recipients, 'id'));
                self.$recipients.eq(index).prop('disabled', true);
            }
            self.$launchOwner.eq(index).prop('disabled', true);
        },

        addRule: function () {
            var self = this;
            var cases;
            var newCase;
            var index;
            var params = _.merge(this.model.toJSON(), {
                access: config.userModel.hasPermissions(),
            });

            params.addRule = true;
            config.trackingDispatcher.trackEventNumber(395);
            cases = this.model.get('emailCases');
            newCase = {
                launchNames: [],
                recipients: ['OWNER'],
                sendCase: 'ALWAYS',
                tags: [],
                id: self.emailCaseId
            };

            params.newCase = newCase;
            cases.push(newCase);
            this.model.set('emailCases', cases);
            this.$notificationArray.append(Util.templates(this.tplItem, params));

            var casesDropdown = new DropDownComponent({
                data: _.map(config.forSettings.emailInCase, function (val) {
                    return { name: val.name, value: val.value, disabled: false };
                }),
                multiple: false,
                defaultValue: config.forSettings.emailInCase[0].value
            });

            $('[data-email-case-id="' + this.emailCaseId + '"] [data-js-case-dropdown]', this.$el).html(casesDropdown.$el);
            if (!config.userModel.hasPermissions()) {
                $(' [data-email-case-id="' + this.emailCaseId + '"] [data-js-case-dropdown] [data-js-dropdown]', this.$el).attr('disabled', 'disabled');
            }
            this.listenTo(casesDropdown, 'change', this.selectProp);
            this.dropdownComponents.push(casesDropdown);
            self.updateRules();
            self.emailCaseId += 1;

            index = $('input.recipients', this.$el).length - 1;

            this.filterMembers(true, index);
            this.filterLaunches(index);
            this.filterTags(index);
        },

        updateRules: function () {
            var emailCase;
            var allLength = $('.email-case-item', this.$el).length;
            var checkedLength = $('.email-case-item', this.$el).find('.remove-email-case:checked').length;
            if (!config.userModel.hasPermissions()) {
                return;
            }
            if ($('.email-case-item', this.$el).length > 1 && (allLength - checkedLength) > 1) {
                $('.remove-email-case', this.$el).prop('disabled', false);
                $('.email-case-item', this.$el).prop('disabled', true).removeClass('the-only');
            } else {
                $('.remove-email-case:not(:checked)', this.$el).prop('disabled', true).closest('.email-case-item').addClass('the-only');
                if (allLength === checkedLength) {
                    emailCase = $('.email-case-item', this.$el).eq(0);

                    this.updateEmailCase(emailCase, 'remove');
                    $('.remove-email-case', emailCase).prop('disabled', true);
                    emailCase.addClass('the-only');
                }
            }
        },

        rulesToDelete: [],

        updateEmailCase: function (emailCase, type) {
            var emailCheckbox = emailCase.find('.remove-email-case');
            var label = $('.ruleName', emailCase);
            var errorBlock = $('.duplicate-error', emailCase);
            if (type === 'add') {
                label.text(Localization.project.deleteRule);
                errorBlock.text(Localization.project.ruleDeleted).show();
                emailCheckbox.closest('.remove-email-item').addClass('checked');
                emailCase.addClass('will-delete');
                emailCheckbox.attr('checked', 'checked').prop('checked', true);
                this.rulesToDelete.push(emailCase.data('email-case-id'));
            } else {
                emailCheckbox.closest('.remove-email-item').removeClass('checked');
                emailCase.removeClass('will-delete');
                emailCheckbox.attr('checked', false).prop('checked', false);
                label.text(Localization.project.rule);
                errorBlock.empty().hide();
                this.rulesToDelete = $.grep(this.rulesToDelete, function (value) {
                    return value !== emailCase.data('email-case-id');
                });
            }
        },

        removeRule: function (event) {
            var self = this;
            var newRules;
            var externalSystemData;
            var emailCheckbox;
            var emailCase = $(event.target).closest('.email-case-item');

            if (!config.userModel.hasPermissions()) {
                return;
            }
            config.trackingDispatcher.trackEventNumber(389);
            if (emailCase.hasClass('local-item')) {
                newRules = _.reject(this.model.get('emailCases'), function (eCase) {
                    return eCase.id === emailCase.data('email-case-id');
                });
                this.model.set('emailCases', newRules);
                emailCase.fadeOut(function () {
                    emailCase.remove();
                    self.updateRules();
                });
                externalSystemData = self.model.getProjectSettings();
                this.appModel.get('configuration').emailConfiguration = externalSystemData.configuration;
                this.checkCases();
            } else if (!emailCase.hasClass('the-only')) {
                emailCheckbox = emailCase.find('.remove-email-case');
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
        },

        filterMembers: function (getAnyway, index) {
            var caseItem;
            var recipients;
            var remoteUsers;
            var users;
            var minimumInputLength;
            var self;
            this.$recipients = $('input.recipients', this.$el);
            this.$launchOwner = $('input.launchOwner', this.$el);

            if (Util.isInPrivilegedGroup()) {
                this.$recipients.prop('disabled', false);
                this.$launchOwner.prop('disabled', false);
            }

            caseItem = $('.email-case-item', this.$el).eq(index || 0);
            recipients = caseItem.find('input.recipients');
            remoteUsers = [];
            users = this.getRecipients(index);
            minimumInputLength = config.forms.filterUser;
            self = this;

            if (getAnyway || !recipients.hasClass('select2-offscreen')) {
                Util.setupSelect2WhithScroll(recipients, {
                    multiple: true,
                    minimumInputLength: 1,
                    maximumInputLength: 128,
                    formatInputTooShort: function () {
                        return Localization.ui.minPrefix +
                        minimumInputLength + Localization.ui.minSufixAuto3;
                    },
                    formatResultCssClass: function (state) {
                        if ((remoteUsers.length === 0 || _.indexOf(remoteUsers, state.text) < 0)
                            && $('.users-typeahead.recipients:not(input)', self.$el).eq(index).find('input').val() === state.text) {
                            return 'exact-match';
                        }
                        return undefined;
                    },
                    allowClear: true,
                    createSearchChoice: function (term, data) {
                        if ($(data).filter(function () {
                            return this.text.localeCompare(term) === 0;
                        }).length === 0) {
                            if (Util.validateEmail(term)) {
                                return {
                                    id: term,
                                    text: term
                                };
                            }
                            return null;
                        }
                        return undefined;
                    },
                    initSelection: function (element, callback) {
                        callback({
                            id: element.val(),
                            text: element.val()
                        });
                    },
                    formatNoMatches: function () {
                        return Localization.project.notFoundRecipients;
                    },
                    query: function (query) {
                        var queryLength;
                        var data;
                        queryLength = query.term.length;
                        data = { results: [] };

                        if (queryLength >= minimumInputLength) {
                            if (queryLength > 256) {
                                self.validateRecipients();
                            } else {
                                if (queryLength <= 256) {
                                    self.validateRecipients();
                                }
                                Service.getProjectUsersById(query.term)
                                .done(function (response) {
                                    remoteUsers = [];
                                    _.each(response, function (item) {
                                        remoteUsers.push(item);
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
                            remoteUsers = [];
                            data.results.push({
                                id: query.term,
                                text: query.term
                            });
                            query.callback(data);
                        }
                    }
                });
                this.$recipients.eq(index).on('select2-open', function () {
                    $('.select2-drop-mask', self.$el).remove();
                })
                    .on('select2-loaded', function () {
                        $('.select2-drop-active', self.$el).removeClass('select2-drop-above');
                        self.$recipients.eq(index).select2('positionDropdown');
                    })
                    .on('change', function () {
                        var data = $(this).select2('data');
                        self.onChangeRicipients(data, $(this).closest('.email-case-item'));
                    })
                    .select2('data', users);

                $(this.el)
                    .on('mousedown.recipients', function () {
                        $('.users-typeahead.recipients', self.$el).select2('close');
                        $('.select2-container.recipients', self.$el).each(function () {
                            var $this = $(this);
                            if ($this.find('.select2-input').val().length <= 256) {
                                self.validateRecipients();
                            }
                        });
                    });
            }
        },

        parseUsers: function (data) {
            var users = _.map(data.content, function (user) {
                return {
                    id: user.userId,
                    text: user.userId
                };
            });
            this.users = this.users.concat(users);
        },

        onChangeRicipients: function (value, eci) {
            var emailCase;
            var recips = _.map(value, function (v) {
                return v.id;
            });
            var checked = eci.find('.launchOwner').is(':checked');
            var emails = [];
            config.trackingDispatcher.trackEventNumber(390);
            this.hideFormsErrors(eci.find('.select2-container.recipients'));
            this.isValidEmail = true;
            if (_.isEmpty(recips) && !checked) {
                this.showFormErrors(eci.find('.select2-container.recipients'), Localization.project.invalidRecipients);
            }
            _.each(recips, function (v) {
                var user = _.find(this.users, function (u) {
                    return u.id === v;
                });
                if (user) {
                    emails.push(user.id);
                    this.isValidEmail = true;
                } else {
                    emails.push(v);
                }
            }, this);
            if (checked) {
                emails.push(eci.find('.launchOwner').val());
            }
            emailCase = _.findWhere(this.model.get('emailCases'), {
                id: eci.data('email-case-id')
            });
            if (emailCase) {
                emailCase.recipients = emails;
            }

            this.checkCases();
        },

        onChangeLaunchNames: function (value, eci) {
            var launches = _.map(value, function (i) {
                return i.id;
            });
            var emailCase = _.findWhere(this.model.get('emailCases'), {
                id: eci.data('email-case-id')
            });
            config.trackingDispatcher.trackEventNumber(393);
            emailCase.launchNames = launches;

            this.checkCases();
        },

        onChangeTags: function (value, eci) {
            var emailCase;
            var tags = (value) ? value.trim().split(',') : [];
            config.trackingDispatcher.trackEventNumber(394);
            this.validateTags(tags);
            emailCase = _.findWhere(this.model.get('emailCases'), {
                id: eci.data('email-case-id')
            });
            emailCase.tags = tags;

            this.checkCases();
        },

        getRecipients: function (index) {
            var emailCase;
            var recipients;
            var val;
            var rejected;
            if (this.model) {
                if (index !== undefined) {
                    this.$launchOwner = $('.launchOwner', this.$el);
                    emailCase = this.model.get('emailCases')[index];
                    recipients = emailCase.recipients || [];
                    val = [];
                    rejected = _.reject(recipients, function (r) {
                        return r === this.$launchOwner.eq(index).val();
                    }, this);
                    _.each(rejected, function (m) {
                        var em = _.find(this.users, function (e) {
                            return e.id === m;
                        });
                        if (em) {
                            val.push(em);
                        } else {
                            val.push({
                                id: m,
                                text: m
                            });
                        }
                    }, this);
                    return val;
                }
                recipients = this.model.get('recipients');
                val = [];
                rejected = _.reject(recipients, function (r) {
                    return r === this.$launchOwner.val();
                }, this);
                _.each(rejected, function (m) {
                    var em = _.find(this.users, function (e) {
                        return e.id === m;
                    });
                    if (em) {
                        val.push(em);
                    } else {
                        val.push({
                            id: m,
                            text: m
                        });
                    }
                }, this);
                return val;
            }
            return undefined;
        },

        filterTags: function (index) {
            var self = this;
            var tags = [];
            var remoteTags = [];

            _.each(this.model.get('emailCases')[index].tags, function (item) {
                tags.push({
                    id: item,
                    text: item
                });
            });

            this.$tagsContainer = $('input.users-typeahead.tags', this.$el);
            if (this.$tagsContainer.eq(index)) {
                Util.setupSelect2WhithScroll(self.$tagsContainer.eq(index), {
                    multiple: true,
                    minimumInputLength: 1,
                    maximumInputLength: 128,
                    formatInputTooShort: function () {
                        return Localization.ui.enterChars;
                    },
                    formatResultCssClass: function (state) {
                        if ((remoteTags.length === 0 || _.indexOf(remoteTags, state.text) < 0)
                            && $('.users-typeahead.tags:not(input)', self.$el).eq(index).find('input').val() === state.text) {
                            return 'exact-match';
                        }
                        return undefined;
                    },
                    tags: true,
                    initSelection: function (item, callback) {
                        var data;
                        tags = item.val().split(',');
                        data = _.map(tags, function (tag) {
                            var tagData = tag.trim();
                            return {
                                id: tagData,
                                text: tagData
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
                        return undefined;
                    },
                    query: function (query) {
                        var queryLength = query.term.length;
                        var data = {
                            results: []
                        };

                        if (queryLength >= 1) {
                            if (queryLength > 256) {
                                self.validateTags(null, true);
                            } else {
                                if (queryLength === 256) {
                                    self.validateTags(null, true);
                                }
                                Service.searchTags(query)
                                    .done(function (response) {
                                        remoteTags = [];
                                        _.each(response, function (item) {
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

                this.$tagsContainer.eq(index).on('select2-loaded', function () {
                    $('.select2-drop-active', self.$el).removeClass('select2-drop-above');
                    self.$tagsContainer.eq(index).select2('positionDropdown');
                })
                    .on('select2-open', function () {
                        $('.select2-drop-mask', self.$el).remove();
                    })
                    .on('change', function () {
                        self.onChangeTags($(this).val(), $(this).closest('.email-case-item'));
                    })
                    .select2('data', tags);
            }

            $(this.el)
                .on('mousedown.tags', function () {
                    var input;
                    $('.users-typeahead.tags', self.$el).select2('close');
                    input = $('.users-typeahead.tags', self.$el).find('.select2-input');

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
            var self = this;
            var remoteLaunches = [];
            var launches = [];

            _.each(this.model.get('emailCases')[index].launchNames, function (item) {
                launches.push({
                    id: item,
                    text: item
                });
            });

            this.$launchContainer = $('input.users-typeahead.launches', this.$el);
            if (this.$launchContainer.eq(index)) {
                Util.setupSelect2WhithScroll(self.$launchContainer.eq(index), {
                    multiple: true,
                    minimumInputLength: 1,
                    maximumInputLength: 128,

                    formatInputTooShort: function () {
                        return Localization.ui.minPrefix + '3' + Localization.ui.minSufixAuto3;
                    },
                    formatResultCssClass: function (state) {
                        if ((remoteLaunches.length === 0 ||
                            _.indexOf(remoteLaunches, state.text) < 0) &&
                            $('.users-typeahead.launches:not(input)', self.$el).eq(index).find('input').val() === state.text) {
                            return 'exact-match';
                        }
                        return undefined;
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
                        return undefined;
                    },
                    initSelection: function (element, callback) {
                        callback({
                            id: element.val(),
                            text: element.val()
                        });
                    },
                    query: function (query) {
                        var queryLength = query.term.length;
                        var data = {
                            results: []
                        };

                        if (queryLength >= 3) {
                            if (queryLength > 256) {
                                self.toggleLaunchNamesErrors(true, false,
                                    self.$launchContainer.eq(index));
                            } else {
                                if (queryLength === 256) {
                                    self.toggleLaunchNamesErrors(false, false,
                                        self.$launchContainer.eq(index));
                                }
                                Service.searchLaunches(query)
                                    .done(function (response) {
                                        remoteLaunches = [];
                                        _.each(response, function (item) {
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
                    $('.select2-drop-mask', self.$el).remove();
                })
                    .on('select2-loaded', function () {
                        $('.select2-drop-active', self.$el).removeClass('select2-drop-above');
                        self.$launchContainer.eq(index).select2('positionDropdown');
                    })
                    .on('change', function () {
                        var values = self.$launchContainer.eq(index).select2('data');
                        self.onChangeLaunchNames(values, $(this).closest('.email-case-item'));
                    })
                    .select2('data', launches);
            }


            $(this.el)
                .on('mousedown.launches', function () {
                    $('.users-typeahead.launches', self.$el).select2('close');
                    $('.select2-container.launches', self.$el).each(function () {
                        var $this = $(this);
                        if ($this.find('.select2-input').val().length <= 256) {
                            self.toggleLaunchNamesErrors(false, true, $this);
                        }
                    });
                });

            if (!Util.isInPrivilegedGroup() && this.$launchContainer) {
                this.$launchContainer.select2('disable');
            }
        },

        validateTags: function (tags, lengthExceeded) {
            var valid = true;
            var self = this;

            $('.email-case-item', this.$el).each(function (index, elem) {
                var tagContainer = $(elem).find('.select2-container.tags');

                if (lengthExceeded && ($.inArray($(elem).data('email-case-id'), self.rulesToDelete) === -1)) {
                    self.showFormErrors(tagContainer, Localization.ui.maxPrefix + '256' + Localization.ui.maxSufix);
                    $('.select2-drop-active', self.$el).hide();
                    $('.select2-input.select2-active', self.$el).removeClass('select2-active');
                    valid = false;
                    return false;
                }
                self.hideFormsErrors(tagContainer);
                return true;
            });

            return valid;
        },

        checkCases: function () {
            var self = this;
            var i;
            var j;
            var firstCaseEqual;
            var caseEqual;
            var currentCase;
            var duplicates = false;
            var cases = this.model.get('emailCases');

            $('.email-case-item', this.$el).removeClass('duplicate');

            if (cases.length === 1) {
                return false;
            }

            for (i = 0; i < cases.length; i += 1) {
                currentCase = cases[i];
                for (j = i + 1; j < cases.length; j += 1) {
                    if (this.isCasesEqual(currentCase, cases[j])) {
                        caseEqual = $('.email-case-item[data-email-case-id=' + cases[j].id + ']', self.$el);
                        firstCaseEqual = $('.email-case-item[data-email-case-id=' + currentCase.id + ']', self.$el);

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
            if (caseOne.sendCase !== caseTwo.sendCase) {
                return false;
            }
            if (caseOne.tags.length !== caseTwo.tags.length) {
                return false;
            }
            if (caseOne.launchNames.length !== caseTwo.launchNames.length) {
                return false;
            }
            if (caseOne.recipients.length !== caseTwo.recipients.length) {
                return false;
            }
            if (_.sortBy(caseOne.tags).equals(_.sortBy(caseTwo.tags)) &&
                _.sortBy(caseOne.launchNames).equals(_.sortBy(caseTwo.launchNames)) &&
                _.sortBy(caseOne.recipients).equals(_.sortBy(caseTwo.recipients))) {
                return true;
            }
            return false;
        },

        selectOwner: function (e) {
            var $el = $(e.target);
            var emailCase = $el.closest('.email-case-item');
            var val = $el.val();
            var emailCaseObj = _.findWhere(this.model.get('emailCases'), {
                id: emailCase.data('email-case-id')
            });
            var sendCase = emailCaseObj.recipients || [];
            config.trackingDispatcher.trackEventNumber(391);
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
                !sendCase.length && this.showFormErrors(emailCase.find('.select2-container.recipients'), Localization.project.invalidRecipients);
                this.validateRecipients();
            }
            sendCase.recipients = sendCase;

            this.checkCases();
        },

        selectProp: function (value, event) {
            var self = this;
            var blockAction;
            var emailCase;
            var val = value;
            var caseBtn = $(event.target).closest('[data-js-case-dropdown]').find('[data-js-dropdown]');
            var mainBtn = $(event.target).closest('[data-js-email-notifications-switcher]').find('[data-js-dropdown]');
            var id = mainBtn.attr('id');
            if (id === 'emailEnabled') {
                val = (val === 'ON');
                blockAction = val ? 'show' : 'hide';
                this.$emailBlock[blockAction]();
                if (val) {
                    self.model.set('emailEnabled', true);
                    $('.email-case-item', self.$el).each(function (index) {
                        self.filterLaunches(index);
                        self.filterTags(index);
                    });
                    Service.getProject()
                        .done(function () {
                            self.render();
                            self.onShow();
                            Util.ajaxSuccessMessenger('updateProjectSettings');
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, 'updateProjectSettings');
                        });
                } else {
                    self.model.set('emailEnabled', false);
                }
                this.model.set(id, val);
                this.updateRules();
            } else {
                emailCase = _.findWhere(this.model.get('emailCases'), {
                    id: caseBtn.closest('.email-case-item').data('email-case-id')
                });
                if (emailCase) {
                    config.trackingDispatcher.trackEventNumber(392);
                    emailCase.sendCase = val;
                }
                this.checkCases();
            }
        },

        setEmailToDefault: function () {
            var self = this;
            $('.email-case-item', this.$el).each(function (index, elem) {
                var emailCase = _.findWhere(self.model.get('emailCases'), { id: $(elem).data('email-case-id') });

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
            var self = this;
            var recipients = false;
            var validAllRecipients = true;
            var emailCase;
            var emailCaseToDelete;
            var validRecipients;

            $('.email-case-item').each(function (index, elem) {
                validRecipients = true;
                emailCase = _.findWhere(self.model.get('emailCases'), {
                    id: $(elem).data('email-case-id')
                });
                emailCaseToDelete = $.inArray($(elem).data('email-case-id'), self.rulesToDelete) !== -1;

                if (!recipients && emailCase && !emailCaseToDelete) {
                    recipients = _.isEmpty(emailCase.recipients);
                }
                if (emailCase && _.isEmpty(emailCase.recipients) && !emailCaseToDelete) {
                    self.showFormErrors($(elem).find('input.recipients'), Localization.project.invalidRecipients);
                }
                if (emailCase && !emailCaseToDelete) {
                    if (validRecipients) {
                        validRecipients = !_.isEmpty(emailCase.recipients);
                    }
                    validAllRecipients = validRecipients;
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
                $('.select2-drop-active', this.$el).hide();
                $('.select2-input.select2-active', this.$el).removeClass('select2-active');
            } else {
                this.hideFormsErrors(launches);
                if (!click) {
                    $('.select2-drop-active', this.$el).last().show();
                    launches.find('.select2-input').addClass('select2-active');
                }
            }
        },

        checkTagsAndLaunches: function (data) {
            var conf = data.configuration;
            if (conf.launchNames && conf.launchNames.length === 0) {
                delete conf.launchNames;
            }
            if (conf.tags && conf.tags.length === 0) {
                delete conf.tags;
            }
            data.configuration = conf;
            // console.log(JSON.stringify(data));
            return data;
        },

        submitNotifications: function () {
            var self = this;
            var emailField = $('#from', this.$el);
            var externalSystemData = this.model.getProjectSettings(this.rulesToDelete);
            config.trackingDispatcher.trackEventNumber(396);
            if (this.model.get('emailEnabled')) {
                if (!this.validateTags()) {
                    return false;
                }
                if (this.validateRecipients()) {
                    return false;
                } else if ($('.email-case-item:not(.will-delete)', this.$el).find('.has-error').length > 0) {
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
                self.model.set('emailEnabled', false);
                $('.email-case-item').remove();
                externalSystemData = self.model.getProjectSettings();
            }
            externalSystemData = this.checkTagsAndLaunches(externalSystemData);
            Service.updateEmailProjectSettings(externalSystemData.configuration)
                .done(function () {
                    self.appModel.get('configuration').emailConfiguration =
                        externalSystemData.configuration;
                    self.emailCaseId = 0;
                    self.rulesToDelete.length = 0;
                    self.updateIds();
                    self.model.set(self.appModel.get('configuration').emailConfiguration);
                    self.render();
                    self.onShow();
                    Util.ajaxSuccessMessenger('updateProjectSettings');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateProjectSettings');
                });
            return undefined;
        },

        onDestroy: function () {
            _.each(this.dropdownComponents, function (item) {
                item.destroy();
            });
            this.$recipients = $('input.recipients', this.$el);
            this.$launchContainer = $('input.launchNames', this.$el);
            this.$tagsContainer = $('input.tags', this.$el);

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

            $('body > #select2-drop-mask, body > .select2-sizer').remove();
        }
    });

    return NotificationsTabView;
});
