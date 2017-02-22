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
    var Widget = require('widgets');
    var App = require('app');
    var Urls = require('dataUrlResolver');
    var Storage = require('storageService');
    var Wizard = require('widgetWizard');
    var Service = require('coreService');
    var WidgetsConfig = require('widget/widgetsConfig');
    var Localization = require('localization');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');
    var ModalConfirm = require('modals/modalConfirm');

    require('gridstack');
    require('fullscreen');
    require('jaddons');

    var config = App.getInstance();

    var updateFullscreenText = function () {
        var content = $('#dynamic-content');
        var addWidget = $('.no-dashboards .warning');

            if ($.fullscreen.isFullScreen()) {
                if (content.find('.widget-item').length == 0) {
                    $('#clickToAddWidget', addWidget).hide();
                }
            }  else {
                $('#clickToAddWidget', addWidget).show();
            }
    };

    var Model = Backbone.Model.extend({
        defaults: {
            name: '',
            id: '',
            widgets: []
        },

        initialize: function () {
            this.url = Urls.dashboardById(this.get('id'));
        },

        addWidget: function (widget, callback) {
            var self = this;
            var data = {
                addWidget: widget
            };
            this.updateDashboard(data, function () {
                if (_.isFunction(callback)) {
                    callback();
                }
            }, self);
        },

        deleteWidget: function (id, callback) {
            var self = this;
            this.updateDashboard({deleteWidget: id}, function () {
                var widgets = _.reject(self.get('widgets'), function (widget) {
                    return widget.widgetId == id;
                });
                self.set('widgets', widgets);
                if (_.isFunction(callback)) {
                    callback();
                }
                if (widgets.length) {
                    $.publish("scroll:greater:than:100");
                }
            }, self);
        },

        updateName: function (data, callback) {
            var self = this;
            this.updateDashboard(data, function () {
                if (_.isFunction(callback)) {
                    callback();
                }
            }, self);
        },

        updateWidgets: function (widgets, callback) {
            var self = this;
            var upWidgets = [];

            _.each(widgets, function (item) {
                var id = item.el.attr('id'),
                eWidget = _.find(this.get('widgets'), function (w) {
                    return w.widgetId === id;
                });
                if (eWidget) {
                    if (!eWidget.widgetSize) {
                        eWidget.widgetSize = [];
                    }
                    if (!eWidget.widgetPosition) {
                        eWidget.widgetPosition = [];
                    }
                    eWidget.widgetPosition[0] = item.x;
                    eWidget.widgetPosition[1] = item.y;
                    eWidget.widgetSize[0] = item.width;
                    eWidget.widgetSize[1] = item.height;
                    upWidgets.push(eWidget);
                }
            }, this);
            this.updateDashboard({updateWidgets: upWidgets}, function () {
                if (_.isFunction(callback)) {
                    callback();
                }
            }, self);
        },

        updateDashboard: function (data, callback, self) {
            Service.updateDashboard(this.get('id'), data)
                .done(function (data) {
                    EQCSS.apply();
                    if (_.isFunction(callback)) {
                        callback();
                    }
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'updateDashboard');
                });
            }
    });

    var Collection = Backbone.Collection.extend({
        model: Model
    });

    var ContentView = Backbone.View.extend({
        initialize: function (options) {
            this.contextName = options.contextName;
            this.context = options.context;
            this.project = config.project;
            this.subContext = options.subContext;

            this.navigationInfo = new NavigationInfo({current: options.subContext});
            this.listenTo(this.navigationInfo, 'load::dashboardById', this.performRender);
        },

        render: function () {
            var self = this;
            this.defectTypes = new SingletonDefectTypeCollection();
            this.navigationInfo.loadDashboards()
                .done(function () {
                    self.defectTypes.ready
                        .done(function () {
                            self.performRender();
                        });
                });
            return this;
        },

        performRender: function () {
            var self = this;

            this.navigationInfo = this.navigationInfo || new NavigationInfo({current: self.subContext});
            var current = this.navigationInfo && this.navigationInfo.getCurrentDashboard();
            if (current) {
                this.createHeader(current);
                this.createBody(current);
            } else {
                this.noDashboards();
            }
        },

        createHeader: function (model) {
            if (this.$header) {
                this.$header.destroy();
            }
            this.$header = new DashboardHeader({
                header: this.context.getMainView().$header,
                context: this.context,
                project: this.project,
                model: model,
                navigationInfo: this.navigationInfo
            }).render();
            this.$header.$el.css('padding-top', 0);
            this.$header.on('onOpenDashboard', this.update, this);
            this.$header.on('onUpdateDashboard', this.update, this);

            this.$header.on('onAddDashboard', this.addDashboard, this);
            this.$header.on('onRemoveDashboard', this.removeDashboard, this);
            this.$header.on('onNoDashboards', this.noDashboards, this);
            this.$header.on('onUpdated', this.reRender, this);
        },

        createBody: function (model) {
            if (this.$body) {
                this.$body.destroy();
            }
            //do not call render method on body - since it is async data dependant and will do it after fetch
            this.$body = new DashboardBody({
                body: this.context.getMainView().$body,
                context: this.context,
                project: this.project,
                model: model,
                navigationInfo: this.navigationInfo
            }).render();
            this.$body.on('addWidget', this.$header.showAddWidget, this);
        },

        update: function (data) {
            var self = this;
            if (data.subContext) {
                this.navigationInfo.changeActive(data.subContext)
                    .done(function () {
                        self.reRender();
                    })
                    .fail(function (error) {
                        self.reRender();
                    });
            }
            else {
                var dash = this.navigationInfo.getCurrentDashboard();
                dash = data[0];
                self.reRender();
            }
        },

        removeDashboard: function (id) {
            var newActive = this.navigationInfo.removeDashboard(id);
            if (!newActive) {
                this.noDashboards();
                config.router.navigate(Urls.redirectToDashboard(), {trigger: false});
            } else {
                this.reRender();
            }
        },

        reRender: function () {
            var dash = this.navigationInfo.getCurrentDashboard();
            if (this.$header) {
                this.$header.update(dash);
            }
            if (this.$body) {
                this.$body.update(dash);
            }
        },

        addDashboard: function (id, addShared) {
            var self = this;
            this.navigationInfo.changeActive(id, addShared)
                .done(function () {
                    self.reRender();
                });
        },

        noDashboards: function () {
            this.createHeader();
            this.createBody();
        },

        destroy: function () {
            this.$header && this.$header.off().destroy();
            this.$body && this.$body.off().destroy();
            this.defectTypes.off('reset');
            this.undelegateEvents();
            this.unbind();
            this.navigationInfo.unbind();
            this.navigationInfo = null;
            Storage.setDirectLinkDashboard(-1);
            delete this;
        }
    });

    var DashboardHeader = Components.BaseView.extend({

        initialize: function (options) {
            this.$el = options.header;
            this.project = options.project;
            this.context = options.context;
            this.context.parent = this;
            this.navigationInfo = options.navigationInfo;
            this.dashboards = this.navigationInfo.getDashboards();
            this.currentDashboard = options.model;

            this.listenTo(this.navigationInfo, 'edit::widget', this.openWidgetWizard);
            this.listenTo(this.navigationInfo, 'add::widget', this.openWidgetWizard);
            this.listenTo(this.navigationInfo, 'dashboard::widget::deleted', this.onWidgetDelete);
        },

        tpl: 'tpl-dashboard-menu-view',
        notFoundDash: 'tpl-dashboard-menu-notfound',
        tplSettings: 'tpl-dashboard-settings-modal',

        render: function () {
            var curDash = (this.currentDashboard) ? this.currentDashboard.toJSON() : '';

            if (curDash && Storage.getDirectLinkDashboard() == "-1") {
                curDash.isDirectLinkDashboard = false;
            }
            var params = {
                project: this.project,
                user: config.userModel.toJSON(),
                currentDashboard: curDash,
                dashboards: this.dashboards.toJSON()
            };

            this.$el.html(Util.templates(this.tpl, params));
            this.validateAddWidgetButton();
            return this;
        },

        update: function (dashboard) {
            this.currentDashboard = dashboard;
            this.render();
        },

        events: {
            'click a.add-widget': 'showAddWidget',
            'click a.edit-dashboard': 'showSettingsForm',
            'click .dashboard-title a': 'showDashboardsList',
            'click a.remove-dashboard': 'removeDashboard',
            'click a.fullscreen-dashboard': 'openFullscreenDashboard',
            'click .add-new-dashboard': 'showAddDashboard'
        },

        showAddWidget: function (e) {
            e.preventDefault();
            if ($(e.currentTarget).hasClass('disabled')) {
                return;
            }
            this.openWidgetWizard();
        },

        openWidgetWizard: function (model) {
            var localModel = {dashboard_id: this.currentDashboard.get("id")};
            if (model) {
                localModel = _.extend(localModel, model);
                localModel['success_event'] = 'refresh::widget';
            } else {
                localModel['success_event'] = 'redirect::to::dashboard';
            }
            if (this.widgetWizard) {
                this.stopListening(this.widgetWizard);
                this.stopListening(this.navigationInfo, 'redirect::to::dashboard');
                this.widgetWizard = null;
            }

            this.widgetWizard = new Wizard.WidgetWizard({navigationInfo: this.navigationInfo}).render(localModel);
            this.listenTo(this.widgetWizard, 'refresh::widget', this.reloadWidget);
            this.listenTo(this.widgetWizard, 'remove::widget', this.removeWidgetSoft);
            this.listenTo(this.navigationInfo, 'redirect::to::dashboard', this.redirectToDashBoard);
        },

        removeWidgetSoft: function (id) {
            // update widgets list
            //this.trigger('onUpdated');
            var widgets = _.reject(this.currentDashboard.get("widgets"), function (widget) {
                return widget.widgetId === id;
            });
            var self = this;
            this.currentDashboard.updateDashboard({updateWidgets: widgets}, function () {
                    self.currentDashboard.set('widgets', widgets);
                    self.trigger('onUpdated');
                });
                //.fail(function (error) {
                //    self.$el.modal("hide");
                //    Util.ajaxFailMessenger(null, 'widgetAddToDashboard');
                //});


            //var grid = $('.grid-stack:first').data('gridstack');
            //this.currentDashboard.deleteWidget(id, function () {
            //grid.remove_widget($("#"+id));
            //});
        },

        redirectToDashBoard: function (dash) {
            dash.owner = config.userModel.get('name');
            this.navigationInfo.addDashboard(dash);
            this.navigationInfo.changeActive(dash.id);
            this.trigger('onUpdated');
        },

        onWidgetDelete: function () {
            this.validateAddWidgetButton();
            updateFullscreenText();
        },

        reloadWidget: function (id) {
            this.navigationInfo.trigger('refresh::widget', id);
        },

        showAddDashboard: function (e) {
            this.tplAddDashModal = DashboardsList.prototype.tplAddDashModal,
            DashboardsList.prototype.showAddDashboardForm.call(this, e);
        },

        validateAddWidgetButton: function () {
            if (this.currentDashboard) {
                var dash = this.navigationInfo.getCurrentDashboard(),
                    widgets = dash.get('widgets'),
                    checkSize = widgets.length >= config.maxWidgetsOnDashboard,
                    action = checkSize ? 'add' : 'remove',
                    title = checkSize ? Localization.dashboard.maxWidgetsAdded : '';
                $('.add-widget', this.$el)[action+'Class']('disabled').attr('title', title);
            }
        },
        openFullscreenDashboard: function (event) {
            event.preventDefault();


            var self = this;
            var content = $('#dynamic-content');

            $('.fullscreen-close')
                .off('click.fullscreen-close')
                .on('click.fullscreen-close', function () {
                    $.fullscreen.exit();
                });

            $('body')
                .off('fscreenopen')
                .on('fscreenopen', function () {
                    content
                        .removeClass('fullscreen-container');
                    updateFullscreenText();
                    if (content.scrollTop()) {
                        $.publish("scroll:greater:than:100");
                    }
                })
                .off('fscreenclose')
                .on('fscreenclose', function () {
                    // $(content).getNiceScroll().remove();
                    _.each(self.context.widgets, function (w) {
                        if (w.charts) {
                            _.each(w.charts, function (c) {
                                if (_.isFunction(c)) {
                                    c.update();
                                }
                            })
                        }
                        else if (w.chart && _.isFunction(w.chart)) {
                            w.chart.update();
                        }
                    });
                    content.off('scroll');
                    content
                        .addClass('fullscreen-container');

                    updateFullscreenText();
                    $("html").css("overflow", "visible");
                })
                .off('click.fullscreen')
                .on('click.fullscreen', '.rp-blue-link-undrl, .text-muted, .cases-view, .pr-grid-defect-link, .rp-link, .rp-ti-badge', function () {
                    $.fullscreen.exit();
                })
                .fullscreen({
                      toggleClass: "fullscreen"
                });

            content
                .off('scroll')
                .scroll(function () {
                    var data = {top:content.scrollTop(), height: content.height() };

                    if (content.scrollTop() > 100) {
                        $.publish("scroll:greater:than:100", data);
                    }
                });
        },

        showSettingsForm: function (e) {
            e.preventDefault();

            var current = this.currentDashboard,
                excludeName = current.get('name'),
                ownDashboards = _.filter(this.dashboards.toJSON(), function (d) {
                    return d.owner === config.userModel.get('name') && d.name !== excludeName;
                });

            var editForm = new EditDashboard({
                context: this.context,
                model: this.currentDashboard,
                project: this.project,
                navigationInfo: this.navigationInfo,
                mydash: ownDashboards
            });
            editForm.render();
        },

        showDashboardsList: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var target = $(e.target),
                self = this,
                link = target.is('a') ? target : target.closest('a');

            if (!link.hasClass('open')) {
                this.list = new DashboardsList({
                    container: $('#dynamic-content'),
                    dashboards: this.dashboards,
                    currentDashboard: this.currentDashboard,
                    context:  this.context,
                    navigationInfo: this.navigationInfo,
                    project: this.project
                });
                this.list.render();
                this.list.show();
                link.addClass('open');
                $(document).on('click', function (e) {
                    if (!$(e.target).closest('div.b-dashboars-list').length) {
                        self.list.hide(function () {
                            link.removeClass('open');
                        });
                    }
                });
            }
            else {
                this.list.hide(function () {
                    link.removeClass('open');
                });
            }
        },

        removeDashboard: function (e) {
            e.preventDefault();
            if ($(e.target).closest('li').hasClass('disabled')) {
                return;
            }
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.dashboardDelete,
                bodyText: Util.replaceTemplate(Localization.dialog.dashboardDelete, this.currentDashboard.get('name')),
                cancelButtonText: Localization.ui.cancel,
                okButtonDanger: true,
                okButtonText: Localization.ui.delete,
                confirmFunction: function() {
                    var id = self.currentDashboard.get('id'),
                        isShared = self.currentDashboard.get('owner') !== config.userModel.get('name');
                    return Service.deleteDashboard(id, isShared)
                        .done(function () {
                            self.trigger('onRemoveDashboard', id);
                            Util.ajaxSuccessMessenger('dashboardDelete');
                        })
                        .fail(function (error) {
                            Util.ajaxFailMessenger(error, 'dashboardDelete');
                        });
                }
            });
            modal.show();
        },

        destroy: function () {
            if (this.currentDashboard && this.currentDashboard.refreshItems && !_.isEmpty(this.currentDashboard.refreshItems)) {
                _.each(this.currentDashboard.refreshItems, function (item) {
                    clearTimeout(item);
                });
            }
            this.widgetWizard = null;
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var DashboardBody = Components.BaseView.extend({
        initialize: function (options) {
            this.context = options.context;
            this.$el = options.body;
            this.user = config.userModel;
            this.project = options.project;
            this.navigationInfo = options.navigationInfo;
            this.model = options.model;
            this.context.widgets = [];
            this.widgets = [];
            this.bindCheckWidgetsForLoad = this.checkWidgetsForLoad.bind(this);

            this.listenTo(this.navigationInfo, 'refresh::widgets', this.renderUpdate);
            this.listenTo(this.navigationInfo, 'dashboard::widget::deleted', this.onWidgetDelete);
            this.listenTo(this.navigationInfo, 'failedload::dashboardById', this.renderNoDashboards);

            WidgetsConfig.clear();
        },

        update: function (model) {
            // todo : move cleanup to separate method and call it with and render renderUpdate
            this.destroyWidgets();
            this.context.widgetsContainer && this.context.widgetsContainer.empty();
            this.model = model;
            this.renderUpdate();
        },

        tpl: 'tpl-dashboard-widget',
        notFoundTpl: 'tpl-dashboard-notfound',

        events: {
            'click .rb-btn-settings': 'addWidget',
            'mouseenter .badge-info': 'handleSharedHover',
            'mouseleave .badge-info': 'handleSharedHover'
        },
        addWidget: function (e) {
            e.preventDefault();
            if ($(e.currentTarget).hasClass('disabled')) {
                return;
            }
            this.navigationInfo.trigger('add::widget');
        },

        createWidget: function (w) {
            var user = config.userModel,
                widgets = this.model.get('widgets'),
                navigationInfo = this.navigationInfo,
                el = $('div.widgets-list', this.$el),
                currWidget = w,
                widgetId = currWidget.widgetId,
                widgetSize = currWidget.widgetSize,
                wisgetPosition = currWidget.widgetPosition,
                widgetHeight = (widgetSize && !_.isEmpty(widgetSize) && widgetSize[1]) ? widgetSize[1] : config.defaultWidgetHeight,
                widgetWidth = (widgetSize && !_.isEmpty(widgetSize) && widgetSize[0]) ? widgetSize[0] : config.defaultWidgetWidth,
                widget = new Widget.WidgetView({
                    container: el,
                    id: widgetId,
                    navigationInfo: navigationInfo,
                    width: widgetWidth,
                    height: widgetHeight,
                    top: wisgetPosition[1],
                    left: wisgetPosition[0],
                    context: this.context
                }).render();
            this.widgets.push(widget);

            var grid = $('.grid-stack', this.$el).data('gridstack');
            if (grid) {
                var el = $('#'+widget.$el.attr('id'));
                grid.add_widget(el, wisgetPosition[0], wisgetPosition[1], widgetWidth, widgetHeight);
                EQCSS.apply();
                if (this.model.get('owner') !== user.get('name')) {
                    grid.movable(el, false);
                    grid.resizable(el, false);
                }
            }
        },

        checkWidgetsForLoad: function () {
            _.each(this.widgets, function (w) {
                if (!w.isStartLoad && this.checkScrollingForWidget(w.id)) {
                    w.loadWidget();
                }
            }, this);
        },

        checkScrollingForWidget: function (id) {
            return $(window).outerHeight() + $(window).scrollTop() >= $('#'+id).offset().top - 100;
        },

        renderUpdate: function () {
            //clean all !!!
            /*var self = this;
            $.when(this.model.fetch())
                .done(function () { self.render(); });*/
            this.render();
        },

        render: function () {
            if (this.model) {
                var dash = this.model,
                    widgets = dash.get('widgets'),
                    user = config.userModel,
                    self = this;

                if (!dash.get('owner')) {
                    this.$el.html(Util.templates(this.notFoundTpl, {deletedShared: true}));
                }
                else if (dash.get('owner') !== user.get('name') && !dash.get('isShared')) {
                    this.$el.html(Util.templates(this.notFoundTpl, {notShared: true}));
                }
                else {
                    this.$el.html(Util.templates(this.tpl, {noShared: dash.get('owner') == user.get('name')}));

                    if (widgets && widgets.length >= 20) {
                        //to do fix buttons add widget
                        $('.btn-addwidget', this.$el).parents('div.btn-group').hide();
                    }

                    var el = $('div.widgets-list', this.$el);
                    this.setupGrid();

                    if (!_.isEmpty(widgets) && _.isArray(widgets)) {
                        widgets.sort(function (a, b) {
                            var posA = a.widgetPosition[1], posB = b.widgetPosition[1];
                            return posA - posB;
                        });

                        var i = 0, size = widgets.length;
                        while (i < size && i < config.maxWidgetsOnDashboard) {
                            this.createWidget(widgets[i++]);
                        }
                        this.validateAddWidgetButton();

                        this.checkWidgetsForLoad();
                        // $.unsubscribe("scroll:greater:than:100");
                        $.subscribe("scroll:greater:than:100", this.bindCheckWidgetsForLoad);
                    }
                    else {
                        this.toggleNoWidgets();
                    }
                }
            }
            else {
                var param = {};
                if (_.isEmpty(this.navigationInfo.collection.models)) {
                    param.no_dashboards = true;
                } else {
                    param.notfound = true;
                }
                this.renderNoDashboards(param);
            }
            return this;
        },

        renderNoDashboards: function (param) {
            if (param.errorText) {
                if (/40014/.test(param.errorText)) {
                    param.dashboardIsNotShared = true;
                } else if (/4049/.test(param.errorText)) {
                    param.notfound = true;
                }
            }
            this.$el.html(Util.templates(this.notFoundTpl, param));
        },

        setupGrid: function () {
            var dash = this.model,
                gridStack = $('.grid-stack', this.$el),
                options = {
                    cell_height: config.widgetGridCellHeight,
                    vertical_margin: config.widgetGridVerticalMargin,
                    handle: '.drag-handle',
                    widgets: this.context.widgets,
                    draggable: {
                        containment: gridStack,
                        handle: '.drag-handle'
                    },
                    resizable: {
                        handles: 'se, sw'
                    }
                };
            gridStack.gridstack(options);
            gridStack.on('change', function (e, items) {
                dash.updateWidgets(items);
                EQCSS.apply();
            });
            gridStack.on('resizestart', function (event, ui) {
                var element = $(event.target);
                element.css('visibility', 'hidden');
            });
            gridStack.on('resizestop', function (event, ui) {
                var element = $(event.target);
                element.css('visibility', 'visible');
            });

        },

        onWidgetDelete: function () {
            this.toggleNoWidgets();
            this.validateAddWidgetButton();
            updateFullscreenText();
        },

        toggleNoWidgets: function () {
            var widgets = this.model.get('widgets'),
                el = $('div.widgets-list', this.$el),
                no_widget = $('div.no-widgets', this.$el);

            if (_.isEmpty(widgets)) {
                if (!no_widget.length) {
                    if (this.model.get('owner') !== config.userModel.get('name')) {
                        el.after(Util.templates(this.notFoundTpl, {sharedEmpty: true}));
                    } else {
                        el.after(Util.templates(this.notFoundTpl, {noWidgets: true}));
                    }
                }
            }
            else {
                if (no_widget.length) {
                    no_widget.remove();
                }
            }
        },

        validateAddWidgetButton: function () {
            var widgets = this.model.get('widgets'),
                checkSize = widgets.length >= config.maxWidgetsOnDashboard,
                action = checkSize ? 'add' : 'remove',
                title = checkSize ? Localization.dashboard.maxWidgetsAdded : '';
            $('#addNewWidget', this.$el)[action+'Class']('disabled').attr('title', title);
        },

        handleSharedHover: function (e) {
            var $tar = $(e.currentTarget),
                $tex = $tar.find(".shared-text");
            if (e.type === "mouseenter") {
                $tex.stop().fadeIn('fast');
            } else {
                $tex.stop().fadeOut('fast');
            }
        },

        destroyWidgets: function () {
            var dashboard = this.model;
            if (dashboard && dashboard.refreshItems && !_.isEmpty(dashboard.refreshItems)) {
                _.each(dashboard.refreshItems, function (item) {
                    clearTimeout(item);
                });
            }
            _.forEach(this.widgets, function (w) {
                w && w.destroy();
            });
            this.widgets = [];
        },

        destroy: function () {
            // $.unsubscribe("scroll:greater:than:100:dashboard");
            $.unsubscribe("scroll:greater:than:100", this.bindCheckWidgetsForLoad);
            this.destroyWidgets();
            this.context.widgetsContainer && this.context.widgetsContainer.empty();
            Components.BaseView.prototype.destroy.call(this);
        }
    });

    var DashboardsList = Backbone.View.extend({
        initialize: function (options) {
            this.container = options.container;
            this.context = options.context;
            this.project = options.project;
            this.navigationInfo = options.navigationInfo;
            this.dashboards = options.dashboards;
            this.currentDashboard = options.currentDashboard;
            this.shared = [];
            this.mydash = [];
            _.each(this.dashboards.toJSON(), function (dash) {
                if (dash.owner == config.userModel.get('name')) {
                    this.mydash.push(dash);
                }
                else {
                    this.shared.push(dash);
                }
            }, this);
        },

        tpl: 'tpl-dashboards-list',
        tplMyDashboards:'tpl-dashboards-list-my',
        tplShatredDashboards: 'tpl-dashboards-list-shared',
        tplDashItem:'tpl-dashboards-list-item',

        // TODO - current template missing;
        tplAddDashModal: 'tpl-dashboard-addnew-modal',

        className: 'b-dashboars-list',

        events: {
            'click .add-new-dashboard': 'showAddDashboardForm',
            'click a': 'onOpenDashboard',
            'click [data-js-remove-dashboard]': 'deleteDeletedByOwnerDashboard',
            'click [data-js-unshared-dashboard]': 'deleteDeletedByOwnerDashboard'
        },

        deleteDeletedByOwnerDashboard: function (e) {
            e.preventDefault();
            var target = $(e.currentTarget);
            var id = target.closest('a').attr('id');
            var li = target.closest('li');
            var row = target.closest('.columnWidget');
            var dashboards = this.navigationInfo.getDashboards();

            Service.deleteDeletedByOwnerDashboard(id)
                .done(function (data) {
                    dashboards.remove(dashboards.get(id));
                    li.remove();
                    if ($('li', row).length < 2) {
                        row.remove();
                    }
                    Util.ajaxSuccessMessenger('dashboardDeletedUnsharedByOwner');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'errorDeleteDashboard');
                });
                return false;
        },

        onOpenDashboard: function (e) {
            var el = $(e.currentTarget);
            if (el.closest('li').hasClass('active') || el.hasClass('disabled')) {
                e.preventDefault();
            }
        },

        showAddDashboardForm: function (e) {
            e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            var addForm = new AddDashboard({
                context: this.context,
                model: this.currentDashboard,
                project: this.project,
                navigationInfo: this.navigationInfo,
                mydash: this.mydash
            });
            addForm.render();
        },

        hide: function (callback) {
            var self = this;
            this.$el.stop().animate({
                height: '0px'
            }, 100, function () {
                if (callback) {
                    callback();
                }
                self.destroy();
            });
        },

        show: function () {
            var self = this;
            this.$el.show();
            if (this.checkMaxDashboards()) {
                $('.add-new-dashboard', this.$el)
                    .addClass('disabled')
                    .attr('title', Localization.dashboard.maxAdded)
                    .tooltip({placement: 'bottom'});
            }
            this.$el.stop().animate({
                height: $('div.dashboards-container', this.$el).outerHeight() + 'px'
            }, 100, function () {
            });
        },

        render: function () {
            this.$el.css({display: 'none', height: '0px'});
            this.container.append(this.$el.html(Util.templates(this.tpl)));
            this.renderMyDashboards();
            this.renderSharedDashboards();
            return this;
        },

        checkMaxDashboards: function () {
            return this.dashboards.length >= config.maxDashboards;
        },

        renderMyDashboards: function () {
            if (this.mydash && !_.isEmpty(this.mydash)) {
                $('div.dashboards-container', this.$el).append(Util.templates(this.tplMyDashboards));
                var i = 0, n = 0;
                _.each(this.mydash, function (dash) {
                    i++;
                    if (i%5 == 0) {
                        n = 4;
                    }
                    else if (i%4 == 0) {
                        n = 3;
                    }
                    else if (i%3 == 0) {
                        n = 2;
                    }
                    else if (i%2 == 0) {
                        n = 1;
                    }
                    else {
                        n = 0;
                    }
                    i = (i==5) ? 0 : i;
                    $('div.my-dashboards-list ul', this.$el).eq(n).append(Util.templates(this.tplDashItem, {
                        projectUrl: this.project.projectId,
                        dash: dash,
                        active: (this.currentDashboard && dash.id == this.currentDashboard.get('id')) ? true : false
                    }));
                }, this);
            }
        },

        parseSharedDashboards: function (data) {
            var self = this;
            var directLinkDash = Storage.getDirectLinkDashboard();
            var owners = [];

            _.each(data, function (dash) {
                var owner = _.find(owners, function (item) {
                    return item.owner == dash.owner;
                });
                if (owner && (dash.id != directLinkDash)) {
                    owner.dashboards.push(dash);
                }
                else {
                    var dashboards = [],
                        name = (dash.owner) ? dash.owner.capitalizeName() : '';
                    if (dash.id != directLinkDash) {
                        dashboards.push(dash);
                        owners.push({
                            owner: dash.owner,
                            name: name,
                            dashboards: dashboards
                        });
                    }
                }
            }, this);
            return owners;
        },

        renderSharedDashboards: function () {
            if (this.shared && !_.isEmpty(this.shared)) {
                var shared = this.parseSharedDashboards(this.shared);
                if (shared.length != 0) {
                    $('div.dashboards-container', this.$el).append(Util.templates(this.tplShatredDashboards, {
                        projectUrl: this.project.projectId,
                        activeId: (this.currentDashboard) ? this.currentDashboard.get('id') : '',
                        items: shared
                    }));
                }
            }
        },

        destroy: function () {
            this.unbind();
            this.undelegateEvents();
            this.remove();
        }
    });

    var AddDashboard = Components.DialogShell.extend({
        initialize: function (options) {
            options['size'] = 'md';
            Components.DialogShell.prototype.initialize.call(this, options);
            this.headerTxt = 'createNewDashboard';
            this.actionTxt = 'create';
            this.context = options.context;
            this.project = options.project;
            this.model = options.model;
            this.navigationInfo = options.navigationInfo;
            this.myDashboards = [];
            if (options.mydash && options.mydash.length) {
                this.myDashboards = _.map(options.mydash, function (d) {
                    return d.name.toLowerCase();
                });
            }
        },

        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'click a.shared-dashboard': 'addSharedDashboard',
                'input #dashboardName': 'validate',
                'change #dashboardName': 'validate'
            });
        },

        contentBody: 'tpl-dashboard-addnew-form',
        emptyTpl: 'tpl-dashboard-form-shared-empty',
        sharedList: 'tpl-dashboard-form-shared-list',

        render: function () {
            Components.DialogShell.prototype.render.call(this);
            var param = {
                name: (this.model) ? this.model.get('name') : '',
                shared: (this.model) ? this.model.get('isShared') : false,
                projectName: this.project.projectId,
                myDash: this.mydash
            };
            this.$content.append(Util.templates(this.contentBody, param));
            this.$dashName = $('#dashboardName', this.$content);
            this.dashModalScroll = Util.setupBaronScroll($('.borderWidget', this.$content));
            this.setupValidator();
            this.actionButton = $('#actionBtnDialog', this.$el);
            var self = this;
            $('a[data-toggle="tab"]', this.$content).on('show.bs.tab', function (e) {
                var target = $(e.target),
                    action = target.attr('href').indexOf('create') >=0 ? 'show' : 'hide';
                self.actionButton[action]();
            });
            $('a[data-toggle="tab"]', this.$content).on('shown.bs.tab', function (e) {
                Util.setupBaronScrollSize(self.dashModalScroll, {maxHeight: 300});
            });
            this.getSharedDashboards();
            Util.switcheryInitialize(this.$content);
            this.delegateEvents();
            return this;
        },

        getSharedDashboards: function () {
            var self = this;
            Service.getSharedDashboards()
                .done(function (data) {
                    $('div.shared-loader', self.$content).hide();
                    self.renderSharedDashboards(data);
                    if($('#shareDashboard', this.$content).hasClass('active')){
                        Util.setupBaronScrollSize(self.dashModalScroll, {maxHeight: 300});
                    }
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'getSharedDashboards');
                });
        },

        isDublicateDashboard: function (dashboardId) {
            return !!_.find(this.navigationInfo.getDashboards().models, function (dashboard) {
                return dashboard.id == dashboardId;
            });
        },

        parseSharedData: function (data) {
            var owners = [],
                directLinkDash = Storage.getDirectLinkDashboard() || null;

            _.each(data, function (val, key) {
                var owner = _.find(owners, function (item) {
                    return item.owner == val.owner;
                });
                var dublicate = this.isDublicateDashboard(key)
                    ? this.isDublicateDashboard(key)
                    : (key == directLinkDash);
                var dashboard = {
                        id: key,
                        name: val.name,
                        dublicate: dublicate
                    };
                if (owner) {
                    owner.dashboards.push(dashboard);
                }
                else {
                    var dashboards = [];
                    var name = val.owner.capitalizeName();
                    dashboards.push(dashboard);
                    owners.push({
                        owner: val.owner,
                        name: name,
                        shortName: name.getCapitalizedOnly(),
                        dashboards: dashboards
                    });
                }
            }, this);
            return owners;
        },

        renderSharedDashboards: function (data) {
            var shared = this.parseSharedData(data);
            $('div.rp-dashboard-content', this.$content).append(Util.templates(this.sharedList, {
                items: shared
            }));
        },

        createNewDashboard: function (data, addShared) {
            this.context.parent.trigger('onAddDashboard', data.id, addShared);
            this.$el.modal('hide');
        },

        addSharedDashboard: function (e) {
            e.preventDefault();
            var $link = $(e.target).closest('.shared-dashboard'),
                self = this;;
            if ($link.hasClass("disabled-link")) {
                return;
            }
            $link.addClass("disabled-link");
            Service.addSharedDashboard($link.data('dashboardId'))
                .done(function (data) {
                    Storage.setDirectLinkDashboard(-1);
                    $('.remove-dashboard').closest('li').removeClass('disabled');
                    self.createNewDashboard(data, true);
                    Util.ajaxSuccessMessenger('dashboardAdded');
                })
                .fail(function (error) {
                    Util.ajaxFailMessenger(error, 'addSharedDashboard');
                    $link.removeClass("disabled-link");
                });
        },

        setupValidator: function () {
            Util.bootValidator(this.$dashName, [
                {
                    validator: 'minMaxRequired',
                    type: 'dashboardName',
                    min: config.dashboardNameSize.min,
                    max: config.dashboardNameSize.max
                },
                {
                    validator: 'noDuplications',
                    type: 'dashboardName',
                    source: this.myDashboards
                }
            ]);
        },

        validate: function () {
            this.$dashName.trigger('validate');
            var validity = this.$dashName.data('valid');
            var action = validity ? 'removeClass' : 'addClass';

            this.actionButton[action]('disabled');
            return validity;
        },

        submit: function (e) {
            e && e.preventDefault();
            if (!this.validate()) {
                return;
            }

            var newName = this.$dashName.val().trim();
            var shared = $('.js-switch', this.$el).prop('checked');
            var dashboard = {
                name: newName,
                share: shared
            };
            var self = this;

            Service.addOwnDashboard(dashboard)
                .done(function (data) {
                    self.createNewDashboard(data, dashboard);
                    Util.ajaxSuccessMessenger('dashboardAdded');
                })
                .fail(function (request) {
                    if (request.status !== 401) {
                        var error = JSON.parse(request.responseText);
                        self.showFormError(error);
                    }
                });
        },

        showFormError: function (error) {
            var cont = this.$dashName.parents('div.form-group');
            var errorFild = $('div.help-inline', this.$el);

            cont.addClass('has-error');
            errorFild.empty().html(error.message).show();
        },

        hideFormError: function () {
            var cont = this.$dashName.parents('div.form-group');

            if (cont.hasClass('has-error')) {
                cont.removeClass('has-error');
                $('div.help-inline', cont).empty().hide();
            }
        },

        destroy: function () {
            Components.DialogShell.prototype.destroy.call(this);
        }
    });

    var EditDashboard = AddDashboard.extend({
        initialize: function (options) {
            AddDashboard.prototype.initialize.call(this, options);
            this.headerTxt = 'dashboardSettings';
            this.actionTxt = 'submit';
            this.size = 'md';
        },

        contentBody: 'tpl-dashboard-settings-form',

        events: function () {
            return _.extend({}, Components.DialogShell.prototype.events, {
                'validation::change #dashboardName': 'validate'
            });
        },

        validate: function () {
            this.$dashName.trigger('validate');
            var validity = this.$dashName.data('valid');
            var action = validity && (this.$dashName.val().trim() !== this.model.get('name') || $('.js-switch', this.$el).prop('checked') !== this.model.get('isShared')) ? 'removeClass' : 'addClass';

            this.actionButton[action]('disabled');
            return validity;
        },

        submit: function (e) {
            e && e.preventDefault();
            if ($(e.target).hasClass('disabled')) {
                return;
            }

            var val = this.$dashName.val().trim();
            var shared = $('.js-switch', this.$el).prop('checked');
            var dashboard = {};

            if (!this.validate() && this.model.get('isShared') == shared) {
                return;
            }

            if (this.validate()) {
                if (this.model.get('name') != val) {
                    dashboard.name = (val) ? val : this.model.get('name');
                }
                dashboard.share = shared;
                this.model.set({name: ((val) ? val : self.model.get('name')), isShared: dashboard.share});
                var self = this;
                this.model.updateName(dashboard, function () {
                    if(self.model){
                        self.context.parent.trigger('onUpdateDashboard', [self.model]);
                        self.$el.modal('hide');
                        Util.ajaxSuccessMessenger('dashboardUpdated');
                    }
                });
            }
        },

        render: function () {
            Components.DialogShell.prototype.render.call(this);
            var param = {
                name: (this.model) ? this.model.get('name') : '',
                shared: (this.model) ? this.model.get('isShared') : false,
                projectName: this.project.projectId,
                myDash: this.mydash
            };
            this.$content.append(Util.templates(this.contentBody, param));
            this.$dashName = $('#dashboardName', this.$content);
            this.setupValidator();
            this.actionButton = $('#actionBtnDialog', this.$el);
            Util.switcheryInitialize(this.$content);
            this.delegateEvents();
            var self = this;
            $('input.js-switch').on('switchChange.bootstrapSwitch', function () {
                self.validate();
            });
            return this;
        }
    });

    var NavigationInfo = Backbone.Model.extend({
        initialize: function (options) {
            this.activeId = options.current;
        },

        getCurrentDashboard: function () {
            this.collection = this.collection || new Collection([]);
            var result;
            if (this.activeId) {
                result = this.collection.get(this.activeId);
            } else {
                var lastActive = Storage.getActiveDashboard() || {};
                if (lastActive.id) {
                    result = this.collection.get(lastActive.id);
                    this.activeId = lastActive.id;
                    config.router.navigate(Urls.redirectToDashboard(this.activeId), {trigger: false});
                } else {
                    result = this.collection.at(0);
                        if (result) {
                            this.setActive(result);
                        }
                }
            }
            return result;
        },

        changeActive: function (id, addShared) {
            this.collection = this.collection || new Collection([]);
            var dashboard =  this.collection.get(id);

            if (dashboard) {
                this.setActive(dashboard);
                var self = this;
                return dashboard.fetch()
                    .done(function (data) {
                        self.collection.add(data, {merge: true});
                    });
            } else {
                // load dashboard into the collection - new dash added case
                this.collection.add(new Model({id: id, isDirectLinkDashboard: !addShared}));
                if (!addShared) {
                    Storage.setDirectLinkDashboard(id);
                }
                return this.changeActive(id);
            }
        },

        addDashboard: function (dash) {
            this.collection.add(new Model(dash), {merge: true});
        },

        loadDashboards: function () {
            var self = this;

            return Service.getProjectDashboards()
                .done(function (dashsData) {
                    var containsDashboard = false,
                     lastActiveId = Storage.getActiveDashboard() || {},
                     currentId = self.activeId || lastActiveId.id;

                    self.collection = new Collection([]);
                    dashsData = dashsData || [];

                    containsDashboard = _.filter(dashsData, function (dashboard) {
                        //if (dashboard.id == currentId) {
                        //    dashboard.isDirectLinkDashboard = true;
                        //    Storage.setDirectLinkDashboard(currentId);
                        //}
                        return dashboard.id == currentId
                    }).length > 0;

                    if (!containsDashboard && currentId) {
                        if (window.location.hash.indexOf('dashboard') > 0) {
                            Service.getProjectDashboard(currentId)
                                .done(function (data) {
                                    data.isDirectLinkDashboard = true;

                                    var mergedDashboards = $.merge( dashsData, [data] );
                                    Storage.setDirectLinkDashboard(data.id);

                                    self.collection = new Collection(mergedDashboards);
                                    self.trigger('load::dashboardById');

                                })
                                .fail(function (error) {
                                    var mergedDashboards = $.merge( [], dashsData );
                                    self.collection = new Collection(mergedDashboards);
                                    self.trigger('load::dashboardById');
                                    self.trigger('failedload::dashboardById', {errorText: error.responseText});
                                });
                        }
                    } else {
                        self.collection = new Collection(dashsData);
                    }
                })
                .fail(function (error) {
                    self.trigger('failedload::dashboardById', {errorText: error.responseText});
                });
        },

        setActive: function (dashboard) {
            this.activeId = dashboard ? dashboard.get("id") : "";
            var lastActive = dashboard
                ? {
                    id: dashboard.get("id"),
                    name: dashboard.get("name"),
                    owner: dashboard.get("owner")
                }
                : {};
            Storage.setActiveDashboard(lastActive);
            config.router.navigate(Urls.redirectToDashboard(this.activeId), {trigger: false});
            if (this.activeId) {
            }
        },

        getDashboards: function () {
            return this.collection;
        },

        removeDashboard: function (id) {
            this.collection.remove(this.collection.where({id: id}));
            var newActive = this.collection.at(0);
            this.setActive(newActive);
            return newActive;
        },

        isEmpty: function () {
            return this.collection.length === 0;
        }
    });

    return {
        ContentView: ContentView,
        DashboardBody: DashboardBody,
        DashboardHeader: DashboardHeader,
        DashboardsList: DashboardsList,
        AddDashboard: AddDashboard,
        EditDashboard: EditDashboard,
        NavigationInfo: NavigationInfo,
        Model: Model
    };
});
