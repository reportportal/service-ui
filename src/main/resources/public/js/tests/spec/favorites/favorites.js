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
    var Components = require('components');
    var Helpers = require('helpers');
    var Util = require('util');
    var Service = require('filtersService');
    var coreService = require('coreService');
    var App = require('app');
    var Favorites = require('favorites');
    var DataMock = require('fakeData');
    var SingletonAppModel = require('model/SingletonAppModel');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');
    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');


    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    describe('Favorite filters', function () {

        var sandbox = $("#sandbox"),
            view,
            context,
            appModel,
            favorites,
            config;
        Util.extendStings();
        var renderView = function () {
            view = new Favorites.Body({
                context: context
            });
            view.collection.add(favorites);
            view.collection.page = {
                number: 1,
                size: 50,
                totalElements: favorites.length,
                totalPages: 1
            };
            view.render();

        };

        beforeEach(function () {
            sandbox.append('<div id="dynamic-content"></div>');
            config = App.getInstance();
            config.userModel = new Backbone.Model(DataMock.getConfigUser());
            config.preferences = DataMock.getUserPreferences();
            appModel = new SingletonAppModel();
            appModel.set('projectId', 'default_project');
            config.router = new Backbone.Router({});
            config.trackingDispatcher = trackingDispatcher;
            favorites = DataMock.getFavorites();
            context = {
                getMainView: function () {
                    return {
                        $body: $('#dynamic-content', sandbox)
                    }
                }
            };

            spyOn(coreService, 'getDefectTypes').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(DataMock.getDefectTypes());
                return deferred.promise();
            });

            spyOn(Backbone.Collection.prototype, 'fetch').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve(favorites);
                return deferred.promise();
            });
        });

        afterEach(function () {
            config = null;
            context = null;
            favorites = null;
            appModel = null;
            view && view.destroy();
            view = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        it('should be defined favorite filters view', function () {
            renderView();
            expect(view).toBeDefined();
            expect($('#dynamic-content .row.rp-table-row', sandbox).length).toEqual(favorites.length);
        });

        it('should be render favorite filter name and link', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-link-to-launches', row),
                filter = favorites[0];
            expect(cell.length).toEqual(1);
            expect(cell.is('a')).toBeTruthy();
            expect(cell.text().trim()).toEqual(filter.name);
        });

        it('should be render favorite filter options', function () {
            spyOn(Helpers, 'getFilterOptions').and.callFake(function () {
            });
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-adv', row);
            expect(cell.length).toEqual(1);
            expect(cell).not.toBeEmpty();
            expect(Helpers.getFilterOptions).toHaveBeenCalled();
        });

        it('should be render favorite filter owner', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('div.rp-info.text-wrapper', row),
                filter = favorites[0];
            expect(cell.length).toEqual(1);
            expect(cell.text().trim()).toEqual(filter.owner);
        });

        it('should be render favorite filter status "Shared"', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.rp-info.filter-shader-status', row);
            expect(cell.length).toEqual(1);
            expect(cell).not.toBeEmpty();
        });

        it('should be show filter status icon, if filter is shared', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.rp-info.filter-actions', row),
                icon = $('.fa-share-alt.fa-rotate-180', cell); // TODO - Not use icons - font-awesome !!!
            expect(icon.length).toEqual(1);
            expect(icon).not.toBe(':hidden');
        });

        it('should be hide filter status icon, if filter is unshared', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(3),
                cell = $('.rp-info.filter-actions', row),
                icon = $('.fa-share-alt', cell); // TODO - Not use icons - font-awesome !!!
            expect(icon.length).toEqual(1);
            expect(icon).not.toBe(':hidden');
        });

        it('should be render favorite filter actions', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell);
            expect(cell.length).toEqual(1);
            expect(actions.length).toEqual(1);
        });

        it('should be show 4 actions buttons if user is owner for filter', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = favorites[0];
            expect(config.userModel.get('name')).toEqual(filter.owner);
            expect($('a.action-link', actions).length).toEqual(4);
            expect($('a.mark-as-favorite', cell).length).toEqual(1);
            expect($('a.edit-filter', cell).length).toEqual(1);
            expect($('a.mark-as-shared', cell).length).toEqual(1);
            expect($('a[data-action="delete"]', cell).length).toEqual(1);
        });

        it('should be show only actions button "Add/Remove to tab" if user doesnt owner for filter', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(1),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = favorites[1];
            expect(config.userModel.get('name')).not.toEqual(filter.owner);
            expect($('a.action-link', actions).length).toEqual(1);
            expect($('a.mark-as-favorite', cell).length).toEqual(1);
        });

        it('should be mark as active action button "Remove from launch tabs" if filter was added to launch tabs', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = favorites[0];
            expect(config.preferences.filters.indexOf(filter.id)).not.toEqual(-1);
            expect($('a.mark-as-favorite', cell).closest('li')).toHaveClass('active');
        });

        it('should be mark as active action button "Share filter" if filter was shared', function () {
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = favorites[0];
            expect((filter.isShared)).toBeTruthy();
            expect($('a.mark-as-shared', cell).closest('li')).toHaveClass('active');
        });

        it('should be apply filter onclick filter link', function () {
            spyOn(Favorites.Body.prototype, 'applyFilter').and.callFake(function () {});
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                link = $('a.filter-link-to-launches', row);
            expect(link.length).toEqual(1);
            link.click();
            expect(Favorites.Body.prototype.applyFilter).toHaveBeenCalled();
        });

        it('should be add filter to launch tabs on click action button', function () {
            spyOn(Favorites.Body.prototype, 'toFavorites').and.callFake(function () {});
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                btn = $('a.mark-as-favorite', cell);
            expect(btn.length).toEqual(1);
            btn.click();
            expect(Favorites.Body.prototype.toFavorites).toHaveBeenCalled();
        });

        it('should be share filter on click action button', function () {
            spyOn(Favorites.Body.prototype, 'shareFilter').and.callThrough();
            spyOn(Favorites.Body.prototype, 'onShareFilter').and.stub;
            spyOn(Service, 'shareFilter').and.callFake(function () {
                var deferred = new $.Deferred();
                deferred.resolve({});
                return deferred.promise();
            });
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = view.collection.at(0),
                btn = $('a.mark-as-shared', cell);
            expect(btn.length).toEqual(1);
            btn.click();
            expect(Favorites.Body.prototype.shareFilter.calls.mostRecent().args[0]).toEqual(filter);
            expect(Service.shareFilter).toHaveBeenCalled();
        });

        it('should be show edit filter form on click action button "Edit"', function () {
            spyOn(Favorites.Body.prototype, 'editFilter').and.callThrough();
            spyOn(Components.DialogWithCallBack.prototype, 'render').and.callFake(function () {});
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = view.collection.at(0),
                btn = $('a.edit-filter', cell);
            expect(btn.length).toEqual(1);
            btn.click();
            expect(Favorites.Body.prototype.editFilter).toHaveBeenCalledWith(filter);
            expect(Components.DialogWithCallBack.prototype.render).toHaveBeenCalled();
        });

        it('should be show delete filter modal popup on click action button "Delete"', function () {
            spyOn(Favorites.Body.prototype, 'deleteFilter').and.callThrough();
            spyOn(Util, 'confirmDeletionDialog').and.callFake(function () {});
            renderView();
            var row = $('#dynamic-content .row.rp-table-row', sandbox).eq(0),
                cell = $('.filter-actions', row),
                actions = $('ul.nav.rp-icons-style', cell),
                filter = view.collection.at(0),
                btn = $('a[data-action="delete"]', cell);
            expect(btn.length).toEqual(1);
            btn.click();
            expect(Favorites.Body.prototype.deleteFilter).toHaveBeenCalledWith(filter);
            expect(Util.confirmDeletionDialog.calls.mostRecent().args[0].callback).toEqual(jasmine.any(Function));
            expect(Util.confirmDeletionDialog.calls.mostRecent().args[0].message).toEqual('deleteFilter');
            expect(Util.confirmDeletionDialog.calls.mostRecent().args[0].format).toEqual([filter.get('name')]);
        });

        it('should be update filters grid on apply filter by name', function () {
            spyOn(Favorites.Body.prototype, 'onPage').and.callFake(function () {});
            spyOn(Favorites.Body.prototype, 'filterApply').and.callThrough();
            renderView();
            var filter = $('#nameFilter', sandbox),
                name = '2334';
            filter.val(name);
            filter.trigger('validation::change', {valid: true, value: name, dirty: true});
            expect(Favorites.Body.prototype.filterApply).toHaveBeenCalled();
            expect(Favorites.Body.prototype.onPage).toHaveBeenCalledWith(1);
        });
    });

});
