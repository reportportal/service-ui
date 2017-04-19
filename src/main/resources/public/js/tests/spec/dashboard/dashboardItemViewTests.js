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
    var Backbone = require('backbone');
    var DataMock = require('fakeData');
    var initialState = require('initialState');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var DashboardModel = require('dashboard/DashboardModel');
    var DashboardItemView = require('dashboard/DashboardItemView');
    var GadgetModel = require('dashboard/GadgetModel');
    var Service = require('coreService');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    var ModalAddWidget = require('modals/addWidget/modalAddWidget');
    var ModalAddSharedWidget = require('modals/addSharedWidget/modalAddSharedWidget');

    require('updateBackbone');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Dashboard View', function () {
        var sandbox = $('#sandbox');
        var view;
        var model;
        var viewModel;
        var config;
        var renderView;
        Util.extendStings();

        renderView = function (modelData) {
            spyOn(DashboardItemView.prototype, 'updateGadgetsTimer').and.stub();
            // spyOn(DashboardItemView.prototype, 'activateGridStack').and.stub();
            view = new DashboardItemView({
                model: modelData
            });
            sandbox.append(view.$el);
        };

        beforeEach(function () {
            initialState.initAuthUser();
            config = App.getInstance();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();
            sandbox.append($('<div id="forScroll"></div>'));
            config.mainScrollElement = Util.setupBaronScroll(sandbox.find($('#forScroll')));
            spyOn(config.mainScrollElement, 'off').and.stub();
            spyOn(config.mainScrollElement, 'on').and.stub();
            spyOn(config.mainScrollElement, 'scrollTop').and.stub();

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

        it('should be defined and render dashboard view', function () {
            var rendered = spyOn(DashboardItemView.prototype, 'render').and.callThrough();
            var el;
            model = new DashboardModel(DataMock.userDashboards()[0]);
            renderView(model);
            el = sandbox.find(view.$el);
            expect(view).toBeDefined();
            expect(rendered).toHaveBeenCalled();
            expect(el.length).toEqual(1);
        });

        it('should be load model and render dashboard view if model not loaded', function () {
            var loaded = spyOn(Service, 'getProjectDashboard').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve([]);
                return deferred.promise();
            });
            var el;
            model = new DashboardModel(DataMock.userDashboards()[0]);
            model.set('notLoad', true);
            renderView(model);
            el = sandbox.find(view.$el);
            expect(loaded).toHaveBeenCalledWith(model.get('id'));
            expect(el.length).toEqual(1);
        });

        it('should be render dashboard header with action buttons', function () {
            var data = DataMock.userDashboards()[0];
            var el;
            model = new DashboardModel(data);
            renderView(model);
            el = sandbox.find(view.$el);
            expect(el.find('[data-js-add-widget]').length).toEqual(2);
            expect(el.find('[data-js-add-shared-widget]').length).toEqual(1);
            expect(el.find('[data-js-edit]').length).toEqual(1);
            expect(el.find('[data-js-full-screen]').length).toEqual(1);
            expect(el.find('[data-js-remove]').length).toEqual(1);
        });

        it('should be show "add widget modal" on click button "Add New Widget"', function () {
            var showAdd = spyOn(ModalAddWidget.prototype, 'show').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve();
                return deferred.promise();
            });
            var data = DataMock.userDashboards()[0];
            var el;
            var add;
            model = new DashboardModel(data);
            renderView(model);
            el = sandbox.find(view.$el);
            add = el.find('[data-js-add-widget]');
            add.click();
            expect(showAdd).toHaveBeenCalled();
        });

        it('should be show "add shared widget modal" on click button "Add Shared Widget"', function () {
            var showAdd = spyOn(ModalAddSharedWidget.prototype, 'show').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve();
                return deferred.promise();
            });
            var data = DataMock.userDashboards()[0];
            var el;
            var add;
            model = new DashboardModel(data);
            renderView(model);
            el = sandbox.find(view.$el);
            add = el.find('[data-js-add-shared-widget]');
            add.click();
            expect(showAdd).toHaveBeenCalled();
        });

        it('should be show "edit dashboard modal" on click button "Edit"', function () {
            var edit = spyOn(ModalEditDashboard.prototype, 'show').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.reject();
                return deferred.promise();
            });
            var data = DataMock.userDashboards()[0];
            var el;
            var btn;
            model = new DashboardModel(data);
            model.collection = new (Backbone.Collection.extend())([]);
            renderView(model);
            el = sandbox.find(view.$el);
            btn = el.find('[data-js-edit]');
            btn.click();
            expect(edit).toHaveBeenCalled();
        });

        it('should be show fullscreen mode on click button "Full Screen"', function () {
            var fullScreen = spyOn($.fn, 'fullscreen').and.callFake(function () {});
            var data = DataMock.userDashboards()[0];
            var el;
            var btn;
            model = new DashboardModel(data);
            renderView(model);
            el = sandbox.find(view.$el);
            btn = el.find('[data-js-full-screen]');
            btn.click();
            expect(fullScreen).toHaveBeenCalled();
        });

        it('should be exit from fullscreen mode on click button "Close Full Screen"', function () {
            var fullScreen = spyOn($.fullscreen, 'exit').and.callFake(function () {});
            var data = DataMock.userDashboards()[0];
            var el;
            var btn;
            var exit;
            model = new DashboardModel(data);
            renderView(model);
            el = sandbox.find(view.$el);
            btn = el.find('[data-js-full-screen]');
            btn.click();
            exit = el.find('[data-js-close-fullscreen]');
            exit.click();
            expect(fullScreen).toHaveBeenCalled();
        });

        it('should be show "Confirmation modal" on click "Delete" button', function () {
            var showConfirm = spyOn(ModalConfirm.prototype, 'show').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.reject();
                return deferred.promise();
            });
            var data = DataMock.userDashboards()[0];
            var el;
            var btn;
            model = new DashboardModel(data);
            renderView(model);
            el = sandbox.find(view.$el);
            btn = el.find('[data-js-remove]');
            btn.click();
            expect(showConfirm).toHaveBeenCalled();
        });

        it('should be render widgets', function () {
            var addWidget = spyOn(DashboardItemView.prototype, 'onAddGadget').and.callThrough();
            var data = DataMock.userDashboards()[0];
            var widgets = data.widgets;
            var el;
            model = new DashboardModel(data);
            model.setWidgets(widgets, true);
            renderView(model);
            el = sandbox.find(view.$el);
            expect(el).not.toHaveClass('not-found');
            expect(addWidget.calls.count()).toEqual(widgets.length);
            expect(el.find('.grid-stack-item').length).toEqual(widgets.length);
        });

        it('should be render no widgets block', function () {
            var addWidget = spyOn(DashboardItemView.prototype, 'onAddGadget').and.callThrough();
            var data = DataMock.userDashboards()[3];
            var widgets = data.widgets;
            var el;
            model = new DashboardModel(data);
            model.setWidgets(widgets, true);
            renderView(model);
            el = sandbox.find(view.$el);
            expect(addWidget).not.toHaveBeenCalled();
            expect(el).toHaveClass('not-found');
            expect(el.find('.no-result-found').length).toEqual(1);
            expect(el.find('[data-js-add-widget]').length).toEqual(2);
        });

        it('should be render added widget on add new widget', function () {
            var addCollection = spyOn(Backbone.Collection.prototype, 'add').and.callThrough();
            var addWidget = spyOn(DashboardItemView.prototype, 'onAddGadget').and.callThrough();
            var data = DataMock.userDashboards()[0];
            var el;
            model = new DashboardModel(data);
            renderView(model);
            model.trigger('add:widget', new GadgetModel());
            el = sandbox.find(view.$el);
            expect(addCollection).toHaveBeenCalled();
            expect(addWidget).toHaveBeenCalled();
            expect(el.find('.grid-stack-item').length).toEqual(1);
        });
    });
});
