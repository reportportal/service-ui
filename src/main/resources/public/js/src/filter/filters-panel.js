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
    var Filters = require('filters');
    var FilterResolver = require('filtersResolver');
    var Service = require('filtersService');
    var Components = require('components');
    var Storage = require('storageService');
    var App = require('app');
    var CoreService = require('coreService');

        var config = App.getInstance();

        var FilterPanel = Components.RemovableView.extend({

            initialize: function (options) {

                this.$el = options.element;
                this.navigationInfo = options.navigationInfo;

                this.currentGridType = this.navigationInfo.getLevelGridType();
                this.currentTab = this.navigationInfo.getCurrentStepTab();
                this.currentGridFilters = null;

                this.defaultTabId = "allCases";
                this.tabsData = {};
                this.copyInProcess = false;
                this.tabs = {};
                this.tabFilters = {};

                // async
                this.readyTabState = this.setupCurrentTabState();

                this.listenTo(this.navigationInfo, "apply::tag::filter", this.applyTag);
                this.listenTo(this.navigationInfo, "navigation::state::change", this.updateTabsNavigation);
            },

            updateTabsNavigation: function (data) {
                if (data && this.tabs[this.currentTab.id]) {
                    if(!this.navigationInfo.isDebug() && this.checkTabUrl(data) && !( (this.activeTab.hasClass('cloned') || this.activeTab.hasClass('navigated')) && data.tabSwitched)){
                        data.state = true;
                    }
                    this.tabs[this.currentTab.id].requestParams.set(data.params.attributes);
                    // TODO don't understand
                    if (~window.location.hash.indexOf('?')){
                        this.tabs[this.currentTab.id].stateUrl = window.location.hash;
                    }

                    if (this.checkIfValidForUnsaved(data)) {
                        this.markAsUnsaved();
                    }
                }
                this.navigationInfo.trigger("toggle::widget::wizard", this.checkIfValidToOpenWidgetWizard());
            },

            checkTabUrl: function(data){
                var url = data.params.toURLSting(),
                    tabUrl = this.tabs[this.currentTab.id].requestParams.toURLSting(),
                    removePageFromUrl = function(u){
                        var removed = _.reject(url.split('&'), function(s){ return s.indexOf('page.page=')>=0; });
                        return removed.join('&');
                    };
                return removePageFromUrl(url) !== removePageFromUrl(tabUrl);
            },

            checkIfValidForUnsaved: function (data) {
                return data.state && this.currentTab.id !== this.defaultTabId && this.navigationInfo.isLaunches();
            },

            setupCurrentTabState: function () {
                // this.currentGridFilters = null;
                var self = this;
                return FilterResolver.getDefaults(this.currentGridType, this.validateForDebugOwnersState())
                    .done(function(currentGridFilters) {
                        self.currentGridFilters = currentGridFilters;
                        if (self.currentTab.requestParams) {
                            self.applyState(self.currentTab.requestParams.getFilters());
                        }
                    })
            },

            validateForDebugOwnersState: function () {
                var result = "";
                if (this.navigationInfo.isDebug() && this.navigationInfo.isLaunches()) {
                    var debugUser = Storage.getDebugUser(),
                        owner = (debugUser) ? debugUser : config.userModel.get('name');
                    result = owner;
                }
                return result;
            },

            validateForDebugOwnersStateChange: function (filter) {
                if (this.navigationInfo.isDebug() && this.checkIfOwnerFilter(filter)) {
                    var debugUser = (filter.value) ? filter.value.replaceAll(' ', '') : '';
                    Util.updateDebugHref(debugUser);
                    Storage.setDebugUser(debugUser);
                }
            },

            loadFilters: function () {
                var ids = config.preferences.filters,
                    self = this,
                    applyTabs = function (tabs) {
                        if (self.navigationInfo) {
                            self.tabs[self.defaultTabId] = self.navigationInfo.getDefaultTab();
                        }
                        if (tabs) {
                            _.merge(self.tabs, tabs);
                        }
                        self.currentTab = self.verifyActiveTab(self.tabs, self.currentTab);
                        self.renderTabs();
                    },
                    setupFilters = function (data) {
                        var tabs = _.indexBy(data, 'id');
                        this.validateForMissingFilters(tabs);
                        applyTabs(tabs);
                    };

                if (ids && ids.length) {
                    Service.getFilters(ids)
                        .done(setupFilters.bind(this))
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, "loadFilters");
                        });
                } else {
                    applyTabs();
                }
            },

            validateForMissingFilters: function (data) {
                var keys = _.keys(data);
                if (keys.length !== config.preferences.filters.length) {
                    config.preferences.filters = keys;
                    Service.updateTabsPreferences({filters: keys});
                }
            },

            renderTabs: function () {
                this.currentTab = this.currentTab || {};

                this.tabsHolder.html(Util.templates(this.tabMenuTpl, {
                    id: this.currentTab.id,
                    user: config.userModel.get('name'),
                    util: Util,
                    tabs: this.tabs
                }));
                this.addTab = $(".add-new:first", this.tabsHolder);
                this.activeTab = $("[data-id=" + this.currentTab.id + "]", this.tabsHolder);
                this.validateForHistory();
                if (this.navigationInfo) {
                    this.navigationInfo.trigger("toggle::widget::wizard", this.checkIfValidToOpenWidgetWizard());
                }

                var data = {params: this.navigationInfo.requestParameters};
                this.updateTabsNavigation(data);
            },

            openItemMenu: function (e) {
                $(e.currentTarget)
                    .find('.filter-manager:first')
                    .replaceWith(Util.templates(this.tabOptionsTpl, this.getActionData()));
            },

            renderItemMenu: function (e) {
                $(e.currentTarget)
                    .after(Util.templates(this.tabOptionsTpl, this.getActionData()))
                    .dropdown();
            },

            getActionData: function () {
                var data = {
                        edit: false,
                        save: false,
                        saveAll: false,
                        clone: false,
                        discard: false,
                        close: false
                    },
                    id = this.currentTab.id,
                    dirty = this.activeTab.hasClass('unsaved'),
                    inDefaultState = this.checkIfFiltersInDefaultState(id),
                    allCases = this.checkIfAllCasesTab();
                if (allCases && inDefaultState) return data;
                if (!this.navigationInfo.isLaunches()) {
                    data.discard = !inDefaultState;
                    data.close = !allCases;
                    return data;
                }
                if (allCases && !inDefaultState) {
                    data.clone = true;
                    data.discard = true;
                } else {
                    if (this.checkIfOwnFilter(id)) {
                        data.edit = true;
                        data.save = dirty && !inDefaultState;
                    }
                    if (!inDefaultState || (inDefaultState && !this.checkIfTempId(id))) {
                        data.discard = dirty;
                    }
                    data.saveAll = this.checkIfMoreThenOneOwnFilterIsUnsaved();
                    data.clone = true;
                    data.close = true;
                }
                return data;
            },

            verifyActiveTab: function (tabs, currentTab) {
                currentTab = currentTab || {};
                tabs = tabs || [];

                var current = tabs[currentTab.id];
                if (!current && this.navigationInfo) {
                    current = this.navigationInfo.changeCurrentStepId(this.defaultTabId);
                }
                return current;
            },

            update: function () {
                this.currentTab = this.navigationInfo.getCurrentStepTab();
                // this.currentTab = this.tabs[this.navigationInfo.requestParameters.getTab()]

                var incomingType = this.navigationInfo.getLevelGridType();
                if (this.currentGridType !== incomingType) {
                    this.currentGridType = incomingType;
                }
                this.setupCurrentTabState();

                this.renderState();
                if (!this.navigationInfo.isDebug()) {
                    this.setupActiveByCurrentTabId();
                    this.validateForHistory();
                }
            },

            setupActiveByCurrentTabId: function () {
                if (this.currentTab.id !== this.activeTab.data('id')) {
                    this.activeTab.removeClass('active');
                    this.activeTab = $('[data-id=' + this.currentTab.id + ']:first', this.tabsHolder);
                    if (!this.activeTab.length) {
                        this.activeTab = $('[data-id=' + this.defaultTabId + ']:first', this.tabsHolder);
                    }
                    this.activeTab.addClass('active');
                }
            },

            getCurrentFilter: function () {
                return this.checkIfAllCasesTab() ? '' : this.tabs[this.currentTab.id];
            },

            shellTpl: 'tpl-filters-panel',
            tabTpl: 'tpl-filters-tab-options',
            tabNewOptionTpl: 'tpl-filters-tab-new-option',
            tabOptionsTpl: 'tpl-filters-tab-options',
            tabCriteriaTpl: 'tpl-filters-tab-criteria',
            tabMenuTpl: 'tpl-filters-tab-menu',
            tabEditTpl: 'tpl-filters-tab-editor',

            events: {
                'click .criteria-option': 'select',
                'click .tab:not(.active)': 'handleTab',
                'click .tab-controls .action': 'makeActionWithTab',
                'click .tab-controls': 'renderItemMenu',
                'show.bs.dropdown .tab': 'openItemMenu',
                'click .edit-tab:not(.disabled)': 'openTabEditor',
                'click .save-tab:not(.disabled)': 'saveSingle',
                'click .save-all-tab:not(.disabled)': 'saveAll',
                'click .discard-tab:not(.disabled)': 'discardTabChanges',
                'click .clone-tab:not(.disabled)': 'cloneTab',
                'click .close-tab:not(.disabled)': 'closeTab'
            },

            cloneTab: function () {
                this.copyInProcess = true;
                if (!this.activeTab.hasClass('unsaved')) {
                    this.activeTab.addClass('cloned');
                } else {
                    this.activeTab.removeClass('cloned');
                }

                this.openTabEditor();
            },

            addNewTab: function (data) {
                var tmp_id = _.uniqueId('tmp_'),
                    newTab = {};
                newTab[tmp_id] = {name: data.name, isShared: data.shared, id: tmp_id, owner: config.userModel.get('name')};

                this.addTab.before(Util.templates(this.tabNewOptionTpl, newTab[tmp_id]));

                this.activeTab.removeClass('active');
                this.activeTab = $("[data-id=" + tmp_id + "]", this.tabsHolder);

                this.fillFiltersAndUpdateCurrentTab(newTab[tmp_id]);

                this.renderState();
                this.activeTab.addClass('active').addClass('unsaved');
                $('#addWidget').addClass('disabled');
            },

            updateTab: function (data) {
                // $(".material-icons", this.activeTab).remove();
                $(".material-icons", this.activeTab).closest('.share-icon-wrapper').remove();
                if (data.shared) {
                    this.checkIfOwnFilter(this.currentTab.id) && this.activeTab.append(Util.getLocalSharedIcon());
                }
                $(".name-text", this.activeTab).text(data.name);
                this.tabs[this.currentTab.id].name = data.name;
                this.tabs[this.currentTab.id].isShared = data.shared;
            },

            fillFiltersAndUpdateCurrentTab: function (newTab) {
                if (this.copyInProcess) {

                    this.tabs[newTab.id] = _.cloneDeep(this.tabs[this.currentTab.id]);
                    var copy = this.tabs[newTab.id];

                    var requestParams = this.navigationInfo.getTempTab(newTab).requestParams;
                    requestParams.set(this.navigationInfo.requestParameters.attributes);
                    requestParams.setTab(newTab.id);
                    copy.requestParams = requestParams;

                    copy.isShared = newTab.isShared;
                    copy.owner = newTab.owner;
                    copy.id = newTab.id;
                    copy.url = this.navigationInfo.getUrlForRequestParams(requestParams);
                    copy.stateUrl = "";
                    copy.name = newTab.name;
                    copy['type'] = 'launch';

                    this.copyInProcess = false;
                    this.updateHrefs(this.currentTab.id, newTab.id);

                    // setup and render default filters
                    this.currentTab = this.tabs[newTab.id];
                    this.setupCurrentTabState();
                } else {
                    this.tabs[newTab.id] = this.navigationInfo.getTempTab(newTab);
                    this.openTabById(newTab.id);
                }
            },

            handleTab: function (e) {
                var self = this,
                    $tab = $(e.currentTarget);

                if ($tab.hasClass('add-new')) {
                    this.openTabEditor();
                } else {
                    this.activeTab.removeClass('active');
                    this.activeTab = $tab;
                    this.activeTab.addClass('active');
                    var id = $tab.attr('data-id'),
                        activeTabUrl = self.tabs[id].url;
                    config.preferences.active = activeTabUrl;
                    Service.updateTabsPreferences({filters: config.preferences.filters, active: activeTabUrl});
                    Util.updateLaunchesHref(activeTabUrl);
                    self.openTabById(id);
                }
            },

            openTabEditor: function (e) {
                var _this = this,
                    tab = {};

                if (e) tab = this.tabs[this.currentTab.id];
                if (this.copyInProcess) tab = {name: this.getNameUnderCopy()};

                this.modal = null;
                this.modal = new Components.DialogWithCallBack({
                    headerTxt: tab.id ? 'editFilter' : 'addFilter',
                    actionTxt: tab.id ? 'update' : 'add',
                    actionStatus: true,
                    contentTpl: this.tabEditTpl,
                    data: tab,
                    callback: function (done) {
                        var name = $("#tabName", this.modal.$content);
                        name.val(name.val().trim()).trigger('validate');

                        if (!name.data('valid')) {
                            return;
                        }

                        var data = {name: name.val(), shared: $("#tabShared", this.modal.$content).prop('checked')};
                        if (this.modal.data.id) {
                            if (this.modal.data.name !== data.name || this.modal.data.isShared !== data.shared) {
                                this.updateTab(data);
                                this.markAsUnsaved();
                            }
                        } else {
                            this.addNewTab(data);
                        }
                        done();
                    }.bind(this),
                    afterRenderCallback: function () {
                        Util.switcheryInitialize(this.$content);
                    },
                    destroyCallback: function () {
                        this.copyInProcess = false;
                    }.bind(this),
                    shownCallback: function () {
                        var nameSize = config.forms.filterName;
                        Util.bootValidator($("#tabName", this.modal.$content), [
                            {validator: 'minMaxRequired', type: 'filterName', min: nameSize[0], max: nameSize[1]},
                            {validator: 'noDuplications', type: 'filterName', source: this.getUsedNames(tab)}
                        ]);
                        $("#tabName", this.modal.$content).focus();
                    }.bind(this)
                }).render();
            },

            getUsedNames: function (editFilter) {
                editFilter = editFilter || {};
                var result = [],
                    self = this;
                CoreService.getOwnFilters()
                    .done(function (data) {
                        _.forEach(self.tabs, function (filter) {
                            if (filter.id !== editFilter.id && self.checkIfOwnFilter(filter.id)) {
                                result.push(filter.name.toLowerCase());
                            }
                        });
                        _.forEach(data, function (filter) {
                            if (filter.id !== editFilter.id) {
                                result.push(filter.name.toLowerCase());
                            }
                        });
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'getUsedNames');
                    });
                return result;
            },

            getNameUnderCopy: function () {
                var copied_name = Util.getCopyName(this.tabs[this.currentTab.id].name),
                    increment = 0,
                    that = this;
                _.forEach(this.tabs, function (filter) {
                    if (that.checkIfAnyOtherFilterStartsWithCopiedName(filter, copied_name)) {
                        increment += 1;
                    }
                }, 0);
                if (increment) {
                    copied_name += " " + increment;
                }
                return copied_name;
            },

            openTabById: function (id) {
                var self = this;
                // self.navigationInfo.followTabUrl(self.tabs[id].stateUrl || self.tabs[id].url);
                _.delay(function() {
                    self.navigationInfo.followTabUrl(self.tabs[id].stateUrl || self.tabs[id].url);
                }, 50);
            },

            reFetchTab: function (id) {
                var self = this;
                Service.getFilters([id]).then(
                    function (result) {
                        var tab = result[0];
                        this.tabs[tab.id].requestParams = tab.requestParams;
                        this.tabs[tab.id].stateUrl = "";
                        this.tabs[tab.id].url = tab.url;

                        this.updateTab({name: tab.name, shared: tab.isShared});
                        this.openTabById(tab.id);
                    }.bind(this),
                    function () {
                        this.removeTabByIdAndSetAllCasesActive(id);
                    }.bind(this)
                );
            },

            markAsUnsaved: function () {
                this.activeTab.addClass('unsaved');
            },

            discardTabChanges: function () {
                var id = this.currentTab.id;

                if (this.checkIfValidForDefaultValuesDiscard(id)) {
                    this.currentTab = this.navigationInfo.getDefaultTab();
                    this.setupCurrentTabState(true);

                    if (this.currentTab.id !== id) {
                        this.currentTab.id = id;
                        this.currentTab.requestParams.setTab(id);
                    }

                    this.renderState();
                    this.navigationInfo.applyFilters(this.getFilters(), this.currentTab.id);
                } else {
                    this.reFetchTab(id);
                }
                if (this.checkIfValidToRemoveUnsavedSign(id)) {
                    this.activeTab.removeClass('unsaved');
                }
            },

            saveSingle: function () {
                this.saveTabs(this.currentTab.id);
            },

            saveAll: function () {
                this.saveTabs();
            },

            saveTabs: function (id) {
                var self = this,
                    ids = [],
                    filtersToSave = [],
                    filtersToUpdate = [],
                    restorationMap = [],
                    ajaxCalls = [],
                    clearUnsavedState = function (ids) {
                        _.forEach(ids, function (id) {
                            $("[data-id=" + id + "]", self.tabsHolder).removeClass("unsaved");
                        });
                    };

                // collect data
                if (id) {
                    //single save initiated
                    ids.push(id);
                } else {
                    // save all initiated - collect unsaved items
                    _.forEach($(".unsaved", self.tabsHolder), function (tab) {
                        var id = $(tab).data('id');
                        if (self.checkIfOwnFilter(id) && !self.checkIfFiltersInDefaultState(id)) {
                            ids.push(id);
                        }
                    });
                }

                _.forEach(ids, function (id) {
                    if (self.checkIfTempId(id)) {
                        if (self.tabs[id]) {
                            filtersToSave.push(self.tabs[id]);
                            restorationMap.push(id);
                        }
                    } else {
                        self.tabs[id].url = self.navigationInfo.getUrlForRequestParams(self.tabs[id].requestParams);
                        filtersToUpdate.push(self.tabs[id]);
                    }
                });

                // push it to the server
                if (filtersToSave.length) {
                    ajaxCalls.push(Service.saveFilters(filtersToSave).then(
                        function (result) {

                            _.forEach(restorationMap, function (id, index) {
                                var currentTab = $("[data-id=" + id + "]", self.tabsHolder);

                                var newId = result[index].id;
                                currentTab.attr('data-id', newId);
                                $(currentTab).data('id', newId);
                                // this will save us from extra iterations afterwords
                                currentTab.removeClass('unsaved');

                                var butt = $('.add-widget-btn');
                                butt.attr('title', butt.data('title'));

                                var filterBackup = self.tabs[id],
                                    tabsDataBackup = self.tabsData[id];

                                delete self.tabs[id];
                                delete self.tabsData[id];

                                self.tabs[newId] = filterBackup;
                                var copy = self.tabs[newId];
                                copy.id = newId;
                                copy.requestParams.setTab(newId);
                                copy.url = self.navigationInfo.getUrlForRequestParams(copy.requestParams);
                                copy.stateUrl = "";

                                self.tabsData[newId] = tabsDataBackup;

                                if (currentTab.hasClass('active')) {
                                    self.currentTab = self.tabs[newId];
                                    self.updateHrefs(id, newId);
                                }
                            });
                        },

                        function (error) {
                            if(error.responseText) {
                                if (error.responseText.indexOf(40031)) {
                                    Util.ajaxFailMessenger(error);
                                } else if (error.responseText.indexOf(4001)) {
                                    Util.ajaxFailMessenger('', "savedLaunchFilterQuantity");
                                } else {
                                    Util.ajaxFailMessenger(error, "savedLaunchFilter");
                                }
                            }
                        }
                    ));
                }
                if (filtersToUpdate.length) {
                    ajaxCalls.push(Service.updateFilters(filtersToUpdate).then(
                        function (result) {
                            clearUnsavedState(_.map(filtersToUpdate, function (f) {
                                return f.id;
                            }));
                        },
                        function (error) {
                            if(error.responseText){
                                if (error.responseText.indexOf(40031)) {
                                    Util.ajaxFailMessenger(error);
                                } else if (error.responseText.indexOf(4001)) {
                                    Util.ajaxFailMessenger('', "savedLaunchFilterQuantity");
                                }  {
                                    Util.ajaxFailMessenger(error, "savedLaunchFilter");
                                }
                            }
                        }
                    ));
                }
                var amount = ids.length > 1 ? 's' : '';
                $.when.apply($, ajaxCalls).done(function () {
                    config.trackingDispatcher.tabSaved(ids.length || 1);
                    // save tabs order to preferences
                    self.updatePreferences();
                    Util.ajaxSuccessMessenger("savedLaunchFilter" + amount);
                    self.navigationInfo.trigger("toggle::widget::wizard", self.checkIfValidToOpenWidgetWizard());
                });
            },

            updateHrefs: function (was, is) {
                this.navigationInfo.replaceTempId(was, is);
                _.each($("#gridWrapper a"), function (link) {
                    var $l = $(link);
                    if ($l.attr('href')) {
                        $l.attr('href', $l.attr('href').replaceAll(was, is));
                    }
                });
            },

            checkIfOwnFilter: function (id) {
                return this.tabs[id].owner === config.userModel.get('name');
            },

            checkIfTempId: function (id) {
                return id.indexOf('tmp_') === 0;
            },

            checkIfAllCasesTab: function () {
                return this.currentTab.id === this.defaultTabId;
            },

            checkIfOwnerFilter: function (filter) {
                return filter && filter.id === "user";
            },

            checkIfFiltersInDefaultState: function (id) {
                //return !this.tabs[id].requestParams || !this.tabs[id].requestParams.hasFiltersWithValue()
                return !this.tabs[id].requestParams.hasFiltersWithValue() && this.tabs[id].requestParams.toURLSting() === this.navigationInfo.requestParameters.toURLSting();
            },

            checkIfValidForDefaultValuesDiscard: function (id) {
                return this.checkIfTempId(id) || this.checkIfAllCasesTab() || !this.navigationInfo.isLaunches();
            },

            checkIfMoreThenOneOwnFilterIsUnsaved: function () {
                var unsaved = 0,
                    self = this;
                _.forEach($(".unsaved", self.tabsHolder), function (tab) {
                    var id = $(tab).attr('data-id');
                    if (self.checkIfOwnFilter(id) && !self.checkIfFiltersInDefaultState(id)) {
                        unsaved += 1
                    }
                });
                return unsaved > 1;
            },

            checkIfIdValidToUpdateActiveTab: function (id) {
                return !this.checkIfTempId(id) && id !== this.defaultTabId && this.tabs[id];
            },

            checkIfValidToRemoveUnsavedSign: function (id) {
                return !this.checkIfTempId(id) && this.navigationInfo.isLaunches();
            },

            checkIfValidToOpenWidgetWizard: function () {
                var result = {
                    show: false,
                    enable: false
                };
                if (this.navigationInfo.isLaunches() && !this.navigationInfo.isDebug()) {
                    result.show = true;
                    if (this.checkIfAllCasesTab()) {
                        result.enable = true;
                    } else {
                        result.enable = !this.checkIfTempId(this.currentTab.id) &&  (this.activeTab && !this.activeTab.hasClass('unsaved'));
                    }
                }
                return result;
            },

            checkIfAnyOtherFilterStartsWithCopiedName: function (filter, copiedName) {
                return filter.id !== this.currentTab.id && filter.name.indexOf(copiedName) === 0;
            },

            updatePreferences: function () {
                var order = [],
                    self = this;
                _.each($(".tab", this.tabsHolder), function (el) {
                    var id = $(el).attr('data-id');
                    if (id && id !== self.defaultTabId && !self.checkIfTempId(id)) {
                        order.push(id);
                    }
                });
                var activeTab = self.getActiveTabUrl();
                config.preferences.filters = order;
                config.preferences.active = activeTab;
                Util.updateLaunchesHref(activeTab);
                Service.updateTabsPreferences({filters: order, active: activeTab});
            },

            getActiveTabUrl: function () {
                var active = "",
                    currentId = this.currentTab.id;
                if (this.checkIfIdValidToUpdateActiveTab(currentId)) {
                    active = this.tabs[currentId].url;
                }
                return active;
            },

            closeTab: function () {
                var self = this,
                    id = this.currentTab.id;
                if (self.checkIfTempId(id)) {
                    self.removeTabByIdAndSetAllCasesActive(id);
                } else {
                    var index = _.indexOf(config.preferences.filters, id);
                    if (index !== -1) {
                        config.preferences.filters.splice(index, 1);
                        Service.updateTabsPreferences({
                            filters: config.preferences.filters,
                            active: ""
                        }).done(function () {
                            self.removeTabByIdAndSetAllCasesActive(id);
                        }).fail(function (error) {
                            //console.log(error);
                        });
                    }
                }
            },

            removeTabByIdAndSetAllCasesActive: function (id) {
                delete this.tabs[id];
                delete this.tabsData[id];
                this.activeTab.remove();

                this.openTabById(this.defaultTabId);
                Util.clearLaunchesActiveFilter();
            },

            select: function (ev) {
                var $el = $(ev.currentTarget),
                    filter = this.currentGridFilters.get($el.data('id'));
                if ($el.is(':checked')) {
                    this._appendFilter(filter);
                } else {
                    this.onFilterRemove(filter.get('id'));
                }
            },

            _appendFilter: function (filter, type) {
                var el = $("<div class='filter-wrapper' />");
                this.criteriaBlock.before(el);
                this.renderFilter(el, filter, type);
            },

            applyTag: function (tag, tagType) {
                var id = tagType || "tags",
                    tag = tag.toString();
                if (this.tabFilters[id]) {
                    var item = this.tabFilters[id],
                        originalValue = item.model.get('value');
                    // todo: think how to transfer this check inside the filter
                    // make sure selected tag is not in the values already
                    if (_.indexOf(originalValue.split(','), tag) === -1) {
                        var newValue = originalValue ? originalValue + "," + tag : tag;
                        item.model.set('value', newValue);
                        item.off();
                        item.$el.empty();
                        this.renderFilter(item.$el, item.model);
                    }
                } else {
                    // add filter
                    var filter = this.currentGridFilters.get(id);
                    this.criteriaHolder.find('[data-id="' + id + '"]:first').prop('checked', true);
                    if (filter) {
                        filter.set('value', tag);
                        this._appendFilter(filter);
                    }
                }
                this.navigationInfo.applyFilters(this.getFilters(), this.currentTab.id);
                config.trackingDispatcher.filterTagClick(tag);
            },

            onFilterChange: function (immediately) {
                if (this.task) {
                    clearTimeout(this.task);
                }
                if (immediately) {
                    this.navigationInfo.applyFilters(this.getFilters(), this.currentTab.id);
                    delete this.task;
                } else {
                    this.task = setTimeout(function () {
                        this.navigationInfo.applyFilters(this.getFilters(), this.currentTab.id);
                        delete this.task;
                    }.bind(this), config.userInputDelay);
                }
            },

            validateForHistory: function () {
                if (this.navigationInfo) {
                    var action = this.navigationInfo.isHistory() ? 'add' : 'remove';
                    this.activeTab[action + 'Class']('history');
                }
            },

            onFilterRemove: function (id) {

                this.validateForDebugOwnersStateChange({id: id});

                var visualId = id.replace('.lte.', '.gte.');
                this.criteriaHolder.find('[data-id="' + visualId + '"]').prop('checked', false);

                var currentFilters = this.tabFilters;
                currentFilters[visualId].destroy();
                delete currentFilters[visualId];
                this.currentGridFilters.get(id).set('value', '');

                // reflect new filter state in the url
                this.navigationInfo.applyFilters(this.getFilters(), this.currentTab.id);
            },

            getFilters: function () {
                var filters = [],
                    self = this;
                _.forEach(this.tabFilters, function (value, key) {
                    var filter = value.getFilter();
                    self.validateForDebugOwnersStateChange({id: key, value: (filter) ? filter.value : ''});
                    if (!_.isEmpty(filter)) {
                        filters.push(filter);
                    }
                });

                return filters;
            },

            renderFilter: function (el, model, type) {
                model.set('gridType', this.navigationInfo.getLevelGridType());
                this.validateForTagsInsideLaunch(model);
                var view = _.isFunction(model.viewCreator)
                    ? model.viewCreator({el: el, model: model, panel: this, noFocus: type || 'nofocus'})
                    : new Filters.View({el: el, model: model, panel: this});
                this.tabFilters[model.get('id')] = view;

                // here we flip filter id to avoid directions collision and try to activate both states, keeping in mind that only one is available at a time
                if (model.id === 'tags' || model.id === 'user' || model.id === 'issue$issue_type' || model.id === 'type' || model.id === 'status') {
                    el.addClass('fluid-filter');
                }

                view.render();
                view.on('filterApply', this.onFilterChange, this);
                view.on('filterRemove', this.onFilterRemove, this);
            },

            applyState: function (filters) {
                var invalidFilters = [];
                _.forEach(filters, function (applied) {
                    var id, cnd;
                    if (applied.id !== 'history_depth' && applied.id !== 'ids') {
                        var params = applied.id.split('.');
                        id = params[2];
                        cnd = params[1];
                    } else {
                        id = applied.id;
                    }
                    var filter = this.currentGridFilters.get(id);
                    if (filter) {
                        filter.set({
                            visible: true,
                            value: applied.value,
                            id: id,
                            condition: cnd
                        });
                    } else if(~id.indexOf('statistics$defects')) {
                        // add invalid defect type filter
                        invalidFilters.push(new Filters.InvalidModel({
                            hideCriteria: true,
                            visible: true,
                            value: applied.value,
                            id: id,
                            condition: cnd
                        }));
                    }
                }, this);
                this.currentGridFilters.add(invalidFilters);
            },

            clearTabFilters: function () {
                _.forEach(this.tabFilters, function (view, key) {
                    _.isFunction(view.destroy) && view.destroy();
                    view = null;
                });
                this.tabFilters = {};
                this.tabsContentHolder.off().empty();
            },

            renderState: function () {
                this.clearTabFilters();
                this.currentGridFilters.forEach(function (model) {
                    if (model.get('required') || model.get('visible')) {
                        var required = model.get('required') ? "required" : "";
                        var el = $("<div class='" + required + " filter-wrapper' />");
                        this.tabsContentHolder.append(el);
                        this.renderFilter(el, model, 'nofocus');
                    }
                }, this);



                this.tabsContentHolder.append(Util.templates(this.tabCriteriaTpl, {
                    criteria: this.currentGridFilters.toJSON(),
                    id: this.currentTab.id
                }));
                this.criteriaBlock = $(".criteria-btn:first", this.tabsContentHolder);
                this.criteriaHolder = $(".filters-criteria:first", this.criteriaBlock);
            },

            validateForTagsInsideLaunch: function (model) {
                if (model.needLaunchId && !this.navigationInfo.isLaunches()) {
                    model.set('launchId', this.navigationInfo.models[1].get('id'));
                }
            },

            render: function () {
                var self = this;
                this.readyTabState.done(function() {
                    self.$el.html(Util.templates(self.shellTpl));
                    self.tabsHolder = $(".rp-filter-tabs:first", self.$el);
                    self.tabsContentHolder = $("#filterInputs", self.$el);
                    self.renderState();

                    if (!self.navigationInfo.isDebug()) {
                        self.loadFilters();
                    } else {
                        self.tabs[self.defaultTabId] = self.navigationInfo.getDefaultTab();
                    }
                });

                return this;
            },

            destroy: function () {
                this.currentGridType = null;
                this.currentTab = null;
                this.clearTabFilters();
                this.currentGridFilters = null;
                this.tabs = null;
                this.navigationInfo = null;
                Components.RemovableView.prototype.destroy.call(this);
            }

        });

        return {
            FilterPanel: FilterPanel
        };
    });
