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
    var Util = require('util');
    var Components = require('core/components');
    var App = require('app');
    var Service = require('coreService');
    var Helpers = require('helpers');
    var Storage = require('storageService');
    var Localization = require('localization');
    var Urls = require('dataUrlResolver');
    var FiltersService = require('filtersService');
    var Widget = require('widgets');
    var Editor = require('launchEditor');
    var Moment = require('moment');
    var WidgetsConfig = require('widget/widgetsConfig');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    require('select2');

    var config = App.getInstance();

    var WidgetModel = Backbone.Model.extend({
        defaults: {
            name: "",
            isShared: false,
            filter_id: 0,
            dashboard_id: 0,
            is_shared: false,
            widget_id: 0,
            widget_template: null,
            criteria: null,
            actions: null,
            limit: 0,
            mode: 'launch',
            users: null,
            is_valid: false,
            success_event: ""
        },

        getCriteriaFields: function (criteria, params) {
            var content = params.content_fields || [];
            for (var key in criteria) {
                content.push(key);
            }
            params.content_fields = _.uniq(content);
        },

        getDefaultCriteriaFields: function (widget, params) {
            params.content_fields = _.uniq(widget.defaultCriteria);
        },

        getContentParameters: function (model) {
            var widget = model.widget_template;
            var params = {
                type: widget.widget_type,
                gadget: widget.gadget
            };
            var widgetOptions = {};

            if (widget.limit) {
                params['itemsCount'] = model.limit ? model.limit : widget.limit.def;
            }
            if (widget.mode && model.mode == 'timeline') {
                widgetOptions['timeline'] = ["DAY"];
            }
            if (widget.actions) {
                var actions = [];
                if (!model.actions) {
                    _.each(widget.actions, function (a) {
                        Array.prototype.push.apply(actions, a.actions);
                    });
                }
                else {
                    actions = model.actions;
                }
                widgetOptions['actionType'] = actions;
            }
            if (widget.usersFilter && model.users && !_.isEmpty(model.users)) {
                widgetOptions['userRef'] = model.users;
            }
            if (widget.launchesFilter) {
                widgetOptions['launchNameFilter'] = model.launches;
            }

            if (widget.noCriteria && widget.staticCriteria && widget.gadget !== 'activity_stream') {
                params['content_fields'] = _.map(widget.staticCriteria, function (val, key) {
                    return key;
                });
            } else {
                if (!_.isEmpty(model.criteria)) {
                    var keys = _.isArray(widget.criteria) ? _.flatten(_.map(widget.criteria, function(d){return d.keys;})) : _.keys(widget.criteria);
                    params['content_fields'] = widget.criteria ? _.intersection(model.criteria, keys) : model.criteria;
                }
                else {
                    if (!_.isEmpty(widget.defaultCriteria)) {
                        this.getDefaultCriteriaFields(widget, params);
                    }
                    else if (widget.criteria) {
                        this.getCriteriaFields(widget.criteria, params);
                    }
                }
                if (widget.staticCriteria) {
                    this.getCriteriaFields(widget.staticCriteria, params);
                }
            }
            var noValidForMetadata = ['unique_bug_table', 'activity_stream', 'launches_table', 'most_failed_test_cases'];
            if (!_.contains(noValidForMetadata, widget.gadget)) {
                params['metadata_fields'] = ['name', 'number', 'start_time'];
            }
            if (widget.gadget == 'most_failed_test_cases') {
                params['metadata_fields'] = ['name', 'start_time'];
            }
            if (!_.isEmpty(widgetOptions)) {
                params['widgetOptions'] = widgetOptions;
            }
            return params;
        },
        getSaveModel: function () {
            var model = this.toJSON();
            if (model.is_valid) {
                var data = {};
                if (!model.is_shared) {
                    data['content_parameters'] = this.getContentParameters(model);
                    data['name'] = model.name;
                    data['share'] = model.isShared;
                    if (!model.widget_template.noFilters) {
                        data['filter_id'] = model.filter_id;
                    }
                }
                return data;
            }
        }
    });

    var WidgetWizard = Components.BaseView.extend({

        $widgetType: null,
        $widgetShared: null,
        $filterOwn: null,
        $filterShared: null,
        renderedTypes: [],
        selectedFilter: null,
        $selectedDashboard: null,
        ownDashboardNames: [],

        _widgetIncomingDashboard: null,

        messages: {
            minMax: "",
            select: ""
        },

        initialize: function (options) {
            this.navigationInfo = (options && options.navigationInfo) ? options.navigationInfo : null;
            var self = this;
            this.$el = Util.getDialog({name: this.dialogShellTpl});
            this.$el.on('hidden.bs.modal', function () {
                    self.destroy();
                })
                .on('shown.bs.modal', function () {
                    self.scrollToTemplate();
                });
            WidgetsConfig.clear();
            this.widgetsConfig = WidgetsConfig.getInstance();
            Util.switcheryInitialize(this.$el);
            this.setupAnchors();
            this.$typesHolder.html(Util.templates(this.widgetTypesTpl, {
                widgetTypes: this.widgetsConfig.widgetTypes,
                isCustomer: Util.isCustomer()
            }));
            this.$templateConfig.slideUp(100);

            this.renderedTypes = [];
            this.model = new WidgetModel({}, {});
            this.edited = null;
            Util.setupBaronScroll($('.borderWidget', this.$el));
            // Util.setupBaronScroll($('#OwnFilters', this.$el));
        },

        setupAnchors: function () {

            this.$topLevelNav = $(".nav-tabs.top-level:first", this.$el);
            this.$TypeTab = $("a[href='#widgetType']:first", this.$el).parent();
            this.$FilterTab = $("a[href='#widgetFilters']:first", this.$el).parent();
            this.$NameTab = $("a[href='#widgetData']:first", this.$el).parent();

            this.$ownDashboardsLink = $("a[href='#OwnDashboards']:first", this.$el);

            this.$DashboardsContent = $('#dashboardSelect', this.$el);
            this.$OwnDashboards = $('#OwnDashboards', this.$el);

            this.$ownFilters = $('.own-filters', this.$el);
            this.$sharedFilters = $('.shared-filters', this.$el);

            this.$previewBlock = $('#widgetPreview', this.$el);
            this.$previewValidatorMessage = $('#previewValidationMessage', this.$el);
            this.$previewValidatorHolder = $('#previewValidationHolder', this.$el);
            this.$previewContent = $('#previewContent', this.$el);

            this.$SharedFilters = $('#SharedFilters', this.$el);
            this.$OwnFilters = $('#OwnFilters', this.$el);
            this.$SharedWidgets = $('#SharedWidgets', this.$el);

            this.$typesHolder = $("#widgetTemplates", this.$el);
            this.$templateConfig = $("#templateConfig", this.$el);
            this.$templateOptions = $("#templateOptions", this.$templateConfig);
            this.$templateValidations = $("#templateValidations", this.$templateConfig);

            this.$widgetIsShared = $('#tabShared', this.$el);
            this.$widgetName = $('#widgetName', this.$el);
            this.$newDashboardName = $('#dashboardName', this.$el);
            this.$newDashboardShared = $('#dashboardShared', this.$el);
            this.$newDashboardWarning = $('#newDashboardWarning', this.$el);

            this.$widgetGlobalLoader = $('#popupLoader', this.$el);
            this.$globalValidation = $('#globalValidation', this.$el);

        },

        dialogShellTpl: "tpl-widget-wizard-dialog",
        widgetTypesTpl: "tpl-widget-wizard-widget-types",
        SharedWidgetsTpl: "tpl-widget-wizard-shared-widget",
        OwnFiltersTpl: "tpl-widget-wizard-filters",
        SharedFiltersTpl: "tpl-widget-wizard-filters",
        dropDownTpl: "tpl-widget-drop-down",
        minMaxTpl: "tpl-widget-min-max",
        usersSelectorTpl: "tpl-widget-users",
        launchesSelectorTpl: 'tpl-widget-launches',
        OwnDashboardsTpl: "tpl-widget-dashboards-own",
        buttonsTpl: 'tpl-widget-buttons',

        render: function (widget) {

            if (widget) {
                this._widgetIncomingDashboard = widget.dashboard_id;
                this.edited = widget;
                this.model.set(this.edited);
                if (this.edited.content_parameters) {
                    this.setupForEdit();
                }
                this.validateForCompletion();
                var self = this;
                this.$el.on('shown.bs.modal', function () {
                    var content = self.model.get('content');
                    if (content) {
                        if (self.validateWidgetType()) {
                            self.$previewValidatorHolder.hide();
                            self.$previewContent.empty().show();
                            self.renderWidgetPreview();
                        } else {
                            self.$previewValidatorMessage.empty();
                            self.$previewValidatorMessage.text(self.$previewValidatorHolder.data('notavailable'));
                            self.$previewValidatorHolder.show();
                        }
                        $('#widgetType li.shared-tab', this.$el).addClass('disabled').attr('title', Localization.wizard.impossibleShared);
                    }
                });
            }
            this.getDashboards();
            this.validateForPreview();
            this.$el.modal("show");
            return this;
        },

        setupForEdit: function () {
            this.model.set('widget_id', this.edited.content_parameters.gadget);
            var params = this.edited.content_parameters,
                launchNameFilter = (params.widgetOptions && params.widgetOptions.launchNameFilter) ? params.widgetOptions.launchNameFilter : null;
            if (launchNameFilter) {
                this.model.set('launches', launchNameFilter);
            }
        },

        preselectDashboard: function () {
            if (!this.model.get('dashboard_id')) {
                var dashboard = Storage.getActiveDashboard(),
                    d = (dashboard.id && dashboard.owner === config.userModel.get('name')) ? _.find(this.OwnDashboardsData, function (i) {
                        return i.id === dashboard.id
                    }) : this.OwnDashboardsData.length ? this.OwnDashboardsData[0] : null;
                this.model.set('dashboard_id', d && !this.validateForMaxWidgts(d) ? d.id : '');
            }
        },

        resetCreateDashboard: function () {
            this.$newDashboardName.val("");
            this.$newDashboardName.closest('.form-group').removeClass('has-error');
            this.$newDashboardShared.bootstrapSwitch('state', false);
        },

        events: {
            'click #widgetType a[data-toggle=tab]': 'handleType',
            'click a[href="#widgetData"]': 'handleNameSection',
            'click .top-level a': 'handleTopLevelNavigation',
            'click .filters-tab': 'handleFiltersTab',
            'click .widget_type': 'selectWidgetType',
            'click .btn-group': 'selectButton',
            'click .shared_widget_block': 'selectSharedWidget',
            'click .filter-row': 'selectFilter',
            'keyup #nameFilter': 'searchInFilters',
            'keyup #nameFilterShared': 'searchInFilters',
            'click .dashboard-selector': 'selectDashboard',
            'click #createDashboard .rp-btn.rp-btn-submit': 'submitNewDashboard',

            'validation::change #widgetName': 'handleWidgetName',
            'switchChange.bootstrapSwitch #tabShared': 'handleWidgetShare',
            'input #limitSelector': 'validateMinMax',
            'change .selectable': 'validateSelect',
            'click .check-all': 'validateSelect',
            'click #saveWidget': 'saveWidget',
            'click #globalValidation': 'hideGlobalValidation',
            'click #newDashboardWarning': 'hideNewDashboardWarning',
            'change #userSelector': 'validateUsersSelect',
            'change #launchesSelector': 'validateLaunchSelect'
        },

        validateMinMax: function (e) {
            var $el = $(e.currentTarget),
                val = $el.val().trim(),
                min = $el.data('min'),
                max = $el.data('max'),
                validationCode = "";
            if (/\D/.test(val)) {
                val = '';
                $el.val(val);
            }
            if (!val.length) {
                validationCode = 'countCantBeEmpty';
            } else {
                var num = parseInt(val);
                if (num < min || num > max) {
                    validationCode = 'countWrongAmountSize';
                }
            }
            this.messages.minMax = (validationCode) ? {code: validationCode, min: min, max: max} : '';
            this.model.set('limit', val);
            this.showMessage();
            this.validateModel();
            this.validateForPreview();
        },

        validateSelect: function (e) {
            var $el = $(e.currentTarget),
                parent = $el.closest(".dropdown-menu");
            if (!$(":checked", parent).length) {
                var code = {};
                code.code = parent.attr('id') === "actionOptions" ? "selectAtLeastOneAction" : "selectAtLeastOneCriteria";
                this.messages.select = code;
            } else {
                this.messages.select = "";
            }
            this.showMessage();
            var type = parent.attr('id') === "actionOptions" ? 'actions' : (parent.attr('id') === "modeOptions" ? 'mode' : 'criteria'),
                options = [];
            if (type === 'actions') {
                var widgetId = this.model.get('widget_id'),
                    def = this.widgetsConfig.widgetTypes[widgetId];
                _.each($(":checked", parent), function (el) {
                    options = options.concat(def.actions[$(el).val()].actions);
                });
            }
            else {
                options = _.flatten(_.map($(":checked", parent), function (el) {
                    return $(el).val().split(',');
                }));
            }
            this.model.set(type, options);
            this.validateModel();
            this.validateForPreview();
        },

        showMessage: function () {
            this.$templateValidations.empty().hide();
            for (var type in this.messages) {
                var code = this.messages[type].code;
                if (code) {
                    var range = (type === 'minMax' && code === 'countWrongAmountSize') ? this.messages[type].min + '-' + this.messages[type].max : '';
                    this.$templateValidations.append(Util.getValidationMessage(code) + range + "</br>");
                }
            }

            if (!this.$templateValidations.is(":empty")) {
                this.$templateValidations.show();
                //this.model.set("is_valid", false);
                this.$TypeTab.removeClass('validated');
            } else {
                this.$templateValidations.hide();
            }
            //this.model.set("is_valid", true);
            this.$TypeTab.addClass('validated');
            this.validateModel();
        },

        hideGlobalValidation: function () {
            this.$globalValidation.fadeOut('slow');
        },

        hideNewDashboardWarning: function () {
            this.$newDashboardWarning.fadeOut('slow');
        },

        validateUsersSelect: function () {
            var users = $('#userSelector', this.$templateConfig).val().split(',');
            this.model.set('users', _.compact(users));
        },

        validateLaunchSelect: function () {
            var launches = _.compact(_.map($('#launchesSelector', this.$templateConfig), function (el) {
                    return $(el).val();
                })),
                validationCode = '';
            if (!launches || _.isEmpty(launches)) {
                validationCode = 'launchesCantBeEmpty';
            }
            this.model.set('launches', launches);
            this.messages.launchesSelect = (validationCode) ? {code: validationCode} : '';
            this.showMessage();
            this.validateModel();
        },

        submitNewDashboard: function () {
            this.$newDashboardName.trigger('validate');
            if (!this.$newDashboardName.closest('.form-group').hasClass('has-error')) {
                var newDash = {
                        share: this.$newDashboardShared.bootstrapSwitch('state'),
                        name: this.$newDashboardName.val()
                    },
                    self = this;
                this.$widgetGlobalLoader.show();
                Service.createDashboard(newDash)
                    .done(function (data) {
                        newDash['id'] = data.id;
                        if (self['OwnDashboardsData'].length) {
                            self['OwnDashboardsData'].unshift(newDash);
                        } else {
                            self['OwnDashboardsData'].push(newDash);
                        }
                        self.model.get('dashboard_id') && $('#' + self.model.get('dashboard_id'), self.$DashboardsContent).removeClass('active');
                        self.model.set('dashboard_id', data.id);

                        self.renderContent('OwnDashboards');

                        $("a[href='#OwnDashboards']:first", self.$el).click();

                        self.resetCreateDashboard();
                        self.$widgetGlobalLoader.hide();
                        self.validateModel();
                        self.ownDashboardNames.push(newDash.name);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(null, 'addDashBoard');
                        self.$widgetGlobalLoader.hide();
                    });
            }
        },

        selectDashboard: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            if (!$el.hasClass('disabled')) {
                $('.dashboard-selector', this.$DashboardsContent).removeClass('active');
                this.model.set('dashboard_id', $el.attr('id'));
                $el.addClass('active');
                this.validateModel();
            }
        },

        searchInFilters: function (e) {
            var $el = $(e.currentTarget),
                value = $el.val(),
                type = $el.attr('id') === "nameFilter" ? "OwnFilters" : "SharedFilters",
                self = this;

            if (value.length > 55) {
                $el.parent().addClass('has-error');
                return;
            }
            $el.parent().removeClass('has-error');
            if (value) {
                _.forEach(self[type + "Data"], function (filter) {
                    var $el = $("#" + filter.id, self["$" + type]);
                    if (filter.name.toLowerCase().indexOf(value.toLowerCase()) === -1) {
                        $el.hide();
                    } else {
                        $el.show();
                    }
                });
            } else {
                $(".filter-row", this["$" + type]).show();
            }
        },

        handleTopLevelNavigation: function (e) {
            var $el = $(e.currentTarget);
            if ($el.parent().hasClass('disabled')) {
                e.stopImmediatePropagation();
                return false;
            }
            if (this.isValidForFirstTimeOwnFiltersLoad($el)) {
                this.loadType('OwnFilters');
            }
            this.hideGlobalValidation();
        },

        handleFiltersTab: function (e) {
            var $el = $(e.target),
                type = $el.attr('href').slice(1);
            this.loadType(type);
        },

        handleType: function (e) {
            if ($(e.currentTarget).parent().hasClass('disabled')) {
                e.stopImmediatePropagation();
                return false;
            }
            var target = $(e.target).attr('href').slice(1);
            if (target === 'SharedWidgets') {
                this.loadType(target);
                this.hideTemplateConfig();
            } else {
                this.showTemplateConfig();
                /*if (this.model.get('widget_template')) {
                 this.disableFilterTab(this.model.get('widget_template').noFilters);
                 }*/
            }
        },

        disableFilterTab: function (lock) {
            var action = lock ? 'add' : 'remove';
            this.$FilterTab[action + 'Class']('disabled');
        },

        loadType: function (type) {
            if (!this[type + "Data"]) {
                this.loadContent(type);
            } else {
                !this.isTypeRendered(type) && this.renderContent(type);
            }
        },

        loadContent: function (type) {
            var that = this;
            this.widgetLoader(this["$" + type], true);
            Service['get' + type]()
                .done(function (r) {
                    that.assignDataByType(r, type);
                    that.renderContent(type);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(null, 'connectToServer');
                });
        },

        handleNameSection: function () {
            var self = this;
            setTimeout(function () {
                self.setupWidgetNameValidator();
                self.renderContent('OwnDashboards');
                var widgetName = self.model.get('name');
                if (widgetName) {
                    self.$widgetName.val(widgetName);
                    self.$widgetIsShared.bootstrapSwitch('state', self.model.get('isShared'));
                }
            });

        },
        // todo: remove when widgets will transferable across dashboards
        validateDashboardTabsForEditability: function () {
            if (this.model.get('success_event') === 'refresh::widget') {
                this.$DashboardsContent.find("ul:first > li").addClass('disabled');
            }
        },
        //todo: remove end

        getDashboards: function () {
            //todo: remove when move widget to other dash will be implemented
            this.validateDashboardTabsForEditability();
            //todo: remove end

            var self = this;
            Service.getProjectDashboards()
                .done(function (data) {
                    self.assignDataByType(data, 'OwnDashboards');
                    self.preselectDashboard();
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'getDashBoards');
                });
        },

        setupWidgetNameValidator: function () {
            var self = this;
            Service.getWidgetNames()
                .done(function (data) {
                    if (self.model.get('widget_id') !== 0) {
                        var index = data.indexOf(self.model.get('name'));
                        if (index !== -1) {
                            data.splice(index, 1);
                        }
                    }
                    Util.bootValidator(self.$widgetName, [
                        {validator: 'minMaxRequired', type: 'widgetName', min: 3, max: 128},
                        {validator: 'noDuplications', type: 'widgetName', source: data}
                    ]);
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(null, 'widgetNames');
                });
        },

        widgetLoader: function (container, show) {
            var loaderAction = show ? 'show' : 'hide',
                contentAction = show ? 'hide' : 'show';
            $('.wizard-loader:first', container)[loaderAction]();
            $('.content-holder:first', container)[contentAction]();
        },

        renderContent: function (type) {
            var dashId = this.model.get('dashboard_id'),
                dash = _.find(this.OwnDashboardsData, function (d) {
                    return d.id === dashId;
                }),
                info = {
                    collection: this[type + "Data"] || [],
                    widgetsConfig: this.widgetsConfig,
                    model: this.model.toJSON(),
                    validateAddSharedWidget: this.validateAddSharedWidget,
                    isCustomer: Util.isCustomer(),
                    dash: dash,
                    validateForMaxWidgts: this.validateForMaxWidgts,
                    inEdit: this.model.get('success_event') === 'refresh::widget'
                };

            if (this.isFiltersType(type)) {
                info['shared'] = type === "SharedFilters";
                info['getFilterOptions'] = Helpers.getFilterOptions;
                info['getLastKey'] = Helpers.getLastKey;
            }

            $(".content-holder", this["$" + type]).html(Util.templates(this[type + "Tpl"], info));

            this.renderedTypes.push(type);
            var $el = this["$" + type];

            /*
            // TODO
            $('.dashboard-selector').each(function () {
                var $this = $(this);
                if ($this.find('.mi-share').length > 0) {
                    //$this.html($.trim($this.html()) + '<i class="material-icons mi-share">reply</i>');
                } else {
                    //$this.html($.trim($this.html()));
                }
            });
            */

            $('.filter-name').each(function () {
                var $this = $(this);
                $this.text($.trim($this.text()));
            });

            if (!$el.setupScroll) {
                var $scrollElement = Util.setupBaronScroll($('.content-holder', $el));
                Util.setupBaronScrollSize($scrollElement, {maxHeight: 300});
                $el.setupScroll = true;
            };

            this.widgetLoader($el);
            this.scrollToType(type);
        },

        scrollToType: function (type) {
            var validId = this.isTypeValidToScroll(type);
            if (validId) {
                var element = $("#" + validId, this["$" + type]);
                if (element.length) {
                    this["$" + type].scrollTop(0).scrollTop(element.position().top);
                }
            }
        },

        scrollToTemplate: function () {
            var top = 0;
            var cp = this.model.get('content_parameters');
            if (cp) {
                this.model.set('widget_id', cp.gadget);
                this.model.set('widget_template', this.widgetsConfig.widgetTypes[cp.gadget]);

                this.$widgetType = $("#" + cp.gadget, this.$typesHolder);
                this.$widgetType.addClass('active');
                this.renderWidgetSettings(this.widgetsConfig.widgetTypes[cp.gadget], cp);
                top = this.$widgetType.position().top;
                if (this.widgetsConfig.widgetTypes[cp.gadget].noFilters) {
                    this.$FilterTab.addClass('disabled');
                }
                this.validateModel();
            }
            this.$typesHolder.scrollTop(0).scrollTop(top);
        },

        assignDataByType: function (data, type) {
            if (this.isSharedWidgets(type)) {
                this[type + "Data"] = _.groupBy(data, 'owner');
            } else if (this.isDashboardType(type)) {
                var split = _.groupBy(data, function (dashboard) {
                    return dashboard.owner === config.userModel.get('name') ? 'own' : 'shared';
                });
                this['OwnDashboardsData'] = split.own || [];
                this.ownDashboardNames = _.pluck(this.OwnDashboardsData, 'name') || [];
                Util.bootValidator(this.$newDashboardName, [
                    {validator: 'minMaxRequired', type: 'dashboardName', min: 3, max: 128},
                    {validator: 'noDuplications', type: 'dashboardName', source: this.ownDashboardNames}
                ]);
            } else if (this.isFiltersType(type)) {
                this[type + "Data"] = data;
            }
        },

        resetActiveSelectable: function (type, el) {
            this["$" + type] && this["$" + type].removeClass('active');
            if (el) {
                this["$" + type] = el;
                this["$" + type].addClass('active');
            } else {
                this["$" + type] = null;
            }
        },

        selectWidgetType: function (e) {
            var $el = $(e.currentTarget);
            if ($el.hasClass('active') || $el.hasClass('disabled')) {
                return;
            }

            this.resetActiveSelectable('widgetType', $el);
            this.resetActiveSelectable('widgetShared');
            this.messages.minMax = '';
            this.messages.select = '';
            this.messages.launchesSelect = '';

            var widgetType = this.$widgetType.attr('id'),
                widget = this.widgetsConfig.widgetTypes[widgetType];
            if (!widget.mode) {
                this.model.set('mode', 'launch');
            }

            if (this.edited && this.edited.content_parameters && this.edited.content_parameters.gadget && widget.gadget === this.edited.content_parameters.gadget) {
                this.setupForEdit();
            }
            this.model.set('widget_template', widget);
            this.model.set('is_shared', false);
            this.model.set('widget_id', $el.attr('id'));
            this.model.set('criteria', null);
            this.model.set('content_parameters', null);
            this.model.set('launches', null);

            this.renderWidgetSettings(widget, this.model.get('content_parameters'));
            this.$previewBlock.show();
            this.disableFilterTab(widget.noFilters || false);

            if (widget.launchesFilter && _.isEmpty(this.model.get('launches'))) {
                this.messages.launchesSelect = {code: 'launchesCantBeEmpty'};
                this.showMessage();
            }
            this.validateModel();
            this.validateForPreview();
            this.disableWidgetNameSection(false);
        },

        getWidgetPreviewData: function () {
            var self = this;
            Service.getFilterData([this.model.get('filter_id')])
                .done(function (data) {
                    if (data && !_.isEmpty(data)) {
                        var filter = data[0],
                            requestParams = new Components.RequestParameters(),
                            type = filter.type,
                            filters = [],
                            model = self.model,
                            widget = model.get('widget_template'),
                            revert = false;

                        FiltersService.loadFilterIntoRequestParams(requestParams, filter);
                        filters = requestParams.getFilters();
                        filters.push({id: 'filter.!in.status', value: 'IN_PROGRESS'});
                        requestParams.setFilters(filters);

                        if (model.get('mode') === 'timeline' || (widget && widget.gadget === 'launch_statistics')) {
                            requestParams.setSortInfo('start_time', 'DESC');
                        }
                        if (widget && widget.gadget === 'launches_comparison_chart') {
                            var sortInfo = requestParams.getSortInfo();
                            if (sortInfo.direction === 'ASC') {
                                revert = true;
                            }
                            requestParams.setSortInfo('start_time', 'DESC');
                        }
                        if (!_.isUndefined(model.get('limit'))) {
                            requestParams.setPageSize(model.get('limit'));
                            if (!self.validateLimitForPreview(widget, model.get('limit'))) {
                                self.renderWidgetPreview({content: []});
                                return false;
                            }
                        }

                        Service.getWidgetData(type, requestParams.toURLSting())
                            .done(function (data) {
                                if (widget && widget.gadget === 'launches_comparison_chart') {
                                    data.content = widgetPreviewService.getComparisonLaunches(data, revert);
                                }
                                self.renderWidgetPreview(data);
                            })
                            .fail(function (error) {
                                self.noDataForPreview();
                                Util.ajaxFailMessenger(null, 'widgetPreviewData');
                            });
                    }
                    else {
                        self.noDataForPreview();
                    }
                })
                .fail(function (error) {
                    self.noDataForPreview();
                    Util.ajaxFailMessenger(null, 'widgetPreviewData');
                });
        },

        validateLimitForPreview: function (widget, limit) {
            var def = widget.limit,
                min = def.min,
                max = def.max;
            return limit >= min && limit <= max;
        },

        parseWidgetPreviewData: function (data, model) {
            return widgetPreviewService.parseData(data, model);
        },

        renderWidgetPreview: function (data) {
            var content_params = this.model.get('content_parameters'),
                gadget = (data) ? this.model.get('widget_id') : content_params.gadget,
                model = this.model.toJSON(),
                params = data ? this.model.getContentParameters(model) : content_params,
                isTimelineMode = data ? this.model.get('mode') && this.model.get('mode') == 'timeline' : content_params.widgetOptions && content_params.widgetOptions.timeline,
                content = (data) ? this.parseWidgetPreviewData(data, this.model) : this.model.get('content'),
                view = Widget.widgetService(gadget),
                widget = {
                    isTimeline: isTimelineMode,
                    id: _.uniqueId('preview-'),
                    name: this.model.get('name'),
                    content: content,
                    height: 240
                };

            this.$previewContent.css('height', '300px');

            this.$previewContent.empty();
            this.widget && this.widget.destroy();
            this.widget = new view({
                container: this.$previewContent,
                context: this.context,
                model: this.model,
                parent: this,
                isPreview: true,
                param: _.extend(params, widget)
            }).render();
        },

        getSharedWidgetData: function () {
            var self = this;
            Service.getSharedWidgetData(this.model.get('id'))
                .done(function (data) {
                    self.model.set({
                        content: data.content,
                        content_parameters: data.content_parameters
                    });
                    self.renderWidgetPreview();
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'sharedWidgetData');
                });
        },

        selectSharedWidget: function (e) {
            var $el = $(e.currentTarget),
                id = $el.attr('id'),
                saveButton = $('#saveWidget', this.$el);
            if ($el.hasClass('disabled')) {
                return;
            }
            ;
            this.emptyTemplateConfig();
            saveButton.removeAttr('disabled').removeProp('disabled');
            this.resetActiveSelectable('widgetShared', $el);
            this.resetActiveSelectable('widgetType');
            this.model.set('widget_template', this.widgetsConfig.widgetTypes[$el.data('gadget')]);
            this.hideTemplateConfig();

            this.model.set('is_shared', true);
            this.model.set('id', id);
            this.validateModel();
            this.disableWidgetNameSection(true);
            this.disableFilterTab(true);

            this.$previewValidatorHolder.hide();
            this.$previewValidatorMessage.empty();
            if (this.validateWidgetType()) {
                this.$previewContent.empty().show();
                this.getSharedWidgetData();
            } else {
                this.$previewContent.empty().hide();
                this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('notavailable'));
                this.$previewValidatorHolder.show();
            }
        },

        validateForMaxWidgts: function (d) {
            return (d && d.widgets && d.widgets.length) >= config.maxWidgetsOnDashboard;
        },

        validateAddSharedWidget: function (dash, id) {
            return dash && !!_.find(dash.widgets, function (w) {
                    return w.widgetId === id
                });
        },

        validateWidgetType: function () {
            var widget = this.model.get('widget_template');
            return !((widget && widget.gadget) && (widget.gadget == 'unique_bug_table' || widget.gadget == 'activity_stream' || widget.gadget == 'launches_table' || widget.gadget == 'most_failed_test_cases'));
        },

        selectButton: function (event) {
            event.preventDefault();

            var $el = $(event.currentTarget);
            var target = $(event.target);

            if (target.hasClass('rp-btn-val')) {
                event.stopPropagation();
                target = target.closest('.rp-btn');
            }

            if (target.hasClass('active')) {
                return;
            }

            $el.find('.rp-btn').removeClass('active');
            target.addClass('active');

            this.model.set($el.data('type'), target.data('value'));

            this.validateModel();
            this.validateForPreview();
        },

        selectFilter: function (e) {
            var $el = $(e.currentTarget);

            if (!this.$filterRow) {
                $('.active', this.$OwnFilters).removeClass('active');
                $('.active', this.$SharedFilters).removeClass('active');
            } else {
                this.$filterRow.removeClass('active');
            }

            this.$filterRow = $el;
            this.$filterRow.addClass('active');

            this.model.set('filter_id', $el.attr('id'));

            this.validateModel();
            this.validateForPreview();
        },

        validateForPreview: function () {
            this.$previewValidatorHolder.hide();
            this.$previewValidatorMessage.empty();
            var filter = this.model.get('filter_id'),
                widget = this.model.get('widget_template'),
                isValid = false;

            if (!this.validateWidgetType()) {
                this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('notavailable'));
            }
            else if (!widget && !filter) {
                this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('default'));
            }
            else if (!widget) {
                this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('notemplate'));
            }
            else if (!filter) {
                if (widget && widget.noFilters) {
                    this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('notavailable'));
                } else {
                    this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('nofilter'));
                }
            }
            else {
                isValid = true;
            }
            if (isValid) {
                this.$previewValidatorHolder.hide();
                this.showPreview();
            }
            else {
                this.$previewContent.empty().hide();
                !this.$previewValidatorMessage.is(":empty") && this.$previewValidatorHolder.fadeIn();
            }
        },

        noDataForPreview: function () {
            this.$previewValidatorMessage.empty();
            this.$previewContent.empty().hide();
            this.$previewValidatorMessage.text(this.$previewValidatorHolder.data('nodata'));
            !this.$previewValidatorMessage.is(":empty") && this.$previewValidatorHolder.fadeIn();
        },

        showPreview: function () {
            this.$previewContent.empty().show();
            this.getWidgetPreviewData();
        },

        hideTemplateConfig: function () {
            this.$templateConfig.slideUp(100);
            this.$templateOptions.hide();
            this.$templateValidations.hide();
        },

        showTemplateConfig: function () {
            this.$templateConfig.slideDown(200);
            this.$templateOptions.show();
            if (!this.$templateValidations.is(':empty')) {
                this.$templateValidations.show();
            }
        },

        emptyTemplateConfig: function () {
            this.$templateOptions.empty();
            this.$templateValidations.empty().hide();
        },

        disableWidgetNameSection: function (direction) {
            this.$widgetIsShared.bootstrapSwitch('disabled', direction);
            if (direction) {
                this.$widgetName.attr('disabled', 'disabled');
            } else {
                this.$widgetName.removeAttr('disabled');
            }
        },

        isCriteriaChecked: function (widget, criteria) {
            if (widget.type == "action") {
                var actions = widget.criteria[criteria].actions;
                return widget.criteria_fields.length && !widget.checkAll ? _.every(actions, function (a) {
                    return _.contains(widget.criteria_fields, a);
                }) : true;
            }
            if (widget.selectType) {
                return _.isEqual(widget.criteria_fields, criteria.split(','));
            } else {
                return widget.criteria_fields.length && !widget.checkAll ? _.every(criteria.split(','), function(c){return _.contains(widget.criteria_fields, c);}) : true;
            }
        },

        renderWidgetSettings: function (widget, gadget) {
            this.emptyTemplateConfig();
            if (this.hasRenderableCriteria(widget)) {
                var keys = _.isArray(widget.criteria) ? _.flatten(_.map(widget.criteria, function(c){return c.keys;})) : _.keys(widget.criteria),
                    criteria_fields = (gadget && gadget.gadget === widget.gadget) ? gadget.content_fields : !_.isEmpty(widget.defaultCriteria) ? widget.defaultCriteria : keys,
                    isCheckAll = keys.length === (gadget && widget.staticCriteria ? criteria_fields.length - _.size(widget.staticCriteria) : criteria_fields.length);

                this.model.set('criteria', criteria_fields);
                this.$templateOptions.append(Util.templates(this.dropDownTpl, {
                    criteria: widget.criteria,
                    criteria_fields: criteria_fields,
                    defaultCriteria: widget.defaultCriteria,
                    selectType: widget.criteriaSelectType,
                    type: 'criteria',
                    checkAll: isCheckAll,
                    isChecked: this.isCriteriaChecked
                }));
            }

            if (widget.limit) {
                var value = gadget && gadget.gadget === widget.gadget && gadget.itemsCount ? gadget.itemsCount : widget.limit.def;
                value && this.model.set('limit', value);
                if (widget.limit.display) {
                    this.$templateOptions.append(Util.templates(this.minMaxTpl, {
                        value: value,
                        limit: widget.limit,
                        gadget: widget.gadget
                    }));
                }
            }

            if (widget.mode) {
                var mode = (gadget && gadget.widgetOptions && gadget.widgetOptions.timeline) ? 'timeline' : 'launch';

                this.model.set('mode', mode);

                this.$templateOptions.append(Util.templates(this.buttonsTpl, {
                    criteria: widget.mode.items,
                    defautlCriteria: mode,
                    type: 'mode'
                }));
            }

            if (widget.actions) {
                var actions = gadget && gadget.widgetOptions && gadget.widgetOptions.actionType,
                    defActions = _.flatten(_.map(widget.actions, function (v, k) {
                        return v.actions
                    }));
                actions && this.model.set('actions', actions);
                actions = actions || [];
                this.$templateOptions.append(Util.templates(this.dropDownTpl, {
                    criteria: widget.actions,
                    criteria_fields: actions,
                    type: 'action',
                    checkAll: !actions.length || defActions.length === actions.length,
                    isChecked: this.isCriteriaChecked
                }));
            }

            if (widget.usersFilter) {
                var selectedUsers = gadget && gadget.widgetOptions && gadget.widgetOptions.userRef,
                    startSearch = config.forms.filterUser;

                selectedUsers && this.model.set('users', selectedUsers);
                this.$templateOptions.append(Util.templates(this.usersSelectorTpl, {
                    selected: selectedUsers || [],
                    startSearch: startSearch
                }));

                var userTags = $('.users-typeahead:first', this.$templateConfig),
                    self = this;
                Editor.setupSelect2Tags(userTags, {
                    type: 'autocompleteUserUrl',
                    min: 1,
                    minimumInputLength: startSearch,
                    maximumInputLength: 256,
                    //dropdownCssClass: 'hideNew',
                    mode: 'DEFAULT',
                    noResizeSearch: true,
                    //noCreateNew: true,
                    startSearch: startSearch
                });
            }

            if (widget.launchesFilter) {
                var selectedLaunches = gadget && gadget.widgetOptions && gadget.widgetOptions.launchNameFilter,
                    self = this;
                this.$templateOptions.append(Util.templates(this.launchesSelectorTpl, {selected: selectedLaunches || []}));
                Util.setupSelect2WhithScroll($('.users-typeahead:first', this.$templateConfig), {
                    multiple: false,
                    min: 3,
                    noCreateNew: true,
                    minimumInputLength: 3,
                    maximumInputLength: 256,
                    allowClear: true,
                    dropdownCssClass: 'hideNew',
                    placeholder: 'Select launch',
                    initSelection: function (element, callback) {
                        callback({id: element.val(), text: element.val()});
                    },
                    query: function (query) {
                        Service.searchLaunches(query)
                            .done(function (response) {
                                var data = {results: []}
                                _.each(response, function (item) {
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
                });
                $('.users-typeahead:first', this.$templateConfig).on('select2-open', function () {
                    $('.select2-drop-mask').remove();
                    self.hideCriteriaDropDown();
                });
                $(document).on('mousedown', function () {
                    $('.users-typeahead:first', self.$templateConfig).select2('close');
                });
            }

            if (!this.$templateOptions.is(':empty')) {
                Util.attachSelectAllFlipper(this.$templateConfig);
                this.$templateConfig.slideDown(200);
            }
        },

        hideCriteriaDropDown: function () {
            var dropDown = $('.dropdown-toggle', this.$templateConfig);
            if (dropDown.parent().hasClass('open')) {
                dropDown.dropdown('toggle');
            }
        },

        validateModel: function () {
            if (this.model.get('is_shared')) {
                this.$TypeTab.addClass('validated');
                var id = this.model.get('id'),
                    dashId = this.model.get('dashboard_id'),
                    dash = _.find(this.OwnDashboardsData, function (i) {
                        return i.id === dashId
                    }),
                    dashAction = !!dashId ? 'add' : 'remove',
                    typeAction = 'add';

                this.$NameTab[dashAction + 'Class']('validated');
                if (dash) {
                    typeAction = !this.validateAddSharedWidget(dash, id) ? 'add' : 'remove';
                    if (typeAction == 'remove' && this.$widgetShared.hasClass('active')) {
                        $('.shared_widget_block', this.$widgetShared).removeClass('active');
                        $('#' + id, this.$widgetShared).addClass('disabled');
                    }
                }
                this.$TypeTab[typeAction + "Class"]('validated');
                this.model.set('is_valid', (dashAction == 'add' && typeAction == 'add') ? true : false);
            } else {
                // validate name and dashboard section
                var nameAction = this.model.get('name') && this.model.get('dashboard_id') ? 'add' : 'remove';
                this.$NameTab[nameAction + "Class"]('validated');

                var filterId = this.model.get('filter_id'),
                    widget = this.widgetsConfig.widgetTypes[this.model.get('widget_id')],
                    filterAction;
                if (widget && widget.noFilters) {
                    filterAction = 'add';
                } else {
                    filterAction = filterId ? 'add' : 'remove';
                }
                this.$FilterTab[filterAction + "Class"]('validated');

                var typeAction = this.model.get('widget_id') ? 'add' : 'remove';

                if (this.typeHasAnyErrors()) {
                    typeAction = 'remove';
                }
                this.$TypeTab[typeAction + "Class"]('validated');

                var validity = nameAction === 'add' && filterAction === 'add' && typeAction === 'add',
                    saveButton = $('#saveWidget', this.$el);

                this.model.set('is_valid', validity);
                if (validity) {
                    saveButton.removeAttr('disabled').removeProp('disabled');
                } else {
                    saveButton.attr('disabled', 'disabled').prop('disabled', 'disabled');
                }
            }
        },

        typeHasAnyErrors: function () {
            return _.any(this.messages, function (i) {
                return !!i;
            });
        },

        handleWidgetName: function (e, data) {
            if (data.valid) {
                this.model.set('name', data.value);
            } else {
                this.model.set('name', "");
            }
            this.validateModel();
        },

        handleWidgetShare: function (e, state) {
            this.model.set('isShared', state);
        },

        hasRenderableCriteria: function (widget) {
            return widget && widget.criteria && !widget.noCriteria;
        },

        isSharedWidgets: function (type) {
            return type === 'SharedWidgets';
        },

        isFiltersType: function (type) {
            return type.indexOf('Filters') !== -1;
        },

        isDashboardType: function (type) {
            return type.indexOf('Dashboards') !== -1;
        },

        isTypeRendered: function (type) {
            return _.indexOf(this.renderedTypes, type) !== -1;
        },

        isValidForFirstTimeOwnFiltersLoad: function ($el) {
            return $el.attr('href') === "#widgetFilters" && !this.OwnFiltersData;
        },

        isTypeValidToScroll: function (type) {
            var id = '';
            if (type === 'SharedFilters' || type === 'OwnFilters') {
                id = this.model.get('filter_id');
            }
            return id;
        },

        checkForUnsavedDashboard: function () {
            var hasUnsavedDashboard = Boolean(this.$newDashboardName.is(":visible") && this.$newDashboardName.val());
            hasUnsavedDashboard && this.$newDashboardWarning.fadeIn();
            return hasUnsavedDashboard;
        },

        validateForCompletion: function () {
            if (this.model.get('id')) {
                this.$FilterTab.addClass('validated');
                this.$TypeTab.addClass('validated');
                this.$NameTab.addClass('validated');
            } else if (this.model.get('filter_id')) {
                this.$FilterTab.addClass('validated');
            }
        },

        getWidgetShell: function () {
            return {
                widgetId: this.model.get('id'),
                widgetPosition: [0, 0],
                widgetSize: [config.defaultWidgetWidth, config.defaultWidgetHeight]
            };
        },

        addToDashboard: function () {
            var data = this.getWidgetShell(),
                self = this,
                dashboardId = this.model.get('dashboard_id'),
                eventCallBack = this.model.get('success_event'),
                makeAction = function (widgets) {
                    var dashboard = _.find(self['OwnDashboardsData'], {id: dashboardId}) || {id: dashboardId};
                    if (eventCallBack) {
                        dashboard['widgets'] = widgets;
                        self.navigationInfo.trigger(eventCallBack, dashboard);
                    } else {
                        self.$el.on("hidden.bs.modal", function () {
                            // force router to handle update
                            Storage.setActiveDashboard({
                                id: dashboard.id,
                                name: dashboard.name,
                                owner: dashboard.owner
                            });
                            config.router && config.router.navigate(Urls.redirectToDashboard(dashboardId), {trigger: true});
                            self.destroy();
                        });
                    }
                    self.$el.modal("hide");
                },
                addWidget = function () {
                    return Service.addWidgetToDashboard(data, dashboardId);
                },
                getDashboard = function () {
                    //return Service.getProjectDashboard(dashboardId)
                    //.then(function (dashboard) {
                    var dashboard = _.find(self['OwnDashboardsData'], {id: dashboardId}) || {id: dashboardId},
                        widgetsList = dashboard.widgets,
                        updatedList = [data];
                    if (widgetsList && widgetsList.length) {
                        _.forEach(widgetsList, function (widget) {
                            if (widget.widgetId !== data.widgetId) {
                                widget.widgetPosition[1] += config.defaultWidgetHeight;
                                updatedList.push(widget);
                            }
                        });
                    }
                    return updatedList;
                    //});
                },

                updateWidgets = function (updatedList) {
                    if (updatedList && updatedList.length === 1) {
                        makeAction([data]);
                    } else {
                        Service.updateWidgetsOnDashboard(updatedList, dashboardId)
                            .done(function (data) {
                                makeAction(updatedList);
                                var gadget = self.model.get('widget_template');
                                // config.trackingDispatcher.widgetAdded((!!gadget.gadget ? gadget.gadget : self.model.get('widget_id')));
                                self.$widgetGlobalLoader.hide();
                            }).fail(errorHandler);
                    }
                },
                errorHandler = function (error) {
                    self.$el.modal("hide");
                    Util.ajaxFailMessenger(error, 'widgetAddToDashboard');
                };

            addWidget()
                .then(getDashboard)
                .then(updateWidgets, errorHandler);
        },

        saveWidget: function () {
            var self = this;
            if (!this.model.get('is_shared')) {
                this.$widgetName.trigger('validate');
            }
            if (this.checkForUnsavedDashboard()) {
                return;
            }
            if (this.model.get('is_valid')) {
                this.hideGlobalValidation();
                this.$widgetGlobalLoader.show();
                if (this.model.get('is_shared')) {
                    this.validateModel();
                    this.addToDashboard();
                } else {
                    if (!this.edited.content_parameters) {
                        this.model.set('id', null);
                    }
                    var model = this.model.getSaveModel(),
                        id = this.model.get('id');
                    if (id) {
                        //this.persistDashboardChange();
                        Service.updateWidget(model, id)
                            .done(function (msg) {
                                self.trigger(self.model.get('success_event'), id);
                                self.$widgetGlobalLoader.hide();
                                self.$el.modal("hide");
                            })
                            .fail(function (error) {
                                Util.ajaxFailMessenger(error, 'widgetUpdate');
                                self.$widgetGlobalLoader.hide();
                                self.$el.modal("hide");
                            });
                    } else {
                        Service.saveWidget(model)
                            .done(function (data) {
                                self.model.set('id', data.id);
                                self.addToDashboard();
                            })
                            .fail(function (error) {
                                Util.ajaxFailMessenger(null, 'widgetSave');
                                self.$widgetGlobalLoader.hide();
                                self.$el.modal("hide");
                            });
                    }
                }
            } else {
                $("li:not(.validated)", this.$topLevelNav).effect('highlight', {}, 3000);
                this.$globalValidation.fadeIn('fast');
            }
        },

        destroy: function () {
            this.widget && this.widget.destroy();
            this.messages = null;
            this.model = null;
            this.$el.data('modal', null);
            this.$el.off().remove();
            Components.RemovableView.prototype.destroy.call(this);
        }

    });

    var widgetPreviewService = {
        parseData: function (data, model) {
            var type = model.get('widget_id');
            switch (type) {
                case "old_line_chart":
                    return this.getLineTrendChartData(data, model);
                    break;
                case "statistic_trend":
                    return this.getLineTrendChartData(data, model);
                    break;
                case "investigated_trend":
                    return this.getColumnChartData(data, model);
                    break;
                case "launch_statistics":
                    return this.getCombinePieChartData(data, model);
                    break;
                case "overall_statistics":
                    return this.getStaticticsPanelData(data, model);
                    break;
                case "not_passed":
                    return this.getNotPassedChartData(data);
                    break;
                case "cases_trend":
                    return this.getCasesTrendChartData(data, model);
                    break;
                case "bug_trend":
                    return this.getBugsTrendChartData(data, model);
                    break;
                case "launches_comparison_chart":
                    return this.getLaunchesComparisonChartData(data, model);
                    break;
                case "launches_duration_chart":
                    return this.getLaunchesDurationChartData(data);
                    break;
                default:
                    return null;
                    break;
            }
        },

        fixCriteria: function (type, key, issueType) {
            var execCount = 'statistics$executionCounter$',
                issueCount = 'statistics$issueCounter$';

            if(type == 'defects'){
                if(issueType){
                    var k = issueType.split('_');
                    if (k[1]) {
                        k[1] = k[1].capitalize();
                    }
                    return issueCount + k.join('') + '$' + key;
                }
                else {
                    var d = key.split('_');
                    if (d[1]) {
                        d[1] = d[1].capitalize();
                    }
                    return issueCount + d.join('');
                }
            }
            else {
                return execCount + key;
            }
        },

        calcValue: function (val) {
            var calc = 0;
            if (_.isObject(val)) {
                if (_.isUndefined(val.total)) {
                    _.each(val, function (v, k) {
                        calc += parseInt(v);
                    });
                }
                else {
                    calc = parseInt(val.total);
                }
            }
            else {
                calc = parseInt(val);
            }
            return calc;
        },

        getValues: function (criteria, launch) {
            var values = {};
            _.each(criteria, function (c) {
                var k = c.split('$'),
                    last = _.last(k),
                    type = k[1],
                    v = launch ? type == 'defects' ? launch[k[0]][type][k[2]][last] : launch[k[0]][type][last] : 0,
                    key = this.fixCriteria(type, last, k[2]),
                    val = this.calcValue(v || 0);
                values[key] = val;
            }, this);
            return values;
        },

        getLaunchInfo: function (launch) {
            return {
                name: launch.name,
                number: launch.number,
                startTime: launch.start_time
            }
        },

        getCriteria: function (model) {
            var criteria = model.get('criteria'),
                widgetsConfig = WidgetsConfig.getInstance();
            if (!criteria) {
                criteria = widgetsConfig.widgetTypes[model.get('widget_id')].criteria;
                if (!criteria) {
                    criteria = widgetsConfig.widgetTypes[model.get('widget_id')].staticCriteria;
                }
                return _.keys(criteria);
            }
            return criteria;
        },

        getComparisonLaunches: function (data, revert) {
            var compare = [],
                launches = data.content;
            for (var i = 0, length = launches.length; i < length; i++) {
                if (compare.length >= 2) {
                    break;
                }
                if (launches.status !== 'inProgress') {
                    compare.push(launches[i]);
                }
            }
            if (!revert) {
                compare.reverse();
            }
            return compare;
        },

        getStaticticsPanelData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                criteria = this.getCriteria(model);
            if (!_.isEmpty(launches)) {
                _.each(launches, function (launch) {
                    _.each(criteria, function (c) {
                        var k = c.split('$'),
                            type = k[1],
                            key = _.last(k),
                            v = launch ? type == 'defects' ? launch[k[0]][type][k[2]][key] : launch[k[0]][type][key] : 0,
                            val = this.calcValue(v || 0);

                        if (content[key]) {
                            content[key] += val;
                        }
                        else {
                            content[key] = val;
                        }
                    }, this);
                }, this);
            }
            return {result: [{values: content}]};
        },

        getLineTrendChartData: function (data, model) {
            var content = {},
                isTimelineMode = model.get('mode') && model.get('mode') == 'timeline',
                launches = data.content.reverse(),
                criteria = this.getCriteria(model);

            if (!_.isEmpty(launches)) {
                if (!isTimelineMode) {
                    content.result = [];
                    _.each(launches, function (launch) {
                        var info = this.getLaunchInfo(launch);
                        info.values = this.getValues(criteria, launch);
                        content.result.push(info);
                    }, this);
                }
                else {
                    var dates = [];
                    _.each(launches, function (launch) {
                        var values = this.getValues(criteria, launch),
                            time = Moment(launch.start_time).format('YYYY-MM-DD');
                        dates.push(Moment(time, 'YYYY-MM-DD').unix());
                        if (content.hasOwnProperty(time)) {
                            var d = content[time][0].values;
                            _.each(d, function (v, k) {
                                d[k] = v + values[k];
                            });
                        }
                        else {
                            content[time] = [{values: values}];
                        }
                    }, this);
                    var minDate = _.min(dates),
                        maxDate = _.max(dates),
                        currentDate = Moment.unix(minDate).format('YYYY-MM-DD'),
                        zero = this.getValues(criteria);
                    while (Moment(currentDate, 'YYYY-MM-DD').unix() < maxDate) {
                        currentDate = Moment(currentDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');
                        if (!content.hasOwnProperty(currentDate)) {
                            content[currentDate] = [{values: zero}];
                        }
                    }
                }
            }
            return content;
        },

        getColumnChartData: function (data, model) {
            var content = {},
                isTimelineMode = model.get('mode') && model.get('mode') == 'timeline',
                criteria = this.getCriteria(model),
                self = this,
                launches = data.content.reverse(),
                getStatsData = function (crt, stats) {
                    var total = 0,
                        inv = 0,
                        to_inv = 0;

                    _.each(crt, function (c) {
                        var arr = c.split('$'),
                            type = arr[2],
                            def = _.last(arr);
                        if(_.has(stats.defects[type], def)){
                            var val = stats.defects[type][def],
                                calc = self.calcValue(val);
                            if (type === 'to_investigate') {
                                to_inv += calc;
                            }
                            else {
                                inv += calc;
                            }
                            total += calc;
                        }
                    }, this);
                    return {total: total, inv: inv, to_inv: to_inv};
                };

            if (!_.isEmpty(launches)) {
                if (!isTimelineMode) {
                    content.result = [];
                    _.each(launches, function (launch) {
                        var launchInfo = this.getLaunchInfo(launch),
                            stats = launch.statistics,
                            data = getStatsData(criteria, stats),
                            total = data.total,
                            inv = data.inv,
                            to_inv = data.to_inv;

                        launchInfo.values = {
                            investigated: total ? Math.round((inv / total * 100) * 100) / 100 : 0,
                            to_investigate: total ? Math.round((to_inv / total * 100) * 100) / 100 : 0
                        };
                        content.result.push(launchInfo);
                    }, this);
                }
                else {
                    var dates = [],
                        days = {};
                    _.each(launches, function (launch) {
                        var time = Moment(launch.start_time).format('YYYY-MM-DD'),
                            stats = launch.statistics,
                            data = getStatsData(criteria, stats),
                            total = data.total,
                            inv = data.inv,
                            to_inv = data.to_inv;

                        dates.push(Moment(time, 'YYYY-MM-DD').unix());

                        if (days.hasOwnProperty(time)) {
                            var d = days[time];
                            d.total += total;
                            d.to_investigate += to_inv;
                            d.investigated += inv;
                        }
                        else {
                            days[time] = {
                                total: total,
                                to_investigate: to_inv,
                                investigated: inv
                            };
                        }
                    }, this);
                    var minDate = _.min(dates),
                        maxDate = _.max(dates),
                        currentDate = Moment.unix(minDate).format('YYYY-MM-DD');

                    while (Moment(currentDate, 'YYYY-MM-DD').unix() < maxDate) {
                        currentDate = Moment(currentDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');
                        if (!days.hasOwnProperty(currentDate)) {
                            days[currentDate] = {total: 0, to_investigate: 0, investigated: 0};
                        }
                    }
                    _.each(days, function (val, key) {
                        var total = val.total,
                            inv = val.investigated,
                            to_inv = val.to_investigate,
                            values = {
                                investigated: total ? Math.round((inv / total * 100) * 100) / 100 : 0,
                                to_investigate: total ? Math.round((to_inv / total * 100) * 100) / 100 : 0
                            };
                        content[key] = [{values: values}];
                    }, this);
                }
            }
            return content;
        },

        getLaunchesDurationChartData: function (data) {
            var content = {result: []},
                launches = data.content.reverse();

            _.each(launches, function (launch) {
                var launchInfo = this.getLaunchInfo(launch);
                launchInfo.values = {
                    status: launch.status,
                    start_time: launch.start_time,
                    end_time: launch.end_time,
                    duration: launch.end_time - launch.start_time
                };
                content.result.push(launchInfo);
            }, this);
            return content;
        },

        getLaunchesComparisonChartData: function (data, model) {
            var content = {},
                launches = data.content,
                criteries = _.map(this.getCriteria(model), function (k) {
                    var cArr = k.split('$');
                    return cArr[2];
                });

            if (!_.isEmpty(launches)) {
                content.result = [];
                _.each(launches, function (launch) {
                    var launchInfo = this.getLaunchInfo(launch),
                        stats = {};
                    _.each(launch.statistics, function (val, key) {
                        var total = _.reduce(val, function (memo, v, k) {
                            var val = this.calcValue(v);
                            return (k !== 'total' && _.contains(criteries, k)) ? memo + val : memo;
                        }, 0, this);

                        _.each(val, function (v, k) {
                            if (k !== 'total' && _.contains(criteries, k)) {
                                var val = this.calcValue(v),
                                    s = total ? Math.round((val / total * 100) * 100) / 100 : 0;
                                stats[this.fixCriteria(key, k)] = s;
                            }
                        }, this);
                        launchInfo.values = stats;

                    }, this);

                    content.result.push(launchInfo);
                }, this);
            }
            return content;
        },

        getNotPassedChartData: function (data) {
            var content = {},
                launches = data.content.reverse();

            if (!_.isEmpty(launches)) {
                content.result = [];
                _.each(launches, function (launch) {
                    var launchInfo = this.getLaunchInfo(launch),
                        stats = launch.statistics,
                        exec = stats.executions,
                        total = parseInt(exec.total),
                        fail = parseInt(exec.failed),
                        skip = parseInt(exec.skipped),
                        val = total ? Math.round((((fail + skip) / total) * 100) * 100) / 100 : 0;
                    launchInfo.values = {'% (Failed+Skipped)/Total': val};
                    content.result.push(launchInfo);
                }, this);
            }
            return content;
        },

        getBugsTrendChartData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                criteria = this.getCriteria(model),
                prev = 0;

            if (!_.isEmpty(launches)) {
                content.result = [];
                _.each(launches, function (launch) {
                    var launchInfo = this.getLaunchInfo(launch),
                        stats = launch.statistics,
                        defects = stats.defects,
                        values = {},
                        total = 0;

                    _.each(criteria, function (c) {
                        var arr = c.split('$'),
                            def = arr[2],
                            val = defects[def],
                            calc = this.calcValue(val);
                        total += calc;
                        values[this.fixCriteria(c)] = calc;
                    }, this);

                    values.issuesCount = total;
                    values.delta = total - prev;
                    launchInfo.values = values;
                    prev = total;
                    content.result.push(launchInfo);
                }, this);
            }
            return content;
        },

        getCasesTrendChartData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                isTimelineMode = model.get('mode') && model.get('mode') == 'timeline',
                criteria = 'total',
                getTotal = function (launch) {
                    var stats = launch.statistics,
                        exec = stats.executions,
                        total = parseInt(exec.total);
                    return total;
                };

            if (!_.isEmpty(launches)) {
                if (!isTimelineMode) {
                    var prev = 0;
                    content.result = [];
                    _.each(launches, function (launch, i) {
                        var launchInfo = this.getLaunchInfo(launch),
                            total = getTotal(launch),
                            addValue = (i == 0) ? 0 : total - prev;

                        prev = total;
                        launchInfo.values = {};
                        launchInfo.values[this.fixCriteria('executions', criteria)] = total;
                        launchInfo.values.delta = addValue;
                        content.result.push(launchInfo);
                    }, this);

                }
                else {
                    var dates = [],
                        days = {};
                    _.each(launches, function (launch) {
                        var time = Moment(launch.start_time).format('YYYY-MM-DD'),
                            total = getTotal(launch),
                            val = {total: total, time: Moment(time, 'YYYY-MM-DD').unix()};

                        if (days.hasOwnProperty(time)) {
                            var item = days[time],
                                t = item.total;
                            if (total > t) {
                                days[time] = val;
                            }
                        }
                        else {
                            days[time] = val;
                            dates.push(Moment(time, 'YYYY-MM-DD').unix());
                        }
                    }, this);

                    var minDate = _.min(dates),
                        maxDate = _.max(dates),
                        currentDate = Moment.unix(minDate).format('YYYY-MM-DD');
                    while (Moment(currentDate, 'YYYY-MM-DD').unix() < maxDate) {
                        currentDate = Moment(currentDate, 'YYYY-MM-DD').add(1, 'd').format('YYYY-MM-DD');
                        if (!days.hasOwnProperty(currentDate)) {
                            days[currentDate] = {total: 0, time: Moment(currentDate, 'YYYY-MM-DD').unix()};
                        }
                    }
                    var values = _.values(days),
                        prev = 0;
                    values.sort(function (a, b) {
                        return a.time - b.time;
                    });

                    _.each(values, function (item, i) {
                        var time = Moment.unix(item.time).format('YYYY-MM-DD'),
                            total = item.total,
                            addVal = (i == 0) ? 0 : total - prev,
                            values = {};
                        values[this.fixCriteria('executions', criteria)] = total;
                        values.delta = addVal;
                        content[time] = [{values: values}];
                        prev = total;
                    }, this);
                }
            }
            return content;
        },

        getCombinePieChartData: function (data, model) {
            var content = {},
                launches = data.content.reverse(),
                launch = _.last(launches),
                criteries = this.getCriteria(model);
            if (launch) {
                var launchInfo = this.getLaunchInfo(launch);
                content.result = [];
                launchInfo.values = {};
                _.each(criteries.reverse(), function (c) {
                    var cArr = c.split('$'),
                        type = cArr[1],
                        defect = _.last(cArr),
                        val = (launch.statistics && launch.statistics[type]) ? type === 'defects' ? launch.statistics[type][cArr[2]][defect]  : launch.statistics[type][defect] : 0,
                        calc = this.calcValue(val || 0);
                    launchInfo.values[this.fixCriteria(type, defect, cArr[2])] = calc;
                }, this);

                content.result.push(launchInfo);
            }
            return content;
        }

    };

    return {
        WidgetWizard: WidgetWizard
    };
});
