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
    var Backbone = require('backbone');
    var initialState = require('initialState');
    var Epoxy = require('backbone-epoxy');
    var DashboardModel = require('dashboard/DashboardModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var DashboardListItemView = require('dashboard/DashboardListItemView');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    require('updateBackbone');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Dashboard List Item View', function () {
        var sandbox = $('#sandbox');
        var view;
        var model;
        var viewModel;
        var config;
        var renderView;
        Util.extendStings();

        renderView = function (m) {
            viewModel = new (Epoxy.Model.extend({
                defaults: {
                    search: ''
                }
            }))();
            view = new DashboardListItemView({ model: m, viewModel: viewModel });
            sandbox.append(view.$el);
        };

        beforeEach(function () {
            sandbox.append('<div id="dynamic-content"></div>');
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

        it('should be defined dashboard list item view', function () {
            model = new DashboardModel(DataMock.userDashboards()[0]);
            renderView(model);
            expect(view).toBeDefined();
        });
        it('should be rendered dashboard list item view', function () {
            var rendered = spyOn(DashboardListItemView.prototype, 'render').and.callThrough();
            model = new DashboardModel(DataMock.userDashboards()[0]);
            renderView(model);
            expect(rendered).toHaveBeenCalled();
            expect(sandbox.find(view.$el).length).toEqual(1);
        });
        it('should be displayed dashboard title, dashboard description, dashboard is shared blocks', function () {
            var titleEl;
            var descriptionEl;
            var isSharedEl;
            model = new DashboardModel(DataMock.userDashboards()[0]);
            renderView(model);
            titleEl = sandbox.find($('[data-js-name]', view.$el));
            descriptionEl = sandbox.find($('[data-js-description]', view.$el));
            isSharedEl = sandbox.find($('[data-js-shared-container]', view.$el));
            expect(titleEl.length).toEqual(1);
            expect(titleEl.text().trim()).toEqual(model.get('name'));
            expect(descriptionEl.length).toEqual(1);
            expect(descriptionEl.text().trim()).toEqual(model.get('description'));
            expect(isSharedEl).not.toHaveClass('hide');
        });
        it('should not be displayed dashboard description, dashboard is shared blocks', function () {
            var descriptionEl;
            var isSharedEl;
            model = new DashboardModel(DataMock.userDashboards()[1]);
            renderView(model);
            descriptionEl = sandbox.find($('[data-js-description]', view.$el));
            isSharedEl = sandbox.find($('[data-js-shared-container]', view.$el));
            expect(descriptionEl.text().trim()).toEqual('');
            expect(isSharedEl).toHaveClass('hide');
        });
        it('should be navigated to dashboard on click dashboard item', function () {
            var clicked = spyOn(DashboardListItemView.prototype, 'onClickItem').and.callThrough();
            var navigate = spyOn(config.router, 'navigate').and.callFake(function () {});
            var nameEl;
            model = new DashboardModel(DataMock.userDashboards()[0]);
            renderView(model);
            nameEl = sandbox.find($('[data-js-name]', view.$el));
            nameEl.click();
            expect(clicked).toHaveBeenCalled();
            expect(navigate.calls.mostRecent().args[0]).toEqual(model.get('url'));
        });
        it('should be shown "Edit dashboard modal" on click "icon edit"', function () {
            var rendered = spyOn(ModalEditDashboard.prototype, 'render').and.callThrough();
            var shown = spyOn(ModalEditDashboard.prototype, 'show').and.callThrough();
            var editEl;
            spyOn(Util, 'hintValidator').and.stub();
            spyOn(Backbone.View.prototype, 'listenTo').and.stub();
            model = new DashboardModel(DataMock.userDashboards()[0]);
            model.collection = new Backbone.Collection(DataMock.userDashboards());
            renderView(model);
            editEl = sandbox.find($('[data-js-edit]', view.$el));
            expect(editEl.length).toEqual(1);
            editEl.click();
            expect(rendered).toHaveBeenCalled();
            expect(shown).toHaveBeenCalled();
        });
        it('should be shown "Delete dashboard modal" on click "icon delete"', function () {
            var rendered = spyOn(ModalConfirm.prototype, 'render').and.callThrough();
            var shown = spyOn(ModalConfirm.prototype, 'show').and.callThrough();
            var deleteEl;
            model = new DashboardModel(DataMock.userDashboards()[0]);
            renderView(model);
            deleteEl = sandbox.find($('[data-js-remove]', view.$el));
            expect(deleteEl.length).toEqual(1);
            deleteEl.click();
            expect(rendered).toHaveBeenCalled();
            expect(shown).toHaveBeenCalled();
        });
    });
});
