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

    var $ = require('jquery'),
        Backbone = require('backbone'),
        Util = require('util'),
        d3 = require('d3'),
        d3tip = require('d3Tip'),
        nvd3 = require('nvd3'),
        urls = require('dataUrlResolver'),
        App = require('app'),
        Service = require('coreService'),
        FiltersService = require('filtersService'),
        Moment = require('moment'),
        WidgetsConfig = require('widget/widgetsConfig'),
        SingletonAppModel = require('model/SingletonAppModel'),
        Components = require('core/components'),
        Localization = require('localization'),
        Epoxy = require('backbone-epoxy'),
        SingletonAppModel = require('model/SingletonAppModel'),
        MarkdownViewer = require('components/markdown/MarkdownViewer'),
        SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection'),
        SingletonLaunchFilterCollection = require('filters/SingletonLaunchFilterCollection'),
        ModalConfirm = require('modals/modalConfirm');

    // require('jqueryUI');
    require('elasticColumns');
    require('select2');

    var config = App.getInstance();

    var Model = Backbone.Model.extend({
        defautls: {
            name: '',
            id: ''
        }
    });

    var WidgetView = Components.BaseView.extend({
        initialize: function (options) {
            this.model = options.model || new Model();
            this.$container = options.container;
            this.context = options.context;
            this.navigationInfo = options.navigationInfo;
            this.height = options.height;
            this.width = options.width;
            this.top = options.top;
            this.left = options.left;
            this.position = options.position;
            this.id = options.id;
            this.url = urls.widgetById(this.id);
            this.isPreview = options.isPreview || false;
            this.isStartLoad = false;
            this.widgetsConfig = WidgetsConfig.getInstance();
            this.listenTo(this.navigationInfo, 'refresh::widget', this.reloadWidget);
        },
        className: 'widget-item',
        getModel: function () {
            return this.model;
        },
        getName: function () {
            return (this.model && this.model.get('name')) ? (this.model.get('name').length > 56) ? this.model.get('name').slice(0, 56) + '...' : this.model.get('name') : '';
        },
        getMode: function () {
            var param = this.getContentParam();
            return !!(param && param.widgetOptions && param.widgetOptions.timeline);
        },
        getShared: function () {
            return this.model.get('isShared');
        },
        getOwner: function () {
            return this.model.get('owner');
        },
        getDashboardOwner: function () {
            return this.navigationInfo.getCurrentDashboard().get('owner');
        },
        getId: function () {
            return (this.model && this.model.get('id'))
                ? this.model.get('id')
                : this.id;
        },
        getContentParam: function () {
            return (this.model && this.model.get('content_parameters'))
                ? this.model.get('content_parameters')
                : null;
        },
        getUrl: function () {
            return this.url;
        },
        getWidgetType: function () {
            var param = this.getContentParam();
            return param.type;
        },
        getGadgetType: function () {
            var param = this.getContentParam();
            return (param && param.gadget) ? param.gadget : null;
        },
        getContentFields: function(){
            var param = this.getContentParam();
            return (param && param.content_fields) ? param.content_fields : null;
        },
        getContent: function () {
            return this.model.get('content');
        },
        getFilter: function(){
            return this.model.get('filter_id');
        },
        getHeight: function(){
            return this.height * config.widgetGridCellHeight + config.widgetGridVerticalMargin - $('.panel-heading', this.$el).outerHeight();
        },
        canEdit: function(){
            var isCustomer = Util.isCustomer() && this.getGadgetType() === 'activity_stream',
                owner = this.getOwner(),
                dashOwner = this.getDashboardOwner(),
                userName = config.userModel.toJSON().name;
            return !isCustomer && owner == userName && dashOwner == userName;
        },
        tplPanel: 'tpl-widget-content',
        tpl: 'tpl-widget-container',
        unableLoadTpl: 'tpl-widget-unable-load',
        events: {
            'click a.remove': 'deleteWidget',
            'click a.refresh': 'refresh',
            'click a.save': 'saveWidget',
            'click a.settings': 'editWidget',
            'click .widget-invalid-data': 'editWidget'
        },
        toggleLoader: function () {
            var loading = $('div.loading-widget', this.$el);
            if (loading.is(':visible')) {
                loading.hide();
            } else {
                loading.show();
            }
        },
        loadWidget: function (callback) {
            var self = this;
            this.isStartLoad = true;
            self.toggleLoader();
            Service.loadWidget(this.getUrl())
                .done(function (response) {
                    if (callback && _.isFunction(callback)) {
                        callback(response);
                    } else {
                        self.renderWidget(response);
                        EQCSS.apply();
                    }
                    self.toggleLoader();
                })
                .fail(function (error) {
                    Util.validateForLogOut(error);
                    self.renderNoData(error);
                });
        },
        saveWidget: function (e) {
            e.preventDefault();
        },
        refresh: function (e) {
            if (e) {
                e.preventDefault();
            }
            var self = this;
            this.loadWidget(function (response) {
                self.renderWidget(response);
                var gadget = self.getGadgetType();
                if(gadget){
                    // config.trackingDispatcher.widgetRefresh(gadget);
                }
            });
        },
        deleteWidget: function (e) {
            e.preventDefault();
            var self = this;
            var dash = this.navigationInfo.getCurrentDashboard();
            var grid = $('.grid-stack:first').data('gridstack');
            var id = this.getId();
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deletedWidget,
                bodyText: Util.replaceTemplate(Localization.dialog.deletedWidget, this.getName()),
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete,
            });
            modal.show().done(function() {
                if (self.model && !_.isEmpty(self.model.attributes)) {
                    var model = self.model.toJSON(),
                        gadget = self.getGadgetType();
                    if (gadget) {
                        // config.trackingDispatcher.widgetRemoveType(gadget);
                    }
                    // config.trackingDispatcher.widgetRemoveIsShared(model.isShared);
                }

                dash.deleteWidget(id, function () {
                    grid.remove_widget(self.$el);
                    self.navigationInfo.trigger("dashboard::widget::deleted", {});
                    self.destroy();
                    dash.updateWidgets(grid.grid.nodes);
                    Util.ajaxSuccessMessenger('deletedWidget');
                });
            });
        },
        editWidget: function (e) {
            e.preventDefault();
            if(this.canEdit()){
                this.navigationInfo.trigger('edit::widget', this.getModel().toJSON());
            }
        },
        reloadWidget: function (id) {
            if (id === this.id) {
                var self = this;
                this.loadWidget(urls.widgetById(this.id), function (response) {
                    self.renderWidget(response);
                });
            }
        },
        render: function () {
            var attr = {
                'data-gs-width': this.width,
                'data-gs-height': this.height,
                'data-gs-y': this.top,
                'data-gs-x': this.left,
                'data-gs-min-width': config.minWidgetWidth,
                'data-gs-min-height': config.minWidgetHeight
            };
            if (this.position == 'bottom') {
                this.$container.append(this.$el.attr(attr).html(Util.templates(this.tpl)));
            }
            else {
                this.$container.prepend(this.$el.attr(attr).html(Util.templates(this.tpl)));
            }
            return this;
        },
        renderWidget: function (response) {
            $('div.grid-stack-item-content', this.$el).empty();

            if (this.widget) {
                this.widget.destroy();
                $('div.panel-heading', this.$el).remove();
            }

            if (this.model){
                this.model.clear().set(response);
            }

            var type = this.getGadgetType();
            var view = widgetService(type);

            if (!view || !this.$el) {
                this.renderNoData();
                return;
            }

            this.$el.attr('data-widget-type', type);
            var param = {
                id: this.getId(),
                name: this.getName(),
                content: this.getContent(),
                gadget: this.getGadgetType(),
                content_fields: this.getContentFields(),
                filter_id: this.getFilter(),
                height: this.getHeight(),
                isTimeline: !!(response.content_parameters.widgetOptions && response.content_parameters.widgetOptions.timeline)
            };
            if (this.getGadgetType() === 'most_failed_test_cases') {
                var contentParam = this.getContentParam(),
                    widgetOptions = contentParam.widgetOptions,
                    launchName = widgetOptions && !_.isEmpty(widgetOptions.launchNameFilter) ? widgetOptions.launchNameFilter[0] : '';
                param.launchName = launchName;
            }
            this.widget = new view({
                container: $('div.grid-stack-item-content', this.$el),
                context: this.context,
                navigationInfo: this.navigationInfo,
                parent: this,
                isPreview: this.isPreview,
                param: param
            }).render();

            if (this.context && this.context.widgets) {
                this.context.widgets.push(this.widget);
            }
            this.renderHeader();
        },
        renderNoData: function(error){
            if (this.$el) {
                this.$container.append(this.$el.html(Util.templates(this.unableLoadTpl, {
                    name: this.getName(),
                    owner: this.getOwner(),
                    notFound: error && error.status == 404 ? true : false,
                    unShared: this.getOwner() && !this.getShared() !== config.userModel.get('name'),
                    isSharedDashboard: this.getDashboardOwner() !== config.userModel.get('name')
                })));
            }
        },
        renderHeader: function(){
            $('div.grid-stack-item-content', this.$el).append(Util.templates(this.tplPanel, {
                name: this.getName(),
                shared: this.getShared(),
                owner: this.getOwner(),
                height: this.getHeight(),
                dashOwner: this.getDashboardOwner(),
                user: config.userModel.toJSON(),
                canEdit: this.canEdit(),
                isTimeline: this.getMode(),
                widgetType: this.widgetsConfig.widgetTypes[this.getGadgetType()].gadget_name
            }));
        },
        destroy: function () {
            if (this.getGadgetType() == 'activity_stream') {
                this.widget.clearAutoRefresh();
            }
            this.context = null;
            this.navigationInfo = null;
            if (this.widget) {
                this.widget.destroy();
            }
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var BaseWidget = Backbone.View.extend({
        initialize: function (options) {
            this.container = options.container;
            this.param = options.param;
            this.context = options.context;
            this.navigationInfo = options.navigationInfo
            this.parent = options.parent;
            this.id = 'widget-' + this.param.id;
            this.isPreview = options.isPreview;
            this.noScroll = options.noScroll;
        },
        className: 'panel-body',
        getTitle: function () {
            var title = (this.param.name.length > 56) ? this.param.name.slice(0, 56) + '...' : this.param.name;
            return title;
        },
        getSeriesColor: function (name) {
            var subTypes = new SingletonDefectTypeCollection(),
                defect = subTypes.getDefectType(name),
                color = defect ? defect.color : Util.getDefaultColor(name);
            return color;
        },
        invalidDataMessage: function(n){
            return Util.templates('tpl-widget-invalid-data', {qty: n, canEdit: this.isPreview || this.parent.canEdit()});
        },
        linkToRedirectService: function (series, id) {
            var defectTypes = new SingletonDefectTypeCollection();
            var appModel = new SingletonAppModel()
            var project = '#' + appModel.get('projectId');
            var filterId = this.param.filter_id;
            var filterStatus = '';
            var getLink = function(filters){
                var arrLink = [project, 'launches/all'];
                var filterForAll = '?page.page=1&page.size=50&page.sort=start_time&filter.eq.has_childs=false';
                var params = [[id, filterForAll].join('')];
                params.push(filters);
                arrLink.push(params.join('&'));
                return arrLink.join('/');
            };
            var getDefects = function(seria){
                var typeArr = seria.split(' '),
                    type = _.map(typeArr, function(t){ return t.toLowerCase();}).join('_'),
                    subDefects = defectTypes.toJSON();
                return Util.getSubDefectsLocators(type, subDefects);
            };
            switch (series) {
                case 'Total':
                case 'total':
                case 'Grow test cases':
                case 'grow_test_cases':
                    filterStatus = 'filter.in.type=STEP&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED';
                    break;
                case 'Passed':
                case 'passed':
                    filterStatus = 'filter.in.type=STEP&filter.in.status=PASSED';
                    break;
                case 'Failed':
                case 'failed':
                    filterStatus = 'filter.in.type=STEP&filter.in.status=FAILED';
                    break;
                case 'Skipped':
                case 'skipped':
                    filterStatus = 'filter.in.type=STEP&filter.in.status=SKIPPED';
                    break;
                case 'To Investigate':
                case 'to_investigate':
                case 'toInvestigate':
                    filterStatus = ['filter.in.issue$issue_type=', getDefects('To Investigate')].join('');
                    break;
                case 'System Issue':
                case 'systemIssue':
                case 'system_issue':
                    filterStatus = ['filter.in.issue$issue_type=', getDefects('System Issue')].join('');
                    break;
                case 'Product Bug':
                case 'productBug':
                case 'product_bug':
                    filterStatus = ['filter.in.issue$issue_type=', getDefects('Product Bug')].join('');
                    break;
                case 'No Defect':
                case 'noDefect':
                case 'no_defect':
                    filterStatus = ['filter.in.issue$issue_type=', getDefects('No Defect')].join('');
                    break;
                case 'Automation Bug':
                case 'Auto Bug':
                case 'automationBug':
                case 'automation_bug':
                    filterStatus = ['filter.in.issue$issue_type=', getDefects('Automation Bug')].join('');
                    break;
                case 'Investigated':
                case 'investigated':
                    var types = ['System Issue', 'Product Bug', 'No Defect', 'Automation Bug'],
                        defects = [];
                    _.each(types, function(d){
                        defects = defects.concat(getDefects(d));
                    });
                    filterStatus = ['filter.in.issue$issue_type=', defects].join('');
                    break;
                case 'Duration':
                case 'duration':
                    filterStatus = '';
                    break;
                default :
                    var defect = _.find(defectTypes.toJSON(), function(d){ return d.locator == series; });
                    if (defect) {
                        filterStatus = ['filter.in.issue$issue_type=', defect.locator].join('');
                    }
                    else {
                        filterStatus = '';
                    }
            }
            return encodeURI(getLink(filterStatus));
        },
        destroy: function () {
            if (this.context) {
                var widget = _.remove(this.context.widgets, function (w) {
                    return w.id === this.id
                }, this);
            }
            if (this.chart && _.isFunction(this.chart)) {
                $(window).off('resize.' + this.id);
                this.chart = null;
            }
            $('#d3-tip-' + this.id).remove();
            this.undelegateEvents();
            this.remove();
            delete this;
        }
    });

    var FilterResultsTable = BaseWidget.extend({

        tpl: 'tpl-widget-filters-table',

        getData: function(){
            var contentData = this.param.content || [];
            if (!_.isEmpty(contentData) && !_.isEmpty(contentData.result)) {
                var data = _.map(contentData.result, function(i){
                    var stats = {},
                        launchInfo = {
                            id: i.id,
                            name: i.name,
                            number: i.number,
                            startTime: i.startTime
                        };

                    _.forEach(i.values, function(v, k){
                        if(k.indexOf('statistics$issueCounter') >= 0){
                            var a = k.split('$'),
                                group = _.initial(a).join('$'),
                                defect = _.last(a),
                                val = parseInt(v);
                            if(stats[group]){
                                stats[group].total += val;
                            }
                            else {
                                stats[group] = {};
                                stats[group].total = val;
                            }
                            stats[group][defect] = val;
                        }
                        else {
                            stats[k] = v;
                        }
                    });
                    return _.extend(launchInfo, stats);
                }, this);
                return data.reverse();
            }
            return [];
        },
        getCriteria: function(){
            var criteria = {};
            _.each(this.param.content_fields, function(c){
                var key = c;
                if(c.indexOf('statistics') >=0 && !criteria[key]){
                    var a = c.split('$'),
                        type = a[1];
                    key = type == 'defects' ? a[2] : _.last(a);
                }
                criteria[key] = true;
            });
            return criteria;
        },
        render: function () {
            this.renderedItems = [];
            this.items = this.getData();

            var params = {
                criteria: this.getCriteria(),
                noItems: !this.items.length
            };
            this.container.append(this.$el.html(Util.templates(this.tpl, params)));
            this.renderItems();
            Util.hoverFullTime(this.$el);
            !this.noScroll && Util.setupBaronScroll(this.$el);
            EQCSS.apply();
            return this;
        },

        getLink: function(){
            var appModel = new SingletonAppModel(),
                project = '#' + appModel.get('projectId'),
                filterId = this.param.filter_id,
                arrLink = [project, 'launches', filterId];
            return arrLink.join('/');
        },

        renderItems: function(){
            _.each(this.items, function(launch){
                var item = new FilterResultsTableItem({
                    model: new Epoxy.Model(launch),
                    criteria: this.getCriteria(),
                    widgetId: this.id,
                    link: this.getLink()
                });
                $('[data-js-items]', this.$el).append(item.$el);

                this.renderedItems.push(item);
            }, this);
        },

        activateAccordions: function(){
            _.each(this.renderedItems, function(view) {
                view.activateAccordion && view.activateAccordion();
            });
        },

        destroy: function(){
            _.each(this.renderedItems, function(view) {
                view.destroy && view.destroy();
            });
            BaseWidget.prototype.destroy.call(this);
        }

    });

    var FilterResultsTableItem = Epoxy.View.extend({
        className: 'row rp-table-row',
        tpl: 'tpl-widget-filters-table-item',
        toolTipContent: 'tpl-launches-table-tooltip-defects',
        bindings: {
            '[data-js-name-link]': 'attr: {href: getItemUrl}',
            '[data-js-name]': 'text: name',
            '[data-js-launch-number]': 'text: number',
        },
        computeds: {
            getItemUrl: {
                deps: ['id'],
                get: function(id){
                    return '#' + this.appModel.get('projectId') + '/launches/all/' + id;
                }
            }
        },
        events: {
            'click [data-js-toggle-open]': 'onClickOpen',
            'mouseenter [data-js-launch-defect]': 'showDefectTooltip',
            'click [data-js-tag]': 'onClickTag',
            'click [data-js-user-tag]': 'onClickUserTag',
        },
        initialize: function(options){
            this.widgetId = options.widgetId;
            this.criteria = options.criteria;
            this.link = options.link;
            this.appModel = new SingletonAppModel();
            this.defectTypes = new SingletonDefectTypeCollection();
            this.render();
            this.markdownViewer = new MarkdownViewer({text: this.model.get('description')});
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
            var self = this;
            this.listenTo(this.model, 'change:description', function(model, description){ self.markdownViewer.update(description); });
            //this.listenTo(this.model, 'change:description change:tags', this.activateAccordion);
            //this.listenTo(this.markdownViewer, 'load', this.activateAccordion);
            setTimeout(function(){
                self.renderDefects();
            }, 100);
        },
        render: function(){
            this.$el.html(Util.templates(this.tpl, {
                item: this.model.toJSON(),
                criteria: this.criteria,
                projectUrl: this.appModel.get('projectId'),
                defectTypes: this.defectTypes,
                getDefectColor: this.getDefectColor,
                allCasesUrl: this.allCasesUrl.bind(this),
                dateFormat: Util.dateFormat,
                widgetId: this.widgetId,
                moment: Moment
            }));
        },
        activateAccordion: function() {
            var innerHeight = 198;
            if($(window).width() < 900) {
                innerHeight = 318;
            }
            if (this.$el.innerHeight() > innerHeight) {
                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        },
        onClickOpen: function() {
            this.$el.toggleClass('open');
        },
        allCasesUrl: function(type){
            var url = this.link + '/' + this.model.get('id'),
                statusFilter = '';

            switch (type) {
                case 'total':
                    statusFilter = '&filter.in.status=PASSED,FAILED,SKIPPED,INTERRUPTED&filter.in.type=STEP';
                    break;
                case 'passed':
                case 'failed':
                case 'skipped':
                    statusFilter = '&filter.in.status=' + type.toUpperCase() + '&filter.in.type=STEP';
                    break;
                default:
                    var subDefects = this.defectTypes.toJSON(),
                        defects = Util.getSubDefectsLocators(type, subDefects).join('%2C');
                    statusFilter = '&filter.in.issue$issue_type=' + defects;
            }
            return url + '?' + '&filter.eq.has_childs=false' + statusFilter;
        },
        onClickTag: function(e) {
            e.preventDefault();
            var tagName = $(e.currentTarget).data('tag');
            this.goToLaunchWithFilter('tags', tagName);
        },
        onClickUserTag: function(e) {
            e.preventDefault();
            var userName = $(e.currentTarget).data('tag');
            this.goToLaunchWithFilter('user', userName);
        },
        goToLaunchWithFilter: function(filterName, filterValue) {
            var launchFilterCollection = new SingletonLaunchFilterCollection();
            var tempFilterModel = launchFilterCollection.generateTempModel();
            config.router.navigate(tempFilterModel.get('url'), {trigger: true});
            tempFilterModel.trigger('add_entity', filterName, filterValue);
        },
        renderDefects: function () {
            var defectCell = $('[data-js-launch-defect]', this.$el);
            _.each(defectCell, function(cell){
                var el = $(cell),
                    type = el.data('defectType'),
                    defect = this.getDefectByType(this.model.toJSON(), type),
                    id = this.widgetId + '-defect-'+this.model.get('id')+'-'+type;
                this.drawPieChart(defect, id);
            }, this);
        },
        getDefectByType: function(item, type){
            var typeCC = _.map(type.split('_'), function(t, i){return i ? t.capitalize() : t;}),
                key = 'statistics$issueCounter$' + typeCC.join('');
            return item[key];
        },
        showDefectTooltip: function (e) {
            var el = $(e.currentTarget),
                type = el.data('defectType');
            if(!el.data('tooltip')){
                el.data('tooltip', 'tooltip');
                this.createDefectTooltip(el, type);
            }
        },
        createDefectTooltip: function (el, type) {
            var launchId = el.closest('.row.rp-table-row').attr('id'),
                content = this.renderDefectsTooltip(launchId, type);
            el.append(content);
        },
        renderDefectsTooltip: function (launchId, type) {
            var launch = this.model.toJSON(),
                defect = this.getDefectByType(launch, type),
                sd = config.patterns.defectsLocator,
                params = {
                    total: defect.total,
                    defects: [],
                    type: type,
                    item: launch,
                    noSubDefects: !this.defectTypes.checkForSubDefects(),
                    color: this.getDefectColor(defect, type, this.defectTypes),
                    url: this.allCasesUrl(type)
                };
            _.each(defect, function(v, k){
                if(k !== 'total'){
                    if(v || sd.test(k)){
                        var defects = this.defectTypes,
                            issueType = defects.getDefectType(k);
                        if(issueType){
                            issueType.val = parseInt(v);
                            params.defects.push(issueType);
                        }
                    }
                }
            }, this);
            params.defects.sort(Util.sortSubDefects);
            return Util.templates(this.toolTipContent, params);
        },
        getDefectColor: function (defect, type, defectTypes) {
            var sd = config.patterns.defectsLocator,
                defectType = _.findKey(defect, function(v, k){
                    return sd.test(k);
                });
            if(defectType){
                var issueType = defectTypes.getDefectType(defectType);
                if(issueType){
                    return issueType.color;
                }
            }
            return Util.getDefaultColor(type);
        },
        getDefectChartData: function (defect) {
            var data = [];
            _.each(defect, function(v, k){
                if(k !== 'total'){
                    var defects = this.defectTypes,
                        customDefect = defects.getDefectType(k);
                    if(customDefect){
                        data.push({color: customDefect.color, key: customDefect.longName, value: parseInt(v)});
                    }
                }
            }, this);
            return data;
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
        destroy: function(){
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
            delete this;
        }
    });

    var MostFailedTestCases = BaseWidget.extend({
        tpl: 'tpl-widget-most-failed-table',
        getData: function (data) {
            var lastLaunch = data.lastLaunch;
            delete data.lastLaunch;
            var items = _.map(data, function (val, key) {
                return {
                    name: key,
                    runs: val[0].values['All runs'],
                    failed: val[0].values['Failed'],
                    affected: val[0].values['Affected by'],
                    depth: val[0].values['Launch depth'],
                    lastDate: val[0].values['Last Failure']
                };
            });
            return {
                items: items,
                lastLaunch: lastLaunch ? lastLaunch[0] : {}
            }
        },
        render: function () {
            var data = this.getData(this.param.content),
                params = {
                    items: data.items,
                    lastLaunch: {
                        id: data.lastLaunch.id,
                        link: this.linkToRedirectService(null, data.lastLaunch.id),
                        name: this.param.widgetOptions && this.param.widgetOptions.launchNameFilter.length ? this.param.widgetOptions.launchNameFilter[0] : ''
                    },
                    dateFormat: Util.dateFormat,
                    moment: Moment
                };
            this.container.append(this.$el.html(Util.templates(this.tpl, params)));
            Util.hoverFullTime(this.$el);
            !this.noScroll && Util.setupBaronScroll(this.$el);
            return this;
        }
    });

    var BugTable = BaseWidget.extend({
        tpl: 'tpl-widget-bug-table',
        tplList: 'tpl-widget-bug-table-list',
        tplItem: 'tpl-widget-bug-table-item',
        ADD_ITEMS_COUNT: 80,
        getData: function(data){
            var items = [];
            _.each(data, function(val, key){
                var item = {bugId: key, items: []};
                var time = 0;
                var name = '';
                _.each(val, function(i){
                    var t = parseInt(i.startTime);
                    var k = {
                        testItemId: i.id,
                        launchId: i.values.launchRef
                    };
                    item.items.push(k);
                    if(time === 0 || time > t){
                        time = t;
                        name = i.name;
                    }
                });
                item.name = name;
                item.time = time;
                items.push(item);
            });
            items.sort(function(a,b) {
                return b.time - a.time;
            });
            return items;
        },
        render: function () {
            var conf = config.project.configuration;

            this.params = {
                title: this.getTitle(),
                items: [],
                conf: conf,
                imageRoot: urls.getAvatar,
                dateFormat: Util.dateFormat,
                moment: Moment
            };

            this.items = this.getData(this.param.content);
            this.params.items = this.items;
            this.container.append(this.$el.html(Util.templates(this.tpl, this.params)));
            this.listContainer = $('.uniq-bugs-list', this.container);

            this.currentBugIndex = 0;
            this.currentBugItemIndex = 0;
            this.addPackItems();
            if(!this.noScroll) {
                var scrollEl = Util.setupBaronScroll(this.$el);
                var self = this;
                scrollEl.scroll(function(){
                    var elem = scrollEl.get(0);
                    if(elem.scrollHeight - elem.scrollTop  < elem.offsetHeight*2){
                        self.addPackItems();
                    }
                });
            }
            // this.getItemsInfo();
            return this;
        },
        addPackItems: function(){
            var currentItemCount = 0;
            var addedPack = [];
            while(currentItemCount < this.ADD_ITEMS_COUNT){
                if(this.currentBugItemIndex == 0){
                    if(!this.addBugList()) break;
                }
                if(this.currentBugItemIndex < this.currentBug.items.length){
                    this.lastBugContainer.append(
                        Util.templates(this.tplItem, this.currentBug.items[this.currentBugItemIndex])
                    );
                    addedPack.push(this.currentBug.items[this.currentBugItemIndex]);
                    this.currentBugItemIndex++;
                }else{
                    this.currentBugItemIndex = 0;
                }
                currentItemCount++;
            }
            this.getItemsInfo(addedPack);
        },
        addBugList: function(){
            if(this.currentBugIndex >= this.items.length) return false;
            this.currentBug = this.items[this.currentBugIndex];
            this.params.item = this.currentBug;
            var $listElement = $.parseHTML(Util.templates(this.tplList, _.extend(this.params, {methodUpdateImagePath: Util.updateImagePath})));
            Util.hoverFullTime($listElement);
            this.listContainer.append($listElement);
            this.lastBugContainer = $('[data-js-bugs-item]:last', this.listContainer);
            this.currentBugIndex++;
            return true;
        },
        renderTags: function(tags){
            if (!_.isEmpty(tags)) {
                return '<span class="text-muted"><i class="material-icons">local_offer</i> ' + tags.join(', ') + '</span>';
            }
            return '';
        },
        renderItemName: function(name, path, id){
            var url = this.getItemUrl(path, id);
            return '<a class="rp-blue-link-undrl" target="_blank" title="' + name + '" href="' + url +'">' + name + '</a><br />';
        },
        getItemUrl: function(path, id){
            return '#' + config.project.projectId + '/launches/all/' + path.join('/') + '?log.item=' + id;
        },
        getItemsInfo: function (items) {
            if(items.length){
                var self = this;
                var itemsIds = _.uniq(_.map(items, function(item){return item.testItemId}));
                Service.getTestItemsInfo(itemsIds)
                    .done(function(response){
                        _.each(itemsIds, function(id){
                            var item = _.find(response, function(d){ return d.id == id; });
                            if(item){
                                self.calculateItemInfo(item, id);
                            }
                        });
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, 'getItemsWidgetBugTable');
                        // $('#' + id, self.$el).empty();
                    });
            }
        },
        calculateItemInfo: function(itemData, id){
            var path = [itemData.launchId].concat(_.keys(itemData.path_names)),
                issues = itemData.issue.externalSystemIssues,
                tags = itemData.tags ? this.renderTags(itemData.tags) : '',
                name = this.renderItemName(itemData.name, path, id),
                self = this;
            $('[data-item-id="' + id + '"]', self.$el).empty().prepend(name, tags);
            _.forEach(issues, function (issue) {
                var link = $('#bugId-' + issue.ticketId, self.$el);
                if (issue.url && !link.parent().is('a.rp-blue-link-undrl')) {
                    link.wrap('<a class="rp-blue-link-undrl" target="_blank" href="' + issue.url + '"></a>');
                }
            });
        }
    });

    var TestCasesUniqueLaunches = BaseWidget.extend({
        tpl: 'tpl-widget-cases-uniq-launches',
        parseData: function (data) {
            var toDel = 'Median value in all unique launches';
            data[toDel] && delete data[toDel];
            var median = [],
                result = _.map(data, function (val, key) {
                    var name = val[0].name,
                        values = val[0].values;
                    median.push(parseInt(values.avg));
                    return _.extend({name: name}, values);
                });
            result.sort(function(a, b){ return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;});
            median.sort(function(a, b){ return a-b; });
            return {items: result, median: median};
        },
        getMedian: function(data){
            var median = 0,
                n = data.length;
            if(n) {
                if (n % 2 === 0) {
                    median = (parseInt(data[n / 2 - 1]) + parseInt(data[n / 2])) / 2;
                }
                else {
                    median = parseInt(data[(n + 1) / 2 - 1]);
                }
            }
            return median;
        },
        render: function () {
            var data = this.parseData(this.param.content),
                params = {
                    median: this.getMedian(data.median),
                    items: data.items
                };
            this.container.empty();
            this.container.append(this.$el.html(Util.templates(this.tpl, params)));
            return this;
        }
    });

    var StaticticsPanel = BaseWidget.extend({
        tpl: 'tpl-widget-statistics-panel',
        getData: function(){
            var contentData = this.param.content || [];
            if (!_.isEmpty(contentData) && !_.isEmpty(contentData.result)) {

                var criteria = this.param.content_fields,
                    values = contentData.result[0].values,
                    widgetsConfig = WidgetsConfig.getInstance(),
                    gadget =  this.param.gadget,
                    widgetType = widgetsConfig.widgetTypes[gadget],
                    data = {
                        executions: [],
                        defects: []
                    };

                this.invalid = 0;

                if(values && !_.isEmpty(values)){
                    _.each(criteria, function(c){
                        var a = c.split('$'),
                            type = a[1],
                            id = _.last(a),
                            name = !widgetType.noCriteria ? widgetType.criteria[c] : widgetType.staticCriteria[c],
                            value = values[id];

                        if(!name){
                            name = Localization.widgets.invalidCriteria;
                            id = 'invalid';
                            value = 0;
                            this.invalid++;
                        }

                        data[type].push({
                            key: name,
                            seriesId: id,
                            type: type,
                            color: this.getSeriesColor(id),
                            value: value
                        });

                    }, this);
                }
                return data;
            }
            return [];
        },
        render: function () {
            var params = {
                title: this.param.name,
                statistics: this.getData(),
                invalidDataMessage: this.invalidDataMessage(this.invalid),
                invalid: this.invalid
            };
            this.container.append(this.$el.html(Util.templates(this.tpl, params)));
            !this.noScroll && Util.setupBaronScroll(this.$el);
            return this;
        }
    });

    var ActivityStreamPanel = BaseWidget.extend({
        initialize: function(options){
            BaseWidget.prototype.initialize.call(this, options);
            this.isAutoRefresh = false; //!_.isUndefined(options.isAutoRefresh) ? options.isAutoRefresh : true;
            this.isReverse = !_.isUndefined(options.isReverse) ? options.isReverse : true;
            this.projectId = options.projectId || config.project.projectId;
        },
        tpl: 'tpl-widget-activity-stream',
        clearAutoRefresh: function () {
            clearTimeout(this.itemRefresh);
            var dashboardModel = this.getCurrentDashboard();
            if(dashboardModel){
                dashboardModel.refreshItems = _.without(dashboardModel.refreshItems, this.itemRefresh);
            }
        },
        checkForInProgress: function () {
            this.clearAutoRefresh();
            var self = this;
            this.itemRefresh = setTimeout(function () {
                if (window.isActive) {
                    self.parent.refresh();
                }
                else {
                    $(window).one('focus', function () {
                        self.parent.refresh();
                    });
                }
            }, config.itemsAutoRefresh);
            var dashboardModel = this.getCurrentDashboard();
            if (dashboardModel.refreshItems) {
                dashboardModel.refreshItems.push(this.itemRefresh);
            }
            else {
                dashboardModel.refreshItems = [this.itemRefresh];
            }
        },
        getCurrentDashboard: function () {
            var dashboardModel = this.navigationInfo.getCurrentDashboard();
            return dashboardModel;
        },
        parseOnOff: function(val){
            return val == 'false' ? Localization.ui.off : val == 'true' ? Localization.ui.on : val;
        },
        getBts: function(val){
            var bts = val.split(':');
            return {type: bts[0], name: bts[1]};
        },
        getData: function(data){
            var dates = [];
            if(data.result) {
                _.each(this.isReverse ? data.result.reverse() : data.result, function (val) {
                    if(!(!Util.hasValidBtsSystem() && val.values.objectType == 'testItem' && val.values.actionType.indexOf('issue') > 0)) {
                        var isEmail = null,
                            emailAction = null,
                            values = {
                                id: val.id
                            };
                        if (val.values.actionType == 'update_project') {
                            values.history = {};
                            _.each(val.values, function (v, k) {
                                if (k.indexOf('Value') > 0) {
                                    if (k == 'emailEnabled$newValue') {
                                        isEmail = 'email';
                                        emailAction = v == 'false' ? 'off_email' : 'on_email';
                                    } else if (k == 'emailCases$newValue') {
                                        isEmail = 'email';
                                        emailAction = 'update_email';
                                    }
                                    else {
                                        var a = k.split('$'),
                                            name = a[0],
                                            type = a[1],
                                            obj = {};
                                        obj[type] = v;
                                        if (values.history[name]) {
                                            _.extend(values.history[name], obj);
                                        }
                                        else {
                                            values.history[name] = obj;
                                        }
                                    }
                                }
                                values[k] = v;
                            }, this);
                        }
                        else {
                            _.extend(values, val.values);
                        }

                        if (isEmail) {
                            values.objectType = isEmail;
                            values.actionType = emailAction;
                        }

                        if (this.checkForIssues(values.actionType)) {
                            this.testItems.push(values.loggedObjectRef);
                        }

                        var date = new Date(parseFloat(values.last_modified)),
                            dateWoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                            dateKey = '' + Date.parse(dateWoTime);

                        values.fullTime = Util.dateFormat(parseFloat(values.last_modified));
                        values.momentTime = Moment(values.fullTime).fromNow();
                        values.userRef = (values.userRef) ? values.userRef.split('_').join(' ') : '';

                        var contains = _.find(dates, function (item) {
                            return item.day == dateKey;
                        });
                        if (contains) {
                            contains.items.push(values);
                        }
                        else {
                            var now = new Date(),
                                today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf(),
                                dayTitle = '',
                                yesterday = new Date(today - 86400000).valueOf(),
                                dt = new Date(parseFloat(dateKey)),
                                months = Localization.ui.months,
                                days = Localization.ui.days;
                            if (dateKey == today) {
                                dayTitle = Localization.ui.today;
                            } else if (dateKey == yesterday) {
                                dayTitle = Localization.ui.yesterday;
                            } else if (today - dateKey <= 604800000) {
                                dayTitle = days[dt.getDay()];
                            } else {
                                dayTitle = months[dt.getMonth()] + ' ' + dt.getDate();
                            }
                            var obj = {
                                day: dateKey,
                                dayTitle: dayTitle,
                                items: [values]
                            };
                            dates.push(obj);
                        }
                    }
                }, this);
            }
            return dates;
        },
        render: function () {
            if(this.isAutoRefresh) {
                this.clearAutoRefresh();
            }
            this.testItems = [];

            var dates = this.getData(this.param.content),
                conf = config.project.configuration,
                params = {
                    title: this.param.name,
                    conf: conf,
                    properties: {
                        projectUrl: this.projectId
                    },
                    getBts: this.getBts,
                    getTicketUrlId: Util.getTicketUrlId,
                    getTickets: this.getTickets,
                    parseOnOff: this.parseOnOff,
                    methodUpdateImagePath: Util.updateImagePath,
                    imageRoot: urls.getAvatar,
                    dates: dates
                };

            this.container.append(this.$el.html(Util.templates(this.tpl, params)));
            Util.hoverFullTime(this.$el);
            !this.noScroll && Util.setupBaronScroll(this.$el);
            this.getItemsInfo(_.uniq(this.testItems));
            if(this.isAutoRefresh){
                this.checkForInProgress();
            }
            return this;
        },
        getTickets: function(item){
            var newTickets = item.ticketId$newValue ? item.ticketId$newValue.split(',') : [],
                oldTickets = item.ticketId$oldValue ? item.ticketId$oldValue.split(',') : [];
            return _.difference(newTickets, oldTickets);
        },
        getItemsInfo: function (items) {
            var self = this;
            _.each(items, function(ikey){
                Service.getTestItemInfo(ikey)
                    .done(function(responce){
                        var path = [responce.launchId].concat(_.keys(responce.path_names));
                        $.each($('[id="itemId-'+ikey+'"]'), function(){
                            $(this).html(' ' + responce.name).wrap('<a class="rp-blue-link-undrl" target="_blank" href="#'+ self.projectId + '/launches/all/' + path.join('/') + '?log.item=' + ikey +'"></a>');
                        });
                    })
                    .fail(function (error) {
                        //Util.ajaxFailMessenger(error, 'getItemsWidgetBugTable');
                        $('#itemId-' + ikey, self.$el).html(Localization.widgets.testItemNotFound);
                    });
            });
        },
        checkForIssues: function(type){
            return type === 'post_issue' || type === 'attach_issue';
        },
        destroy: function () {
            var baronScroll = this.$el.parent('.baron_scroller').parent('.baron__root');
            if(this.isAutoRefresh) {
                this.clearAutoRefresh();
            }
            BaseWidget.prototype.destroy.call(this);
            baronScroll.baron().dispose();
            baronScroll.remove();
        }
    });

    var ChartView = BaseWidget.extend({
        className: 'panel-body',
        tplTooltip: 'tpl-widget-tooltip',
        attributes: function () {
            return {id: this.id}
        },
        redirectOnElementClick: function (type) {
            if (!this.isPreview) {
                var self = this;
                this.chart[type].dispatch.on("elementClick", function (e) {
                    config.trackingDispatcher.trackEventNumber(344);
                    if ($('.fullscreen-close').is(':visible')) {
                        // $('#dynamic-content').getNiceScroll().remove();
                        $.fullscreen.exit();
                    }
                    if(self.param.isTimeline){
                        self.redirectForTimeLine(e);
                    }
                    else {
                        self.redirectToLaunch(e);
                    }
                });
            }
        },
        redirectForTimeLine: function(e){
            var self = this,
                appModel = new SingletonAppModel(),
                projectId = appModel.get('projectId'),
                range = 86400000,
                filterId = this.param.filter_id,
                newFilter = 'New_filter',
                linkArr = ['#'+projectId, 'launches', newFilter];
            Service.getFilterData([filterId])
                .done(function(response){
                    var time = Moment.unix(e.point.startTime),
                        dateFilter = {condition: 'btw', filtering_field: 'start_time', is_negative: false, value: time.format('x') + ',' + (parseInt(time.format('x')) + range)},
                        filtersCollection = new SingletonLaunchFilterCollection(),
                        newFilter = filtersCollection.generateTempModel(),
                        entities = response[0].entities || [],
                        link = newFilter.get('url');

                    entities.push(dateFilter);
                    newFilter.set('newEntities', JSON.stringify(entities));
                    link += '?' + newFilter.getOptions().join('&');
                    if (link) {
                        setTimeout(function(){
                            document.location.hash = link;
                        }, 100);
                    }
                });
        },
        redirectToLaunch: function(e){
            var key = e.series.key,
                seria = _.find(this.series, function(v, k){ return v.key == key;}),
                seriesId = seria ? seria.seriesId : '' ,
                cat = this.categories[e.pointIndex],
                id = cat.id,
                link = seriesId && id ? this.linkToRedirectService(seriesId, id) : '';
            if (link) {
                setTimeout(function(){
                    document.location.hash = link;
                }, 100);
            }
        },
        createTooltip: function (content) {
            if (content && $.fullscreen.isFullScreen()) {
                return d3tip()
                    .attr({'class': 'd3-tip', 'id': 'd3-tip-' + this.id})
                    .style('display', 'none')
                    .offset([10, 150])
                    .html(function (d) {
                        return content;
                    })
            } else {
                return d3tip()
                    .attr({'class': 'd3-tip', 'id': 'd3-tip-' + this.id})
                    .style('display', 'none')
                    .offset([-10, 0])
                    .html(function (d) {
                        return content;
                    })
            }
        },
        tooltipLabel: Localization.widgets.casesLabel,
        tooltipContent: function(){
            var self = this;
            return function (key, x, y, e, graph) {
                config.trackingDispatcher.trackEventNumber(343);
                if (self.param.isTimeline) {
                    var index = e.pointIndex,
                        cat = self.categories[index],
                        date = Moment.unix(cat.startTime);
                    return '<p style="text-align:left"><strong>' + date.format('YYYY-MM-DD') + '</strong><br/>' + key + ': <strong>' + y + '</strong> ' + self.tooltipLabel + '</p>';
                } else {
                    var index = e.pointIndex,
                        cat = self.categories[index],
                        date = self.formatDateTime(cat.startTime);
                    return '<p style="text-align:left"><strong>' + cat.name + ' ' + cat.number + '</strong><br/>' + date + '<br/>' + key + ': <strong>' + y + '</strong> ' + self.tooltipLabel + '</p>';
                }
            };
        },
        getTitle: function () {
            if (this.param.name) {
                return {
                    text: (this.param.name.length > 56) ? this.param.name.slice(0, 56).escapeHtml() + '...' : this.param.name.escapeHtml(),
                    useHTML: true
                }
            }
        },
        addSVG: function () {
            this.container.append(this.$el.css('overflow', 'visible').attr(this.attributes()).append('<svg style="height: 100%;"></svg>'));
        },
        formatNumber: function (d) {
            if (d % 1 === 0) {
                if(!this.param.isTimeline) {
                    var cat = this.categories[d - 1];
                    return (cat && cat.number) ? cat.number : d;
                }
                else {
                    var cat = this.categories[d - 1],
                        date = Moment.unix(cat.startTime);
                    return date.format('ddd') + ',<br>' + date.format('YYYY-MM-DD');
                }
            }
            return '';
        },
        formatCategories: function (d) {
            if(!this.param.isTimeline){
                var cat = this.categories[d - 1],
                    date = this.formatDateTime(cat.startTime);
                return '<strong>' + cat.name + ' ' + cat.number + '</strong><br/><span style="font-weight:normal">' + date + '</span>';
            }
            else {
                var cat = this.categories[d - 1],
                    date = Moment.unix(cat.startTime);
                return  '<strong>' + date.format('YYYY-MM-DD') + '</span>';
            }
        },
        formatDateTime: function(time){
            return Util.dateFormat(new Date(time));
        },
        disabeLegendEvents: function () {
            if(this.chart.legend) {
                for (var property in this.chart.legend.dispatch) {
                    this.chart.legend.dispatch[property] = function () {
                    };
                }
            }
        },
        addLegendClick: function(svg){
            if(this.chart.legend) {
                svg.selectAll('.nvd3.nv-legend').on('click', function(){
                    config.trackingDispatcher.trackEventNumber(342);
                });
            }
        },
        addLaunchNameTip: function(svg, tip){
            if (!this.isPreview) {
                var self = this;
                svg.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text')
                    .each(function(d) {
                        d3.select(this)
                            .on('mouseover.' + self.id, function (event) {
                                if (d3.select(this).style('opacity') == 1) {
                                    var category = self.categories[event - 1] || {};
                                    if (!category.name && !category.number) return;
                                    tip
                                        .style('display', 'block')
                                        .html(Util.templates(self.tplTooltip, {
                                            tooltipName: Localization.launches.launchName,
                                            tooltipContent: category.name + ' ' + category.number
                                        })).show();
                                }
                            })
                            .on('mouseout.' + self.id, function () {
                                tip
                                    .style('display', 'none')
                                    .hide();
                            });
                    });
            }
        },
        getSeries: function(criteria){
            var widgetsConfig = WidgetsConfig.getInstance(),
                series = {},
                gadget =  this.param.gadget,
                widgetType = widgetsConfig.widgetTypes[gadget];
            this.invalid = 0;

            _.each(criteria, function(i){
                var a = i.split('$'),
                    t = _.last(a),
                    seriesId = t,
                    name = !widgetType.noCriteria ? widgetType.criteria[i] : widgetType.staticCriteria[i];

                if(gadget === 'launches_comparison_chart' || gadget === 'last_launch'){
                    var n = t.split('_');
                    if(n[1]){
                        n[1] = n[1].capitalize();
                    }
                    t = seriesId = n.join('');
                }
                if(!name){
                    name = Localization.widgets.invalidCriteria;
                    seriesId = 'invalid';
                    this.invalid++;
                }
                series[t] = {
                    key: name,
                    seriesId: seriesId,
                    color: this.getSeriesColor(seriesId),
                    values: []
                };

            }, this);
            if(gadget === 'launches_comparison_chart'){
                delete series.total;
            }
            this.series = series;
            return this.series;
        },
        updateInvalidCriteria: function(vis){
            if(this.invalid){
                vis.selectAll('.nv-legend .nv-legend-text').each(function (d, i) {
                    if(d.seriesId == 'invalid'){
                        d3.select(this).attr("fill", d.color);
                        d3.select(this.previousSibling).attr('r', '2');
                    }
                });
                $('#' + this.id)
                    .addClass('widget-invalid')
                    .append(this.invalidDataMessage(this.invalid));

                this.chart.update();
            }
        },
        getChartData: function(){
            var contentData = this.param.content || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var criteria = this.param.content_fields,
                    series = this.getSeries(criteria);

                if(!this.param.isTimeline) {
                    _.each(contentData.result, function (d, i) {
                        var cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number,
                            startTime: parseInt(d.startTime)
                        };
                        this.categories.push(cat);
                        _.each(d.values, function (v, k) {
                            var type = _.last(k.split('$')),
                                prop = _.extend({x: i + 1, y: parseFloat(v)}, cat);
                            series[type] && series[type].values.push(prop);
                        });

                    }, this);
                }
                else {
                    var pairs = _.pairs(contentData);
                    pairs.sort(function(a,b){ return Moment(a[0], 'YYYY-MM-DD').unix() - Moment(b[0], 'YYYY-MM-DD').unix()});
                    _.each(pairs, function(p, i){
                        var values = p[1][0].values,
                            date = Moment(p[0], 'YYYY-MM-DD'),
                            cat = {
                                time: date.format('YYYY-MM-DD'),
                                startTime: date.unix()
                            };
                        this.categories.push(cat);
                        _.each(values, function (v, k) {
                            var type = _.last(k.split('$')),
                                prop = {startTime: date.unix(), x: i+1, y: parseFloat(v)};
                            series[type].values.push(prop);
                        });
                    }, this);
                }
                return _.values(series);
            }
            return [];
        },
        updateChart: function() {
            var self = this;
            if(self.charts && self.charts.length){
                _.each(self.charts, function(chart){
                    chart && chart.update();
                });
            }
            else {
                self.chart && self.chart.update();
            }
        },
        addResize: function(){
            var self = this,
                update = function(e){
                    if($(e.target).is($(window))) {
                        self.updateChart();
                    }
                },
                resize  = _.debounce(update, 500);
            $(window).on('resize.' + this.id, resize);
        }
    });

    var LineChartView = ChartView.extend({
        redirectOnElementClick: function () {
            this.chart.stacked.dispatch.on("areaClick", null);
            this.chart.stacked.dispatch.on("areaClick.toggle", null);
            if (!this.isPreview) {
                var self = this,
                    svg = d3.select('#' + this.id + ' svg'),
                    point = svg.select('.nv-scatterWrap').selectAll('path.nv-point');

                this.chart.stacked.dispatch.on("areaClick", function (e) {
                    config.trackingDispatcher.trackEventNumber(344);
                    self.redirectTo(e);
                });
                point.each(function () {
                    d3.select(this).on('click', function (e) {
                        config.trackingDispatcher.trackEventNumber(344);
                        self.redirectTo(e);
                    });
                });
            }
        },
        redirectTo: function (e) {
            // if ($('.fullscreen-close').is(':visible')) {
                // $('#dynamic-content').getNiceScroll().remove();
                // $('.fullscreen-close').trigger('click');
            // }
            var o = {series: {}};
            if (!_.has(e, 'pointIndex')) {
                var svg = d3.select('#' + this.id + ' svg'),
                    data = svg.data();
                o.series.key = (data && data[0] && data[0][e.seriesIndex]) ? data[0][e.seriesIndex].key : null;
                o.pointIndex = parseInt(e.index);
            }
            else {
                o.series.key = e.series;
                o.pointIndex = 0 + parseInt(e.pointIndex);
            }
            if(this.param.isTimeline){
                var cat = this.categories[o.pointIndex];
                o.point = {startTime: cat.startTime};
                this.redirectForTimeLine(o);
            }
            else {
                this.redirectToLaunch(o);
            }
        },
        render: function () {
            this.addSVG();
            var data = this.getChartData(),
                self = this;
            this.chart = nvd3.models.stackedAreaChart()
                .margin({left: 70})
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .useInteractiveGuideline(!self.isPreview)
                .showControls(false)
                .clipEdge(true)
                .showLegend(!self.isPreview)
                ;

            this.chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                })
                ;

            this.chart.yAxis
                .axisLabelDistance(-10)
                .axisLabel('cases')
                ;

            this.chart.yAxisTickFormat(d3.format('d'));

            var tip = this.createTooltip(),
                vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                ;

            if (self.param.isTimeline) {
                var contentGenerator = this.chart.interactiveLayer.tooltip.contentGenerator(),
                    tooltip = this.chart.interactiveLayer.tooltip;
                    tooltip.contentGenerator(function (d) {
                        var date = d.value.split('>')[d.value.split('>').length-2],
                            dateClear = date.split('<')[0];

                        d.value = Moment(dateClear).format('YYYY-MM-DD');
                        return contentGenerator(d);
                    });
            } else {
                vis.call(tip);
            }

            vis.selectAll('.nv-stackedarea').each(function(d, i){
                $(this).on('mouseenter', function(){
                    config.trackingDispatcher.trackEventNumber(343);
                });
            });

            if (self.param.isTimeline) {
                vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                    var $this = $(this),
                        isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;

                    var multiLineText = $this.text().split('<br>');

                    $this.empty();
                    for (i = 0; i < multiLineText.length; i++) {
                        d3.select(this).append("tspan")
                            .text(multiLineText[i])
                            .attr("dy", i ? "1.2em" : 0)
                            .attr("x", isMaxMin ? -10 : 0)
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .attr("class", "tspan" + i);
                    }
                });
            }

            this.addLaunchNameTip(vis, tip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                });

            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis.
                    tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;
                if (self.param.isTimeline) {
                    vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                        var $this = $(this),
                            isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;
                        var multiLineText = $this.text().split('<br>');

                        $this.empty();
                        for (i = 0; i < multiLineText.length; i++) {
                            d3.select(this).append("tspan")
                                .text(multiLineText[i])
                                .attr("dy", i ? "1.2em" : 0)
                                .attr("x", isMaxMin ? -10 : 0)
                                .attr("y", 20)
                                .attr("text-anchor", "middle")
                                .attr("class", "tspan" + i);
                        }
                    });
                }
                self.addLaunchNameTip(vis, tip)
                self.redirectOnElementClick();
                self.addLegendClick(vis);
            };
            this.chart.update = update;

            this.addResize();
            this.redirectOnElementClick();
            this.addLegendClick(vis);
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            this.updateInvalidCriteria(vis);
            return this;
        }
    });

    var TrendsChartView = ChartView.extend({
        // TODO ?
        render: function () {
            this.addSVG();

            var data = this.getChartData(),
                self = this,
                tooltip = this.tooltipContent();

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x
                })
                .y(function (d) {
                    return d.y
                })
                .forceY([0,1])
                .stacked(true)
                .showControls(false)
                .clipEdge(true)
                .showXAxis(true)
                .tooltips(self.isPreview ? false : true)
                .showLegend(!self.isPreview)
                ;

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(d3.format("d"))
                .axisLabelDistance(-10)
                .axisLabel('cases')
                ;

            this.chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                })
                ;

            var tip = this.createTooltip();

            var vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                .call(tip)
                ;

            if (self.param.isTimeline) {
                vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                    var $this = $(this),
                        isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;

                    var multiLineText = $this.text().split('<br>');

                    $this.empty();
                    for (i = 0; i < multiLineText.length; i++) {
                        d3.select(this).append("tspan")
                            .text(multiLineText[i])
                            .attr("dy", i ? "1.2em" : 0)
                            .attr("x", isMaxMin ? -10 : 0)
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .attr("class", "tspan" + i);
                    }
                });
            }

            this.addLaunchNameTip(vis, tip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                });
            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis.
                    tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;

                if (self.param.isTimeline) {
                    vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                        var $this = $(this),
                            isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;
                        var multiLineText = $this.text().split('<br>');

                        $this.empty();
                        for (i = 0; i < multiLineText.length; i++) {
                            d3.select(this).append("tspan")
                                .text(multiLineText[i])
                                .attr("dy", i ? "1.2em" : 0)
                                .attr("x", isMaxMin ? -10 : 0)
                                .attr("y", 20)
                                .attr("text-anchor", "middle")
                                .attr("class", "tspan" + i);
                        }
                    });
                }
            };
            this.chart.update = update;
            this.addResize();
            this.redirectOnElementClick('multibar');
            this.addLegendClick(vis);
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            this.updateInvalidCriteria(vis);
            return this;
        }
    });

    var ColumnChartView = ChartView.extend({
        getChartData: function(){
            var contentData = this.param.content || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var series = {
                        to_investigate: {key: Localization.widgets.toInvestigate, seriesId: 'to_investigate',},
                        investigated: {key: Localization.widgets.investigated, seriesId: 'investigated'}
                    };
                _.each(series, function(val, key){
                    val.color = this.getSeriesColor(key);
                    val.values = [];
                }, this);
                if(!this.param.isTimeline) {
                    _.each(contentData.result, function (d, i) {
                        var cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number,
                            startTime: parseInt(d.startTime)
                        };
                        this.categories.push(cat);
                        _.each(d.values, function (v, k) {
                            var prop = _.extend({x: i + 1, y: parseFloat(v)}, cat);
                            series[k].values.push(prop);
                        });

                    }, this);
                }
                else {
                    var pairs = _.pairs(contentData);
                    pairs.sort(function(a,b){ return Moment(a[0], 'YYYY-MM-DD').unix() - Moment(b[0], 'YYYY-MM-DD').unix()});
                    _.each(pairs, function(p, i){
                        var values = p[1][0].values,
                            date = Moment(p[0], 'YYYY-MM-DD'),
                            cat = {
                                time: date.format('YYYY-MM-DD'),
                                startTime: date.unix()
                            };
                        this.categories.push(cat);
                        _.each(values, function (v, k) {
                            var prop = {startTime: date.unix(), x: i+1, y: parseFloat(v)};
                            series[k].values.push(prop);
                        });
                    }, this);
                }
                this.series = _.values(series)
                return this.series;
            }
            return [];
        },

        tooltipLabel: '%',

        render: function () {
            this.addSVG();

            var data = this.getChartData(),
                self = this,
                tooltip = this.tooltipContent();

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .stacked(true)
                .forceY([0,1])
                .showControls(false)
                .clipEdge(true)
                .showXAxis(true)
                .yDomain([0,100])
                .tooltips(self.isPreview ? false : true)
                .showLegend(self.isPreview ? false : true)
                ;

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(function(d){
                    return d;
                })
                .axisLabelDistance(-10)
                .axisLabel(Localization.widgets.ofInvestigation)
                ;

            this.chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                });

            var tip = this.createTooltip();

            var vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                .call(tip);

            if (self.param.isTimeline) {
                vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                    var $this = $(this),
                        isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;

                    var multiLineText = $this.text().split('<br>');

                    $this.empty();
                    for (i = 0; i < multiLineText.length; i++) {
                        d3.select(this).append("tspan")
                            .text(multiLineText[i])
                            .attr("dy", i ? "1.2em" : 0)
                            .attr("x", isMaxMin ? -10 : 0)
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .attr("class", "tspan" + i);
                    }
                });
            }

            this.addLaunchNameTip(vis, tip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                });
            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis.
                    tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;

                $('.tick text').each(function () {
                    var $this = $(this);
                    if (!self.param.isTimeline) {
                        $this.css('opacity') == 0 ? $this.parent().css('display', 'none') : $this.parent().css('display', 'block')
                    }
                });
                if (self.param.isTimeline) {
                    vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                        var $this = $(this),
                            isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;
                        var multiLineText = $this.text().split('<br>');

                        $this.empty();
                        for (i = 0; i < multiLineText.length; i++) {
                            d3.select(this).append("tspan")
                                .text(multiLineText[i])
                                .attr("dy", i ? "1.2em" : 0)
                                .attr("x", isMaxMin ? -10 : 0)
                                .attr("y", 20)
                                .attr("text-anchor", "middle")
                                .attr("class", "tspan" + i);
                        }
                    });
                }
            };
            this.chart.update = update;
            this.addResize();
            this.redirectOnElementClick('multibar');
            this.addLegendClick(vis);
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            return this;
        }
    });

    var LaunchesComparisonChart = ChartView.extend({
        tooltipLabel: '%',

        getSeries: function(criteria){
            var widgetsConfig = WidgetsConfig.getInstance(),
                series = {},
                gadget =  this.param.gadget,
                widgetType = widgetsConfig.widgetTypes[gadget];

            _.each(criteria, function(i){
                var a = i.split('$'),
                    type = a[1],
                    t = type == 'defects' ? a[2] : _.last(a),
                    seriesId = t,
                    sd = config.patterns.defectsLocator,
                    name = !widgetType.noCriteria ? widgetType.criteria[i] : widgetType.staticCriteria[i];
                if(seriesId !== 'total'){
                    if(type == 'defects'){
                        var def = _.map(a[2].split('_'), function(d, i){ return i > 0 ? d.capitalize() : d;}),
                            t = def.join('');
                    }
                    if(!series[t]){
                        series[t] = {
                            key: name,
                            seriesId: seriesId,
                            color: this.getSeriesColor(seriesId),
                            values: []
                        };
                    }
                    if(type == 'defects' && sd.test(_.last(a))){
                        series[t].key = name;
                    }
                }
            }, this);
            this.series = series;
            return this.series;
        },

        getChartData: function() {
            var contentData = this.param.content || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var criteria = this.param.content_fields,
                    series = this.getSeries(criteria);

                _.each(contentData.result, function (d, i) {
                    var cat = {
                        id: d.id,
                        name: d.name,
                        number: '#' + d.number,
                        startTime: parseInt(d.startTime)
                    };
                    this.categories.push(cat);
                    _.each(d.values, function (v, k) {
                        var a = k.split('$'),
                            type = a[1],
                            id = type == 'issueCounter' ? a[2] : _.last(a),
                            prop = _.extend({x: i + 1, y: parseFloat(v)}, cat);

                        if(series[id]){
                            if(_.isObject(series[id].values[i])){
                                series[id].values[i].y += parseFloat(v);
                            }
                            else {
                                series[id].values.push(prop);
                            }
                        }
                    });
                }, this);
                return _.values(series);
            }
            return [];
        },

        render: function () {
            this.addSVG();
            var data = this.getChartData(),
                self = this,
                tooltip = this.tooltipContent();
            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x
                })
                .y(function (d) {
                    return d.y
                })
                .forceY([0,1])
                .showControls(false)
                .clipEdge(true)
                .showXAxis(true)
                .yDomain([0,100])
                .tooltips(self.isPreview ? false : true)
                .showLegend(!self.isPreview)
                ;

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .axisLabelDistance(-10)
                .tickFormat(function (d) {
                    return d;
                })
                .tickValues(_.range(0, 101, 10))
                .axisLabel('% ' + Localization.widgets.ofTestCases);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                });

            var tip = this.createTooltip();

            var vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                .call(tip);

            this.addLaunchNameTip(vis, tip);
            this.addLegendClick(vis);
            this.addResize();
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            return this;
        }
    });

    var LaunchesDurationChart = ChartView.extend({
        getTimeType: function (max) {
            var time = {value: 3600000, type: Localization.time.hours};
            if(max > 0){
                if (max < 60000) {
                    time = {value: 1000, type: Localization.time.seconds};
                }
                else if (max <= 2 * 3600000) {
                    time = {value: 60000, type: Localization.time.minutes};
                }
            }
            return time;
        },
        getChartData: function(){
            var contentData = this.param.content || [];
            this.categories = [];
            this.colors = [];
            this.max = 0;
            this.ITERUPT = 'INTERRUPTED';
            if (!_.isEmpty(contentData) && contentData.result) {
                var series = {}, size = 0,
                    sum = 0, avg = 0,
                    key = 'duration',
                    inKey = 'interrupted',
                    data = _.clone(contentData.result).reverse();
                series.key = Localization.widgets[key];
                series.color = this.getSeriesColor(key);
                series.seriesId = 'duration',
                series.values = [];
                _.each(data, function(d, i){
                    var values = d.values,
                        duration = parseInt(values.duration),
                        cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number
                        };
                    this.categories.push(cat);
                    series.values.push(_.extend(values, {num: i+1}, cat));
                    if(!this.isInterupt(values)){
                        this.max = duration > this.max ? duration : this.max;
                        sum += duration;
                        ++size;
                    }
                }, this);

                avg = sum/size;
                _.each(series.values, function (k) {
                    if (this.isInterupt(k)) {
                        k.duration = avg && !isNaN(avg) ? avg : k.duration;
                        this.colors.push(this.getSeriesColor(inKey));
                    }
                    else {
                        this.colors.push(this.getSeriesColor(key));
                    }
                }, this);
                this.series = [series];
                return this.series;
            }
            return [];
        },
        isInterupt: function(v){
            return v.status == this.ITERUPT;
        },
        tooltipContent: function(){
            var self = this,
                type = this.getTimeType(this.max);
            return function (key, x, y, e, graph) {
                config.trackingDispatcher.trackEventNumber(343);
                var index = e.pointIndex,
                    time = Moment.duration(Math.abs(e.value), type.type).humanize(true),
                    cat = self.categories[index],
                    status = e.point.status,
                    tipTitle = '<p style="text-align:left;"><b>' + cat.name + ' ' + cat.number + '</b><br/>',
                    tipVal = '<b>' + ((status !== self.ITERUPT) ? e.series.key + ':' : '<span style="color: ' + self.getSeriesColor(status) + ';">Run ' + self.ITERUPT.toLowerCase().capitalize() + '</span>') + ' </b> ' + ((status !== self.ITERUPT) ? time : '') + ' <br/></p>';
                return tipTitle + tipVal;
            };
        },
        render: function () {
            this.addSVG();
            var data = this.getChartData(),
                self = this,
                type = this.getTimeType(this.max),
                tooltip = this.tooltipContent();

            this.chart = nvd3.models.multiBarHorizontalChart()
                .x(function (d) {
                    return d.num;
                })
                .y(function (d) {
                    return parseInt(d.duration) / type.value;
                })
                .showValues(false)
                .tooltips(self.isPreview ? false : true)
                .showControls(false)
                .reduceXTicks(true)
                .barColor(this.colors)
                .valueFormat(d3.format(',.2f'))
                .showXAxis(true)
                .showLegend(false)
                ;

            this.chart.tooltipContent(tooltip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatNumber(d, self.categories);
                });
            this.chart.yAxis
                .tickFormat(d3.format(',.2f'))
                .axisLabel(type.type);

            var tip = this.createTooltip(true);

            var vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                .call(tip)
                ;


            $('.tick text').each(function () {
                var $this = $(this);
                $this.css('opacity') == 0 ? $this.parent().css('display', 'none') : $this.parent().css('display', 'block');
            });

            this.addLaunchNameTip(vis, tip);

            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis.
                    tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;

                $('.tick text').each(function () {
                    var $this = $(this);
                    if (!self.param.isTimeline) {
                        $this.css('opacity') == 0 ? $this.parent().css('display', 'none') : $this.parent().css('display', 'block')
                    }
                });
                if (self.param.isTimeline) {
                    vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                        var $this = $(this),
                            isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;

                        var multiLineText = $this.text().split('<br>');

                        $this.empty();
                        for (i = 0; i < multiLineText.length; i++) {
                            d3.select(this).append("tspan")
                                .text(multiLineText[i])
                                .attr("dy", i ? "1.2em" : 0)
                                .attr("x", isMaxMin ? -10 : 0)
                                .attr("y", 20)
                                .attr("text-anchor", "middle")
                                .attr("class", "tspan" + i);
                        }
                    });
                }

                var tip = self.createTooltip(true);

                vis.selectAll('.nv-x .tick, .nv-x .nv-axisMaxMin')
                    .on('mouseover.' + self.id, function (event) {
                        var category = self.categories[event - 1] || {};

                        if ($('#widgetWizardModal').is(':visible') || (!category.name && !category.number)) return;

                        tip.html(Util.templates(self.tplTooltip, {
                            tooltipName: Localization.launches.launchName,
                            tooltipContent: category.name + ' ' + category.number
                        })).show();
                    })
                    .on('mouseout.' + self.id, tip.hide);
                vis.call(tip);
            };
            this.chart.update = update;
            this.addResize();
            this.redirectOnElementClick('multibar');
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            return this;
        }
    });

    var CasesTrendChartView = ChartView.extend({
        addColors: function(val){
            switch (true) {
                case val < 0 :
                    this.colors.push(this.getSeriesColor('negative'));
                    break;
                case val == 0 :
                    this.colors.push(this.getSeriesColor('zero'));
                    break;
                case val > 0 :
                    this.colors.push(this.getSeriesColor('positive'));
                    break;
            }
        },
        getChartData: function(){
            var contentData = this.param.content || [];
            this.categories = [];
            this.colors = [];
            this.startVal = 0;
            if (!_.isEmpty(contentData)) {
                var series = {};
                series.key = Localization.widgets.growTestCases;
                series.color = this.getSeriesColor(series.key);
                series.seriesId = 'grow_test_cases';
                series.values = [];
                if(!this.param.isTimeline) {
                    _.each(contentData.result, function (d, i) {
                        var values = d.values,
                            val = parseInt(values['statistics$executionCounter$total']),
                            added = parseInt(values.delta),
                            cat = {
                                id: d.id,
                                name: d.name,
                                number: '#' + d.number,
                                startTime: parseInt(d.startTime)
                            };
                        this.categories.push(cat);
                        if (i == 0) {
                            this.startVal = parseInt(val);
                        }
                        this.addColors(added);
                        series.values.push(_.extend({y: added, value: val, x: i + 1}, cat));
                    }, this);
                }
                else {
                    var pairs = _.pairs(contentData);
                    pairs.sort(function(a,b){ return Moment(a[0], 'YYYY-MM-DD').unix() - Moment(b[0], 'YYYY-MM-DD').unix()});
                    _.each(pairs, function(p, i){
                        var values = p[1][0].values,
                            date = Moment(p[0], 'YYYY-MM-DD'),
                            cat = {
                                time: date.format('YYYY-MM-DD'),
                                startTime: date.unix()
                            };
                        this.categories.push(cat);
                        var val = parseInt(values['statistics$executionCounter$total']),
                            added = parseInt(values.delta);
                        if (i == 0) {
                            this.startVal = val;
                        }
                        this.addColors(added);
                        series.values.push({x: i+1, startTime: date.unix(), y: added, value: val});
                    }, this);
                }
                this.series = [series];
                return this.series;
            }
            return [];
        },
        tooltipContent: function(){
            var self = this;
            return function (key, x, y, e, graph) {
                config.trackingDispatcher.trackEventNumber(343);
                if (self.param.isTimeline) {
                    var index = e.pointIndex,
                        cat = self.categories[index];
                    return '<p style="text-align:left">' + cat.time + '<br/>' + key + ': <strong>' + y + '</strong>' + '<br/>' + Localization.widgets.totalTestCases + ': <strong>' + e.point.value + '</strong></p>';
                } else {
                    var index = e.pointIndex,
                        cat = self.categories[index],
                        date = self.formatDateTime(cat.startTime);
                    return '<p style="text-align:left"><strong>' + cat.name + ' ' + cat.number + '</strong><br/>' + date + '<br/>' + key + ': <strong>' + y + '</strong>' + '<br/>' + Localization.widgets.totalTestCases + ': <strong>' + e.point.value + '</strong></p>';
                }
            };
        },
        getDomain: function(data){
            var y = this.startVal,
                m = !_.isEmpty(data) ? _.map(data[0].values, function (a, i) {
                    return y = y + a.y;
                }) : 0,
                max = _.max(m),
                min = _.min(m),
                damain = [];
            if(max === min) {
                max += 1;
            }
            damain = [min, max];
            return damain;

        },
        render: function () {
            this.addSVG();

            var data = this.getChartData(),
                self = this,
                tooltip = this.tooltipContent(),
                yDomain = this.getDomain(data);

            this.chart = nvd3.models.trendBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .yDomain(yDomain)
                .valueFormat(d3.format('f'))
                .tooltips(self.isPreview ? false : true)
                .showValues(true)
                .color(this.colors)
                ;

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(d3.format("d"))
                .axisLabelDistance(-10)
                .axisLabel('cases')
                ;

            this.chart.xAxis
                .staggerLabels(false)
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                })
                ;

            var tip = this.createTooltip();

            var vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                .call(tip)
                ;

            if (self.param.isTimeline) {
                vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                    var $this = $(this),
                        isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;

                    var multiLineText = $this.text().split('<br>');

                    $this.empty();
                    for (i = 0; i < multiLineText.length; i++) {
                        d3.select(this).append("tspan")
                            .text(multiLineText[i])
                            .attr("dy", i ? "1.2em" : 0)
                            .attr("x", isMaxMin ? -10 : 0)
                            .attr("y", 20)
                            .attr("text-anchor", "middle")
                            .attr("class", "tspan" + i);
                    }
                });
            }
            this.addLaunchNameTip(vis, tip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                });

            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;
                if (self.param.isTimeline) {
                    vis.selectAll('.nv-x .tick text, .nv-x .nv-axisMaxMin text').each(function (d, i) {
                        var $this = $(this),
                            isMaxMin = $(".nv-x .tick", '#' + self.id + ' svg').index($this.parent()) == $(".nv-x .tick", '#' + self.id + ' svg').length - 1;

                        var multiLineText = $this.text().split('<br>');

                        $this.empty();
                        for (i = 0; i < multiLineText.length; i++) {
                            d3.select(this).append("tspan")
                                .text(multiLineText[i])
                                .attr("dy", i ? "1.2em" : 0)
                                .attr("x", isMaxMin ? -10 : 0)
                                .attr("y", 20)
                                .attr("text-anchor", "middle")
                                .attr("class", "tspan" + i);
                        }
                    });
                }
            };
            this.chart.update = update;
            this.addResize();
            this.redirectOnElementClick('trendbar');
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            return this;
        }
    });

    var NotPassedChartView = ChartView.extend({
        initialize: function (options) {
            ChartView.prototype.initialize.call(this, options);
            this.seriesTotal = Localization.widgets.not_passed;
            this.label = '%';
            this.labelName = Localization.widgets.nonPassedCases;
            this.yDomain = [0, 100];
        },
        getChartData: function(){
            var contentData = this.param.content || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var series = {};
                series.key = this.seriesTotal;
                series.color = this.getSeriesColor('not_passed');
                series.values = [];
                _.each(contentData.result, function(d, i){
                    var cat = {
                        id: d.id,
                        name: d.name,
                        number: '#' + d.number,
                        startTime: parseInt(d.startTime)
                    };
                    this.categories.push(cat);
                    series.values.push(_.extend({value: parseFloat(d.values[series.key]), num: i+1}, cat));
                }, this);
                return [series];
            }
            return [];
        },
        render: function () {
            this.addSVG();

            var data = this.getChartData(),
                self = this;

            this.chart = nvd3.models.lineChart()

                .x(function (d) {
                    return d.num;
                })
                .y(function (d) {
                    return d.value;
                })
                .interactive(false)
                .useInteractiveGuideline(self.isPreview ? false : true)
                .showLegend(self.isPreview ? false : true)
                ;

            this.chart.yAxis
                .tickFormat(function(d){
                    return d.toFixed();
                })
                .axisLabelDistance(-10)
                .axisLabel(this.labelName)
                ;

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatNumber(d);
                });

            if(this.yDomain){
                this.chart.yDomain(this.yDomain);
            }

            var tip = this.createTooltip();

            var vis = d3.select('#' + this.id + ' svg');

            vis.datum(data)
                .transition().duration(500)
                .call(this.chart)
                .call(tip)
                ;

            $('.tick text').each(function () {
                var $this = $(this);
                $this.css('opacity') == 0 ? $this.parent().css('display', 'none') : ''
            });

            vis.selectAll('.nv-line').each(function(d, i){
                $(this).on('mouseenter', function(){
                    config.trackingDispatcher.trackEventNumber(343);
                });
            });

            this.addLaunchNameTip(vis, tip);

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                });

            var cup = self.chart.update;
            var update = function () {
                self.chart.xAxis.
                    tickFormat(function (d) {
                        return self.formatNumber(d);
                    });
                cup();
                self.chart.xAxis
                    .tickFormat(function (d) {
                        return self.formatCategories(d);
                    });
                self.chart.update = update;
                self.addLaunchNameTip(vis, tip);
            }
            this.chart.update = update;
            this.addResize();
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            return this;
        }
    });

    var BugsToCasesChartView = NotPassedChartView.extend({
        initialize: function (options) {
            NotPassedChartView.prototype.initialize.call(this, options);
            this.seriesTotal = Localization.widgets.failed;
            this.label = Localization.widgets.casesLabel;
            this.labelName = Localization.widgets.failedCases;
            this.yDomain = null;
        },
        getChartData: function(){
            var contentData = this.param.content || [];
            this.categories = [];
            if (!_.isEmpty(contentData)) {
                var series = {};
                series.key = this.seriesTotal;
                series.color = this.getSeriesColor('failed');
                series.values = [];
                _.each(contentData.result, function(d, i){
                    var val = d.values.issuesCount,
                        cat = {
                            id: d.id,
                            name: d.name,
                            number: '#' + d.number,
                            startTime: parseInt(d.startTime)
                        };
                    this.categories.push(cat);
                    series.values.push(_.extend({value: parseInt(val), num: i+1}, cat));
                }, this);
                return [series];
            }
            return [];
        }
    });

    var CombinePieChartView = ChartView.extend({
        pieGrid: 'tpl-pie-grid',
        addSVG: function (data) {
            this.container.append(this.$el.attr(this.attributes()).append(Util.templates(this.pieGrid, {id: this.id, stats: data})));
        },
        roundLabels: function(d){
            var label = (d % 2 === 0) ? d * 100 : d3.round(d * 100, 2),
                sum = d3.round(this.forLabels.sum + label, 2);
            ++this.forLabels.count;
            if(this.forLabels.count == this.forLabels.size){
                if(sum > 100 || sum < 100 ){
                    label = d3.round(100 - this.forLabels.sum, 2);
                }
            }
            this.forLabels.sum = sum;
            return label + '%';
        },
        // LAST LAUNCH STATISTIC
        renderPie: function (data, id, title) {
            var self = this;

            this.forLabels = {size: data.length, count: 0, sum: 0};
            this.chart = nvd3.models.pieChart()
                .x(function (d) {
                    return d.key
                })
                .y(function (d) {
                    return d.value
                })
                .margin({top: !self.isPreview ? 30 : 0})
                .margin({left: 20})
                .margin({right: 20})
                .margin({bottom: 0})
                .valueFormat(d3.format('f'))
                .showLabels(!self.isPreview)
                .color(function (d) {
                    return d.data.color;
                })
                .title(!self.isPreview ? title + ':' : '')
                .titleOffset(-10)
                .growOnHover(false)
                .labelThreshold(0)
                .labelType("percent")
                .legendPosition(title == 'Issues' && data.length > 9 ? 'right' : 'top')
                .labelFormat(function (d) {
                    return self.roundLabels(d);
                })
                .donut(true)
                .donutRatio(0.4)
                .tooltips(self.isPreview ? false : true)
                .showLegend(!self.isPreview && !this.param.isShowLegend ? true : false )
                ;

            d3.select(id)
                .datum(data)
                .call(this.chart)
                ;

            var vis = d3.select(id);
            vis.selectAll('.nvd3.nv-wrap.nv-pie').each(function(d, i){
                $(this).on('mouseenter', function(){
                    config.trackingDispatcher.trackEventNumber(343);
                });
            });

            this.charts.push(this.chart);
            this.addResize();
            this.redirectOnElementClick('pie');
            this.updateOnLegendClick(id, title);
            if (self.isPreview) {
                this.disabeLegendEvents();
            }
            this.updateInvalidCriteria(d3.select(id));
        },
        upadateTotal: function(id, title){
            var data = d3.select(id).data()[0],
                total = 0;
            _.each(data, function(item){
                total = item.disabled ? total : total + parseInt(item.value);
            });
            $('.nv-pie-title tspan', id).text(total);
        },
        updateOnLegendClick: function (id, title) {
            var self = this;
            this.chart.legend.dispatch.on("legendClick", function(d, i){
                config.trackingDispatcher.trackEventNumber(342);
                self.upadateTotal(id, title);
            });
            this.chart.legend.dispatch.on("legendDblclick", function(d, i){
                config.trackingDispatcher.trackEventNumber(342);
                self.upadateTotal(id, title);
            });
        },
        renderTitle: function (id, type) {
            var ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            $('.nv-pie-title', id).append($(ts).attr({x: '0', dy: '1.2em'}).text(type));
        },
        redirectOnElementClick: function (type) {
            var self = this;
            this.chart[type].dispatch.on("elementClick", null);
            if (!this.isPreview) {
                this.chart[type].dispatch.on("elementClick", function (e) {
                    config.trackingDispatcher.trackEventNumber(344);
                    nv.tooltip.cleanup();
                    if ($('.fullscreen-close').is(':visible')) {
                        // $('#dynamic-content').getNiceScroll().remove();
                        $('.fullscreen-close').trigger('click');
                    }
                    var key = e.label,
                        seria = _.find(self.series, function(v, k){ return v.key == key;}),
                        seriesId = seria ? seria.seriesId : '' ,
                        id = e.point.launch.id,
                        link = seriesId && id ? self.linkToRedirectService(seriesId, id) : '';
                    if (link) {
                        document.location.hash = link;
                    }
                });
            }
        },
        getChartData: function(){
            this.issues = 0;
            this.total = 0;
            this.gagData = false;
            var contentData = this.param.content || [];
            if (!_.isEmpty(contentData) && !_.isEmpty(contentData.result)) {
                var criteria = this.param.content_fields,
                    series = this.getSeries(criteria),
                    data = contentData.result[0],
                    stats = {
                        issues: [],
                        exec: []
                    },
                    pairs = _.pairs(data.values);

                pairs.sort(function(a, b){
                    return a[0] == b[0] ? 0 : a[0] < b[0] ? -1 : 1;
                });
                _.each(pairs, function(p){
                    var k = p[0], v = p[1],
                        a = k.split('$'), t = a[1], n = _.last(a),
                        val = parseInt(v), s = series[n];
                    if(s){
                        s.value = val;
                        s.launch = {
                            name: data.name,
                            number: '#' + data.number,
                            startTime: parseInt(data.startTime),
                            id: data.id
                        };
                    }
                    if(n == 'total'){
                        this.total = val;
                    }
                    else if(t == 'executionCounter'){
                        stats.exec.push(s);
                    }
                    else if(t == 'issueCounter'){
                        this.issues += val;
                        stats.issues.push(s);
                    }
                }, this);
                return stats;
            }
            return [];
        },
        render: function () {

            var data = this.getChartData(),
                exec = data.exec || [],
                issues = data.issues || [];


            this.addSVG(data);

            this.charts = [];
            this.renderPie(this.checkForZeroData(exec), '#' + this.id + '-svg1', 'Sum');
            this.renderPie(this.checkForZeroData(issues), '#' + this.id + '-svg2', 'Issues');
            if (!_.isEmpty(this.param.content)) {
                this.renderTitle('#' + this.id + '-svg1', this.total);
                this.renderTitle('#' + this.id + '-svg2', this.issues);
            }
            return this;
        },
        checkForZeroData: function (data) {
            return !_.all(data, function (v) {
                return v.value == 0
            }) ? data : [];
        }

    });

    var LastLaunchPieChartView = CombinePieChartView.extend({
        initialize: function(options){
            CombinePieChartView.prototype.initialize.call(this, options);
            this.param.gadget = 'last_launch';
            this.param.isShowLegend = true;
            this.param.content_fields = ["statistics$executions$total", "statistics$executions$passed", "statistics$executions$failed", "statistics$executions$skipped", "statistics$defects$product_bug", "statistics$defects$automation_bug", "statistics$defects$system_issue", "statistics$defects$to_investigate"];
        },
        redirectOnElementClick: function(){
            return false;
        }
    });

    var PercantageOfInvestigationsChart = ChartView.extend({
        disabledSeries: [],
        getSortedItems: function(){
            var items = [];
            _.each(this.param.content, function(val, key){
                var value = val[0],
                    item = _.extend({}, value.values);
                if(this.param.interval == 1){
                    item.startTime = Moment(key, 'YYYY-MM-DD').unix();
                }
                else {
                    var arr = key.split('-'),
                        year = parseInt(arr[0]),
                        week = parseInt(arr[1].substr(1)),
                        date = Moment(key);
                    item['week'] = week;
                    item.startTime = date.unix();
                    item.endTime = date.add('day', 6).unix();
                }
                items.push(item);
            }, this);
            items.sort(function(a, b){ return a.startTime - b.startTime; });
            return items;
        },
        getData: function(){
            var data = [];
            this.categories = [];
            if (!_.isEmpty(this.param.content)) {
                var items = this.getSortedItems(),
                    series = {
                        toInvestigate: {key: Localization.widgets.toInvestigate},
                        investigated: {key: Localization.widgets.investigated}
                    };
                _.each(series, function(val, key){
                    val.color = this.getSeriesColor(key == 'toInvestigate' ? 'to_investigate' : key);
                    val.values = [];
                    this.disabledSeries.push(false);
                }, this);
                _.each(items, function(item, i) {
                    var value = {};
                    value.startTime = item.startTime;
                    value.endTime = item.endTime ? item.endTime : null;
                    value.week = item.endTime ? item.week : null;
                    this.categories.push(_.clone(value));
                    value.x = i + 1;
                    _.each(series, function(val, key){
                        val.values.push(_.clone(_.extend({y: parseFloat(item[key])}, value)));
                    }, this);
                }, this);
                data = _.values(series);
            }
            return data;
        },
        formatCategories: function(d){
            var date = this.categories[d - 1] || {};
            if (!_.isEmpty(date)) {
                if (date.endTime) {
                    return date.week;
                } else {
                    return Moment.unix(date.startTime).format('DD');
                }
            }
        },
        tooltipContent: function(data){
            var self = this,
                format = config.widgetTimeFormat;
             return function (key, x, y, e, graph) {
                 var toolTip = '',
                     index = e.pointIndex,
                     start = Moment.unix(e.point.startTime).format(format),
                     end = e.point.endTime ? Moment.unix(e.point.endTime).format(format) : null,
                     time = end ? (start + ' - ' + end) : start;
                 toolTip = '<p style="text-align:left"><strong>' + time + '</strong><br/></p>';
                 _.each(data, function (val, i) {
                    if (!self.disabledSeries[i]) {
                         toolTip += '<div style="text-align:left; margin-right: 14px; margin-bottom: 10px;"><div style="width: 8px; height: 8px; display: inline-block; margin: 0 7px 0 14px; background: ' + val.color + '"></div>' + val.key + ':<strong> ' + val.values[index].y + '% ' + '</strong></div>';
                    }
                });
                return toolTip;
            };
        },
        // PERCENTAGE OF INVESTIGATIONS
        render: function () {
            this.addSVG();

            var self = this;
            var isWeeks = parseInt(this.param.interval) !== 1 ? true : false;
            var data = this.getData();
            var tooltip = this.tooltipContent(data);
            var vis;

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .margin({'top': 30, 'left': 40, 'right': 0, 'bottom': 40})
                .reduceXTicks(true)
                .showControls(false)
                .stacked(true)
                .clipEdge(true)
                .showXAxis(true)
                .yDomain([0,100])
                .tooltips(self.isPreview ? false : true)
                .showLegend(false)
                ;

            this.chart.dispatch.on('stateChange', function (e) {
                self.disabledSeries = e.disabled;
            });

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(function (d) {
                    return d3.round(_.isNaN(d) ? 0 : d) + '%';
                })
                //.axisLabel(Localization.widgets.ofInvestigation)
                // .orient('left')
                // .rotateYLabel(false)
                // .tickPadding(4)
                ;

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                })
                .axisLabel(
                    isWeeks
                    ? Localization.widgets.timeWeeks
                    : Localization.widgets.timeDays
                )
                .tickPadding(8)
                ;

            vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                ;

            vis.filter(function (data) {
                    if (_.isEmpty(data)) {
                        $(this).closest('div').append('<div class="no-data-available"></div>');
                        //$(this).closest('.widget-body').css('height', 'inherit');
                    }
                }, this)
                ;
            this.addResize();
            return this;
        }
    });

    var LaunchesQuantity = ChartView.extend({
        getData: function(){
            var data = [],
                key = 'number_launches',
                series = {};

            if(!_.isEmpty(this.param.content)){
                series.key = Localization.widgets.quantityLaunches;
                series.color = this.getSeriesColor(key);
                series.values = [];

                _.each(this.param.content, function(val, key){
                    var value = val[0].values,
                        item = {};
                    item.y = parseInt(value.count);
                    item.startTime = Moment(value.start, 'YYYY-MM-DD').unix();
                    if(value.end){
                        var w = parseInt(key.slice(key.indexOf('W') + 1));
                        item.x = w || Moment(value.start, 'YYYY-MM-DD').week();
                        item.endTime = Moment(value.end, 'YYYY-MM-DD').unix();
                    }
                    else {
                        item.x = Moment(value.start, 'YYYY-MM-DD').format('DD');
                    }
                    series.values.push(item);
                }, this);
                series.values.sort(function(a, b){ return a.startTime - b.startTime;});
                data.push(series);
            }
            return data;
        },
        tooltipContent: function(){
            var format = config.widgetTimeFormat;
            return function (key, x, y, e, graph) {
                var start = Moment.unix(e.point.startTime).format(format),
                    end = e.point.endTime ? Moment.unix(e.point.endTime).format(format) : null;
                return '<p style="text-align:left"><strong>' + y + '</strong> ' + Localization.widgets.launches + '</strong><br/>' + start + (end ? ' - ' + end : '') + '</p>';
            };
        },
        // QUANTITY OF LAUNCHES
        render: function () {
            this.addSVG();

            var self = this;
            var data = this.getData();
            var isWeeks = this.param.interval !== 1 ? true : false;
            var tooltip = this.tooltipContent();
            var vis;

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .margin({'top': 30, 'left': 40, 'right': 0, 'bottom': 40})
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true)
                .showControls(false)
                .reduceXTicks(true)
                .defaultState(true)
                .tooltips(self.isPreview ? false : true)
                .tooltipContent(tooltip)
                ;

            this.chart.yAxis
                .tickFormat(function (d) {
                    return _.isNaN(d) ? 0 : d;
                })
                // .axisLabel(Localization.widgets.launches)
                // .rotateYLabel(false)
                // .orient('left')
                // .tickPadding(4)
                ;

            this.chart.xAxis
                .tickFormat(function (d) {
                    return d;
                })
                .axisLabel(
                    isWeeks
                    ? Localization.widgets.timeWeeks
                    : Localization.widgets.timeDays
                )
                .tickPadding(8)
                ;

            vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .transition()
                .duration(500)
                .call(this.chart)
                ;

            vis.filter(function (data) {
                    if (_.isEmpty(data)) {
                        $(this).closest('div').append('<div class="no-data-available"></div>');
                        //$(this).closest('.widget-body').css('height', 'inherit');
                    }
                }, this)
                ;
            this.addResize();
            return this;
        }
    });

    var IssuesChartTrend = ChartView.extend({
        disabledSeries: [],
        getCriteria: function(){
            return ['toInvestigate', 'systemIssue', 'automationBug', 'productBug'];
        },
        getWeek: function(str){
            return parseInt(str.slice(str.indexOf('-W') + 2));
        },
        getSortedItems: function(){
            var items = [];
            _.each(this.param.content, function(val, key){
                var value = val[0],
                    item = _.extend({}, value.values);
                if(this.param.interval == 1){
                    item.startTime = Moment(key, 'YYYY-MM-DD').unix();
                }
                else {
                    var week = this.getWeek(key),
                        date = Moment(key);
                    item['week'] = week;
                    item.startTime = date.unix();
                    item.endTime = date.add('day', 6).unix();
                }
                items.push(item);
            }, this);
            items.sort(function(a, b){ return a.startTime - b.startTime; });
            return items;
        },
        getSeries: function(criteria){
            var series = {};
            _.each(criteria, function(item){
                series[item] = {
                    color: this.getSeriesColor(item),
                    key: Localization.widgets[item],
                    values: []
                }
                this.disabledSeries.push(false);
            }, this);
            this.series = series;
            return this.series;
        },
        getData: function(){
            var data = [];
            this.categories = [];
            if(!_.isEmpty(this.param.content)){

                var items = this.getSortedItems(),
                    criteria = this.getCriteria(),
                    series = this.getSeries(criteria);

                _.each(items, function(item, i) {
                    var value = {},
                        total = 0;
                    value.startTime = item.startTime;
                    value.endTime = item.endTime ? item.endTime : null;
                    value.week = item.endTime ? item.week : null;

                    this.categories.push(_.clone(value));
                    _.each(criteria, function(c){
                        total += parseInt(item[c]);
                    });
                    _.each(series, function(val, key) {
                        value.x = i + 1;
                        value.y = total ? parseFloat(+((parseInt(item[key])/total)*100).toFixed(2).escapeNaN()) : 0;
                        val.values.push(_.clone(value));
                    });
                }, this);
                data = _.values(series);
            }
            return data;
        },
        tooltipContent: function(data){
            var self = this,
                format = config.widgetTimeFormat;
            return function (key, x, y, e, graph) {
                var toolTip = '',
                    index = e.pointIndex,
                    time,
                    cat = self.categories[index],
                    start = Moment.unix(cat.startTime).format(format),
                    end = cat.endTime ? Moment.unix(cat.endTime).format(format) : null;

                time = end ? (start + ' - ' + end) : start;
                toolTip = '<p style="text-align:left"><strong>' + time + '</strong><br/></p>';
                _.each(data, function (val, i) {
                    if (!self.disabledSeries[i]) {
                        var percent = val.values[index].y;
                        toolTip += '<div style="text-align:left; margin-right: 14px; margin-bottom: 12px;"><div style="width: 8px; height: 8px; display: inline-block; margin: 0 7px 0 14px; background: ' + val.color + '"></div><strong>' + percent + '% ' + '</strong>' + val.key + '<br/></div>';
                    }
                });
                return toolTip;
            };
        },
        formatCategories: function(d){
            var date = this.categories[d - 1] || {};
            if (!_.isEmpty(date)) {
                if (date.endTime) {
                    return date.week || Moment.unix(date.startTime).week();
                } else {
                    return Moment.unix(date.startTime).format('DD');
                }
            }
        },
        // LAUNCH STATISTICS
        render: function () {
            this.addSVG();

            var self = this;
            var data = this.getData();
            var isWeeks = this.param.interval !== 1 ? true : false;
            var tooltip = this.tooltipContent(data);
            var vis;

            this.chart = nvd3.models.multiBarChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .margin({'top': 30, 'left': 40, 'right': 0, 'bottom': 40})
                .showControls(false)
                .stacked(true)
                .showLegend(false)
                .showXAxis(true)
                .reduceXTicks(false)
                .tooltips(self.isPreview ? false : true)
                .yDomain([0,100])
                ;

            this.chart.dispatch.on('stateChange', function (e) {
                self.disabledSeries = e.disabled;
            });

            this.chart.tooltipContent(tooltip);

            this.chart.yAxis
                .tickFormat(function (d) {
                    return d + '%'
                })
                //.axisLabel('% ' + Localization.widgets.ofIssues)
                // .orient('left')
                // .rotateYLabel(false)
                // .tickPadding(4)
                ;

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                })
                .axisLabel(
                    isWeeks
                    ? Localization.widgets.timeWeeks
                    : Localization.widgets.timeDays
                )
                .tickPadding(8)
                ;

            vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart);

            // vis.selectAll('.nv-y text.nv-axislabel')
            //     .style('text-anchor','start')
            //     .attr('y','-15')
            //     .attr('x','2')
            //     ;

            vis.filter(function (data) {
                    if (_.isEmpty(data)) {
                        $(this).closest('div').append('<div class="no-data-available"></div>');
                        //$(this).closest('.widget-body').css('height', 'inherit');
                    }
                }, this)
                ;
            this.addResize();
            return this;
        }
    });

    var IssuesChartLine = ChartView.extend({
        getCriteria: function(){
            return ['toInvestigate', 'systemIssue', 'automationBug', 'productBug'];
        },
        getSeries: function(criteria){
            var series = {};
            _.each(criteria, function(item){
                series[item] = {
                    color: this.getSeriesColor(item),
                    key: Localization.widgets[item],
                    values: []
                }
            }, this);
            this.series = series;
            return this.series;
        },
        getData: function(){
            var data = [];
            this.dates = {};
            this.categories = [];
            if(!_.isEmpty(this.param.content)){
                var items = _.map(this.param.content, function(v, k){ return v[0].values; }),
                    criteria = this.getCriteria(),
                    series = this.getSeries(criteria);

                items.sort(function(a, b){ return Moment(a.start, 'YYYY-MM-DD').unix() - Moment(b.start, 'YYYY-MM-DD').unix(); });

                _.each(items, function(item, i){
                    var value = {},
                        date = Moment(item.start, 'YYYY-MM-DD'),
                        dateKey = !item.end ? date.format('DD') : date.week() ;
                    value.startTime = date.unix();
                    value.endTime = item.end ?  Moment(item.end, 'YYYY-MM-DD').unix() : null;
                    this.categories.push(_.clone(value));
                    this.dates[dateKey] = this.categories[i];
                    _.each(series, function(val, key) {
                        value.x = i + 1;
                        value.y = parseInt(item[key]);
                        val.values.push(_.clone(value));
                    });
                }, this);
                data = _.values(series);
            }
            return data;
        },
        formatCategories: function(d){
            var cat = this.categories[d - 1] || {};
            if (!_.isEmpty(cat)) {
                if (cat.endTime) {
                    var week = Moment.unix(cat.startTime).week();
                    return week;
                } else {
                    var day = Moment.unix(cat.startTime).format('DD');
                    return day;
                }
            }
        },
        render: function () {
            this.addSVG();

            var self = this,
                data = this.getData(),
                isWeeks = this.param.interval !== 1 ? true : false;

            this.chart = nvd3.models.lineChart()
                .margin({left: 70})
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true)
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .useInteractiveGuideline(true)
                .tooltips(self.isPreview ? false : true);

            var format = config.widgetTimeFormat,
                contentGenerator = this.chart.interactiveLayer.tooltip.contentGenerator(),
                tooltip = this.chart.interactiveLayer.tooltip;

            tooltip.contentGenerator(function (d) {
                var start = Moment.unix(self.dates[d.value].startTime).format(format),
                    end = isWeeks ? Moment.unix(self.dates[d.value].endTime).format(format) : '';

                d.value = isWeeks ? (start + ' - ' + end) : start;
                return contentGenerator(d);
            });

            this.chart.yAxis
                .tickFormat(function (d) {
                    return _.isNaN(d) ? 0 : d;
                })
                // .axisLabelDistance(10)
                .axisLabelDistance(0)
                .axisLabel('issues');

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                })
                .axisLabel(
                    isWeeks
                    ? Localization.widgets.timeWeeks
                    : Localization.widgets.timeDays
                );

            var vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart)
                ;
            this.addResize();
            return this;
        }
    });

    var PercentageOfProductBugsChart = ChartView.extend({

        getWeek: function(str){
            return parseInt(str.slice(str.indexOf('-W') + 2));
        },

        getSortedItems: function(){
            var items = [];
            _.each(this.param.content, function(val, key){
                var value = val[0],
                    item = _.extend({}, value.values);
                if(this.param.interval == 1){
                    item.startTime = Moment(key, 'YYYY-MM-DD').unix();
                }
                else {
                    var week = this.getWeek(key),
                        date = Moment(key);
                    item['week'] = week;
                    item.startTime = date.unix();
                    item.endTime = date.add('day', 6).unix();
                }
                items.push(item);
            }, this);
            items.sort(function(a, b){ return a.startTime - b.startTime; });
            return items;
        },

        getData: function(){
            var data = [],
                contentData = this.param.content;
            this.categories = [];
            this.dates = {};
            this.averageBugs = 0;
            if(!_.isEmpty(contentData)){
                var items = this.getSortedItems(),
                    size = _.size(contentData),
                    totalBugs = 0,
                    criteria = this.getCriteria(),
                    series = this.getSeries(criteria);

                _.each(items, function(item, i) {
                    var value = {},
                        dateKey = !item.endTime ? Moment.unix(item.startTime).format('DD') : item.week,
                        total = _.reduce(this.issues, function(memo, n){ return memo + parseInt(item[n]); }, 0);

                    value.startTime = item.startTime;
                    value.endTime = item.endTime ? item.endTime : null;
                    value.week = item.endTime ? item.week : null;
                    this.categories.push(_.clone(value));
                    this.dates[dateKey] = this.categories[i];
                    value.x = i + 1;

                    _.each(series, function(val, key){
                        var y = total ? parseInt(item[key])*100/total : 0;
                        value.x = i + 1;
                        value.y = (y % 2 === 0) ? y : d3.round(y, 2);
                        val.values.push(_.clone(value));
                        if(key === this.averageKey){
                            totalBugs += value.y;
                        }
                    }, this);
                }, this);
                this.averageBugs = !_.isNaN(totalBugs) && !_.isNaN(size) ? Math.round(totalBugs/size*100)/100 : 0;
                data = _.values(series);
            }
            return data;
        },

        getCriteria: function(){
            return ['productBug', 'toInvestigate'];
        },

        averageKey: 'productBug',

        issues: ['toInvestigate', 'systemIssue', 'automationBug', 'productBug'],

        label: Localization.widgets.ofProductBugs,

        getSeries: function(criteria){
            var series = {};
            _.each(criteria, function(item){
                series[item] = {
                    color: this.getSeriesColor(item),
                    key: Localization.widgets[item],
                    values: []
                }
            }, this);
            this.series = series;
            return this.series;
        },

        formatCategories: function(d){
            var cat = this.categories[d - 1] || {};
            if (!_.isEmpty(cat)) {
                if (cat.endTime) {
                    var week = cat.week;
                    return week;
                } else {
                    var day = Moment.unix(cat.startTime).format('DD');
                    return day;
                }
            }
        },

        // PERCENTAGE OF SYSTEM ISSUES
        // PERCENTAGE OF PRODUCT BUGS
        // PERCENTAGE OF AUTO BUGS
        render: function () {
            this.addSVG();

            var self = this;
            var data = this.getData();
            var isWeeks = this.param.interval !== 1 ? true : false;
            var average = $('#total-'+this.id);
            var vis;

            if (!_.isEmpty(this.param.content)) {
                average.text(Localization.widgets.averageBugs.replace('%%%', this.averageBugs) + ' ' + Localization.widgets[this.averageKey]);
            } else {
                average.addClass('hide');
            };

            this.chart = nvd3.models.stackedAreaChart()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .margin({'top': 30, 'left': 40, 'right': 0, 'bottom': 40})
                .yDomain([0,100])
                .useInteractiveGuideline(true)
                .showLegend(false)
                .clipEdge(true)
                .showControls(false)
                .yAxisTickFormat(function(d){
                    return (_.isNaN(d) ? 0 : d) + '%';
                })
                ;

            var format = config.widgetTimeFormat,
                contentGenerator = this.chart.interactiveLayer.tooltip.contentGenerator(),
                tooltip = this.chart.interactiveLayer.tooltip;

                tooltip.contentGenerator(function (d) {
                    var start = Moment.unix(self.dates[d.value].startTime).format(format),
                        end = isWeeks ? Moment.unix(self.dates[d.value].endTime).format(format) : '';
                    d.value = isWeeks ? (start + ' - ' + end) : start;
                    d.series = _.sortBy(d.series, 'key');
                    return contentGenerator(d);
                });

            this.chart.xAxis
                .tickFormat(function (d) {
                    return self.formatCategories(d);
                })
                .axisLabel(
                    isWeeks
                    ? Localization.widgets.timeWeeks
                    : Localization.widgets.timeDays
                )
                .tickPadding(8)
                ;

            vis = d3.select('#' + this.id + ' svg')
                .datum(data)
                .call(this.chart);

            vis.filter(function (data) {
                    if (_.isEmpty(data)) {
                        $(this).closest('div').append('<div class="no-data-available"></div>');
                        $(this).closest('.widget-body').css('height', 200+'px');
                    }
                }, this)
                ;
            this.addResize();
            return this;
        }

    });

    // PERCENTAGE OF PRODUCT BUGS
    var PercentageOfSystemIssuesChart = PercentageOfProductBugsChart.extend({
        averageKey: 'systemIssue',
        label: Localization.widgets.ofSystemIssues,
        getCriteria: function(){
            return [ 'systemIssue', 'toInvestigate'];
        }
    });

    // PERCENTAGE OF AUTO BUGS
    var PercentageOfAutoBugsChart = PercentageOfProductBugsChart.extend({
        averageKey: 'automationBug',
        label: Localization.widgets.ofAutoBugs,
        getCriteria: function(){
            return ['automationBug', 'toInvestigate'];
        }
    });

    var widgetService = function (name) {
        switch (name) {
            case "old_line_chart":
                return LineChartView;
                break;
            case "statistic_trend":
                return TrendsChartView;
                break;
            case "investigated_trend":
                return ColumnChartView;
                break;
            case "last_launch":
                return LastLaunchPieChartView;
                break;
            case "launch_statistics":
                return CombinePieChartView;
                break;
            case "overall_statistics":
                return StaticticsPanel;
                break;
            case "not_passed":
                return NotPassedChartView;
                break;
            case "cases_trend":
                return CasesTrendChartView;
                break;
            case "unique_bug_table":
                return BugTable;
                break;
            case "bug_trend":
                return BugsToCasesChartView;
                break;
            case "activity_stream":
            case "activities":
                return ActivityStreamPanel;
                break;
            case "launches_comparison_chart":
                return LaunchesComparisonChart;
                break;
            case "launches_duration_chart":
                return LaunchesDurationChart;
                break;
            case "launches_table":
                return FilterResultsTable;
                break;
            case "investigated":
                return PercantageOfInvestigationsChart;
                break;
            case "bugs_percentage":
                return PercentageOfProductBugsChart;
                break;
            case "system_issues_percentage":
                return PercentageOfSystemIssuesChart;
                break;
            case "auto_bugs_percentage":
                return PercentageOfAutoBugsChart;
                break;
            case "cases_stats":
                return TestCasesUniqueLaunches;
                break;
            case "launches_quantity":
                return LaunchesQuantity;
                break;
            case "most_failed_test_cases":
                return MostFailedTestCases;
                break;
            case "issues_chart_trend":
            case "issues_chart":
                return IssuesChartTrend;
                break;
            case "issues_chart_line":
                return IssuesChartLine;
                break;
            default:
                break;
        }
    };

    return {
        Model: Model,
        WidgetView: WidgetView,
        widgetService: widgetService,
        LineChartView: LineChartView,
        LaunchesComparisonChart: LaunchesComparisonChart
    }
});
