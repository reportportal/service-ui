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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var storageService = require('storageService');
    var Components = require('core/components');
    var DataMock = require('fakeData');
    var SingletonAppModel = require('model/SingletonAppModel');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('PagingToolbar', function () {

        xdescribe("disabled suite", function () {

            var sandbox = $("#sandbox"),
                context,
                page,
                view,
                appModel,
                config;
            Util.extendStings();

            var renderPaging = function () {
                view = new Components.PagingToolbar({
                    el: sandbox,
                    model: new Backbone.Model(page),
                    pageType: "objectsOnPage"
                }).render();
            };

            beforeEach(function () {
                config = App.getInstance();
                config.userModel = new Backbone.Model(DataMock.getConfigUser());
                config.preferences = DataMock.getUserPreferences();
                appModel = new SingletonAppModel();
                appModel.set('projectId', 'default_project');
                page = {
                    number: 3,
                    size: 50,
                    totalElements: 250,
                    totalPages: 5
                };

                spyOn(Components.PagingToolbar.prototype, 'scrollToTop').and.stub;
            });

            afterEach(function () {
                config = null;
                context = null;
                appModel = null;
                view && view.destroy();
                view = null;
                $('.dialog-shell').modal('hide');
                $('.modal-backdrop, .dialog-shell').remove();
                sandbox.off().empty();
            });

            it('should be render paging toolbar', function () {
                spyOn(Components.PagingToolbar.prototype, 'render').and.callThrough();
                renderPaging();
                expect(view).toBeDefined();
                expect(Components.PagingToolbar.prototype.render).toHaveBeenCalled();
                expect($('.pagingtoolbar', sandbox).length).toEqual(1);
            });

            it('should be render paging toolbar buttons', function () {
                renderPaging();
                expect($('.first', sandbox).length).toEqual(1);
                expect($('.previous', sandbox).length).toEqual(1);
                expect($('.next', sandbox).length).toEqual(1);
                expect($('.last', sandbox).length).toEqual(1);
                expect($('.page', sandbox).length).toEqual(page.totalPages);
            });

            it('should be render quantity displayed items on page of items', function () {
                renderPaging();
                var blk = $('p.text-left.col-md-2', sandbox),
                    qty = ((page.number - 1) * page.size + 1) + ' - ' + page.number * page.size + ' of ' + page.totalPages * page.size;
                expect(blk.length).toEqual(1);
                expect(blk.text().trim()).toEqual(qty);
            });

            it('should be render items per page counter', function () {
                renderPaging();
                var blk = $('.itemsPerPage', sandbox);
                expect(blk.length).toEqual(1);
                expect(blk.text().trim()).toEqual('' + page.size);
            });

            it('should be show change items per page control', function () {
                renderPaging();
                var btn = $('.itemsPerPage', sandbox),
                    form = $('#pageSize', sandbox);
                expect(btn.length).toEqual(1);
                expect(form.length).toEqual(1);
                expect(form.css('display')).toEqual('none');
                btn.click();
                expect(btn.css('display')).toEqual('none');
                expect(form.css('display')).toEqual('inline-block');
            });

            it('should be update items per page onchange by user', function () {
                spyOn(Components.PagingToolbar.prototype, 'applyPaging').and.callThrough();
                spyOn(Components.PagingToolbar.prototype, 'trigger').and.callFake(function () {
                });
                renderPaging();
                var qty = 10,
                    form = $('#pageSize', sandbox),
                    e = $.Event("keyup");
                view.showItemsPerPageControl($.Event("click"));
                form.val(qty);
                e.keyCode = 13;
                form.trigger(e);
                expect(Components.PagingToolbar.prototype.applyPaging).toHaveBeenCalled();
                expect(Components.PagingToolbar.prototype.trigger.calls.count()).toEqual(2);
                expect(Components.PagingToolbar.prototype.trigger.calls.argsFor(0)).toEqual(['keyUpPageSize', '10']);
                expect(Components.PagingToolbar.prototype.trigger.calls.argsFor(1)).toEqual(['count', 10]);
            });

            it('should be navigate to first page onclick "First page" button', function () {
                spyOn(Components.PagingToolbar.prototype, 'trigger').and.callFake(function () {
                });
                renderPaging();
                var btn = $('a.first', sandbox);
                expect(btn.length).toEqual(1);
                btn.click();
                expect(Components.PagingToolbar.prototype.trigger).toHaveBeenCalledWith('page', 1);

            });

            it('should be navigate to last page onclick "Last page" button', function () {
                spyOn(Components.PagingToolbar.prototype, 'trigger').and.callFake(function () {
                });
                renderPaging();
                var btn = $('a.last', sandbox);
                expect(btn.length).toEqual(1);
                btn.click();
                expect(Components.PagingToolbar.prototype.trigger).toHaveBeenCalledWith('page', page.totalPages);
            });

            it('should be navigate to next page onclick "Next page" button', function () {
                spyOn(Components.PagingToolbar.prototype, 'trigger').and.callFake(function () {
                });
                renderPaging();
                var btn = $('a.next', sandbox);
                expect(btn.length).toEqual(1);
                btn.click();
                expect(Components.PagingToolbar.prototype.trigger).toHaveBeenCalledWith('page', page.number + 1);
            });

            it('should be navigate to previus page onclick "Prev page" button', function () {
                spyOn(Components.PagingToolbar.prototype, 'trigger').and.callFake(function () {
                });
                renderPaging();
                var btn = $('a.previous', sandbox);
                expect(btn.length).toEqual(1);
                btn.click();
                expect(Components.PagingToolbar.prototype.trigger).toHaveBeenCalledWith('page', page.number - 1);
            });

            it('should be navigate to page onclick page number', function () {
                spyOn(Components.PagingToolbar.prototype, 'trigger').and.callFake(function () {
                });
                renderPaging();
                var btn = $('a.page', sandbox).eq(3),
                    number = 3 + 1;
                expect(btn.length).toEqual(1);
                btn.click();
                expect(Components.PagingToolbar.prototype.trigger).toHaveBeenCalledWith('page', number);
            });
        });
    });
});