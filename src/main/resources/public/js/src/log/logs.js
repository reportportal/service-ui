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

    var Backbone = require('backbone');
    var Components = require('components');
    var DefectEditor = require('defectEditor');
    var Util = require('util');
    var App = require('app');
    var urls = require('dataUrlResolver');
    var StickyHeader = require('core/StickyHeader');
    var Markitup = require('markitup');
    var MarkitupSettings = require('markitupset');
    var Textile = require('textile');
    var Service = require('coreService');
    var Filter = require('filters');
    var Moment = require('moment');

    var config = App.getInstance();

    var LogPanel = Components.BaseView.extend({
        initDone: false,
        historyPanel: null,
        defectEditor: null,
        levelFilter: null,
        messageFilter: null,
        historyFilter: new Filter.Model({id: 'log.state.history', noConditions: true}),
        historyPrevVal: null,

        initialize: function (options) {
            this.$el = options.element;
            this.navigationInfo = options.navigationInfo;
            this.user = options.user;
            this.project = options.project;
            this.historyItems = null;
            this.$currentLogId = options.navigationInfo.last().get('data').id;
            this.inMultyRuns = false;

            this.restoreHistoryFilter();

            this.listenTo(this.navigationInfo, "open::gallery::at::index", this.openGallery);
            this.listenTo(this.navigationInfo, "defect::updated", this.reLoadDefect);
            this.listenTo(this.navigationInfo, "log::update::filters", this.updateFilters);
            this.listenTo(this.navigationInfo, "open::post::bug", this.postBug);
            this.listenTo(this.navigationInfo, "open::load::bug", this.loadBug);

            this.rotationOptions = ['rotated-90', 'rotated-180', 'rotated-270']
        },

        tpl: "tpl-log-panel",
        tplGalleryContent: "tpl-log-gallery-content",
        //tplActivityPanel: "tpl-logs-activity-panel",
        tplDefectStatic: "tpl-launch-grid-defect-type",
        historyTpl: "tpl-logs-defect-control",
        historyItemTpl: "tpl-logs-defect-item",

        render: function () {
            this.$el.html(Util.templates(this.tpl));
            this.galleryHolder = $("#logGallery", this.$el);
            this.imageBlockCollapse = $("#imageBlockCollapse", this.galleryHolder);
            this.historyHolder = $("#logHistory", this.$el);
            this.historyWell = $("#historyWell", this.$el);
            this.defectWell = $("#defectWell", this.$el);
            this.activityWell = $("#activityWell", this.$el);
            this.filterHolder = $("#logFilter", this.$el);

            this.validateForHistory();
            this.renderFilter();
            this.renderLogHeaderPanel();

            return this;
        },

        restoreHistoryFilter: function () {
            var data = this.navigationInfo.getRequestData(),
                filter = data['log.state.history'] || null;
            this.historyFilter.set('value', filter);
        },

        renderFilter: function () {
            this.levelFilter = new Filter.MultiButtonFilter({
                navigationInfo: this.navigationInfo,
                element: this.filterHolder,
                id: 'level',
                condition: 'in',
                values: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'],
                triggerEvent: "log::update::filters"
            }).render();
            this.screenShotsFilter = new Filter.ButtonFilter({
                navigationInfo: this.navigationInfo,
                element: $("#ScreenshotsFilter", this.$el),
                id: 'binary_content$id',
                condition: 'ex',
                name: 'Screenshot',
                triggerEvent: "log::update::filters"
            }).render();
            this.filters = [this.levelFilter, this.screenShotsFilter];
        },

        getCurrentFilters: function () {
            var messageFilterParams = this.messageModel.value ? this.messageModel : null;
            var levelFilterParams = this.levelFilter.getParams();
            var screenFilterParams = this.screenShotsFilter.getParams();
            messageFilterParams && config.trackingDispatcher.searchLogMessage(messageFilterParams.value);
            levelFilterParams && config.trackingDispatcher.logLevelIn(levelFilterParams.value);
            screenFilterParams && config.trackingDispatcher.logWithAttach();
            return [
                messageFilterParams,
                levelFilterParams,
                screenFilterParams,
                this.historyFilter.asParameter()
            ];
        },

        clearFilters: function (data) {
            _.each(this.filters, function (filter) {
                var filterData = filter.data,
                    filterId = ['filter', filterData.get('condition'), filterData.get('id')].join('.');
                if (!_.contains(_.keys(data), filterId)) {
                    filter.clearButtons();
                }
            });
            this.clearMessageFilter(data);
        },

        clearMessageFilter: function (data) {
            if (!_.contains(_.keys(data), 'filter.cnt.message')) {
                this.messageModel.value = '';
                this.$messageFilter.val('');
            }
        },

        flipSorting: function () {
            var newDirection = this.$sortByTime.hasClass('ASC') ? 'DESC' : 'ASC';
            this.$sortByTime.attr('class', 'rp-table-th ' + newDirection);
            this.applyState();
        },

        updateFilters: function () {
            this.navigationInfo.requestParameters.setPage(1);
            this.applyState();
        },

        applyState: function () {
            this.navigationInfo.requestParameters.setFilters(this.getCurrentFilters());
            this.navigationInfo.requestParameters.setSortInfo('time', this.$sortByTime.hasClass('ASC') ? 'ASC' : 'DESC');
            this.navigationInfo.applyRequestParameters();
        },

        validateForHistory: function () {
            this.loadHistory();
        },

        renderActivities: function () {
            var targetId = this.historyFilter.get('value') || this.navigationInfo.last().get('data').id;
            if (this.activityView) {
                this.activityView.destroy();
                this.activityView = null;
            }
            if (this.inMultyRuns) return;
            // will render itself on data fetch
            this.activityView = new ItemActivityView({
                element: this.activityWell,
                navigationInfo: this.navigationInfo,
                project: this.project,
                user: this.user,
                id: targetId
            });
        },

        reLoadDefect: function () {
            // reload updated item to use it for history line item and defect editor
            var currentItem = this.getCurrentHistoryItem(),
                id = currentItem ? currentItem.id : this.$currentLogId;
            Service.getDefectItem(id)
                .success(function (response) {
                    _.forEach(this.historyItems.models, function (item, index) {
                        var lookup = item.get('items')[0];
                        if (lookup && lookup.id === response.id) {
                            item.set('items', [response]);
                            this.historyItems.models[index].set('items', [response]);
                            if(!this.inMultyRuns) {
                                //re-render single history line item
                                var html = Util.templates(this.historyItemTpl, {
                                    item: item.toJSON(),
                                    textile: Textile,
                                    getIssueType: Util.getIssueType,
                                    defectTypes: this.navigationInfo.defectTypes,
                                    step: this.getHistoryLog(item, this.$currentLogId),
                                    logId: this.$currentLogId
                                });

                                if (html) {
                                    $(".progress-bar.activeItem", this.historyWell).html(html);
                                }
                            }
                            return false;
                        }
                    }.bind(this));
                    // reload current defect editor static view
                    this.renderDefect();
                }.bind(this));
            // re-fetch activity items and re-render them
            this.validateForHistory();
        },

        renderDefect: function () {
            var item = this.getCurrentHistoryItem();

            if (this.inMultyRuns) {
                this.defectWell.empty().hide();
                return;
            }
            if (item && item.issue) {
                var launch = this.navigationInfo.at(1).get('data'),
                    canStartMatch = Util.canStartMatchIssues(launch),
                    currentItem = this.navigationInfo.last().get('data');

                this.defectWell.html(Util.templates(this.tplDefectStatic, {
                    item: item,
                    getIssueType: Util.getIssueType,
                    defectTypes: this.navigationInfo.defectTypes,
                    textile: Textile,
                    needMatch: !this.navigationInfo.isDebug() && canStartMatch && currentItem.id === item.id,
                    canMatchIssue: canStartMatch,
                    launchInProcess: launch && launch.isProcessing
                })).show();
            } else {
                this.navigationInfo.trigger("log::post::bug", {action: "noissues"});
                this.defectWell.hide();
            }
        },

        postBug: function () {
            if (this.postBugView) {
                this.postBugView = null;
            }
            this.postBugView = new DefectEditor.PostBug({
                settings: config.forSettings,
                user: config.userModel.toJSON(),
                systems: config.project.configuration.externalSystem,
                items: [this.getCurrentHistoryItem()],
                selected: 1,
                ulr: window.location.href
            }).render();
            this.listenTo(this.postBugView, "defect::updated", this.reLoadDefect);

        },

        loadBug: function () {
            if (this.loadBugView) {
                this.loadBugView = null;
            }
            this.loadBugView = new DefectEditor.LoadBug({
                items: [this.getCurrentHistoryItem()],
                systems: config.project.configuration.externalSystem
            }).render();
            this.listenTo(this.loadBugView, "bug::loaded", this.reLoadDefect);
        },

        loadHistory: function () {
            Service.loadHistory(this.$currentLogId)
                .done(function (response) {
                    this.clearLastHistoryStep(response);
                    this.historyItems = new HistoryItems(response, {parse: true});
                    if (!_.isEmpty(response)) {
                        if (!this.navigationInfo.isDebug()) {
                            this.historyWell.html(Util.templates(this.historyTpl, {
                                items: this.historyItems.toJSON(),
                                textile: Textile,
                                defectItemTpl: this.historyItemTpl,
                                defectTypes: this.navigationInfo.defectTypes,
                                getCurrentLogTypeCls: this.getCurrentLogTypeCls,
                                getHistoryLog: this.getHistoryLog,
                                id: this.$currentLogId,
                                util: Util
                            })).show();
                        }
                        this.attachEventsToHistory();
                        this.renderActivities();
                    } else {
                        this.historyWell.hide();
                    }
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'loadHistory');
                });
        },

        getCurrentLogTypeCls: function (item, id) {
            var logs = item.items;
            var log = _.find(logs, function (i) {
                    return i.id === id
                });
            var cls = '';

            if (log) {
                if (log.status == "FAILED" || log.status == "INTERRUPTED") {
                    cls = 'progress-bar-danger';
                }
                else if (log.status == "PASSED") {
                    cls = 'progress-bar-success';
                }
                else if (log.status == "SKIPPED") {
                    cls = 'progress-bar-skip';
                }
                else if (log.status == "IN_PROGRESS") {
                    cls = 'progress-striped progress-bar-inprogress';
                }
                else if (log.status == "RESETED") {
                    cls = 'progress-bar-reseted';
                }
                if (item.launchStatus == 'INTERRUPTED') {
                    cls += ' progress-bar-interupt';
                } else if (item.launchStatus == 'IN_PROGRESS') {
                    cls += ' progress-striped active';
                }
            }
            else {
                cls = item.cls;
            }
            return cls;
        },

        clearLastHistoryStep: function (response) {
            var lastKey = _.max(_.keys(response), function (num) {
                return +num;
            });
            if (response[lastKey] && response[lastKey].length > 1) {
                response[lastKey] = _.reject(response[lastKey], function (step) {
                    return step.id !== this.$currentLogId;
                }.bind(this));
            }
        },

        setupActiveHistoryByElement: function (el) {
            // for the cases when element is missing or has not been found let assume we need the last item in history line
            if (!el || !el.length) {
                el = $(".progress-bar:last", this.historyWell);
                // quit method if nothing is found
                if (!el.length) {
                    return;
                }
            }
            var action = '';
            $(".navigation-item").remove();
            if (this.$currentLogId === el.data('id')) {
                this.historyWell.find(".activeItem").removeClass("activeItem");
                el.addClass("activeItem");
                action = this.navigationInfo.launchIsProcessing(this.navigationInfo.last().get('data')) ? 'isProcessing' :  "remove";
            } else {
                el.closest(".history-cont").addClass("activeItem");
                el.closest(".history-cont").find(".activeItem").removeClass('activeItem');
                el.closest(".progress-bar").addClass("activeItem");
                action = "add";
            }
            this.navigationInfo.trigger("log::post::bug", {action: action});
            return el.data('id');
        },

        attachEventsToHistory: function () {
            this.historyWell.tooltip({
                selector: '[data-toggle="tooltip"]',
                html: true, placement: 'auto top'
            });
            this.defectWell.tooltip({
                selector: '[data-toggle="tooltip"]',
                html: true
            });

            DefectEditor.TicketManager.attachListener(this.defectWell);

            $(".progress-bar:last", this.historyWell).addClass('last');

            this.setupDefectByHistory();

            this.historyWell.on('click', ".progress-bar", function (e) {
                var $el = $(e.currentTarget);
                if ($el.hasClass('activeItem') || $el.hasClass('progress-bar-empty')) {
                    return;
                }
                var active = $(".progress-bar.activeItem:first", this.historyWell),
                    steps = $(".progress-bar", this.historyWell),
                    diff = steps.index(active) - steps.index($el);
                config.trackingDispatcher.historyLineNavigation(diff);
                this.historyFilter.set('value', $el.data('id'));
                this.applyState();
            }.bind(this));
        },

        setupDefectByHistory: function () {
            // restore to selected history line step and defect editor
            var currentHistory = this.historyFilter.get('value') || this.$currentLogId;
            var target = currentHistory
                ? $("[data-id='" + currentHistory + "']", this.historyWell)
                : $(".progress-bar:last", this.historyWell);
            this.setupActiveHistoryByElement(target);
            this.renderDefect();
        },

        getCurrentHistoryItem: function () {
            var currentHistory = this.historyFilter.get('value') || this.$currentLogId;
            var item;
            if(this.historyItems){
                if (currentHistory) {
                    item = _.find(this.historyItems.models, function (i) {
                        var items = i.get("items");
                        return _.find(items, function (d) {
                            return d.id === currentHistory;
                        });
                    });
                    this.inMultyRuns = currentHistory === this.$currentLogId ? false : item && item.get("type") === "WARNING";
                } else {
                    item = this.historyItems.last();
                    this.inMultyRuns = false;
                }
            }
            return this.getHistoryLog(item, this.$currentLogId);
        },

        getHistoryLog: function (item, id) {
            var log = null;
            if (item) {
                var logs = _.isFunction(item.get) ? item.get("items") : item.items;
                log = _.find(logs, function (i) {
                    return i.id === id
                }, this);
                if (!log) {
                    log = logs[0];
                }
            }
            return log;
        },

        events: {
            'click #galleryToggler': 'renderGalleryContent',
            'click .js-navigation-next': 'slideThumb',
            'click .js-navigation-prev': 'slideThumb',
            'slide.bs.carousel #launchesCarousel': 'slideCarousel',
            'click .carousel-caption': 'scrollToMessage',
            'click .rotate-image': 'rotateImage',
            'click .defect-type': 'openDefectEditor',
            'click .external-ticket a': 'followToExternalSystem',
            'click .external-ticket': 'followToExternalSystem',
            'click [data-js-event="removeTicket"]': 'removeTicket',
            'click .match-issue': 'matchIssue',
            'click #sortByTime': 'flipSorting',
            'validation::change #messageFilter': 'submitMessageFilter',
            'click .defect-desc .rp-blue-link-undrl': 'preventPropagation',
            'click .activity-str .rp-blue-link-undrl': 'preventPropagation',
            'click a.edit-defect': 'preventDefaultAction',
        },

        preventDefaultAction: function(e) {
            e.preventDefault();
        },
        preventPropagation: function (e) {
            e.stopImmediatePropagation();
        },

        rotateImage: function (e) {
            e.stopImmediatePropagation();
            var image = $(e.currentTarget).closest('.item').find('img:first'),
                currentRotation = image.data('rotation'),
                nextRotation = '';
            if (!currentRotation) {
                nextRotation = this.rotationOptions[0];
            } else {
                var index = _.indexOf(this.rotationOptions, currentRotation);
                nextRotation = (index + 1) === this.rotationOptions.length ? '' : this.rotationOptions[index + 1];
            }
            image.attr('class', 'img-responsive ' + nextRotation).data('rotation', nextRotation);
            // think about it since image gets alot of distortion
            //if(!nextRotation || index === 0) {
            //    image.attr('style', '');
            //} else {
            //    image.css('height', '200px');
            //}
        },

        matchIssue: function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            var el = $(e.currentTarget), self = this, itemData;
            if (!el.hasClass('disabled') && !el.hasClass('autoanalyze')) {
                el.addClass('autoanalyze').addClass('label-danger');
                itemData = this.navigationInfo.at(1).get('data');
                itemData.isProcessing = true;
                this.navigationInfo.trigger('match::issues::action');
                this.navigationInfo.trigger("log::post::bug", {action: 'isProcessing'});
                this.navigationInfo.trackForLaunchProcessing(Service['startLaunchMatch'](itemData.id), itemData.id);
                config.trackingDispatcher.matchIssue(el.parent().find('.badge:first').text().trim());
            }
        },

        submitMessageFilter: function (e, state) {
            if (state.valid) {
                this.messageModel.value = state.value;
                this.applyState();
            }
        },

        renderLogHeaderPanel: function () {
            this.$messageFilter = $("#messageFilter", this.$el)
            Util.bootValidator(this.$messageFilter, [{
                validator: 'minMaxNotRequired',
                type: 'logMessage',
                min: 3,
                max: 55
            }]);
            this.messageModel = {id: 'filter.cnt.message', value: ''};
            var presentValues = this.navigationInfo.getCurrentFilterValue(this.messageModel.id);
            if (presentValues) {
                this.messageModel.value = presentValues;
                this.$messageFilter.val(presentValues);
            }
            this.$sortByTime = $('#sortByTime', this.$el);
        },

        removeTicket: function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            var el = $(e.currentTarget),
                def = el.closest('div.defect-type '),
                disabled = def.hasClass('disabled') || def.parent().hasClass('disabled');
            if(!disabled) {
                var badge = $(e.currentTarget).closest('.badge'),
                    row = badge.closest('#defectWell');
                DefectEditor.removeTicket(badge, this.getCurrentHistoryItem(), row, function () {
                    this.reLoadDefect();
                }.bind(this));
                config.trackingDispatcher.jiraTicketDelete();
            }
        },

        followToExternalSystem: function (e) {
            e.stopImmediatePropagation();
        },

        $editor: null,
        openDefectEditor: function (e) {
            var item = this.navigationInfo.last().get('data');
            if (!this.navigationInfo.launchIsProcessing(item)) {
                var origin = $(e.currentTarget),
                    item = this.getCurrentHistoryItem();
                var element = $("<div/>").insertAfter(origin);

                this.$editor = new DefectEditor.Editor({
                    element: element,
                    origin: origin,
                    item: item,
                    selected: 1,
                    navigationInfo: this.navigationInfo,
                    defectCallBack: 'defect::updated'
                }).render();
            }
        },

        slideCarousel: function (e) {
            var index = $(e.relatedTarget).index();
            var links = $(".navigation-item", this.$el);
            $(".selected:first", this.$el).removeClass('selected');
            $(links[index]).addClass('selected');
        },

        slideThumb: function (e) {
            var el = $(e.currentTarget),
                line = el.closest("#slider-thumbs").find('.navigation-items'),
                left = line.position().left,
                max = 972 - line.width();
            if (el.hasClass('js-navigation-next')) {
                left -= 250;
                if (left <= max) {
                    left = max;
                }
            } else {
                left += 250;
                if (left >= 0) {
                    left = 0;
                }
            }
            line.stop().animate({left: left}, 400);
        },

        renderGalleryContent: function () {
            $("#galleryContent", this.galleryHolder).html(Util.templates(this.tplGalleryContent, {
                collection: this.binaryCollection,
                updateImagePath: Util.updateImagePath,
                dataUrl: urls.getFile()
            }));
            // setup actual width with a delay - so thumbs will have some time to load
            setTimeout(function () {
                var thumbs = $(".navigation-item", this.galleryHolder);
                var actual = 0;
                _.each(thumbs, function (thumb) {
                    actual += $(thumb).outerWidth();
                });
                actual && $(".navigation-items:first").css('width', actual + "px");
            }, 2000);
        },

        parseCollectionForImages: function (collection) {
            // to re-render new gallery content - first close it (use case - filtering)
            this.imageBlockCollapse.removeClass("in").attr('style', "");
            if (collection && collection.length) {
                this.binaryCollection = _.filter(collection.toJSON(), function (model) {
                    return model.binary_content !== undefined && model.binary_content.thumbnail_id !== undefined;
                });
                var action = this.binaryCollection && this.binaryCollection.length ? 'show' : 'hide';
                this.galleryHolder[action]();
            } else {
                $("#galleryContent", this.galleryHolder).empty();
                this.imageBlockCollapse.removeClass("in");
                this.galleryHolder.hide();
                this.binaryCollection = null;
            }
        },

        openGallery: function (index) {
            var links = $(".navigation-item", this.$el);
            if (!links.length) {
                this.renderGalleryContent();
                links = $(".navigation-item", this.$el);
            } else {
                $(".selected", this.$el).removeClass('selected');
            }
            this.imageBlockCollapse.addClass("in").attr('style', "");
            $(links[index]).click();
            config.mainScrollElement.animate({
                scrollTop: 0
            }, 200);
        },

        scrollToMessage: function (e) {
            var id = $(e.currentTarget).data("content-id");
            Util.scrollToHighlight(id);
        },

        update: function (collection) {
            // check for images any time collection is reloaded
            this.parseCollectionForImages(collection);
            var data = this.navigationInfo.getRequestData(),
                filter = data['log.state.history'];
            this.historyFilter.set('value', filter);
            this.clearFilters(data);
            if (this.initDone) {
                var incomingLog = this.navigationInfo.last().get('data').id;
                if (this.$currentLogId === incomingLog) {
                    var target = filter ? $("[data-id='" + filter + "']", this.historyWell) : $(".progress-bar:last", this.historyWell);
                    this.setupActiveHistoryByElement(target);
                    if(this.getCurrentHistoryItem()){
                        this.reLoadDefect();
                    }
                    // do nothing with gallery since it listens to grid::loaded event eny way
                } else {
                    // weird case when somebody inserts url with another log id
                    this.$currentLogId = incomingLog;
                    this.validateForHistory();
                }
            } else {
                this.initDone = true;
            }
            _.delay(function () {
                $("html,body").trigger("scroll");
            }, 500);
        }
    });

    var ItemActivityView = Components.BaseView.extend({
        initialize: function (options) {
            this.$container = options.element;
            this.navigationInfo = options.navigationInfo;
            this.project = options.project;
            this.user = options.user;
            this.itemId = options.id;
            this.loadActivity();
        },

        loadActivity: function () {
            Service.loadActivityItems(this.itemId)
                .done(function (data) {
                    if (data.length > 0) {
                        this.activityItems = new Backbone.Collection(data);
                        this.render();
                    } else {
                        this.$el && this.$el.attr('style', '');
                        this.destroy();
                    }
                }.bind(this))
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'loadActivityItems');
                });
        },

        tplActivityPanel: "tpl-logs-activity-panel",

        render: function () {
            var items = this.activityItems.toJSON();
            _.each(items, function (item) {
                item.fullTime = Util.dateFormat(item.lastModifiedDate);
                item.momentTime = Moment(Util.dateFormat(item.lastModifiedDate)).fromNow();
                item.fullUserName = item.userRef.replace('_', ' ');
                item.field = _.size(item.history) > 1 ? 'issue' : _.first(Object.keys(item.history)).split('_').join(' ');
                var aType = item.actionType.split('_');
                aType[0] = (aType[0].match("e$") ? aType[0] + 'd' : aType[0] + 'ed');
                item.actionType = aType.join(' ');
                if (item.history.comment && !_.isEmpty(item.history.comment)) {
                    var newVal = item.history.comment.newValue,
                        oldVal = item.history.comment.oldValue;
                    if ($.trim(oldVal) != $.trim(newVal)) {
                      //  item.history.comment.newValue = Util.replaceLink(newVal);
                      //  item.history.comment.oldValue = Util.replaceLink(oldVal);
                    } else {
                        delete item.history.comment;
                    }
                }
            });
            var params = {
                last: _.first(items),
                items: _.rest(items),
                user: this.user,
                url: Util.hasExternalSystem() ? this.project.configuration.externalSystem[0].url : '',
                renderTicket: this.renderTicket,
                textile: Textile
            };
            this.$container.append(this.$el.html(Util.templates(this.tplActivityPanel, params)).attr('style', ''));
            this.$accordion =  $('#accordion', this.$el);
            Util.hoverFullTime();
            if (this.stickyHeader) { this.stickyHeader.destroy(); }
            this.stickyHeader = new StickyHeader({fixedBlock: $(".fixed_table_header:first")});
            // Sticker.setupSticker([$("#headerBar"), $(".fixed_table_header:first")], 1);
            var self = this;
            this.$accordion.on('hidden.bs.collapse', function () {
                self.stickyHeader.sync();
                // Sticker.updateKickOff(1);
            }).on('shown.bs.collapse', function () {
                self.stickyHeader.sync();
                // Sticker.updateKickOff(1);
            });
            this.$accordion.on('shown.bs.collapse', function () {
                config.trackingDispatcher.testItemActivityExpanded(this.navigationInfo.last().get('name'));
            }.bind(this));
        },

        renderTicket: function (ticket) {
            var ticketObj = Util.getTicketUrlId(ticket);
            return ticketObj.url ? '<a target="_blank" class="rp-blue-link-undrl" href="' + ticketObj.url + '">' + ticketObj.id + '</a>' : ticketObj.id;
        },

        destroy: function () {
            if(this.stickyHeader) { this.stickyHeader.destroy(); };
            this.navigationInfo = null;
            this.activityItems = null;
            this.user = null;
            this.$accordion = null;
            Components.BaseView.prototype.destroy.call(this);
            this.$container.empty();
        }
    });

    var HistoryItems = Backbone.Collection.extend({
        parse: function (response) {
            var empty = 0,
                passed = 0,
                failed = 0,
                skipped = 0,
                warning = 0,
                items = [];
            _.each(response, function (val) {
                var item = {
                    items: val.resources,
                    launch: val.launchNumber,
                    startTime: parseInt(val.startTime),
                    launchNumber: parseInt(val.launchNumber),
                    launchStatus: val.launchStatus
                };
                if (_.isEmpty(val.resources)) {
                    //if EMPTY
                    empty += 1;
                    item.cls = 'progress-bar-empty';
                    item.type = 'EMPTY';
                } else {
                    // NOT EMPTY
                    if (val.resources.length > 1) {
                        // has multiple items for it in history
                        warning += 1;
                        item.cls = 'progress-bar-warning';
                        item.type = 'WARNING';
                    } else {
                        // one item with Status
                        var itemOne = val.resources[0] || val[0];
                        if (itemOne.status == "FAILED" || itemOne.status == "INTERRUPTED") {
                            failed += 1;
                            item.cls = 'progress-bar-danger';
                            item.type = 'FAILED';
                        }
                        else if (itemOne.status == "PASSED") {
                            passed += 1;
                            item.cls = 'progress-bar-success';
                            item.type = 'PASSED';
                        }
                        else if (itemOne.status == "SKIPPED") {
                            skipped += 1;
                            item.cls = 'progress-bar-skip';
                            item.type = 'SKIPPED';
                        }
                        else if (itemOne.status == "IN_PROGRESS") {
                            skipped += 1;
                            item.cls = 'progress-striped active progress-bar-inprogress';
                            item.type = 'IN_PROGRESS';
                        }
                        else if (itemOne.status == "RESETED") {
                            empty += 1;
                            item.cls = 'progress-bar-reseted';
                            item.type = 'EMPTY';
                        }
                    }
                }
                // check launch status
                if (item.launchStatus == 'INTERRUPTED') {
                    item.cls += ' progress-bar-interupt';
                } else if (item.launchStatus == 'IN_PROGRESS') {
                    item.cls += ' progress-striped active';
                }
                items.push(item);
            });
            items = _.sortBy(items, 'startTime');

            var n_defect = 4.6;
            var n_warn = 4.6;
            var passedW = 100 / ((failed + skipped) * n_defect + warning * n_warn + (passed + empty));
            var failedW = passedW * n_defect;
            var warnW = passedW * n_warn;
            _.each(items, function (item) {
                if (item.type == 'PASSED' || item.type == 'EMPTY') {
                    item.width = passedW;
                } else if (item.type == 'WARNING') {
                    item.width = warnW;
                } else {
                    item.width = failedW;
                }
            });
            return items;
        }
    });

    return {
        LogPanel: LogPanel,
        HistoryItems: HistoryItems
    }
});
