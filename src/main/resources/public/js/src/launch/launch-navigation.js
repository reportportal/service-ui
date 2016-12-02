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
    var Components = require('components');
    var LaunchGrid = require('launchgrid');
    var Filters = require('filters');
    var Widgets = require('widgets');
    var FiltersPanel = require('filtersPanel');
    var urls = require('dataUrlResolver');
    var App = require('app');
    var Editor = require('launchEditor');
    var Wizard = require('widgetWizard');
    var Service = require('coreService');
    var Storage = require('storageService');
    var Localization = require('localization');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var StickyHeader = require('core/StickyHeader');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Crumbs = require('launchCrumbs');

    require('readmore-js');

    var config = App.getInstance();

    var ContentView = Backbone.View.extend({

        initialize: function (options) {

            this.contextName = options.contextName;
            this.context = options.context;
            this.queryString = options.queryString;

            this.navigationInfo = new NavigationInfo([{name: 'All Runs', id: 'all', grid: "launch"}],
                {
                    prefix: this.contextName
                });

            if (this.queryString) {
                this.navigationInfo.restoreNavigationState('launches/all' + this.queryString);
            }
        },

        render: function () {
            this.$header = new Header({
                header: this.context.getMainView().$header,
                navigationInfo: this.navigationInfo,
                context: this.context,
                project: config.project
            }).render();
            
            //do not call render method on body - since it is async data dependant and will do it after fetch
            this.$body = new Body({
                context: this.context,
                project: config.project,
                navigationInfo: this.navigationInfo
            }).render();
            return this;
        },

        update: function (options) {
            var query = options.queryString;
            this.navigationInfo.updateNavigationState(query);
        },

        destroy: function () {
            this.$header.destroy();
            this.$body.destroy();
            this.navigationInfo.destroy();
            this.navigationInfo = null;
            this.undelegateEvents();
            this.unbind();
            delete this;
        }
    });

    var Header = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.header;
            this.context = options.context;
            this.project = options.project;
            this.navigationInfo = options.navigationInfo;

            this.listenTo(this.navigationInfo, 'navigation::loaded', this.update);
            this.listenTo(this.navigationInfo, 'navigation::compare::hide', this.hideCompare);
            this.listenTo(this.navigationInfo, 'navigation::merge::hide', this.hideMerge);
            this.listenTo(this.navigationInfo, 'log::post::bug', this.updatePostBugBtn);
            this.listenTo(this.navigationInfo, 'grid::data::loaded', this.toggleButtons);
            this.listenTo(this.navigationInfo, 'grid::testitems::loaded', this.toggleTestItemsNav);
            this.listenTo(this.navigationInfo, 'toggle::widget::wizard', this.toggleWidgetWizard);
            this.listenTo(this.navigationInfo, 'refresh::counter', this.updateCounter);
            this.listenTo(this.navigationInfo, 'reset::counter', this.resetCounter);
        },

        filterPanel: null,

        tpl: 'tpl-launches-header',

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.$breadCrumbs = $("#breadCrumbs", this.$el);
            this.crumbsView = new Crumbs.View({
                holder: this.$breadCrumbs,
                navigationInfo: this.navigationInfo
            }).render();
            this.historyButton = $("#historyActivator", this.$el);
            this.filterPanelHolder = $("#filterPanel", this.$el);
            this.compareButton = $("#launchesCompare", this.$el);
            this.mergeButton = $('#mergeLaunches', this.$el);
            this.postBugButton = $("#postBug", this.$el);
            this.loadBugButton = $("#loadBug", this.$el);
            this.widgetWizardButton = $("#addWidget", this.$el);
            this.testItemsNavBtn = $('#testItemsNav', this.$el);
            this.counter = $("#changeCounter", this.$el);
            this.count = 0;
            this.validateForFilters();
            this.validatePostLoadBug();
            return this;
        },

        updateCounter: function (count, showStopped) {
                this.count += count;
                this.counter = $("#changeCounter", this.$el);
                this.counter.text(this.count);
                this.counter.addClass('rp-display-block');
        },

        resetCounter: function () {
            this.count = 0;
            $("#changeCounter", this.$el).removeClass('rp-display-block');
        },

        toggleWidgetWizard: function (data) {
            var action = data.show ? "show" : "hide";
            var state = data.enable ? "remove" : "add";
            var title = data.enable ? '' : this.widgetWizardButton.data('title');
            var btn = this.widgetWizardButton.find('.add-widget-btn');

            this.widgetWizardButton[action]()[state + "Class"]('disabled').attr('title', title);
            if (title) {
                btn.removeAttr('title');
            } else {
                btn.attr('title', btn.data('title'));
            }
        },

        openWidgetWizard: function (e) {
            if ($(e.currentTarget).hasClass('disabled')) {
                return;
            }
            if (this.widgetWizard) {
                this.widgetWizard = null;
            }
            this.widgetWizard = new Wizard.WidgetWizard().render({filter_id: this.filterPanel.getCurrentFilter().id});
        },

        update: function () {
            this.validateForFilters();
            this.crumbsView.updateCrumbs();
            this.validatePostLoadBug();
            this.validateForTestItemsNav();
            this.navigationInfo.isHistory() && this.historyButton.hide();
            this.resetCounter();
        },

        toggleButtons: function (data) {
            if (data.size) {
                this.validateForHistory();
                this.validateMergeCompare();
            } else {
                this.hideButtons();
            }
        },

        hideButtons: function () {
            this.historyButton.hide();
            this.compareButton.hide();
            this.mergeButton.hide();
        },

        validatePostLoadBug: function () {
            var action = !this.navigationInfo.isDebug() && this.navigationInfo.isLog() ? 'show' : 'hide';
            this.postBugButton[action]();
            this.loadBugButton[action]();
        },

        validateForTestItemsNav: function(){
            var action = this.navigationInfo.isLog() ? 'show' : 'hide';
            this.toggleTestItemsNav(action);
        },

        toggleTestItemsNav: function(action){
            this.testItemsNavBtn[action]();
        },

        validateForHistory: function () {
            var action = this.navigationInfo.validForHistory() ? 'show' : 'hide';
            this.historyButton[action]();
        },

        validateMergeCompare: function () {
            var action = !this.navigationInfo.isDebug() && this.navigationInfo.isLaunches() ? 'show' : 'hide';
            this.compareButton[action]();
            this.mergeButton[action]();
        },

        validateForFilters: function () {
            // use to check if any of the parents contains 'log' id, but since it 'log' is always the last level what the reason???
            if (this.navigationInfo.requiresFilters()) {
                if (this.filterPanel) {
                    this.filterPanel.update();
                } else {
                    this.createFilterPanel();
                }
                this.filterPanelHolder.show();
            } else {
                if (this.filterPanel) {
                    this.filterPanelHolder.hide();
                }
            }
        },

        createFilterPanel: function () {
            this.filterPanel = new FiltersPanel.FilterPanel({
                element: this.filterPanelHolder,
                navigationInfo: this.navigationInfo
            }).render();
        },

        events: {
            "click #historyActivator": 'onShowHistory',
            'click #gridRefresh': 'onRefresh',
            'click #postBug:not(.disabled)': 'postBug',
            'click #loadBug:not(.disabled)': 'loadBug',
            'click #launchesCompare:not(.disabled)': 'toggleCompareSelect',
            'click #mergeLaunches:not(.disabled)': 'toggleMerge',
            'click #addWidget': 'openWidgetWizard',
            'click #testItemsNav a': 'navigateToTestItem'
            //'click .breadcrumb-mode': 'toggleBreadcrumbs'
        },

        onRefresh: function (e) {
            e.preventDefault();
            this.navigationInfo.trigger('navigation::reload::table', {scrollTop: $('.fixed_header').hasClass('affix') ? $('body').getNiceScroll(0).newscrolly : 0});
            config.trackingDispatcher.refreshGrid(this.navigationInfo.length);
            this.resetCounter();
        },

        postBug: function () {
            this.navigationInfo.trigger("open::post::bug");
        },

        loadBug: function () {
            this.navigationInfo.trigger("open::load::bug");
        },

        onShowHistory: function (e) {
            e.preventDefault();
            this.historyButton.hide();
            this.navigationInfo.trigger('navigation::show::history');
        },

        toggleCompareSelect: function (e) {
            e.preventDefault();
            if (this.comparePanel) {
                if (this.stickyHeader) { this.stickyHeader.destroy(); }
                this.hideCompare();
                this.navigationInfo.trigger('navigation::compare::hide');
            } else {
                this.showFor(this.compareButton);
                this.createComparePanel();
                this.navigationInfo.trigger('navigation::compare::show', this.comparePanel);
                if (this.stickyHeader) { this.stickyHeader.destroy(); }
                this.stickyHeader = new StickyHeader({fixedBlock: $(".history-panel:first")});
                // Sticker.setupSticker([$(".history-panel:first")], 0);
            }
        },

        navigateToTestItem: function(e) {
            var el = $(e.currentTarget);
            if(el.hasClass('disabled')){
                e.preventDefault();
            }
            var title = el.attr('title');
            if(!title) return;
            if(~title.indexOf('Next')) {
                config.trackingDispatcher.nextPreviousTest('Next');
            }else if(~title.indexOf('Previous')) {
                config.trackingDispatcher.nextPreviousTest('Previous');
            }
        },

        showFor: function (button) {
            $('li.rp-launch-btn', this.$el).addClass("disabled");
            button.removeClass('disabled').addClass('history-shown');
            this.filterPanelHolder.hide();
        },

        hideFor: function (button) {
            if (this.stickyHeader) { this.stickyHeader.destroy(); }
            button.removeClass('history-shown');
            $('li.rp-launch-btn', this.$el).removeClass("disabled");
            this.filterPanelHolder.show();
        },

        hideCompare: function () {
            this.hideFor(this.compareButton);
            if (this.comparePanel) {
                this.comparePanel.destroy();
                this.comparePanel = null;
            }
        },

        createComparePanel: function () {
            this.comparePanel = new ComparePanel({
                container: $('#contentHeader'),
                context: this.context,
                project: config.project,
                navigationInfo: this.navigationInfo
            }).render();
        },

        toggleMerge: function (e) {
            e.preventDefault();
            if (this.mergePanel) {
                if (this.stickyHeader) { this.stickyHeader.destroy(); }
                this.hideMerge();
                this.navigationInfo.trigger('navigation::merge::hide');
            } else {
                // if(this.stickyHeader) { this.stickyHeader.destroy(); }
                // Sticker.clearSticker();
                this.showFor(this.mergeButton);
                this.createMergePanel();
                this.navigationInfo.trigger('navigation::merge::show', this.mergePanel);
                if (this.stickyHeader) { this.stickyHeader.destroy(); }
                this.stickyHeader = new StickyHeader({fixedBlock: $(".history-panel:first")})
                // Sticker.setupSticker([$(".history-panel:first")], 0);
            }
        },

        hideMerge: function () {
            this.hideFor(this.mergeButton);
            if (this.mergePanel) {
                this.mergePanel.destroy();
                this.mergePanel = null;
            }
        },

        updatePostBugBtn: function (options) {
            var postTitle = '',
                loadTitle = '',
                loadAction = '';
            if (options.action === "remove") {
                options.action = Util.canPostToJira() ? 'remove' : 'add';
                loadAction = Util.hasValidBtsSystem() ? 'remove' : 'add';
                postTitle = options.action === 'add' ? this.postBugButton.data('notbs') : this.postBugButton.data('tbs');
                loadTitle = Util.hasValidBtsSystem() ? this.loadBugButton.data('tbs') : this.loadBugButton.data('notbs');
            } else if(options.action === 'isProcessing'){
                options.action = 'add';
                loadAction = 'add';
                postTitle = this.postBugButton.data('isprocessing');
                loadTitle = this.loadBugButton.data('isprocessing');
            } else if (options.action === "noissues") {
                options.action = 'add';
                loadAction = 'add';
                postTitle = this.postBugButton.data('noissues');
                loadTitle = this.loadBugButton.data('noissues');
            }
            this.postBugButton[options.action + "Class"]('disabled').attr('title', postTitle);
            this.loadBugButton[(loadAction || 'add') + "Class"]('disabled').attr('title', loadTitle);
        },

        createMergePanel: function () {
            this.mergePanel = new MergePanel({
                container: $('#contentHeader'),
                context: this.context,
                navigationInfo: this.navigationInfo
            }).render();
        },

        destroy: function () {
            if (this.stickyHeader) { this.stickyHeader.destroy(); }
            if (this.crumbsView) this.crumbsView.destroy();
            if (this.widgetWizard) this.widgetWizard.destroy();
            if (this.filterPanel) this.filterPanel.destroy();

            this.hideMerge();
            this.hideCompare();
            this.navigationInfo = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var Body = Components.BaseView.extend({

        grid: null,

        initialize: function (options) {
            this.$el = options.context.getMainView().$body;
            this.context = options.context;
            this.project = options.project;
            this.navigationInfo = options.navigationInfo;
            this.listenTo(this.navigationInfo, 'navigation::loaded', this.update);
            this.listenTo(this.navigationInfo, 'navigation::reload::table', this.update);
            this.listenTo(this.navigationInfo, 'navigation::show::history', this.showHistory);
            this.listenTo(this.navigationInfo, 'navigation::compare::hide', this.removeGridForCompare);
            this.listenTo(this.navigationInfo, 'navigation::compare::show', this.showGridForCompare);
            this.listenTo(this.navigationInfo, 'navigation::merge::hide', this.removeGridForMerge);
            this.listenTo(this.navigationInfo, 'navigation::merge::show', this.showGridForMerge);
        },

        update: function (options) {
            options = options || {};
            if (options.rerender) {
                this.grid && this.grid.destroy();
                this.grid = null;
                this.initializeGrid();
            } else {
                if (options.scrollTop) {
                    this.grid.load(false, options.scrollTop || 0 );
                } else {
                    this.grid.load();
                }
            }
            this.validateForInfoLine();
        },

        initializeGrid: function () {
            this.$gridWrapper.off().empty();
            if (this.navigationInfo.isHistory()) {
                this.grid = new LaunchGrid.HistoryGrid({
                    element: this.$gridWrapper,
                    navigationInfo: this.navigationInfo,
                    path: window.location.hash.split('history?')[0],
                    urlResolver: UrlResolver
                });
            } else {
                this.grid = new LaunchGrid.GridByType({
                    gridHolder: this.$gridWrapper,
                    infoHolder: this.$infoHolder,
                    navigationInfo: this.navigationInfo,
                    urlResolver: UrlResolver
                });
            }
        },

        navigate: function (parents) {
            this.navigationInfo.restoreNavigationState('launches/' + parents);
            if (this.navigationInfo.last().get('id') != 'history') {
                this.createFilterPanel();
            }
        },

        validateForInfoLine: function () {
            if (!this.navigationInfo.isLaunches() && !this.navigationInfo.isLog()) {
                var item = this.navigationInfo.isHistory()
                    ? this.navigationInfo.at(this.navigationInfo.length - 2).get('data')
                    : this.navigationInfo.last().get('data');
                if (!this.infoLine) {
                    this.infoLine = new InfoPanel({
                        container: this.$infoHolder,
                        item: item,
                        navigationInfo: this.navigationInfo
                    });
                    var self = this;
                    if(_.isEmpty(this.navigationInfo.defectTypes.models)){
                        this.navigationInfo.defectTypes.on('reset', function(){
                            self.infoLine.render(item);
                        });
                    }
                    else {
                        self.infoLine.render(item);
                    }
                }
                else {
                    this.infoLine.reload(item);
                }
            } else {
                if (this.infoLine) {
                    this.infoLine.unrender();
                    this.infoLine.destroy();
                    this.infoLine = null;
                }
            }
        },

        showHistory: function () {
            var ids = this.grid.collection.map(function (item) {
                    return item.get('id');
                }),
                url = urls.historyGridUrl(ids, config.defaultHistoryDepth, this.navigationInfo.extractTabId());
            config.router.navigate(url, {trigger: true});
        },

        showGridForCompare: function (panel) {
            if (this.grid) {
                this.compareGrid = new CompareGrid({
                    panel: panel,
                    grid: this.grid,
                    navigationInfo: this.navigationInfo
                }).render();
                this.grid.$el.hide();
            }
        },

        removeGridForCompare: function () {
            this.compareGrid.destroy();
            this.compareGrid = null;
            this.grid.$el.show();
        },

        showGridForMerge: function (panel) {
            if (this.grid) {
                this.mergeGrid = new MergeGrid({
                    panel: panel,
                    grid: this.grid,
                    navigationInfo: this.navigationInfo
                }).render();
                this.grid.$el.hide();
            }
        },

        removeGridForMerge: function () {
            this.mergeGrid.destroy();
            this.mergeGrid = null;
            this.grid.$el.show();
        },

        render: function () {
            this.$el.html('<div id="infoWrapper"></div><div id="gridWrapper"></div>');
            this.$infoHolder = $("#infoWrapper", this.$el);
            this.$gridWrapper = $("#gridWrapper", this.$el);

            // will render itself into the element
            this.initializeGrid();
            this.validateForInfoLine();

            return this;
        },

        destroy: function () {
            if (this.grid && this.grid.destroy) {
                this.grid.destroy();
                this.grid = null;
            }
            if (this.infoLine) {
                this.infoLine.destroy();
                this.infoLine = null;
            }
            this.navigationInfo = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });


    var InfoPanel = Components.BaseView.extend({

        tpl: 'tpl-launches-info-panel',
        notFoundTPL: 'tpl-launch-notfound',
        toolTipTpl: 'tpl-launches-tooltip',
        defectsTipContent: 'tpl-launches-tooltip-defects',
        execTipContent: 'tpl-launches-tooltip-executions',
        defectTpl: 'tpl-launches-info-panel-defect',

        initialize: function (options) {
            options.container.html('<span id="infoLine" />');
            this.$el = options.container.find('#infoLine');
            this.item = options.item;
            this.navigationInfo = options.navigationInfo;
            this.listenTo(options.navigationInfo, 'launch:not_found', this.updateTemplate);
            this.defects = {};
            this.stats = [];
        },

        updateTemplate: function (data) {
            this.$el.html(Util.templates(this.notFoundTPL, {
                isLaunch: !data
            }));
            $('#gridWrapper').hide();
        },

        events: {
            'mouseenter [data-tooltip-type]': 'showTooltip'
        },

        reload: function(item){
            if (item) {
                this.item = item;
            }
            if(this.item){
                var type = this.item.launchId ? 'item' : 'launch',
                    id = this.item.id,
                    self = this;
                Service.getLaunchItem(type, id)
                    .done(function(data){
                        self.item = data;
                        self.unrender();
                        self.render();
                    })
                    .fail(function(error){
                        self.unrender();
                        Util.ajaxFailMessenger(error);
                    });
            }
            else {
                this.unrender();
                this.render();
            }
        },

        showTooltip: function(e){
            var el = $(e.currentTarget),
                type = el.data('tooltipType');
            if(!el.data('tooltip')){
                el.data('tooltip', 'tooltip');
                this.createTooltip(el, type);
            }
        },

        createTooltip: function(el, type){
            var content = '';
            if(type == 'duration'){
                content = Util.templates(this.toolTipTpl, {message: Localization.launchesHeaders.durationSpecific});
            }
            else if(type == 'executions') {
                content = this.renderExecutionsTooltip();
            }
            else {
                content = this.renderDefectsTooltip(type);
            }
            el.closest('li').append(content);
        },

        renderExecutionsTooltip: function(){
            return Util.templates(this.execTipContent, {stats: this.stats});
        },

        renderDefectsTooltip: function(type){
            return Util.templates(this.defectsTipContent, _.extend(this.defects[type], {
                item: this.item,
                noTotalLink: true,
                tab: this.navigationInfo.getTabAsUrlString(),
                noSubDefects: !this.navigationInfo.defectTypes.checkForSubDefects(),
                urlResolver: UrlResolver}));
        },

        renderDefect: function(tpl){
            return function(defect){
                return Util.templates(tpl, defect);
            }
        },

        render: function (item) {
            if (item) {
                this.item = item;
            }
            if (this.item) {
                this.$el.html(Util.templates(this.tpl, this.getRenderModel()));
            } else {
                this.updateTemplate(this.navigationInfo.length > 2);
            }
            this.$el.show();
            return this;
        },

        getDefects: function(){
            var stats = this.item.statistics.defects;
            _.each(stats, function(val, type){
                this.defects[type] = this.getDefectByType(val, type);
            }, this);
        },

        getDefectByType: function(defect, type){
            var def = {defects: []},
                total = 0;

            _.each(defect, function(v, d){
                if(d == 'total'){
                    total =  parseInt(v);
                }
                else {
                    var defects = this.navigationInfo.defectTypes,
                        issueType = defects.getDefectType(d);
                    if(issueType){
                        issueType.val = parseInt(v);
                        def.defects.push(issueType);
                    }
                }
            }, this);

            def.defects.sort(Util.sortSubDefects);
            def.total = total;
            def.type = type;
            def.cls = Util.getDefectCls(type);
            def.short = this.getShortType(type);
            def.color = Util.getDefaultColor(type);

            return def;
        },

        getShortType: function(type){
            var short = Localization.defectShortCutById[type.toUpperCase()];
            return short;
        },

        getCls: function(type){
            var cls = '',
                tArr = type.split('_');
            cls = tArr.length == 1 ? tArr[0].slice(0,1) : tArr.length == 2 ? tArr[0][0] + tArr[1][0] : '';
            return cls
        },

        getStats: function(){
            var exec = this.item.statistics.executions,
                total = +exec.total,
                passed = ((+exec.passed/total) * 100).toFixed(2),
                failed = ((+exec.failed/total) * 100).toFixed(2),
                skipped = ((+exec.skipped/total) * 100).toFixed(2);
            this.stats = [
                {name: 'passed', value: passed},
                {name: 'failed', value : failed},
                {name: 'skipped', value: skipped}
            ];
        },

        getRenderModel: function () {
            this.getDefects();
            this.getStats();
            var params = {
                    total: this.item.statistics.executions.total,
                    duration: Util.timeFormat(this.item.start_time, this.item.end_time),
                    finish: Util.dateFormat(this.item.end_time, true),
                    status: this.item.status.toLocaleLowerCase(),
                    sortedIssueTypes: Util.getIssueTypes(),
                    interrupted: this.statusInterrupt(this.item),
                    renderDefect: this.renderDefect(this.defectTpl),
                    getDefaultColor: Util.getDefaultColor,
                    defects: this.defects
                },
                stats = this.stats,
                sum = 0,
                max = {value: 0},
                toStats = {};

            _.each(stats, function(s){
                s.value = parseFloat(s.value.escapeNaN());
                sum += s.value;
                max = s.value > max.value ? s : max;
            });
            if((sum > 100 || sum < 100) && max.value !== 0){
                max.value = (100 - (sum - max.value)).toFixed(2);
            }
            _.each(stats, function(s){
                toStats[s.name] = s.value;
            });

            return _.extend(params, toStats);
        },

        statusInterrupt: function (item) {
            return item.status === 'INTERRUPTED';
        },

        unrender: function () {
            $('[data-tooltip-type]', this.$el).popover('destroy');
            $('.info_section:first', this.$el).remove();
            $('.no-launches').remove();
            $('#gridWrapper').show();
        }

    });

    var ComparePanel = Backbone.View.extend({

        initialize: function (options) {
            this.context = options.context;
            this.project = options.project;
            this.$container = options.container;
            this.navigationInfo = options.navigationInfo;
            this.ids = [];

            this.compareModal = Util.getDialog({name: "tpl-launches-compare-modal"});
            this.modalContent = $("#compareContent", this.compareModal);
            this.modalContent.css('min-height', '420px');
            this.loader = $('.submitticket-loader', this.compareModal);

            this.listenTo(this.navigationInfo, 'add::compare::item', this.addCompareItem);
            this.listenTo(this.navigationInfo, 'remove::compare::item::from::panel', this.removeCompareItemFromPanel);

            WidgetsConfig.clear();
        },

        className: 'history-panel',

        tmpl: 'tpl-launches-compare-panel',
        tmpCompareItem: 'tpl-launches-panel-item',

        events: {
            'click #cancel-history': 'cancelCompare',
            'click .btn-show-compare': 'compare',
            'click .remove-item': 'removeMergeItem'
        },

        addCompareItem: function (item) {
            this.comparesHolder.append(Util.templates(this.tmpCompareItem, item));
            this.ids.push(item.id);
            this.compareBtn.show();
        },

        removeMergeItem: function (e) {
            var el = $(e.currentTarget);
            this.navigationInfo.trigger('remove::compare::item::from::grid', el.data('id'));
            el.closest('li').remove();
            this.removeFromIds(el.data('id'));
        },

        removeCompareItemFromPanel: function (id) {
            $("#panel-item-" + id, this.$el).remove();
            this.removeFromIds(id);
        },

        removeFromIds: function (id) {
            this.ids = _.filter(this.ids, function (tid) {
                return tid !== id;
            });

            if (!this.ids.length) {
                this.compareBtn.hide();
            }
        },

        cancelCompare: function (e) {
            e.preventDefault();
            this.navigationInfo.trigger('navigation::compare::hide');
        },

        clearCompare: function () {
            this.ids = [];
            this.comparesHolder.empty();
            this.navigationInfo.trigger('navigation::compare::clear');
        },

        render: function () {
            this.$container.prepend(this.$el.html(Util.templates(this.tmpl)));
            this.comparesHolder = $(".history-items", this.$el);
            this.compareBtn = $('button.btn-show-compare', this.$el);
            return this;
        },

        createChart: function (responce) {
            var gadget = 'launches_comparison_chart',
                widgetsConfig = WidgetsConfig.getInstance(),
                criteria = widgetsConfig.widgetTypes[gadget].staticCriteria;
            delete criteria['statistics$defects$no_defect$total'];
            this.widget = new Widgets.LaunchesComparisonChart({
                container: this.modalContent,
                param: {
                    gadget: gadget,
                    content: responce,
                    content_fields: _.keys(widgetsConfig.widgetTypes[gadget].staticCriteria),
                    height: config.defaultWidgetHeight
                }
            });
            this.widget.render();
        },

        compare: function (e) {
            e.preventDefault();
            var self = this;

            if (self.widget) {
                self.widget.remove();
            }
            self.loader.show();
            self.compareModal.modal("show").one('shown.bs.modal', function () {
                Service.getCompare(self.ids.join(','))
                    .done(function (response) {
                        if (self.compareModal.length) {
                            self.loader.hide();
                            self.createChart(response);
                        }
                    }).fail(function (response) {
                        self.loader.hide();
                        Util.ajaxFailMessenger(response, "errorUpdateWidget");
                        self.compareModal.modal("hide");
                    });
            });
            self.compareModal.one('hidden.bs.modal', function () {
                self.clearCompare();
                self.widget.remove();
                setTimeout(function () {
                    self.compareModal.remove();
                }, 100);
            });
        },

        destroy: function () {
            if (this.widget) {
                this.widget.remove();
            }
            if (this.compareModal.length) {
                this.compareModal.remove();
            }
            Components.RemovableView.prototype.destroy.call(this);
        }

    });

    var CompareGrid = Backbone.View.extend({

        initialize: function (options) {
            this.launchGrid = options.grid;
            this.launchGrid.destroyStickyHeader();
            this.panel = options.panel;
            this.navigationInfo = options.navigationInfo;
            this.listenTo(this.navigationInfo, 'navigation::compare::clear', this.clearSelect);
            this.listenTo(this.navigationInfo, 'remove::compare::item::from::grid', this.removeCompareItem);
        },

        attributes: {
            'id': 'compareGrid'
        },

        events: {
            'click .rp-table-row': 'selectForCompare'
        },

        clearSelect: function () {
            $('button.btn-show-compare', this.panel.$el).hide();
            $('div.selected-forhistory', this.$el).attr('data-toggled', 'off').removeClass('selected-forhistory');
        },

        selectForCompare: function (e) {
            var el = $(e.currentTarget),
                id = el.attr('id');
            if (!el.attr('data-toggled') || el.attr('data-toggled') == 'off') {
                el.attr('data-toggled', 'on');
                el.addClass('selected-forhistory');

                this.navigationInfo.trigger('add::compare::item', {
                    id: id,
                    name: this.launchGrid.collection.get(id).get('name')
                });
            }
            else {
                el.attr('data-toggled', 'off').removeClass('selected-forhistory');
                this.navigationInfo.trigger('remove::compare::item::from::panel', id);
            }
        },

        removeCompareItem: function (id) {
            $("#" + id, this.$el).attr('data-toggled', 'off').removeClass('selected-forhistory');
        },

        render: function () {
            var cloneGrid = this.launchGrid.$el.find('.container-fluid.suit-grid').clone();

            $('.rp-table-th', cloneGrid).removeClass('sortable');
            $('.rp-table-th .keyboard_arrow_down', cloneGrid).hide();
            $('input', cloneGrid).attr('disabled', 'disabled');
            $('.tooltip', $(cloneGrid)).remove();
            _.forEach($('a', cloneGrid), function (el) {
                var $el = $(el);
                $el.replaceWith('<span style="'+ $el.attr('style') +'" class="to-history ' + $el.attr('class') + '">' + $el.html() + '</span>');
            });
            this.launchGrid.$el.after(this.$el.html(cloneGrid).addClass(this.launchGrid.$el.attr('class')));
            return this;
        },

        destroy: function () {
            Components.RemovableView.prototype.destroy.call(this);
        }

    });

    var MergePanel = Backbone.View.extend({

        initialize: function (options) {
            this.launches = [];
            this.launchesId = [];
            this.lastLaunch = null;
            this.navigationInfo = options.navigationInfo;
            this.$container = options.container;

            this.listenTo(this.navigationInfo, 'add::compare::item', this.addCompareItem);
            this.listenTo(this.navigationInfo, 'remove::merge::item::from::panel', this.removeMergeItemPanel);
        },

        className: 'history-panel',

        tmpl: 'tpl-launches-merge-panel',
        mergeFormTmpl: 'tpl-launches-merge-form',
        rowTpl: 'tpl-launch-update-row',
        tmpCompareItem: 'tpl-launches-panel-item',

        events: {
            'click #cancel-merge': 'cancelMerge',
            'click [data-js-merge-launches]': 'showPopupForMerge',
            'click .remove-item': 'removeCompareItem'
        },

        removeCompareItem: function (e) {
            var el = $(e.currentTarget);
            this.navigationInfo.trigger('remove::compare::item::from::grid', el.data('id'));
            el.closest('li').remove();
        },

        removeMergeItemPanel: function (id) {
            $("#panel-item-" + id, this.$el).remove();
        },

        addCompareItem: function (item) {
            this.comparesHolder.append(Util.templates(this.tmpCompareItem, item));
        },

        cancelMerge: function () {
            this.navigationInfo.trigger('navigation::merge::hide');
        },

        showPopupForMerge: function () {
            this.mergeEditor = null;
            this.mergeEditor = new Editor.MergeEditor({
                launches: this.launches,
                eventBus: this.navigationInfo,
                owner: config.userModel.get('name').replace('_', ' ').capitalize(),
                callback: function (response, lastLaunch) {
                    this.updateGrid(response, lastLaunch);
                    this.cancelMerge();
                    config.trackingDispatcher.launchesMerge(this.launches.length);
                }.bind(this)
            }).render();
        },

        updateGrid: function (obj, lastId) {
            var store = this.grid.collection,
                last = store.get(lastId),
                self = this,
                removed = _.reject(this.launches, function (launch) {
                    $('#' + launch.id, this.grid.$el).addClass('selected-forhistory').fadeOut("slow", function () {
                        $('#' + launch.id, self.grid.$el).remove()
                    });
                    return launch.id == lastId;
                }, this),
                id = obj.id,
                self = this;
            store.remove(removed);
            _.delay(function () {
                config.router.navigate(document.location.hash + '/' + id + '?' + self.navigationInfo.getTabAsUrlString(), {trigger: true});
            }, 800);
        },

        render: function () {
            this.$container.prepend(this.$el.html(Util.templates(this.tmpl)));
            this.comparesHolder = $(".history-items", this.$el);
            return this;
        },

        destroy: function () {
            this.mergeEditor = null;
            Components.RemovableView.prototype.destroy.call(this);
        }

    });

    var MergeGrid = Backbone.View.extend({

        initialize: function (options) {
            this.launchGrid = options.grid;
            this.launchGrid.destroyStickyHeader();
            this.panel = options.panel;
            this.panel.grid = this.launchGrid;
            this.navigationInfo = options.navigationInfo;
            //this.listenTo(this.navigationInfo, 'navigation::compare::clear', this.clearSelect);
            this.listenTo(this.navigationInfo, 'remove::compare::item::from::grid', this.removeMergeItem);
            this.listenTo(this.launchGrid.collection, 'reset', this.updateGrid);
        },

        attributes: {
            'id': 'mergeGrid'
        },

        events: {
            'click div.rp-table-row': 'selectForMerge'
        },

        tplMergeAlert: 'tpl-merge-warning',

        selectForMerge: function (e) {
            var el = $(e.currentTarget),
                id = el.attr('id'),
                launch = this.launchGrid.collection.get(id);

            if (!el.hasClass('disabled') || this.validateForOwner(launch)) {
                if (!el.attr('data-toggled') || el.attr('data-toggled') == 'off') {
                    var isProcessing = this.validateIsProcessing(launch),
                        isDeleting = this.validateIsDeleting(launch.get('id'));
                    if (launch.get('status') == 'IN_PROGRESS' || isProcessing || isDeleting) {
                        var message = isProcessing ? Localization.launches.launchIsProcessing : isDeleting ? Localization.launches.launchIsDeleting : Localization.launches.launchNotInProgress,
                            modal = new Components.DialogWithCallBack({
                                headerTxt: 'unableSelectForMerge',
                                actionTxt: 'ok',
                                hideDismiss: true,
                                actionStatus: true,
                                data: {message: message},
                                contentTpl: this.tplMergeAlert,
                                callback: function () {
                                    modal.$el.modal('hide');
                                }
                            }).render();
                    }
                    else {
                        el.attr('data-toggled', 'on');
                        el.addClass('selected-forhistory');
                        this.panel.launches.push(launch);
                        if (this.panel.launches.length > 1) {
                            $('[data-js-merge-launches]', this.panel.$el).show();
                        }
                        var renderObject = {
                            id: id,
                            name: launch.get('name'),
                            number: launch.get('number')
                        };
                        this.navigationInfo.trigger('add::compare::item', renderObject);
                    }
                }
                else {
                    this.removeMergeItem(id);
                    this.navigationInfo.trigger('remove::merge::item::from::panel', id);
                }
            }
        },

        removeMergeItem: function (id) {
            var target = $("#" + id, this.$el);
            target.attr('data-toggled', 'off').removeClass('selected-forhistory');
            this.panel.launches = _.filter(this.panel.launches, function (item) {
                return item.id !== id
            });
            if (this.panel.launches.length < 2) {
                $('button#merge-launches', this.panel.$el).hide();
            }
        },

        updateGrid: function(){
            _.each(this.launchGrid.collection.models, function(launch){
                var launchId  = launch.get('id'),
                    aaLabel = $('#' + launchId + ' .label.autoanalyze', this.$el),
                    action = this.validateIsProcessing(launch) ? 'show' : 'hide' ;
                aaLabel[action]();
            }, this);
        },

        render: function () {
            var cloneGrid = this.launchGrid.$el.find('.container-fluid.suit-grid').clone();
            $('.rp-table-th', $(cloneGrid)).removeClass('sortable');
            $('.rp-table-th .keyboard_arrow_down', $(cloneGrid)).hide();
            $('input', $(cloneGrid)).attr('disabled', 'disabled');
            $('.tooltip', $(cloneGrid)).remove();
            _.forEach($('a', cloneGrid), function (el) {
                var $el = $(el);
                $el.replaceWith('<span style="'+ $el.attr('style') +'" class="to-history ' + $el.attr('class') + '">' + $el.html() + '</span>');
            });
            if (!config.userModel.hasPermissions()) {
                _.each(this.launchGrid.collection.models, function (launch) {
                    if (!this.validateForOwner(launch)) {
                        $('#' + launch.get('id'), cloneGrid).addClass('disabled');
                    }
                }, this);
            }
            this.launchGrid.$el.after(this.$el.html(cloneGrid).addClass(this.launchGrid.$el.attr('class')));
            return this;
        },

        validateForOwner: function (launch) {
            return launch.get('owner') === config.userModel.get('name');
        },

        validateIsProcessing: function (launch) {
            return launch.get('isProcessing');
        },

        validateIsDeleting: function(id){
            var deletingLaunches = Storage.getDeletingLaunches();
            return _.contains(deletingLaunches, id);
        },

        destroy: function () {
            this.launchGrid = null;
            this.navigationInfo = null;
            this.panel = null;
            Components.RemovableView.prototype.destroy.call(this);
        }
    });

    /*
     navigation point - one of selected 'parent' object in 'drilldown' process
     */
    var NavigationPoint = Backbone.Model.extend({
        defaults: {
            name: '',
            id: '',
            params: null,
            grid: '',
            data: null
        }
    });

    /*
     All 'navigation points' - collection of all 'parent'.
     */
    var NavigationInfo = Backbone.Collection.extend({

        model: NavigationPoint,

        prefix: '',

        parentItem: null,

        scrollToDestinationId: null,

        initialize: function (models, options) {
            this.prefix = options.prefix;
            this.url = urls.getProjectBase();
            this.navigationCache = {};
            this.requestParameters = new Components.RequestParameters({});
            this.requestParameters.loadObjectsCount('objectsOnPage');
            this.requestParameters.loadObjectsCount('objectsOnPageLogs');
            this.requestParameters.clear();
            this.defectTypes = new SingletonDefectTypeCollection();
        },

        getLevelGridType: function () {
            return this.last().get('grid');
        },

        checkIfStepDefaultsRevealed: function () {
            return Boolean(this.last().get('params'));
        },

        toNavigationObject: function (string) {
            if (string) {
                var result = [];
                var steps = string.split('/');
                _.each(steps, function (step, index) {
                    var raw = step.split('?');
                    if (index === 0) {
                        raw[0] = 'all';
                    }
                    // do not decode undefined -> it becomes string =)
                    result.push({id: raw[0], params: raw[1]});
                });
                return result;
            }
        },

        getURLForCurrentLocation: function () {
            return this.reduce(function (memo, parent) {
                var url = ((memo) ? memo + '/' : '') + parent.get('id');
                if (!_.isEmpty(parent.get('params'))) {
                    url += '?' + parent.get('params');
                }
                return url;
            }, (this.prefix) ? this.prefix : null);
        },

        saveNavigationState: function () {
            this.trigger('navigation::loaded');
            if (this.last().get('params')) {
                this.requestParameters.apply(this.last().get('params'));
            }
        },

        updateNavigationState: function (query) {
            var currentGrid = this.getLevelGridType();
            // on update walk through all steps and verify them for validity : remove if changed
            if (query) {
                var request = this.toNavigationObject(query);
                this.combineRequestWithCurrentNavigation(request);
                this.setupRequestParamsForLevel();
            } else {
                // empty update can be called only for the very first step - so lets just reload it
                while (this.length > 1) {
                    this.pop();
                }
                this.setupRequestParamsForLevel();
            }

            this.parentItem = null;
            this.trigger('navigation::loaded', {rerender: currentGrid !== this.getLevelGridType()});

            // tab switched
            var activeTab = $('.active.tab');
            if (!activeTab.hasClass('unsaved')) {
                activeTab.addClass('navigated');
            } else {
                activeTab.removeClass('navigated');
            }
            this.trigger("navigation::state::change", {params: this.requestParameters, tabSwitched: true});
        },

        setupRequestParamsForLevel: function () {
            // at this point we have valid navigation info and can act as usually
            if (this.last().get('params')) {
                this.requestParameters.clear(this.setRequestObjectsType());
                this.requestParameters.apply(this.last().get('params'));
            } else {
                this.requestParameters.clear(this.setRequestObjectsType());
            }
        },

        setRequestObjectsType: function () {
            return this.getLevelGridType() === 'log' ? 'objectsOnPageLogs' : 'objectsOnPage';
        },

        applyRequestParameters: function () {
            this.last().set('params', this.requestParameters.toURLSting());
            // make sure that cache is updated in case will need to move forward
            this.navigationCache[this.last().get('id')] = this.last();

            var path = '#' + config.project.projectId + '/' + this.getURLForCurrentLocation();
            config.router.navigate(path, {trigger: true});
        },

        applyPaging: function (page, size) {
            var params = this.last().get('params');
            if (!params) {
                this.revealDefaults();
            } else {
                this.requestParameters.apply(params);
            }
            page && this.requestParameters.setPage(page);
            size && this.requestParameters.setPageSize(size);
            this.last().set('params', this.requestParameters.toURLSting());
            this.updateHashSilently();
            this.trigger("navigation::state::change", {params: this.requestParameters});
        },

        applySorting: function (index, direction) {
            this.revealDefaults();
            this.requestParameters.setSortInfo(index, direction);
            this.updateLastItemCacheAndUrl();
            this.trigger("navigation::state::change", {params: this.requestParameters, state: true});
        },

        applyPageCount: function () {
            this.trigger("navigation::state::change", {params: this.requestParameters, state: true});
        },

        applyFilters: function (filters, id) {
            var lastItem = this.last(),
                params = lastItem.get('params');
            this.requestParameters.clear(this.setRequestObjectsType());
            params && this.requestParameters.apply(params);
            if (!this.isHistory()) {
                this.requestParameters.setFilters(filters);
                this.requestParameters.setPage(1);
                id && this.requestParameters.setTab(id);
            } else {
                var itemsIds = _.find(decodeURIComponent(params).split('&'), function (item) {
                        return item.indexOf('ids') === 0
                    }),
                    ids = (itemsIds) ? itemsIds.substring(4) : '';
                filters.push({id: 'ids', value: ids});
                this.requestParameters.setFilters(filters);
            }

            this.updateLastItemCacheAndUrl();

            this.trigger('reset::counter');
            this.trigger('navigation::reload::table', {});
            this.trigger('navigation::state::change', {params: this.requestParameters, state: true});
        },

        updateLastItemCacheAndUrl: function () {
            this.last().set('params', this.requestParameters.toURLSting());
            // make sure that cache is updated in case will need to move forward
            this.navigationCache[this.last().get('id')] = this.last();
            this.updateHashSilently();
        },

        getCurrentFilterValue: function (filterId) {

            var params = this.last().get('params'),
                value = null;
            if (params) {
                this.requestParameters.clear(this.setRequestObjectsType());
                this.requestParameters.apply(params);
                var filter = _.find(this.requestParameters.getFilters(), function (filter) {
                    return filter.id === filterId;
                });
                if (filter) {
                    value = filter.value;
                }
            }
            return value;
        },

        revealDefaults: function () {
            if (this.checkIfStepDefaultsRevealed()) return;

            var defaults = this.getRequestData();
            this.requestParameters.setPage(defaults['page.page']);
            this.requestParameters.setPageSize(defaults['page.size']);
            var sort = defaults['page.sort'].split(',');
            this.requestParameters.setSortInfo(sort[0], sort[1]);
            this.last().set('params', this.requestParameters.toURLSting());
        },

        updateHashSilently: function () {
            var path = '#' + config.project.projectId + '/' + this.getURLForCurrentLocation();
            config.router.navigate(path, {trigger: false});
        },

        combineRequestWithCurrentNavigation: function (request) {
            var newCollection = [];
            for (var i = 0, l = request.length; i < l; i += 1) {
                var cached = this.navigationCache[request[i].id];
                if (!cached || i === (l - 1)) {
                    // load item if it is absent or reload last for infoPanel
                    var navigationItem = this.loadNavigationStep(request[i], i);
                    newCollection.push(navigationItem);
                    // no need to cache log level
                    if (navigationItem && navigationItem.grid !== 'log') this.navigationCache[request[i].id] = navigationItem;
                } else {
                    // become cache driven
                    cached.set('params', request[i].params);
                    newCollection.push(cached);
                }
            }
            this.reset(newCollection);
        },

        loadNavigationStep: function (step, index) {
            var result = null,
                projectedUrlPrefix = urls.getProjectBase(),
                lookingFor = index > 1 ? '/item/' : '/launch/',
                self = this,
                url;
            if (step.id === 'all') {
                result = new NavigationPoint({name: 'All', id: step.id, params: step.params, grid: "launch"});
            } else if (step.id.indexOf('all-cases-for-') === 0) {

                url = projectedUrlPrefix + lookingFor + step.id.replace('all-cases-for-', '');
                $.ajax(url, {
                    type: 'GET',
                    async: false,
                    success: function (response) {
                        result = new NavigationPoint({
                            name: response.name + (response.number ? ' #' + response.number : ''),
                            id: step.id,
                            params: step.params,
                            grid: "test",
                            data: response
                        });
                        self.requestParameters.clear('objectsOnPage');
                    },
                    error: function (response) {
                        self.trigger('launch:not_found', index > 1);
                        response && Util.ajaxFailMessenger(response, 'loadNavigationStep');
                    }
                });
            } else if (step.id.indexOf('log-for-') === 0) {

                url = projectedUrlPrefix + '/item/' + step.id.replace('log-for-', '');
                $.ajax(url, {
                    type: 'GET',
                    async: false,
                    success: function (response) {
                        result = new NavigationPoint({
                            name: response.name,
                            id: step.id,
                            params: step.params,
                            grid: "log",
                            data: response
                        });
                        self.requestParameters.clear('objectsOnPageLogs');
                    },
                    error: function (response) {
                        self.trigger('launch:not_found', index > 1);
                        response && Util.ajaxFailMessenger(response, 'loadNavigationStep');
                    }
                });
            } else if (step.id == 'history') {
                result = new NavigationPoint({name: step.id, id: step.id, params: step.params, grid: "history"});
            } else {
                url = projectedUrlPrefix + lookingFor + step.id;
                $.ajax(url, {
                    type: 'GET',
                    async: false,
                    success: function (response) {
                        // if parent is Test with children - this is the test grid
                        var grid = GridByParentValidator.typeTestAndChildren(response) ? 'test' : 'suit';
                        result = new NavigationPoint({
                            name: response.name + (response.number ? ' #' + response.number : ''),
                            id: step.id,
                            params: step.params,
                            grid: grid,
                            data: response
                        });
                        self.requestParameters.clear('objectsOnPage');
                    },
                    error: function (response) {
                        self.trigger('launch:not_found', index > 1);
                        response && Util.ajaxFailMessenger(response, 'loadNavigationStep');
                    }
                });
            }
            return result;
        },

        restoreNavigationState: function (path) {
            var request = this.toNavigationObject(path.replace('launches/all', '').replace('userdebug/all', ''));
            var navigationItems = [];
            _.forEach(request, function (item, index) {
                var navigationItem = this.loadNavigationStep(item, index);
                navigationItems.push(navigationItem);
                this.navigationCache[item.id] = navigationItem;
            }, this);
            this.reset(navigationItems);
            this.saveNavigationState();
            this.trigger("navigation::state::change", this.requestParameters);
        },

        getRequestData: function () {
            //this.requestParameters.setGridType(this.getLevelGridType());
            var defaults = {},
                id = this.last().get('id');
            if (this.last().get('params')) {
                // load visible request params from current step params to the request state
                this.requestParameters.apply(this.last().get('params'));
                // if it is all cases fall through - no need to get defaults, they are already in the params
                if (id.indexOf('all-cases-') === 0) {
                    var params = this.requestParameters.toJSON(),
                        isExecution = this.isExecutionStatistics(params),
                        targetId = id.replace('all-cases-for-', ''),
                        targetSet = DefaultRequestParams.allcases(isExecution, targetId, this.length);
                    return _.extend(targetSet, params);
                }
            }
            // now set default request params for current step from the storage
            if (this.isLaunches()) {
                // this is launches step for sure
                defaults = DefaultRequestParams.launch();
            } else if (this.length === 2) {
                // this is first level step for sure
                defaults = DefaultRequestParams.suit();
                defaults['filter.eq.launch'] = id;
            } else {
                // this is something else
                if (this.isLog()) {
                    defaults = DefaultRequestParams.log();
                    defaults['filter.eq.item'] = id.replace('log-for-', '');
                } else {
                    defaults = DefaultRequestParams.test();
                    defaults['filter.eq.parent'] = id;
                }
            }
            if (_.isEmpty(this.requestParameters.getSortInfo())) {
                this.applySortingParamsByGridType(this.requestParameters);
            }
            return _.extend(defaults, this.requestParameters.toJSON());

            // var requestParams = this.requestParameters.toJSON();
            // if(requestParams['filter.btw.start_time']){
            //     requestParams['filter.btw.start_time'] = requestParams['filter.btw.start_time']
            //         .replace('TODAY', '0;1439')
            //         .replace('YESTERDAY', '-1440;-1')
            //         .replace('LAST_7_DAYS', '-10080;-1')
            //         .replace('LAST_30_DAYS', '-43200;-1')
            // }
            // // at the end merge possible request params with defaults
            // return _.extend(defaults, requestParams);

        },

        isExecutionStatistics: function (params) {
            return !params['filter.in.issue$issue_type'] && params['filter.in.type'] !== undefined;
        },

        getValidator: function () {
            return GridByParentValidator;
        },

        getTempTab: function (newTab) {
            var params = new Components.RequestParameters({});
            // apply sorting manually - because temp tab is always at the launch level
            var sorting = DefaultRequestParams.launch(),
                split = sorting['page.sort'].split(',');
            params.setSortInfo(split[0], split[1]);
            params.setTab(newTab.id);
            return {
                id: newTab.id,
                name: newTab.name,
                requestParams: params,
                url: this.getUrlForRequestParams(params),
                stateUrl: '',
                type: 'launch',
                isShared: newTab.isShared,
                owner: config.userModel.get('name')
            };
        },

        getUrlForRequestParams: function (params) {
            return urls.tabUrl(params.toURLSting());
        },

        replaceTempId: function (id, newId) {
            this.requestParameters.setTab(newId);
            this.last().set('params', this.requestParameters.toURLSting());
            var hash = window.location.hash;
            hash = hash.replace(id, newId);
            config.router.navigate(hash, {trigger: false});
        },

        applySortingParamsByGridType: function (params) {
            var gridType = this.getLevelGridType();
            var sorting = (this.models.length === 1) ? DefaultRequestParams.launch() : (!!gridType ? DefaultRequestParams[gridType]() : '');
            if (sorting) {
                var split = sorting['page.sort'].split(',');
                params.setSortInfo(split[0], split[1]);
            }
        },

        getDefaultTab: function () {
            var params = new Components.RequestParameters({});
            this.applySortingParamsByGridType(params);
            return {
                id: params.getTab(),
                requestParams: params,
                name: "All Launches",
                owner: config.userModel.get('name'),
                url: urls.tabUrl(params.toURLSting())
            };
        },

        extractTabId: function (string) {
            var tabId = '',
                target = string ? string : this.last().get('params');
            try {
                tabId = target.split('tab.id=')[1].split('&')[0];
            } catch (e) {
                // console.log(e);
            }
            return tabId || config.defaultTabId;
        },

        getFilter: function (id) {
            return _.find(this.requestParameters.getFilters(), function (filter) {
                return filter.id === id;
            });
        },

        getCurrentStepTab: function () {
            return {
                id: this.requestParameters.getTab(),
                requestParams: this.requestParameters,
                url: urls.tabUrl(this.requestParameters.toURLSting())
            }
        },

        changeCurrentStepId: function (id) {
            this.requestParameters.setTab(id);
            this.updateLastItemCacheAndUrl();
            return {id: this.requestParameters.getTab(), requestParams: this.requestParameters};
        },

        applyCurrentStepTab: function (requestParameters) {
            // todo default it to the launches level
            this.requestParameters.set(requestParameters.attributes);
            this.updateLastItemCacheAndUrl();
            this.trigger('navigation::reload::table', {});
        },

        restoreFromLast: function () {
            var tabId = "?" + this.getTabAsUrlString(),
                item = this.last(),
                url,
                data;
            if (item) {
                data = item.get("data");
                url = "#" + config.project.projectId + "/" + this.prefix + "/all" + tabId + "/" + data.launchId + tabId;

                _.forEach(data.path_names, function (value, key) {
                    url += "/" + key + tabId;
                });

                url += "/" + item.get("id");
                if (item.get("id").indexOf('log-for') === -1) url += tabId;
                config.router.navigate(url, {trigger: true});
            }
        },

        followTabUrl: function (url) {
            url = url || urls.launchesBase() + "/all";
            config.router.navigate(url);
            Backbone.history.loadUrl(url);
        },

        requiresFilters: function () {
            return !this.isLog();
        },

        isAllCases: function () {
            return this.last().get("id").indexOf('all-cases-for-') === 0;
        },

        isHistory: function () {
            return this.last().get("id").indexOf('history') === 0;
        },

        getUrlForSuit: function (id) {
            var launch = this.at(1),
                tabId = "?" + this.getTabAsUrlString(),
                state = this.at(0).toJSON().params,
                launchState = state ? ("?" + state) : tabId;
            return Util.getRoot() + "#" + config.project.projectId + "/"
                + this.prefix + "/all" + launchState + "/" + launch.get('id').replace("all-cases-for-", "") + tabId + "/" + id + tabId;
        },

        getTabAsUrlString: function () {
            return this.requestParameters ? "tab.id=" + this.requestParameters.get('tab')['tab.id'] : "";
        },

        isDebug: function () {
            return this.prefix === 'userdebug';
        },

        isLaunches: function () {
            return this.length === 1;
        },

        isLog: function () {
            return this.getLevelGridType() === "log";
        },

        isLaunchOwner: function () {
            var launch = this.at(1),
                launchData = launch ? launch.get('data') : {};
            return launchData.owner === config.userModel.get('name');
        },

        launchIsProcessing: function(item){
            var progress = false;
            if(item.launchId){
                var launch = this.get(item.launchId) || this.get('all-cases-for-' + item.launchId);
                if(launch){
                    var launchData = launch.get('data');
                    if(launchData){
                        progress = launchData.isProcessing;
                    }
                }
            }
            return progress;
        },

        isInterrupted: function () {
            var currentData = this.last().get('data');
            return currentData.status === "INTERRUPTED" || currentData.status === "STOPPED";
        },

        isLaunchInterrupted: function () {
            var item = this.last().get('data'),
                progress = false;
            if(item.launchId){
                var launch = this.get(item.launchId);
                if(launch){
                    var launchData = launch.get('data');
                    if(launchData){
                        progress = launchData.status === config.launchStatus.interrupted || launchData.status === config.launchStatus.stopped;
                    }
                }
            }
            return progress;
        },

        validForHistory: function () {
            return !this.isDebug() && !this.isLaunches() && !this.isLog() && !this.isAllCases() && !this.isHistory() && !this.isInterrupted() && !this.isLaunchInterrupted();
        },

        trackForLaunchProcessing: function (call, id) {
            var self = this;
            call
                .done(function(response){
                    Util.ajaxSuccessMessenger("startAnalyzeAction");
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, "startAnalyzeAction");
                })
                .always(function () {
                    if (self.navigationCache && self.navigationCache[id]) {
                        self.navigationCache[id].get('data').isProcessing = false;
                    }
                    self.trigger('analyze:is:over');
                });
        },

        destroy: function () {
            this.reset();
            this.stopListening();
            this.unbind();
            this.navigationCache = null;
            this.requestParameters = null;
            this.remove();
            delete this;
        }

    });

    var GridByParentValidator = {
        hasOwner: function (parent) {
            return parent['owner'] !== undefined;
        },
        hasIssue: function (parent) {
            return parent['issue'] !== undefined;
        },
        hasNoChildren: function (parent) {
            return parent['has_childs'] !== undefined && !parent.has_childs
        },
        hasNoResetedStatus: function (parent) {
            return parent['status'].toLowerCase() !== 'reseted';
        },
        typeSuiteAndChildren: function (parent) {
            return parent['type'] !== undefined && parent.type === "SUITE" && parent['has_childs'] !== undefined && parent.has_childs;
        },
        typeSuiteAndNoChildren: function (parent) {
            return parent['type'] !== undefined && parent.type === "SUITE" && parent['has_childs'] !== undefined && !parent.has_childs;
        },
        typeStepAndNoChildren: function (parent) {
            return parent['type'] !== undefined && parent.type === "STEP" && parent['has_childs'] !== undefined && !parent.has_childs;
        },
        typeTestAndChildren: function (parent) {
            return parent['type'] !== undefined && parent.type === "TEST" && parent['has_childs'] !== undefined && parent.has_childs;
        },
        typeStep: function (parent) {
            return parent['type'] !== undefined && parent.type === "STEP";
        },
        typeAndNoChildren: function (parent) {
            return parent['type'] !== undefined && parent['has_childs'] !== undefined && !parent.has_childs;
        },
        durationInProgress: function (item) {
            return item.status === 'IN_PROGRESS';
        },
        canStopLaunch: function (item, isDebug) {
            var projectRole = config.userModel.get('projects')[config.project.projectId].projectRole,
                roleIndex = config.projectRoles.indexOf(projectRole);
            return Util.isAdmin(config.userModel.toJSON())
                || roleIndex >= 2
                || (this.isOwner(item) && !isDebug);
        },
        isOwner: function (item) {
            return item.owner === config.userModel.get('name');
        },
        durationSkipped: function (item) {
            return item.status === 'SKIPPED';
        },
        durationInterrupted: function (item) {
            return item.status === 'INTERRUPTED' || item.status === 'STOPPED';
        },
        durationStopped: function (item) {
            return  item.status === 'STOPPED';
        },
        durationStartAndEnd: function (item) {
            return item.start_time && item.end_time;
        },
        durationStartNoEnd: function (item) {
            return item.start_time && !item.end_time;
        },
        statusFailedNoChildren: function (parent) {
            return parent.status !== undefined && parent.status === "FAILED"
                && parent['has_childs'] !== undefined && !parent.has_childs;
        },
        stepIsShifter: function (parent) {
            return parent['type'] !== undefined && parent['has_childs'] !== undefined && !parent.has_childs;
        },
        levelError: function (parent) {
            return parent['level'] !== undefined && parent.level === "ERROR";
        }
    };

    var DefaultRequestParams = Util.getDefaultRequestParams();

    var UrlResolver = function (type, item, tab) {
        var allCasesConstructor = function (id, owner, status) {
            var positionalFilter = owner !== undefined ? '&filter.eq.launch=' : '&filter.in.path=';
            var taba = tab ? "&" + tab : "";
            return 'all-cases-for-' + id
                + '?page.page=1&page.sort=start_time,ASC'
                + '&filter.eq.has_childs=false'
                + status
                + positionalFilter + id + taba;
        };
        var url = window.document.location + '/';
        switch (type) {
            case 'name':
                var idPrefix = (GridByParentValidator.hasNoChildren(item) && GridByParentValidator.hasNoResetedStatus(item)) ? 'log-for-' : '',
                    tab = tab ? ("?" + tab) : "";
                url = url + idPrefix + item.id + tab;
                break;
            case 'total':
                var statusFilter = '&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED&filter.in.type=STEP';
                url = url + allCasesConstructor(item.id, item.owner, statusFilter);
                break;
            case 'passed':
            case 'failed':
            case 'skipped':
                var interrupted = type == 'failed' ? ',INTERRUPTED' : '',
                    statusFilter = '&filter.in.status=' + type.toUpperCase() + interrupted + '&filter.in.type=STEP';
                url = url + allCasesConstructor(item.id, item.owner, statusFilter);
                break;
            case 'product_bug':
            case 'system_issue':
            case 'to_investigate':
            case 'no_defect':
            case 'automation_bug':
                var statusFilter = '&filter.in.issue$issue_type=',
                    defectTypes = new SingletonDefectTypeCollection(),
                    subDefects = defectTypes.toJSON(),
                    defects = Util.getSubDefectsLocators(type, subDefects).join('%2C');
                url = url + allCasesConstructor(item.id, item.owner, statusFilter + defects);
                break;
            default:
                break;
        }
        return url;};

    return {
        NavigationPoint: NavigationPoint,
        NavigationInfo: NavigationInfo,
        ContentView: ContentView,
        MergeGrid: MergeGrid,
        MergePanel: MergePanel,
        UrlResolver: UrlResolver
    };
});
