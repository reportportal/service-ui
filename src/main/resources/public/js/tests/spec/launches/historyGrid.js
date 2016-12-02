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
    var LaunchGrid = require('launchgrid');
    var App = require('app');
    var Mock = require('fakeData');
    var trackingDispatcher = require('dispatchers/TrackingDispatcher');

    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config, gridView, sandbox,
        historyView = LaunchGrid.HistoryGrid,
        idsList,
        navigationMock = function () {
            var navigation = Backbone.Collection.extend({
                getFilter: function (value) {
                    var result = config.defaultHistoryDepth;
                    if (value === 'ids') result = {id: 'ids', value: idsList.join(',')};
                    return result;
                },
                extractTabId: function () {
                    return config.defaultTabId;
                }
            });
            return new navigation();
        },
        setupGrid = function () {
            gridView = new historyView({
                element: sandbox,
                navigationInfo: navigationMock(),
                path: '?ids=' + idsList.toString() + '&history_depth=' + config.defaultHistoryDepth + '&tab.id=' + config.defaultTabId
            });
        };

    describe('History grid', function () {
        sandbox = $("#sandbox");

        beforeEach(function () {
            config = App.getInstance();
            idsList = ['123', '124', '125'];
            config.trackingDispatcher = trackingDispatcher;
        });

        afterEach(function () {
            config = null;
            gridView && gridView.destroy();
            sandbox.off().empty();
        });

        it('should call for load method on init with 0 as increment', function () {
            var spy = spyOn(historyView.prototype, "load").and.stub();
            setupGrid();
            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(0);
        });

        it('validateForReset should set depth if view depth is 0', function () {
            spyOn(historyView.prototype, "load").and.stub();
            setupGrid();
            expect(gridView.depth).toEqual(0);
            gridView.validateForReset(5, true);
            expect(gridView.depth).toEqual(5);
        });

        it('validateForReset should set depth if increment is false', function () {
            spyOn(historyView.prototype, "load").and.stub();
            setupGrid();
            gridView.validateForReset(5, true);
            expect(gridView.depth).not.toEqual(0);
            gridView.validateForReset(10, false);
            expect(gridView.depth).toEqual(10);
        });

        it('assignHistory should sort by keys response to keep it ordered', function () {
            spyOn(historyView.prototype, "load").and.stub();
            setupGrid();
            var fakeItems = [
                {launchNumber: '22', startTime: 3},
                {launchNumber: '11', startTime: 2},
                {launchNumber: '2', startTime: 1}
            ];
            gridView.assignHistory(fakeItems);
            expect(gridView.launches[0].launchNumber).toEqual('2');
            expect(gridView.launches[2].launchNumber).toEqual('22');
        });

        it('render should show load more button if loaded items are less then requested ids length', function () {
            idsList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            config.defaultHistoryDepth = 5;
            spyOn(historyView.prototype, "load").and.stub();
            setupGrid();
            gridView.launches = [
                {launchNumber: '1', startTime: 3},
                {launchNumber: '2', startTime: 2},
                {launchNumber: '3', startTime: 1}
            ];
            gridView.render();
            expect($("#loadMorePanel", sandbox).length).toEqual(1);
        });

    });
});