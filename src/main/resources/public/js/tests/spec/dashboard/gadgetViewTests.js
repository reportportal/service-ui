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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Util = require('util');
    var App = require('app');
    var DataMock = require('fakeData');
    var initialState = require('initialState');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var DashboardModel = require('dashboard/DashboardModel');
    var GadgetView = require('dashboard/GadgetView');
    var GadgetModel = require('dashboard/GadgetModel');
    var Service = require('coreService');
    var WidgetView = require('newWidgets/WidgetView');
    var ModalEditWidget = require('modals/addWidget/modalEditWidget');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    require('updateBackbone');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Gadget Item View', function () {
        var sandbox = $('#sandbox');
        var view;
        var model;
        var viewModel;
        var config;
        var renderView;
        Util.extendStings();

        renderView = function (modelData, widgetData, activate) {
            spyOn(Service, 'loadDashboardWidget').and.callFake(function () {
                var deferred = new $.Deferred();
                if (widgetData) {
                    deferred.resolve(widgetData);
                } else {
                    deferred.reject({status: 404});
                }
                return deferred.promise();
            });
            spyOn(WidgetView.prototype, 'onShow').and.stub();
            viewModel = new DashboardModel(DataMock.userDashboards()[0]);
            view = new GadgetView({ model: modelData, dashboardModel: viewModel });
            sandbox.append(view.$el);
            if (activate) {
                view.activateGadget();
            }
        };

        beforeEach(function () {
            initialState.initAuthUser();
            config = App.getInstance();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();
            config.trackingDispatcher = trackingDispatcher;
            spyOn(config.trackingDispatcher, 'trackEventNumber').and.stub();
        });

        afterEach(function () {
            config = null;
            model = null;
            viewModel = null;
            view && view.destroy();
            view = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should be defined gadget view', function () {
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], false);
            expect(view).toBeDefined();
            expect(view instanceof GadgetView).toBeTruthy();
        });

        it('should be rendered gadget view with preloader', function () {
            var updated = spyOn(GadgetView.prototype, 'update').and.callThrough();
            var el;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], false);
            el = sandbox.find(view.$el);
            expect(el.length).toEqual(1);
            expect(updated).not.toHaveBeenCalled();
            expect(view.$el).toHaveClass('load');
        });

        it('should be render gadget view without preloader if gadget is active', function () {
            var updated = spyOn(GadgetView.prototype, 'update').and.callThrough();
            var el;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            expect(el.length).toEqual(1);
            expect(updated).toHaveBeenCalled();
            expect(view.$el).not.toHaveClass('load');
        });

        it('should be render gadget view with widget name', function () {
            var el;
            var name;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            name = el.find('[data-js-name]');
            expect(name.length).toEqual(1);
            expect(name.text().trim()).toEqual(model.get('name'));
        });

        it('should be render gadget view with "Description" icon with tooltip if widget has description', function () {
            var renderTooltip = spyOn(Util, 'appendTooltip').and.callFake(function () {});
            var el;
            var description;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[2], true);
            el = sandbox.find(view.$el);
            description = el.find('[data-js-comment]');
            expect(description.length).toEqual(1);
            expect(description).not.toHaveClass('hide');
            expect(renderTooltip).toHaveBeenCalled();
        });

        it('should be render gadget view without "Description" icon', function () {
            var renderTooltip = spyOn(Util, 'appendTooltip').and.callFake(function () {});
            var el;
            var description;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            description = el.find('[data-js-comment]');
            expect(description.length).toEqual(1);
            expect(description).toHaveClass('hide');
            expect(renderTooltip).not.toHaveBeenCalled();
        });

        it('should be render gadget view with "Shared" icon if widget is shared', function () {
            var el;
            var shared;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            shared = el.find('[data-js-shared]');
            expect(shared.length).toEqual(1);
            expect(shared).not.toHaveClass('hide');
        });

        it('should be render gadget view without "Shared" icon', function () {
            var el;
            var shared;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[1], true);
            el = sandbox.find(view.$el);
            shared = el.find('[data-js-shared]');
            expect(shared.length).toEqual(1);
            expect(shared).toHaveClass('hide');
        });

        it('should be render gadget view with widget type', function () {
            var el;
            var type;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            type = el.find('[data-js-widget-type]');
            expect(type.length).toEqual(1);
            expect(type.text().trim()).toEqual(model.get('gadgetName'));
        });

        it('should be render gadget view with widget mode "Timeline"', function () {
            var el;
            var mode;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            mode = el.find('[data-js-timeline]');
            expect(mode.length).toEqual(1);
            expect(mode).not.toHaveClass('hide');
            expect(mode).not.toBeEmpty();
        });

        it('should be render gadget view without widget mode', function () {
            var el;
            var mode;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[1], true);
            el = sandbox.find(view.$el);
            mode = el.find('[data-js-timeline]');
            expect(mode.length).toEqual(1);
            expect(mode).toHaveClass('hide');
        });

        it('should be render gadget view without "Public" icon for owner widget', function () {
            var el;
            var pub;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            pub = el.find('[data-js-public]');
            expect(pub.length).toEqual(1);
            expect(pub).toHaveClass('hide');
            expect(pub.attr('title')).toEqual('');
        });

        it('should be render gadget view with "Public" icon if widget was created by another user', function () {
            var el;
            var pub;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[3], true);
            el = sandbox.find(view.$el);
            pub = el.find('[data-js-public]');
            expect(pub.length).toEqual(1);
            expect(pub).not.toHaveClass('hide');
            expect(pub.attr('title')).toEqual(Localization.widgets.widgetCreatedBy + ' ' + model.get('owner'));
        });

        it('should be render gadget view without "Edit widget" icon if widget was created by another user', function () {
            var showEdit = spyOn(ModalEditWidget.prototype, 'show').and.callFake(function () {});
            var el;
            var edit;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[3], true);
            el = sandbox.find(view.$el);
            edit = el.find('[data-js-gadget-edit]');
            expect(edit.length).toEqual(1);
            expect(edit).toHaveClass('hide');
            edit.click();
            expect(showEdit).not.toHaveBeenCalled();
        });

        it('should be show "Edit widget modal" on click "Edit widget" icon', function () {
            var showEdit = spyOn(ModalEditWidget.prototype, 'show').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.reject();
                return deferred.promise();
            });
            var el;
            var edit;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            edit = el.find('[data-js-gadget-edit]');
            expect(edit.length).toEqual(1);
            expect(edit).not.toHaveClass('hide');
            edit.click();
            expect(showEdit).toHaveBeenCalled();
        });

        it('should be show "Confirmation widget modal" on click "Remove widget" icon', function () {
            var showConfirm = spyOn(ModalConfirm.prototype, 'show').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.reject();
                return deferred.promise();
            });
            var el;
            var remove;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            remove = el.find('[data-js-gadget-remove]');
            expect(remove.length).toEqual(1);
            expect(remove).not.toHaveClass('hide');
            remove.click();
            expect(showConfirm).toHaveBeenCalled();
        });

        it('should be refresh widget on click "Refresh widget" icon', function () {
            var updated = spyOn(GadgetView.prototype, 'update').and.callThrough();
            var el;
            var refresh;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, DataMock.getWidgetsModelData()[0], true);
            el = sandbox.find(view.$el);
            refresh = el.find('[data-js-gadget-refresh]');
            expect(refresh.length).toEqual(1);
            expect(refresh).not.toHaveClass('hide');
            refresh.click();
            expect(updated.calls.count()).toEqual(2);
        });

        it('should be show "Unable to load widget" if error come on loading widget', function () {
            var errorLoad = spyOn(GadgetView.prototype, 'onLoadDataError').and.callThrough();
            var el;
            var noData;
            model = new GadgetModel(DataMock.getGadgetModelData());
            renderView(model, null, true);
            el = sandbox.find(view.$el);
            noData = el.find('.widget-error-view');
            expect(errorLoad).toHaveBeenCalled();
            expect(noData.length).toEqual(1);
            expect(noData.text().trim()).toEqual(Localization.widgets.widgetNotFound);
        });
    });
});
