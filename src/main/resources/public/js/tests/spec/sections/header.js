/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var storageService = require('storageService');
    var Router = require('router');

    var DataMock = require('fakeData');
    var initialState = require('initialState');
    var SingletonAppModel = require('model/SingletonAppModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');

    var Header = require('sections/header');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox"></div>');

    describe('header section tests', function () {

        var sandbox,
            headerView,
            config,
            appModel,
            activeHash = 'default_project/members',
            project = "default_project",
            currentPage = "members";

        Util.extendStings();

        var renderHeader = function() {
            spyOn(Backbone.history, 'getFragment').and.returnValue(activeHash);
            headerView = new Header({
                el: $('#sandbox #topHeader'),
                tpl: 'tpl-header',
                lastUrl: project,
                currentPage: currentPage
            }).render();
        };

        beforeEach(function () {
            spyOn(Router.Router.prototype, 'onChangeUserAuth').and.stub();
            sandbox = $("#sandbox");
            sandbox.append('<section class="header"><div id="topHeader"></div></section>');
            config = App.getInstance();
            appModel = new SingletonAppModel();
            appModel.set('projectId', project);
            config.router = new Backbone.Router({});
            config.preferences = DataMock.getUserPreferences();
            config.trackingDispatcher = trackingDispatcher;

            initialState.initAuthUser();
            config.userModel.set(DataMock.getConfigUser());
            config.userModel.ready.resolve();
        });

        afterEach(function () {
            headerView && headerView.destroy();
            headerView = null;
            config = null;
            appModel = null;
            sandbox.off().empty();
        });

        it('should render project selector', function () {
            renderHeader();
            expect($('#projectSelector', sandbox).length).toEqual(1);
        });

        it('should render members and setting buttons', function () {
            renderHeader();
            expect($('#members', sandbox).length).toEqual(1);
            expect($('#settings', sandbox).length).toEqual(1);
        });

        it('should render user navigator', function () {
            renderHeader();
            expect($('#userNavigator', sandbox).length).toEqual(1);
        });

        it('should destroy sidebar view', function () {
            renderHeader();
            headerView.destroy();
            expect($('#topHeader', sandbox).html()).toEqual('');
        });

        it('should toogle menu', function () {
            spyOn(Header.prototype, "onClickMenuOpen").and.callThrough();
            renderHeader();
            spyOnEvent($('[data-js-toogle-menu]'),'click');
            $('[data-js-toogle-menu]', sandbox).trigger('click'); //open menu
            expect('click').toHaveBeenTriggeredOn('[data-js-toogle-menu]');
            expect(Header.prototype.onClickMenuOpen).toHaveBeenCalled();
            expect($('body').hasClass('menu-open')).toBeTruthy();
            $('[data-js-toogle-menu]', sandbox).trigger('click'); //close menu
            expect($('body').hasClass('menu-open')).toBeFalsy();
        });

        it('should clear actives', function () {
            spyOn(Header.prototype, "clearActives").and.callThrough();
            renderHeader();
            $('#members > a',sandbox).addClass('active');
            expect($('#members > a.active',sandbox)).toExist();
            headerView.clearActives();
            expect(Header.prototype.clearActives).toHaveBeenCalled();
            expect($('#members > a.active',sandbox)).not.toExist();
            $('.user-id',sandbox).addClass('active');
            expect($('.user-id.active',sandbox)).toExist();
            headerView.clearActives();
            expect(Header.prototype.clearActives).toHaveBeenCalled();
            expect($('.user-id.active',sandbox)).not.toExist();
        });

        it('should update active link', function () {
            spyOn(Header.prototype, "updateActiveLink").and.callThrough();
            spyOn(Header.prototype, "clearActives").and.callThrough();
            renderHeader();
            $('.user-id',sandbox).addClass('active');
            headerView.updateActiveLink();
            expect(Header.prototype.updateActiveLink).toHaveBeenCalled();
            expect($('.user-id.active',sandbox)).not.toExist();
            expect($('a.active',sandbox)).toEqual($('#members > a',sandbox));
        });

        it('should set last active page', function () {
            spyOn(Header.prototype, "setLastActivePage").and.callThrough();
            spyOn(Header.prototype, "trackClick").and.stub();
            renderHeader();
            spyOnEvent($('[data-js-administrate-page-link]'), 'click');
            headerView.userStorage.set('lastActiveURL', null);
            $('[data-js-administrate-page-link]', sandbox).trigger('click');
            expect('click').toHaveBeenTriggeredOn('[data-js-administrate-page-link]');
            expect(Header.prototype.setLastActivePage).toHaveBeenCalled();
            expect(headerView.userStorage.get('lastActiveURL')).toEqual('default_project/members');
        });

        it('should track click', function() {
            spyOn(Header.prototype, "trackClick").and.callThrough();
            renderHeader();
            spyOnEvent($('#userNavigator a:not("#logout")'), 'click');
            $('#userNavigator a:not("#logout")', sandbox).trigger('click');
            expect('click').toHaveBeenTriggeredOn('#userNavigator a:not("#logout")');
            expect(Header.prototype.trackClick).toHaveBeenCalled();
        });

        it('should logout on click logout button', function() {
            spyOn(Header.prototype, "onClickLogout").and.callThrough();
            renderHeader();
            expect(config.userModel.get('auth')).toBeTruthy();
            spyOnEvent($('#logout'), 'click');
            $('#logout', sandbox).trigger('click');
            expect('click').toHaveBeenTriggeredOn('#logout');
            expect(Header.prototype.onClickLogout).toHaveBeenCalled();
            expect(config.userModel.get('auth')).toBeFalsy();
        });
    });
});