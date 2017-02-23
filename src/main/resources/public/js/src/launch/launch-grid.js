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
    var Components = require('core/components');
    var Util = require('util');
    var Urls = require('dataUrlResolver');
    var App = require('app');
    var Service = require('coreService');
    var Storage = require('storageService');
    var DefectEditor = require('defectEditor');
    // var Textile = require('textile');
    var StickyHeader = require('core/StickyHeader');
    var Editor = require('launchEditor');
    var Log = require('log');
    var Localization = require('localization');
    var Moment = require('moment');
    var d3 = require('d3');
    var nvd3 = require('nvd3');
    var ModalConfirm = require('modals/modalConfirm');

    require('bootstrap');

    var config = App.getInstance();

    var GridByType = Components.BaseView.extend({
        tpl: null,
        sortingTpl: 'tpl-launch-grid-sorting-state',
        executionTpl: 'tpl-launch-grid-statistics-cell',
        durationTpl: 'tpl-launch-grid-duration-cell',
        defectTypeTpl: 'tpl-launch-grid-defect-type',
        forceFinishTpl: 'tpl-launch-warning-dialog',
        deleteLaunchTpl: 'tpl-delete-launch-dialog',
        itemMenuTpl: 'tpl-launch-item-menu',
        collapsedButtonTpl: 'tpl-test-collapsed-button',

        dynamicTpl: function () {
            var type = (this.type === "launch") ? "suit" : this.type;
            return 'tpl-launch-' + type + '-grid';
        },

        initialize: function (options) {
            this.$el = options.gridHolder;
            this.$infoHolder = options.infoHolder;
            this.collection = new Components.GridsStore();
            this.urlResolver = options.urlResolver;
            this.navigationInfo = options.navigationInfo;

            this.type = this.navigationInfo.getLevelGridType();
            this.url = Urls.getGridUrl(this.type, this.navigationInfo.isDebug());

            StateDecorator(this);
            this.tpl = this.dynamicTpl();

            this.listenTo(this.navigationInfo, 'analyze:is:over', this.onPage);
            this.listenTo(this.navigationInfo, 'navigation::compare::hide', this.setupStickyHeader);
            this.listenTo(this.navigationInfo, 'navigation::merge::hide', this.setupStickyHeader);
            // this.listenTo(this.navigationInfo, 'navigation::merge::show', this.destroyStickyHeader);
            // this.listenTo(this.navigationInfo, 'navigation::compare::show', this.destroyStickyHeader);

            this.statusPreconditions = Storage.getPreconditionMethodsStatus();

            this.inProgress = [];
            var self = this;
            if(_.isEmpty(this.navigationInfo.defectTypes.models)){
                this.navigationInfo.defectTypes.on('reset', _.bind(this.validateForLoad, this));
            }
            else {
                this.validateForLoad();
            }
        },

        validateForLoad: function () {
            if(this.type) {
                this.load();
            }
        },

        load: function (init, scrollTop) {
            // if (!scrollTop ||  scrollTop <= 0) {
            //     Sticker.clearSticker();
            // }

            var params = {
                url: this.url,
                reset: true,
                success: this.onDataLoad.bind(this),
                error: this.onDataLoadException.bind(this),
                data: this.navigationInfo.getRequestData()
            };

            if (typeof this.preLoad === 'function') {
                this.preLoad(params);
            }

            this.collection.fetch(params);
            this.gridScrollTop = scrollTop;
        },

        onPageCount: function () {
            this.navigationInfo.applyPageCount();
        },

        onPage: function (page, size) {
            this.navigationInfo.trigger('reset::counter');
            this.navigationInfo.applyPaging(page, size);
            this.load();
        },

        onDataLoad: function (collection) {
            if (!this.navigationInfo) return;
            // only if it is all-casesview- we need to group data by parents
            if (this.navigationInfo.isAllCases()) {
                this.isAllCases = true;
                var sortedByParents = _(collection.toJSON()).chain().sortBy(function (test) {
                    var keys = _.keys(test.path_names);
                    return test.path_names[keys[1]];
                }).sortBy(function (test) {
                    var keys = _.keys(test.path_names);
                    return test.path_names[keys[0]];
                }).value();
                // replace not grouped collection
                this.collection.reset(sortedByParents);
            } else {
                this.isAllCases = false;
            }
            // trigger toggleButtons in header
            this.navigationInfo.trigger("grid::data::loaded", {size: collection.length});

            this.render();

            this.checkForInProgress(collection);

            Util.hoverFullTime();
        },

        checkForInProgress: function (data) {
            this.clearTimer();
            if (this.navigationInfo.isLaunches()) {
                var self = this;
                _.forEach(data.models, function (item) {
                    if (item.get('status') === config.launchStatus.inProgress) {
                        self.inProgress.push(item.get('id'));
                    }
                });
                if (this.inProgress.length) {
                    this.startTimer();
                }
            }
        },

        startTimer: function () {
            var self = this;
            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                self.verifyStateChanges();
            }, config.launchVerifyDelay);
        },

        verifyStateChanges: function () {
            var self = this;
            Service.checkForStatusUpdate(this.inProgress)
                .done(function (result) {
                    if (!self.inProgress.length) {
                        self.clearTimer();
                        return;
                    }
                    self.renderApproximateTime();

                    var running = [];
                    _.forEach(result, function (value, key) {
                        if (value === config.launchStatus.inProgress) {
                            running.push(key);
                        }
                        else {
                            self.finishApproximateTime(key);
                        }
                    });
                    if (running.length) {
                        var difference = self.inProgress.length - running.length;
                        if (difference < 0) {
                            self.clearTimer();
                        } else {
                            if (difference > 0) {
                                self.navigationInfo.trigger('refresh::counter', difference, true);
                                self.inProgress = running;
                                self.difference = difference;
                            }
                            self.startTimer();
                        }
                    } else {
                        self.navigationInfo.trigger('refresh::counter', self.inProgress.length);
                        self.clearTimer();
                    }
                })
                .fail(function (error) {
                    self.clearTimer();
                });
        },

        clearTimer: function () {
            if (this.timer) {
                this.inProgress = [];
                clearTimeout(this.timer);
            }
        },

        onDataLoadException: function (collection, response) {
            response && Util.ajaxFailMessenger(response, 'gridData');
        },

        renderApproximateTime: function () {
            var inProgress = [];
            if(!_.isEmpty(this.inProgress)){
                _.each(this.inProgress, function(id) {
                    var item = this.collection.get(id)
                    item && inProgress.push(item.toJSON());
                }, this);
            }
            else {
                inProgress = this.getLaunchesInProgress();
            }
            if(!_.isEmpty(inProgress)){
                _.each(inProgress, function(item){
                    this.updateApproximateTime(item);
                }, this);
            }
        },

        getLaunchesInProgress: function () {
            return _.filter(this.collection.toJSON(), function(i){ return i.status === config.launchStatus.inProgress;});
        },

        finishApproximateTime: function (id) {
            var node = $('#approximate-' + id, this.$el);
            if(node.length){
                node.empty();
                node.closest('div').attr('title', Localization.launches.launchFinished);
            }
        },

        updateApproximateTime: function (item) {
            if(item.approximateDuration) {
                var node = $('#approximate-' + item.id, this.$el),
                    appTime = Math.round(item.approximateDuration),
                    time = Math.round((item.start_time + appTime - Moment().unix() * 1000) / 1000),
                    val = '';
                if (time > 0) {
                    val = time > 60 ? Localization.launches.approximateTimeLeft.replace('%%%', this.approximateTimeFormat(time)) : Localization.launches.approximateTimeLessMin;
                }
                else {
                    var end = this.approximateTimeFormat(Math.round(appTime / 1000)),
                        over = this.approximateTimeFormat(Math.abs(time));
                    node.closest('div').attr('title', [Localization.launches.approximateTimeExpected, ' ', end, ', ', Localization.launches.approximateTimeOverLap, ' ', over].join(''));
                }
                node.html(val);
            }
        },

        approximateTimeFormat: function (time) {
            var days = Math.floor(time / 86400),
                hours = Math.floor((time - (days * 86400)) / 3600),
                minutes = Math.floor((time - (days * 86400) - (hours * 3600)) / 60),
                seconds = time - (days * 86400) - (hours * 3600) - (minutes * 60),
                val = '';
            if (days > 0) {
                val = val + days + 'd ';
            }
            if (hours > 0) {
                val = val + hours + 'h ';
            }
            if (minutes > 0) {
                val = val + minutes + 'm';
            }
            if (val === '' && seconds > 0) {
                val = seconds + 's';
            } else if (val === '' && seconds === 0) {
                val = (Math.round((time) / 10)) / 100 + 's';
            }
            return val;
        },

        getTemplateData: function () {
            var that = this;
            var tabSufix = that.navigationInfo.getTabAsUrlString();

            return {
                navigationInfo: that.navigationInfo,
                collection: that.collection ? that.collection.toJSON() : [],
                root: that.root,
                util: Util,
                validateForPreconditions: that.validateForPreconditions,
                statusPreconditions: that.statusPreconditions,
                renderSorting: function (id) {
                    return Util.templates(that.sortingTpl, {
                        filter: that.navigationInfo.requestParameters.getSortInfo(),
                        currentId: id
                    });
                },

                renderStatics: function (type, item, shifted) {
                    return Util.templates(that.executionTpl, {
                        urlResolver: that.urlResolver,
                        item: item,
                        type: type,
                        shifted: shifted,
                        defectTypes: that.navigationInfo.defectTypes,
                        getDefectColor: that.getDefectColor,
                        tab: tabSufix
                    });
                },

                renderDuration: function (item) {
                    return Util.templates(that.durationTpl, {
                        item: item,
                        util: Util,
                        validator: that.navigationInfo.getValidator()
                    });
                },

                renderDefect: function (item) {
                    return Util.templates(that.defectTypeTpl, {
                        item: item,
                        defectTypes: this.navigationInfo.defectTypes,
                        textile: Textile
                    });
                },

                urlResolver: that.urlResolver,
                getTabUrl: function () {
                    return tabSufix;
                },

                tagSorter: function (tags) {
                    return _.sortBy(tags, function (t) {
                        return t.toUpperCase() === 'BUILD' || t.indexOf('uild') !== -1;
                    });
                },

                canEdit: that.canEdit,
                validator: that.navigationInfo.getValidator(),
                dataUrl: Urls.getFile(),
                isAllCases: that.isAllCases,
                isValidForParent: function (item, parentLine) {
                    if (_.isEmpty(parentLine) || !_.isEqual(item.path_names, parentLine)) {
                        parentLine = item.path_names;
                        return parentLine;
                    } else {
                        return false;
                    }
                },
                getSuitUrl: function (id) {
                    return that.navigationInfo.getUrlForSuit(id);
                }
            };
        },

        fixLogs: function () {
            var r = /\\u([\d\w]{4})/gi;

            $('.pre-view, .log-preview').each(function () {
                var stringArr = $(this).html()
                    .replace(/&lt;br&gt;/gi, '<br>')
                    .replace(/&lt;br &gt;/gi, '<br>')
                    .replace(/<br\/>/gi, '<br>')
                    .replace(/<br \/>/gi, '<br>')
                    .split('<br>');

                $(this).empty();
                var totalLength = stringArr.length;
                for (var i = 0; i < totalLength; i++) {
                    var messagePart = stringArr[i];
                    if (!!messagePart) {
                        messagePart = messagePart.replace(r, function (match, grp) {
                            return String.fromCharCode(parseInt(grp, 16));
                        });
                        messagePart = unescape(messagePart);
                        $(this).append($.trim(messagePart.replace(/<br>/gi, '').replace(/&lt;br&gt;/gi, '')) + (totalLength - 1 != i ? '<br>' : ''));
                    }
                }
            });
        },

        validateForPreconditions: function (item) {
            return item.type !== 'STEP' && item.type !== 'SUIT' && item.status !== 'FAILED';
        },

        togglePreconditionMethods: function (elem) {
            elem.preventDefault();

            var collapsed = $('div.method-collapsed', this.$el);

            if (this.statusPreconditions == 'show') {
                this.onSwitcher(collapsed);
            } else {
                this.offSwitcher(collapsed);
            }
            Storage.setPreconditionMethodsStatus(this.statusPreconditions);
            elem.stopPropagation();
        },

        setPreconditionMethods: function (status) {
            return true
        },

        updateStatusMethodCollapsed: function (collapsed, status) {
            collapsed.removeClass('method-collapsed-' + this.statusPreconditions);
            collapsed.addClass('method-collapsed-' + status);
            this.statusPreconditions = status;
        },

        onSwitcher: function (collapsed) {
            this.setPreconditionMethods('ON');
            this.updateStatusMethodCollapsed(collapsed, 'hide');

            $('#collapseMethodBtn .rp-switcher', this.$el).attr('title', Localization.launches[this.statusPreconditions + 'PreconditionMethods']);
            $('#collapseMethodBtn .rp-switcher input', this.$el).prop('checked', true);

            this.toggleCollapsedRows(this.statusPreconditions, true);
        },

        offSwitcher: function (collapsed) {
            this.setPreconditionMethods('OFF');
            this.updateStatusMethodCollapsed(collapsed, 'show');

            $('input.select-test', collapsed).prop('checked', false);

            $('div.row.rp-table-row', collapsed).removeClass('selected');

            $('#collapseMethodBtn .rp-switcher', this.$el).attr('title', Localization.launches[this.statusPreconditions + 'PreconditionMethods']);
            $('#collapseMethodBtn .rp-switcher input', this.$el).prop('checked', false);

            this.toggleCollapsedRows(this.statusPreconditions, true);
        },

        toggleCollapsedRows: function (status, fast) {
            var collapsedRows = $('div.method-collapsed', this.$el);
            var opacity = status === 'show' ? 0.5 : 1;
            var speed = fast ? 1 : 400;
            collapsedRows.stop().fadeTo(speed , opacity);
        },

        renderCollapseButtons: function () {
            $('#add-collapse-method', this.$el).append(Util.templates(
                this.collapsedButtonTpl,
                { statusPreconditions: this.statusPreconditions }
            ));

            var collapsedBtn = $('#collapseMethodBtn', this.$el);
            var self = this;

            collapsedBtn.on('mouseenter', function() {
                if (self.statusPreconditions == 'show') {
                    self.toggleCollapsedRows('show');
                }
            });

            collapsedBtn.on('mouseleave', function() {
                if (self.statusPreconditions == 'show') {
                    self.toggleCollapsedRows('hide');
                }
            });
        },

        gridScrollTop: 0,

        updateStartTime: function () {
            var launches = this.collection.toJSON();
            _.each(launches, function(launch){
                var row = $('#' + launch.id, this.$el),
                    now = $('span.from-now', row),
                    ext = $('span.exact-time', row),
                    start_format = Util.dateFormat(launch.start_time);
                now.html(Util.fromNowFormat(start_format));
                ext.html(start_format);
            }, this);
        },

        startUpdateStartTime: function () {
            var self = this;
            this.upStartTimer && clearTimeout(this.upStartTimer);
            this.upStartTimer = setTimeout(function () {
                self.updateStartTime();
                self.startUpdateStartTime();
            }, 60000);
        },

        clearUpdateStartTime: function () {
            this.upStartTimer && clearTimeout(this.upStartTimer);
        },

        render: function () {
            var that = this;
            if(!$('#compareGrid, #mergeGrid').length){
                this.$el.show();
            }
            this.$el.html(Util.templates(this.tpl, that.getTemplateData()));
            if (this.type !== 'test' && this.type !== 'log'){
                this.renderDefects();
            }
            if(this.type == 'test'){
                this.renderCollapseButtons();
            }
            this.renderApproximateTime();
            this.fixLogs();
            this.$el.addClass(Storage.getStartTimeMode() === 'exact' ? 'exact-driven' : '');
            this.$el.append("<div id='pagingHolder'></div>");
            this.paging && this.paging.destroy();
            this.paging = new Components.PagingToolbarConfigSave({
                el: $("#pagingHolder", this.$el),
                model: new Backbone.Model(this.collection.page),
                pageType: this.navigationInfo.getLevelGridType() === 'log' ? "objectsOnPageLogs" : "objectsOnPage"
            });
            this.paging.render();
            this.listenTo(this.paging, 'page', this.onPage);
            this.listenTo(this.paging, 'count', this.onPageCount);
            if(this.type == 'launch'){
                this.startUpdateStartTime();
            }
            else {
                this.clearUpdateStartTime();
            }
            if(this.type === 'log'){
                this.addTestItemsNav();
            }
            else {
                if($('#testItemsNav').is(':visible')){
                    this.navigationInfo.trigger('grid::testitems::loaded','hide');
                }
            }

            $('.collapseLogs')
                .on('shown.bs.collapse', function () {
                    that.fixLogs();
                })
                .on('hidden.bs.collapse', function () {
                    that.fixLogs();
                })
                .on('show.bs.collapse', function () {
                    that.fixLogs();
                })
                .on('hide.bs.collapse', function () {
                    that.fixLogs();
                });

            if (!this.gridScrollTop || this.gridScrollTop <=0) {
                this.scrollToOrigin(this.navigationInfo.scrollToDestinationId);
            }
            this.navigationInfo.scrollToDestinationId = this.navigationInfo.last().get("id").replace("all-cases-for-", '');

            if (typeof this.postRender === "function") {
                this.postRender();
            }
            //setup scroll analyzer by grid type
            this.setupStickyHeader();

            $('.badge').on('show.bs.tooltip', function() {
                $('.tooltip').not(this).hide();
            });
            //  this.gridScrollTop             undefined
            // $('body').getNiceScroll(0).doScrollTop(this.gridScrollTop, 0);

            for (var dl = 0; dl < config.deletingLaunches.length; dl ++) {
                Util.showOverlay('.rp-table-row[data-id='+ config.deletingLaunches[dl] +']');
            }
            $('.nicescroll-it, .shifted', this.$el).each(function(){
                var heightRoot = $(this).height();
                if (heightRoot > 300) {
                    heightRoot = 300;
                    var scrollElem = Util.setupBaronScroll($(this));
                    var scrollRoot = scrollElem.parent('.baron__root');
                    scrollRoot.height(heightRoot);
                }
            });

            return this;
        },

        setupStickyHeader: function () {
           // if (!this.navigationInfo.isLog()) {
           //      Sticker.setupSticker([$("#headerBar"), $(".fixed_table_header:first")], 0)
           // };
            this.destroyStickyHeader();
            this.stickyHeader = new StickyHeader({fixedBlock: $("#headerBar"), topMargin: 0});
            this.stickyTable = new StickyHeader({fixedBlock: $(".fixed_table_header:first", this.$el), topMargin: 47});
        },

        destroyStickyHeader: function () {
            if (this.stickyHeader) {
                this.stickyHeader.destroy();
            }
            if (this.stickyTable) {
                this.stickyTable.destroy();
            }
        },

        events: {
            'click .sortable': 'applySort',
            'click .navigateable': 'pushCurrentItemToTheNavigation',
            'click a.cases-view': 'pushCurrentItemToTheNavigation',
            'click .show-time': 'toggleStartTimeView',
            'click .tag': 'applyTag',
            'click .launch-mode-switch': 'switchLaunchMode',
            'click .item-menu:not(.rendered)': 'renderItemMenu',
            'click .edit-item': 'showEdit',
            'click .delete-item': 'showDeleteModal',
            'click .start-analyze': 'startAnalyzeAction',
            'click .match-issues': 'startAnalyzeAction',
            'click .force-finish': 'stopLaunch',
            'click .rp-export-btn-group a': 'exportLaunch',
            'mouseenter .pr-grid-defect-stats': 'showDefectTooltip',
            'click [data-toggle-switch]': 'togglePreconditionMethods'
        },

        renderDefects: function () {
            var collection = this.collection ? this.collection.toJSON() : [];

            _.each(collection, function(launch){
                var row = $('#'+launch.id, this.$el),
                    defectCell = $('.pr-grid-defect-stats', row),
                    defects = launch.statistics.defects;
                _.each(defectCell, function(cell){
                    var el = $(cell),
                        type = el.data('defectType'),
                        defect = defects[type],
                        id = 'defect-'+launch.id+'-'+type;
                    this.drawPieChart(defect, id);
                }, this);
            }, this);
        },

        getDefectChartData: function (defect) {
            var data = [];
            _.each(defect, function(v, k){
                if(k !== 'total'){
                    var defects = this.navigationInfo.defectTypes,
                        customDefect = defects.getDefectType(k);
                    if(customDefect){
                        data.push({color: customDefect.color, key: customDefect.longName, value: parseInt(v)});
                    }
                }
            }, this);
            return data;
        },

        showDefectTooltip: function (e) {
            var el = $(e.currentTarget),
                type = el.data('defectType');
            if(!el.data('tooltip')){
                el.data('tooltip', 'tooltip');
                this.createDefectTooltip(el, type);
            }
        },

        exportLaunch: function (e) {
            var el = $(e.currentTarget);
            if(el.hasClass('disabled')){
                return false;
            }
        },

        createDefectTooltip: function (el, type) {
            var launchId = el.closest('.row.rp-table-row').data('id'),
                content = this.renderDefectsTooltip(launchId, type);
            el.append(content);
        },

        toolTipContent: 'tpl-launches-tooltip-defects',

        renderDefectsTooltip: function (launchId, type) {
            var launch = this.collection.get(launchId),
                stats = launch.get('statistics'),
                defect = stats.defects[type],
                params = {
                    total: defect.total,
                    defects: [],
                    type: type,
                    item: launch.toJSON(),
                    noSubDefects: !this.navigationInfo.defectTypes.checkForSubDefects(),
                    tab: this.navigationInfo.getTabAsUrlString(),
                    color: this.getDefectColor(defect, type, this.navigationInfo.defectTypes),
                    urlResolver: this.urlResolver
                };
            _.each(defect, function(v, k){
                if(k !== 'total'){
                    var defects = this.navigationInfo.defectTypes,
                        issueType = defects.getDefectType(k);
                    if(issueType){
                        issueType.val = parseInt(v);
                        params.defects.push(issueType);
                    }
                }
            }, this);
            params.defects.sort(Util.sortSubDefects);
            return Util.templates(this.toolTipContent, params);
        },

        getDefectColor: function (defect, type, defects) {
            var sd = config.patterns.defectsLocator,
                defectType = _.findKey(defect, function(v, k){
                    return sd.test(k);
                });
            if(defectType){
                var issueType = defects.getDefectType(defectType);
                if(issueType){
                    return issueType.color;
                }
            }
            return Util.getDefaultColor(type);
        },

        drawPieChart: function (defect, id) {
            var chart,
                pieWidth = 48,
                pieHeight = 48,
                data = this.getDefectChartData(defect);

            chart = nvd3.models.pie()
                .x(function(d) {
                    return d.key;
                })
                .y(function(d) {
                    return d.value;
                })
                .width(pieWidth)
                .height(pieHeight)
                .showLabels(false)
                .donut(true)
                .growOnHover(false)
                .donutRatio(0.40)
                .startAngle(function(d){
                    return d.startAngle - Math.PI/2;
                })
                .endAngle(function(d){
                    return d.endAngle - Math.PI/2;
                })
                .color(function (d) {
                    return d.data.color;
                })
                .valueFormat(d3.format('f'))
            ;

            d3.select('#' + id + ' svg')
                .datum([data])
                .call(chart)
            ;
            return chart;
        },

        renderItemMenu: function (e) {
            var $link = $(e.currentTarget),
                item = this.collection.get($link.data('id')).toJSON(),
                menuData = {
                    item: item,
                    isLaunchInProgress: this.launchInProgress(item),
                    canEdit: this.canEdit(item),
                    canDeleteLaunch: this.canDeleteLaunch(item),
                    util: Util,
                };

            if (this.navigationInfo.isLaunches()) {
                _.extend(menuData, {
                    validator: this.navigationInfo.getValidator(),
                    isCustomer: Util.isCustomer(),
                    isDebug: this.navigationInfo.isDebug(),
                    canMatchIssues: Util.canStartMatchIssues(item),
                    getExportUrl: Urls.exportLaunchUrl,
                    exportFormats: ['pdf', 'xls', /*'xml',*/ 'html']
                });
            }
            _.extend(menuData, {
                validator: this.navigationInfo.getValidator()
            });

            $link
                .after(Util.templates(this.itemMenuTpl, menuData))
                .addClass('rendered')
                .dropdown();
        },

        canDeleteLaunch: function (item) {
            var user = config.userModel.toJSON(),
                projectRole = user.projects[config.project.projectId].projectRole,
                roleIndex = config.projectRoles.indexOf(projectRole);
            return Util.isAdmin(user)
                || roleIndex > 1
                || item.owner === user.user_login
                || this.navigationInfo.isLaunchOwner();
        },

        canEdit: function (item) {
            var isOwner = this.navigationInfo.isLaunches()
                ? config.userModel.get('name') === item.owner
                : this.navigationInfo.isLaunchOwner();
            return isOwner || Util.isInPrivilegedGroup();
        },

        launchInProgress: function (item) {
            var progress = false;
            if(item.launchId){
                var launch = _.find(this.navigationInfo.models, function(m){
                    var data = m.get('data');
                    return data ? data.id === item.launchId : false;
                });
                if(launch){
                    var launchData = launch.get('data');
                    if(launchData){
                        progress = launchData.status === config.launchStatus.inProgress;
                    }
                }
            }
            return progress;
        },

        startAnalyzeAction: function (e) {
            e.preventDefault();
            var self = this,
                el = $(e.currentTarget),
                id = el.data('id'),
                type = el.data('type') === "analyze" ? "startLaunchAnalyze" : "startLaunchMatch";
            if (!el.hasClass('disabled')) {
                el.closest('.name-cell').find('.autoanalyze:first').show();

                _.forEach(el.closest('.dropdown-menu').find('.start-analyze, .match-issues'), function (link) {
                    var $link = $(link);
                    $link.addClass('disabled');
                    $link.parent().addClass('disabled');
                });

                this.collection.get(id).set('isProcessing', true);
                self.navigationInfo.trackForLaunchProcessing(Service[type](id), id);
            }
            else {
                e.stopPropagation();
            }
        },

        stopLaunch: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget),
                id = $el.data('id');
            if (!$el.hasClass('disabled')) {
                var that = this;
                if (!this.warningDialog) {
                    this.warningDialog = {};
                }
                this.warningDialog['editDialog'] = Util.getDialog({
                    name: this.forceFinishTpl,
                    data: {name: $el.data('name')}
                });
                this.warningDialog['submitButton'] = $(".rp-btn-danger", this.editDialog);

                this.warningDialog.editDialog.on('click', ".rp-btn-danger", function (e) {
                        Service.finishLaunch(id)
                            .done(function () {
                                Util.ajaxSuccessMessenger("finishLaunch");
                                that.load();
                                if (that.inProgress.length) {
                                    var before = that.inProgress.length;
                                    that.inProgress = _.reject(that.inProgress, function (v) {
                                        return v === id;
                                    });

                                    if ((before - that.inProgress.length) > 0) {
                                        that.navigationInfo.trigger('refresh::counter', before - that.inProgress.length);
                                    } else {
                                        that.navigationInfo.trigger('refresh::counter', that.inProgress.length);
                                    }
                                } else {
                                    that.navigationInfo.trigger('reset::counter');
                                }
                            })
                            .fail(function (error) {
                                Util.ajaxFailMessenger(error, "finishLaunch");
                            });
                        that.warningDialog.editDialog.modal("hide");
                    })
                    .on('change', "#deleteConfirm", function (e) {
                        that.warningDialog.submitButton.prop('disabled', !$(this).is(':checked'));
                    })
                    .on('hidden.bs.modal', function () {
                        $(this).data('modal', null);
                        that.warningDialog.submitButton = null;
                        that.warningDialog.editDialog.remove();
                    });
                this.warningDialog.editDialog.modal("show");
            }
            else {
                e.stopPropagation();
            }
        },

        showEdit: function (e) {
            e.preventDefault();
            var el = $(e.currentTarget);
            if(!el.hasClass('disabled')){
                var editorType = this.navigationInfo.isLaunches() ? 'LaunchEditor' : 'ItemEditor';
                this.itemEditor = null;
                this.itemEditor = new Editor[editorType]({
                    item: this.collection.get($(e.currentTarget).data('id')).toJSON(),
                    eventBus: this.navigationInfo
                }).render();
            }
            else {
                e.stopPropagation();
            }
        },

        showDeleteModal: function (e) {
            e.preventDefault();
            var $el = $(e.currentTarget),
                id = $el.data('id'),
                self = this;

            if (!$el.hasClass('disabled')) {
                var typeItems = (this.navigationInfo.isLaunches()) ? Localization.ui.launch : Localization.ui.item;

                var modal = new ModalConfirm({
                    headerText: Localization.ui.delete + ' ' + typeItems,
                    bodyText: Util.replaceTemplate(Localization.dialog.msgDeleteItems, typeItems,typeItems + ' \'' + $el.data('name').bold() + '\''),
                    confirmText: Util.replaceTemplate(Localization.launches.deleteAgree, typeItems +  ' \'' + $el.data('name') + '\''),
                    cancelButtonText: Localization.ui.cancel,
                    okButtonText: Localization.ui.delete,
                });

                modal.show().done(function () {
                    return self.deleteLaunch(id);
                });
            }
            else {
                e.stopPropagation();
            }
        },

        deleteLaunch: function (id) {
            var self = this,
                type = this.navigationInfo.isLaunches() ? 'deleteLaunch' : 'deleteTestItem';
            Util.showOverlay('.rp-table-row[data-id='+ id +']');
            config.deletingLaunches.push(id);
            (function(id) {
                Service[type](id)
                    .done(function (response) {
                        self.navigationInfo && self.navigationInfo.trigger('navigation::reload::table', {});
                        Util.ajaxSuccessMessenger(type);
                        config.deletingLaunches = _.without(config.deletingLaunches, id);
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error);
                        Util.hideOverlay('.rp-table-row[data-id='+ id +']');
                        config.deletingLaunches = _.without(config.deletingLaunches, id);
                    });
            })(id);
        },

        switchLaunchMode: function (e) {
            e.preventDefault();
            var elm = $(e.currentTarget);
            if (!elm.hasClass('disabled')) {
                    var id = elm.closest('div.rp-table-row').attr('data-id'),
                    data = {},
                    launch = this.collection.get(id),
                    self = this;

                data.mode = (launch.get('mode') == 'DEBUG') ? 'DEFAULT' : 'DEBUG';
                Service.updateLaunch(data, id)
                    .done(function (response) {
                        self.navigationInfo.trigger('navigation::reload::table', {});
                        Util.ajaxSuccessMessenger((data.mode == 'DEBUG') ? 'switchToDebug' : 'switchToAllLaunches');
                        var reportAction = (data.mode === 'DEBUG') ? 'debugOn' : 'debugOff';

                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error);
                    });
            }
        },

        applySort: function (e) {
            var $el = $(e.currentTarget),
                dataIndex = $el.data('sorter'),
                sortInfo = this.navigationInfo.requestParameters.getSortInfo(),
                direction = (sortInfo.dataIndex === dataIndex && sortInfo.direction === 'ASC') ? 'DESC' : 'ASC';
            this.navigationInfo.applySorting(dataIndex, direction);
            this.onPage(1);
        },

        applyTag: function (e) {
            var $target = $(e.currentTarget);

            e.preventDefault();
            this.navigationInfo.trigger("apply::tag::filter", $target.data('tag'), $target.data('tag-type'));
        },

        pushCurrentItemToTheNavigation: function (e) {
            var $el = $(e.currentTarget);
            this.navigationInfo.scrollToDestinationId = $el.data('id');
            if (!$el.hasClass('cases-view')) {
                this.reportLogViewToTracker($el);
            } else {
                this.reportAllCasesToTracker($el);
            }
        },

        reportAllCasesToTracker: function (el) {
            if (this.navigationInfo.isLaunches()) {
                var type = el.attr('href').match(/\$issue_type=([^<]+)\&filter.eq./),
                    status = el.attr('href').match(/\&filter.in.status=([^<]+)\&filter.in.type/),
                    result = type ? type[1]
                        : status ? status[1] : 'TOTAL';

            }
        },

        reportLogViewToTracker: function (el) {
            var href = el.attr('href');

        },

        toggleStartTimeView: function () {
            this.$el.toggleClass('exact-driven');
            var mode = this.$el.hasClass('exact-driven') ? 'exact' : '';
            Storage.setStartTimeMode(mode);
        },

        scrollToOrigin: function (id) {
            Util.scrollToHighlight(id, true);
        },

        destroy: function () {
            // Sticker.clearSticker();
            if(this.stickyHeader) { this.stickyHeader.destroy() }
            if(this.stickyTable) { this.stickyTable.destroy() }
            $('.pr-grid-defect-stats', this.$el).popover('destroy');
            this.paging && this.paging.destroy();
            this.paging = null;
            this.navigationInfo.defectTypes.off('reset');
            this.clearTimer();
            this.clearUpdateStartTime();
            if (this.$editor) {
                this.$editor.destroy();
            }
            this.navigationInfo = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var StateDecorator = function (instance) {
        var decorator = null;
        switch (instance.type) {
            case 'test':
                decorator = TestGrid;
                break;
            case 'log':
                decorator = LogGrid;
                break;
            default :
                decorator = {events: {}};
                break;
        }
        _.defaults(instance, decorator);
        _.extend(instance.events, decorator.events);
        if (_.isFunction(decorator.destroy)) instance.destroy = decorator.destroy;
    };

    var TestGrid = {
        events: {
            'click .select-all': 'selectAll',
            'click .select-test': 'selectTest',
            'click .defect-type': 'editDefect',
            'click .navigateable': 'reportLogOpenIfValid',
            'click [data-js-event="removeTicket"]': 'removeTicket',
            'click .defect-type .rp-blue-link-undrl': 'preventPropagation',
            'click .external-ticket': 'preventPropagation'
        },

        reportLogOpenIfValid: function (e) {
            this.reportLogViewToTracker($(e.currentTarget));
        },

        preventPropagation: function (e) {
            e.stopImmediatePropagation();
        },

        selectAll: function (e) {
            e.stopImmediatePropagation();
            var action = $(e.currentTarget).is(':checked');
            this.handleRows(action);
            this.navigationInfo.trigger("all::edited", this.getSelectedItems());
            !action && this.removeEditor();
        },

        handleRows: function (action) {
            var isUndefide = (action === undefined);
            if (isUndefide) {
                $(".select-all:first", this.$el).prop('checked', false);
            }
            action = isUndefide ? false : action;
            var classAction = action ? 'add' : 'remove';
            _.each($(".select-test", this.$el), function(item){
                if(!$(item).is(':disabled') && !$(item).closest('div.method-collapsed-hide').length){
                    $(item).prop('checked', action).closest('.rp-table-row')[classAction + 'Class']('selected');
                }
            });
        },

        selectTest: function (e) {
            e.stopImmediatePropagation();
            var checkBox = $(e.currentTarget),
                status = checkBox.is(':checked'),
                notInEditMode = $(e.currentTarget).closest(".rp-table-row").find('.defect-type').is(':visible');

            checkBox.closest('.rp-table-row').toggleClass('selected');
            if (notInEditMode) {
                if (status) {
                    var item = this.collection.get(checkBox.data('id')).toJSON();
                    this.navigationInfo.trigger("increase::edited", item);
                } else {
                    this.navigationInfo.trigger("decrease::edited", checkBox.data('id'));
                }
            } else {
                this.removeEditor();
            }
        },

        $editor: null,

        setupEditor: function (origin, item, items) {
            this.removeEditor();
            this.$editor = new DefectEditor.Editor({
                element: $("<div class='col-sm-12 editor-row'/>").appendTo(origin.closest('.rp-table-row')),
                origin: origin,
                item: item,
                items: items,
                navigationInfo: this.navigationInfo,
                defectCallBack: 'navigation::reload::table'
            }).render();
        },

        removeEditor: function () {
            if (this.$editor) {
                this.$editor.destroy();
                this.$editor = null;
            }
        },

        editDefect: function (e) {
            var that = this,
                $el = $(e.currentTarget),
                id = $el.data('id'),
                item = this.collection.get(id).toJSON(),
                $row = $el.closest(".rp-table-row");
            if(!this.navigationInfo.launchIsProcessing(item)){
                $row.addClass('selected').find('.select-test').prop('checked', true);
                var items = that.getSelectedItems();
                this.setupEditor($el, item, items);
            }
        },

        getSelectedItems: function () {
            var items = {},
                that = this;
            _.forEach($(".select-test:checked", that.$el), function (box) {
                var id = $(box).data('id');
                items[id] = that.collection.get(id).toJSON();
            });
            return items;
        },

        postRender: function () {
            this.$el.tooltip('destroy');
            this.$el.tooltip({selector: '[data-toggle="tooltip"]', html: true});
            DefectEditor.TicketManager.attachListener(this.$el);
            this.listenTo(this.navigationInfo, 'deselect::rows', this.handleRows);
            // _.forEach($(".tickets-container", this.$el), function (container) {
            //     var $container = $(container);
            //     if ($container.height() > 320) {
            //         $container.addClass('nicely-scrollable');
            //         Util.setupNiceScroll($container);
            //     }
            // });
        },

        removeTicket: function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            var el = $(e.currentTarget),
                def = el.closest('div.defect-type '),
                disabled = def.hasClass('disabled') || def.parent().hasClass('disabled');
            if(!disabled){
                var badge = el.closest('.badge'),
                    row = badge.closest('.rp-table-row'),
                    item = this.collection.get(badge.closest('.tickets-container').data('id'));

                DefectEditor.removeTicket(badge, item.toJSON(), row);
            }
        }
    };

    var LogGrid = {
        openGallery: function (e) {
            e.preventDefault();
            this.navigationInfo.trigger("open::gallery::at::index", $(e.currentTarget).data('slide-index'));

        },

        addTestItemsNav: function () {
            this.testItems = new Components.GridsStore();
            this.testItemsUrl = Urls.getGridUrl('test', this.navigationInfo.isDebug());
            this.getTestItems();
        },

        getTestItems: function (type, page) {
            var params = {
                url: this.testItemsUrl,
                merge: true,
                success: this.onLoadTestItems.bind(this, type),
                error: this.onLoadTestItemsError.bind(this),
                data: this.getTestItemsRequestData(page)
            };
            this.testItems.fetch(params);
        },

        // TODO
        // https://localhost:8443/reportportal-ws/#default_project/launches/all/56d599b9bfcd0b0a8de703d0/56d599b9bfcd0b0a8de703d2/56d599b9bfcd0b0a8de703d4?page.page=2&page.sort=start_time,ASC&page.size=5&tab.id=allCases/log-for-56d599babfcd0b0a8de703ea

        updateTestItemsNav: function () {
            var prevBtn = $('#testItemsNav a').eq(0),
                nextBtn = $('#testItemsNav a').eq(1),
                prevUrl = this.getTestItemLink(this.testItems.prev),
                nextUrl = this.getTestItemLink(this.testItems.next);
            if(prevUrl){
                prevBtn.attr('href', prevUrl).removeClass('disabled');
            }
            else {
                prevBtn.attr('href', '').addClass('disabled');
            }
            if(nextUrl){
                nextBtn.attr('href', nextUrl).removeClass('disabled');

            }
            else {
                nextBtn.attr('href', '').addClass('disabled');
            }
            this.navigationInfo.trigger('grid::testitems::loaded','show');
        },

        getTestItemLink: function (item) {
            var url  = window.document.location.hash,
                uArr = _.initial(url.split('/')),
                last = _.last(uArr).split('?'),
                newUrl = '/log-for-',
                url = null;
            if(item && item.item) {
                this.testItems.requestParameters.setPage(item.page.number);
                uArr[uArr.length - 1] = last[0] + '?' + this.testItems.requestParameters.toURLSting();
                url = uArr.join('/') + newUrl + item.item.id;
            }
            return url;
        },

        getTestItemByIndex: function (type, collection, index) {
            var item = null;
            while (!item && index >= 0 && index < this.testItems.length) {
                if (this.statusPreconditions == 'hide') {
                    var tst = collection.at(index);
                    if (tst && !this.validateForPreconditions(tst.toJSON())) {
                        item = tst;
                    }
                }
                else {
                    item = collection.at(index);
                }
                index = type == 'next' ? index + 1 : index - 1;
            }
            return item;
        },

        onLoadTestItems: function (type, collection) {
            var id = this.navigationInfo.last().get('id').replace('log-for-', ''),
                index = _.findIndex(this.testItems.models, function(i){return i.id == id}, this),
                next = null,
                prev = null;
            if(!type){
                next = this.getTestItemByIndex('next', collection, index+1);
                prev = this.getTestItemByIndex('prev', collection, index-1);
                this.testItems.prev = {item: prev, page: collection.page};
                this.testItems.next = {item: next, page: collection.page};
                this.updateTestItemsNav();
                if(!prev && collection.page.number !== 1){
                    this.getTestItems('prev', +collection.page.number - 1);
                }
                if(!next && collection.page.number < collection.page.totalPages) {
                    this.getTestItems('next', +collection.page.number + 1);
                }
            }
            else {
                if(type == 'next'){
                    next = this.getTestItemByIndex('next', collection, 0);
                    this.testItems.next = {item: next, page: collection.page};
                    if(!next && collection.page.number < collection.page.totalPages) {
                        this.getTestItems('next', +collection.page.number + 1);
                    }

                }
                else if(type == 'prev'){
                    prev = this.getTestItemByIndex('prev', collection, +collection.page.size-1);
                    this.testItems.prev = {item: prev, page: collection.page};
                    if(!prev && collection.page.number !== 1){
                        this.getTestItems('prev', +collection.page.number - 1);
                    }
                }
                this.updateTestItemsNav();
            }
        },

        onLoadTestItemsError: function (error) {
            Util.ajaxFailMessenger(error);
        },

        getTestItemsRequestData: function (page) {
            var defaults = {},
                last = _.last(_.initial(this.navigationInfo.models), this),
                DefaultRequestParams = Util.getDefaultRequestParams(),
                id = last.get('id');

            this.testItems.requestParameters = new Components.RequestParameters({});
            if (last && last.get('params')) {
                this.testItems.requestParameters.apply(last.get('params'));
            }
            if(page){
                this.testItems.requestParameters.setPage(page);
            }
            if (id.indexOf('all-cases-') === 0) {
                var params = this.testItems.requestParameters.toJSON(),
                    isExecution = this.navigationInfo.isExecutionStatistics(params),
                    targetId = id.replace('all-cases-for-', ''),
                    targetSet = DefaultRequestParams.allcases(isExecution, targetId, this.navigationInfo.length-1);
                return _.extend(targetSet, params);
            }
            defaults = DefaultRequestParams.test();
            defaults['filter.eq.parent'] = id;
            if (_.isEmpty(this.testItems.requestParameters.getSortInfo())) {
                var sorting = DefaultRequestParams.test();
                if (sorting) {
                    var split = sorting['page.sort'].split(',');
                    this.testItems.requestParameters.setSortInfo(split[0], split[1]);
                }
            }
            return _.extend(defaults, this.testItems.requestParameters.toJSON());
        },

        testItemNavTpl: 'tpl-logs-test-nav',

        postRender: function () {
            // activate image lazy loading
            // $("#gridWrapper .lazy", this.$el).lazyload({threshold: 150});
            if (this.logPanel) {
                this.logPanel.update(this.collection);
            }
        },

        preLoad: function (params) {
            // check if it is the logs level with history activated and if so - replace original log-for- id
            if (params.data['log.state.history']) {
                params.data['filter.eq.item'] = params.data['log.state.history'];
            }

            if (!this.logPanel) {
                this.$infoHolder.off().empty();
                this.logPanel = new Log.LogPanel({
                    navigationInfo: this.navigationInfo,
                    element: this.$infoHolder,
                    user: config.userModel,
                    project: config.project
                }).render();
            }
        },

        events: {
            'click .thumbnail.image': 'openGallery'
        },

        destroy: function () {
            this.logPanel && this.logPanel.destroy();
            this.logPanel = null;
            this.$infoHolder.off().empty();
            GridByType.prototype.destroy.call(this);
        }
    };

    var HistoryGrid = Components.BaseView.extend({
        initialize: function (options) {
            this.$el = options.element;
            this.navigationInfo = options.navigationInfo;
            this.urlResolver = options.urlResolver;
            this.depth = 0;
            this.toLoad = [];
            this.qty = config.historyItemsToLoad;
            this.ids = this.navigationInfo.getFilter('ids').value.split(',');
            this.tabId = this.navigationInfo.extractTabId();
            this.path = options.path;
            this.loaded = 0;
            this.launches = [];
            this.load(this.loaded);
        },

        tpl: 'tpl-launch-history-grid',
        loadButton: 'tpl-launch-history-load-more',
        toolTipTpl: 'tpl-launches-tooltip',
        defectsTipContent: 'tpl-launches-tooltip-defects',

        events: {
            'click .btn-block': 'loadNext',
            'click .goToItem': 'redirectToItem',
            'mouseenter [data-tooltip-type]': 'showTooltip'
        },

        load: function (increment, scrollTop) {
            this.validateForReset(this.navigationInfo.getFilter('history_depth').value, increment);
            this.toLoad = this.ids.slice(this.loaded, this.loaded + this.qty);
            Service.getHistoryData(this.toLoad, this.depth)
                .done(function (response) {
                    this.assignHistory(response);
                    this.loaded += this.toLoad.length;
                    if (this.$el) {
                        this.render();
                        config.mainScrollElement.scrollTop(scrollTop);
                        // $('body').getNiceScroll(0).doScrollTop(scrollTop, 0);
                    }
                    this.navigationInfo.trigger("grid::data::loaded", {size: 1});
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'loadHistory');
                });
        },

        validateForReset: function (newDepth, increment) {
            if (!this.depth || !increment) {
                this.loaded = 0;
                this.depth = newDepth;
                this.launches = [];
            }
        },

        assignHistory: function (items) {
            items.sort(function(a, b){ return parseInt(a.startTime) - parseInt(b.startTime); });
            if(!_.isEmpty(this.launches)) {
                this.mergeLaunches(items)
            }
            else {
                this.launches = items;
            }
        },

        mergeLaunches: function(items){
            _.each(items, function(i){
                var launchId = i.launchId,
                    launch = _.find(this.launches, function(l){ return l.launchId === launchId});
                if(launch){
                    launch.resources = launch.resources.concat(i.resources);
                }
                else {
                    this.launches.push(i);
                }
            }, this);
        },

        loadNext: function (e) {
            e.preventDefault();
            $(e.target).css('visibility', 'hidden');
            $('div.loader', this.$el).show();
            this.load(this.loaded);
        },

        redirectToItem: function (e) {
            var el = $(e.currentTarget),
                itemId = el.data('itemId'),
                router = config.router,
                self = this;
            Service.getTestItemsInfo([itemId])
                .done(function(data){
                    var link = self.getItemLink(data);
                    router.navigate(link, {trigger: true});
                })
                .fail(function(error){
                    Util.ajaxFailMessenger(error, 'getItemInfo');
                });
        },

        showTooltip: function (e) {
            var el = $(e.currentTarget),
                type = el.data('tooltipType');
            if(!el.data('tooltip')){
                el.data('tooltip', 'tooltip');
                this.createTooltip(el, type);
            }
        },

        createTooltip: function (el, type) {
            var itemId = el.closest('.history-col').data('item-id'),
                launchID = el.closest('.history-col').data('launch-id'),
                item = this.getItem(launchID, itemId),
                content = '';
            if(type == 'warning') {
                content = this.renderToolTip(el.data('tooltip-content'));
            }
            else {
                content = this.renderDefectsTooltip(type, item)
            }
            el.append(content);
        },

        renderToolTip: function (message) {
            return Util.templates(this.toolTipTpl, {message: message})
        },

        renderDefectsTooltip: function (type, item) {
            return Util.templates(this.defectsTipContent, _.extend(this.getDefects(item, type), {
                    item: item,
                    noTotalLink: true,
                    tab: this.navigationInfo.getTabAsUrlString(),
                    noSubDefects: !this.navigationInfo.defectTypes.checkForSubDefects(),
                    urlResolver: this.urlResolver
                }));
        },

        getItemLink: function (data) {
            var item = data[0],
                path = [item.launchId].concat(_.keys(item.path_names), ['log-for-' + item.id]),
                link = '#' +config.project.projectId + '/launches/all/' + path.join('/');
            return link;
        },

        getItem: function (launchId, itemId) {
            var launch = _.find(this.launches, function(d){
                return d.launchId == launchId;
            });
            if(launch){
                return _.find(launch.resources, function(d){
                    return d.id == itemId;
                });
            }
            return null;
        },

        getDefects: function (item, type) {
            var defects = item.statistics.defects,
                defect = defects[type],
                def = {defects: []},
                sd = config.patterns.defectsLocator,
                total = 0,
                color = '';
            _.each(defect, function(val, key){
                if(key !== 'total'){
                    var defects = this.navigationInfo.defectTypes,
                    issueType = defects.getDefectType(key);
                    if (parseInt(val) !== 0) {
                        if(issueType){
                            issueType.val = parseInt(val);
                            def.defects.push(issueType);
                        }
                    }
                    if(sd.test(key) && issueType){
                        color = issueType.color;
                    }
                }
                else {
                    total = parseInt(val)
                }
            }, this);
            def.defects.sort(Util.sortSubDefects);
            def.color = color || Util.getDefaultColor(type);
            def.type = type;
            def.total = total;
            return def;
        },

        getHistoryItems: function () {
            var names = [];
            _.forEach(this.launches, function (val) {
                var key = val.launchNumber;
                _.forEach(val.resources, function (item) {
                    var ooo = {
                            name: item.name, description: item.description, tags: item.tags, launches: {}
                        };
                    ooo.launches[key] = [item];

                    if (_.isEmpty(names)) {
                        names.push(ooo);
                    } else {
                        var oneName = _.find(names, function (obj) {
                            var name = obj.name === item.name,
                                descr = obj.description === item.description,
                                tags = _.size(obj.tags) === _.size(item.tags) && _.every(obj.tags, function(i){return _.contains(item.tags, i)});
                            return (name && descr && tags);
                        });
                        if (!oneName) {
                            names.push(ooo);
                        } else {
                            if (oneName.launches[key]) {
                                oneName.launches[key].push(item);
                            } else {
                                oneName.launches[key] = [item];
                            }
                        }
                    }
                });
            });
            return names;
        },

        getCls: function (item) {
            var cls = '',
                defects = item.statistics.defects,
                isDefects = !_.isEmpty(defects) && !_.every(defects, function (defect) {
                        return defect == 0
                    }),
                isPassed = (item.status == "PASSED") ? true : false,
                isFailed = (item.status == "FAILED") ? true : false,
                isReseted = (item.status == "RESETED" || item.status == "INTERRUPTED") ? true : false,
                isSkipped = (item.status == "SKIPPED") ? true : false,
                isInProgress = (item.status == 'IN_PROGRESS') ? true : false;
            if (isPassed) {
                cls = 'rp-pass';
            } else if (isSkipped) {
                cls = 'rp-skip';
            } else if (isReseted) {
                cls = 'rp-reseted';
            } else if(isInProgress){
                cls = 'rp-inprogress progress-striped';
            } else if (isFailed || isDefects) {
                cls = 'rp-fail';
            }
            return cls;
        },

        getIssuesByType: function (item, defects) {
            var issues = item.statistics.defects,
                deff = {},
                isDefects = !_.isEmpty(issues) && !_.every(issues, function (defect) {
                        return defect == 0;
                    });
            if (isDefects) {
                _.each(issues, function (val, defect) {
                    if(val.total != 0){
                        var sd = config.patterns.defectsLocator,
                            defectType = _.findKey(val, function(v, k){
                                return sd.test(k);
                            });
                        if(defectType){
                            var issueType = defects.getDefectType(defectType);
                            if(issueType){
                                deff[defect] = {
                                    shortName: issueType.shortName,
                                    fullName: issueType.longName,
                                    color: issueType.color || Util.getDefaultColor(defect),
                                    cls: Util.getDefectCls(defect)
                                };
                            }
                        }
                    }
                });
                return deff;
            }
            return false;
        },

        getTickets: function (tickets) {
            var ids = _.map(tickets, function(t){ return t.ticketId; })
            return ids.join(', ');
        },

        getComment: function (comment) {
            return Textile(comment.setMaxLength(256)).escapeScript();
        },

        render: function () {
            var launches = _.map(this.launches, function(launch){
                return {launchNumber: launch.launchNumber, launchStatus: launch.launchStatus, launchId: launch.launchId};
            });
            if (!launches.length) {
                this.$el.html(Util.templates(this.tpl, {launches: []}));
                return;
            }
            this.$el.html(Util.templates(this.tpl, {
                launches: launches,
                items: this.getHistoryItems(),
                getCls: this.getCls,
                getDefectCls: Util.getDefectCls,
                getIssuesByType: this.getIssuesByType,
                getTickets: this.getTickets,
                defectTypes: this.navigationInfo.defectTypes,
                getComment: this.getComment,
                sortedIssueTypes: Util.getIssueTypes(),
                buildUrl: function (item) {
                    var last = item.launches[_.last(_.keys(item.launches))][0];
                    return this.path + ((!last.has_childs && last.status == "RESETED") || last.has_childs ? '' : 'log-for-') + last.id + (this.tabId ? '?tab.id=' + this.tabId : '');
                }.bind(this)
            }));
            if (this.loaded < this.ids.length) {
                this.$el.append(Util.templates(this.loadButton));
            }



            $('.nicescroll-it, .shifted', this.$el).each(function(){

                var heightRoot = $(this).height();
                if(heightRoot > 190) {
                    heightRoot = 190;
                    var scrollElem = Util.setupBaronScroll($(this));
                    var scrollRoot = scrollElem.parent('.baron__root');
                    scrollRoot.height(heightRoot);
                }
            });
        },

        destroy: function () {
            $('[data-toggle="tooltip"]', this.$el).tooltip('destroy');
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    return {
        GridByType: GridByType,
        HistoryGrid: HistoryGrid
    }
});
