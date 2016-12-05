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

    var panel = require('filtersPanel');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Util = require('util');
    var Service = require('filtersService');
    var CoreService = require('coreService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var FiltersResolver = require('filtersResolver');
    var App = require('app');
    var Components = require('core/components');

    var initialState = require('initialState');


    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox" style="height: 1px; position:absolute;left: 2000px;"></div>');

    var config,
        Panel,
        sandbox,
        navigation,
        getFiltersSpy;
    var getNavigation = function () {
            var info = Backbone.Collection.extend({
                getLevelGridType: function () {
                    return "launch";
                },
                getCurrentStepTab: function () {
                    return {id: 'allCases', filters: []};
                },
                isDebug: function () {
                    return false;
                },
                isLaunches: function () {
                    return true;
                },
                applyFilters: function (filters) {
                },
                prefix: "launches",
                getDataUrl: function () {
                    return "";
                },
                applyCurrentStepTab: function () {
                },
                changeCurrentStepId: function () {
                    return {id: "allCases", requestParams: new Components.RequestParameters({})}
                },
                getDefaultTab: function () {
                    return {
                        id: "allCases",
                        name: "All",
                        owner: "test",
                        url: "#default_project/launches/all?page.page=1&page.sort=start_time,DESC&page.size=50&tab.id=allCases"
                    }
                },
                isHistory: function () {
                    return false;
                },
                followTabUrl: function () {

                },
                getTempTab: function (newTab) {
                    return {
                        id: newTab.id,
                        name: newTab.name,
                        requestParams: {},
                        url: "/",
                        stateUrl: "",
                        type: 'launch',
                        isShared: newTab.isShared,
                        owner: config.user.user_login
                    }
                }
            });
            return new info();
        },
        getUser = function () {
            var user = Backbone.Model.extend({
                defaults: {
                    user_login: "default",
                    'launch-filters': [3244334, 23423423],
                    'active-filter': 23423423
                }
            });
            return new user();
        };

    describe('Filter panel module', function () {

        Util.extendStings();

        beforeEach(function () {
            initialState.initAuthUser();
            sandbox = $("#sandbox");
            //Panel = new panel.FilterPanel({element: sandbox, navigationInfo: new navigationMock(), user: new userMock()}).render();
            config = App.getInstance();
            config['fullUser'] = getUser();
            config['user'] = config.fullUser.toJSON();
            navigation = getNavigation();
        });

        afterEach(function () {
            Panel && Panel.destroy();
            Panel = null;
            config = null;
            navigation = null;
            getFiltersSpy = null;
            $('.dialog-shell').modal('hide');
            $('.modal-backdrop, .dialog-shell').remove();
            sandbox.off().empty();
        });

        var renderDefaultPanel = function (options) {
            options = options || {};
            config.preferences = options.preferences || {filters: []};

            var deferred = new $.Deferred(),
                promise = deferred.promise();
            deferred.resolve(options.filters || []);

            getFiltersSpy = spyOn(Service, "getFilters").and.returnValue(promise);
            spyOn(CoreService, 'getDefectTypes').and.returnValue($.Deferred().resolve({}));
            var appModel = new SingletonAppModel();
            appModel.set({projectId: 'test'});

            Panel = new panel.FilterPanel({
                element: sandbox,
                navigationInfo: navigation
            }).render();
        };

        var renderPanelWithTwoTabs = function (hasShared) {
            var filters = [{
                name: "hello",
                id: "200",
                requestParams: new Components.RequestParameters({})
            }, {
                name: "good bye",
                id: "42435245",
                requestParams: new Components.RequestParameters({})
            }];
            if (hasShared) {
                filters[1].isShared = true;
            }
            renderDefaultPanel({
                preferences: {filters: ["200", "42435245"]},
                filters: filters
            });
        };

        it('should render default tabs "All" and Add New', function () {
            renderDefaultPanel();
            var allTabs = $(".tab", sandbox);
            expect(allTabs.length).toEqual(2);
            expect($(allTabs[0]).text().trim()).toEqual("All Launches");
            expect(allTabs[1]).toHaveClass("add-new");
        });

        it('should render all tabs from the getFilters request', function () {
            renderPanelWithTwoTabs();
            // 2 default + 2 faked
            expect($(".tab", sandbox).length).toEqual(4);
        });

        it('should render "All" tab as active for empty filters', function () {
            renderDefaultPanel();
            expect($(".tab:first", sandbox)).toHaveClass("active");
        });

        it('should set active tab according to the getCurrentStepTab response', function () {

            spyOn(navigation, 'getCurrentStepTab').and.callFake(function () {
                return {id: '200', filters: []};
            });

            renderPanelWithTwoTabs();
            expect($(".tab.active", sandbox).length).toEqual(1);
            expect($(".tab[data-id=200]", sandbox)).toHaveClass('active');
        });

        it('should call updateTabsPreferences when filter tab was clicked', function () {
            renderPanelWithTwoTabs();
            var spy = spyOn(Service, 'updateTabsPreferences').and.stub(),
                openTabSpy = spyOn(Panel, 'openTabById').and.callFake(function (id) {
                });

            $(".tab[data-id=200]", sandbox).click();
            expect(spy).toHaveBeenCalled();
            expect(openTabSpy).toHaveBeenCalled();
            expect(openTabSpy.calls.mostRecent().args[0]).toEqual('200');
        });

        it('should NOT call updateTabsPreferences if add-new tab was clicked', function () {
            renderPanelWithTwoTabs();
            var spy = spyOn(Service, 'updateTabsPreferences');
            $(".tab.add-new", sandbox).click();
            expect(spy).not.toHaveBeenCalled();
        });

        it('should render Tab with "shared" class if filter has property isShared true', function () {
            renderPanelWithTwoTabs(true);
            expect($(".tab[data-id=42435245]", sandbox)).toHaveClass('shared');
        });

        it('should add new tab with given name right before the add-new tab and make it active', function () {
            renderDefaultPanel();
            spyOn(Panel, 'openTabById').and.callFake(function (id) {
            });
            var name = 'Test_new_tab';
            Panel.addNewTab({name: name, shared: true});
            expect($('.tab', sandbox).length).toEqual(3);
            var beforeLast = $('.tab:last', sandbox).prev();
            expect(beforeLast).toHaveClass('active');
            expect(beforeLast.text().trim()).toEqual(name);
            expect(beforeLast).toHaveClass('unsaved');
        });

        it('should render filter"s criteria based on the grid type for launches level', function () {
            renderDefaultPanel();
            var allLaunchFilters = FiltersResolver.getDefaults(Panel.currentGridType, false);
            var notRequiredLaunchFilters = allLaunchFilters.reject(function (filter) {
                return !!filter.get('required');
            });
            expect($(".checkbox", sandbox).length).toEqual(notRequiredLaunchFilters.length);
        });

        it('should render filter"s criteria based on the grid type for test (suit) level', function () {
            spyOn(navigation, 'getLevelGridType').and.returnValue("test");
            renderDefaultPanel();
            var allLaunchFilters = FiltersResolver.getDefaults(Panel.currentGridType, false);
            var notRequiredLaunchFilters = allLaunchFilters.reject(function (filter) {
                return !!filter.get('required');
            });
            expect($(".checkbox", sandbox).length).toEqual(notRequiredLaunchFilters.length);
        });

        // filter menu options

        it('should not render filter menu options before it was called to be shown', function () {
            renderPanelWithTwoTabs();
            expect($(".tab:first > .filter-manager", sandbox).length).toEqual(0);
        });

        it('should render filter menu options after it was called to be shown', function () {
            renderPanelWithTwoTabs();
            $(".tab[data-id=allCases] > .tab-controls", sandbox).click();
            expect($(".tab[data-id=allCases] > .filter-manager", sandbox).length).toEqual(1);
        });

        it('should render filter menu fully disabled for ALL tab if it was not modified', function () {
            renderPanelWithTwoTabs();
            spyOn(Panel, 'openTabById').and.callFake(function (id) {
            });
            $(".tab:first > .tab-controls", sandbox).click();
            expect($(".tab[data-id=200] .menu-option", sandbox).length).toEqual(6);
            expect($(".tab[data-id=200] .disabled", sandbox).length).toEqual(6);
        });

        it('should open own saved filter menu with EDIT, CLONE and CLOSE options enabled', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            renderPanelWithTwoTabs();
            spyOn(Panel, 'checkIfOwnFilter').and.returnValue(true);
            $(".tab[data-id=200] > .tab-controls", sandbox).click();
            expect($(".tab[data-id=200] .menu-option", sandbox).length).toEqual(6);
            expect($(".tab[data-id=200] .disabled", sandbox).length).toEqual(3);
            expect($(".tab[data-id=200] .edit-tab", sandbox)).not.toHaveClass('disabled');
            expect($(".tab[data-id=200] .clone-tab", sandbox)).not.toHaveClass('disabled');
            expect($(".tab[data-id=200] .close-tab", sandbox)).not.toHaveClass('disabled');
        });

        it('should open shared filter menu with CLONE and CLOSE options enabled', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            renderPanelWithTwoTabs();
            spyOn(Panel, 'checkIfOwnFilter').and.returnValue(false);
            $(".tab[data-id=200] > .tab-controls", sandbox).click();
            expect($(".tab[data-id=200] .disabled", sandbox).length).toEqual(4);
            expect($(".tab[data-id=200] .clone-tab", sandbox)).not.toHaveClass('disabled');
            expect($(".tab[data-id=200] .close-tab", sandbox)).not.toHaveClass('disabled');
        });

        it('should render filter menu for ALL tab with CLONE and DISCARD options enabled if it was modified', function () {
            renderPanelWithTwoTabs();
            Panel.markAsUnsaved();
            expect($(".tab[data-id=allCases]", sandbox)).toHaveClass('active');
            expect($(".tab[data-id=allCases]", sandbox)).toHaveClass('unsaved');
            $(".tab[data-id=allCases] > .tab-controls", sandbox).click();
            expect($(".tab[data-id=200] .clone-tab", sandbox)).not.toHaveClass('disabled');
            expect($(".tab[data-id=200] .discard-tab", sandbox)).not.toHaveClass('disabled');
        });

        it('should enable SAVE and DISCARD on custom filter if it was marked marked as unsaved', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            renderPanelWithTwoTabs();
            spyOn(Panel, 'checkIfOwnFilter').and.returnValue(true);
            spyOn(Panel, 'checkIfFiltersInDefaultState').and.returnValue(false);
            Panel.markAsUnsaved();
            $(".tab[data-id=200] > .tab-controls", sandbox).click();
            expect($(".tab[data-id=200] .save-tab", sandbox)).not.toHaveClass('disabled');
            expect($(".tab[data-id=200] .discard-tab", sandbox)).not.toHaveClass('disabled');
        });

        it('should enable SAVE ALL if more then one filter is marked as unsaved', function () {
            spyOn(Service, 'updateTabsPreferences').and.stub();
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            renderPanelWithTwoTabs();
            spyOn(Panel, 'openTabById').and.callFake(function (id) {
            });
            spyOn(Panel, 'checkIfOwnFilter').and.returnValue(true);
            spyOn(Panel, 'checkIfFiltersInDefaultState').and.returnValue(false);
            Panel.markAsUnsaved();
            $(".tab[data-id=42435245]", sandbox).click();
            Panel.markAsUnsaved();
            $(".tab[data-id=42435245] > .tab-controls", sandbox).click();
            expect($(".tab[data-id=42435245] .save-all-tab", sandbox)).not.toHaveClass('disabled');
        });

        it('should hide options menu for current tab if history mode was detected', function () {
            spyOn(navigation, 'isHistory').and.returnValue(true);
            renderPanelWithTwoTabs();
            expect($(".tab[data-id=allCases]", sandbox)).toHaveClass('history');
        });

        it('should set ALL cases tab active if currentTab tab id is not found among rendered tabs', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '201', filters: []});
            renderPanelWithTwoTabs();
            expect($(".tab[data-id=allCases]", sandbox)).toHaveClass('active');
        });

        it('should not render filter tubs if it is debug mode', function () {
            spyOn(navigation, 'isDebug').and.returnValue(true);
            renderPanelWithTwoTabs();
            expect($(".rp-filter-tabs:first", sandbox)).toBeEmpty();
        });

        // filter menu actions

        it('should call re-fetch getFilters when custom filter changes discarded', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            renderPanelWithTwoTabs();
            spyOn(Panel, 'openTabById').and.callFake(function (id) {
            });
            Panel.markAsUnsaved();
            Panel.discardTabChanges();
            expect(getFiltersSpy.calls.mostRecent().args[0][0]).toEqual('200');
            // one call from beforeEach
            expect(getFiltersSpy.calls.count()).toEqual(2);
        });

        it('should NOT re-fetch if discard called on ALLCASES or TEMP or UNDERLAUNCHES filters', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            spyOn(navigation, 'getDefaultTab').and.returnValue({
                id: "allCases",
                name: "All",
                owner: "test",
                url: "#default_project/launches/all?page.page=1&page.sort=start_time,DESC&page.size=50&tab.id=allCases",
                requestParams: {
                    setTab: function (id) {

                    },
                    getFilters: function () {
                        return []
                    }
                }
            });
            spyOn(navigation, 'isLaunches').and.returnValue(false);
            renderPanelWithTwoTabs();
            Panel.markAsUnsaved();
            Panel.discardTabChanges();
            // one call from beforeEach
            expect(getFiltersSpy.calls.count()).toEqual(1);
        });

        it('should update name and shared state after update and mark as unsaved', function () {
            spyOn(navigation, 'getCurrentStepTab').and.returnValue({id: '200', filters: []});
            renderPanelWithTwoTabs();
            Panel.markAsUnsaved();
            var name = 'UpdateD';
            Panel.updateTab({name: name, shared: true});
            var tab = $('.tab[data-id=200]', sandbox);
            expect(tab.text().trim()).toEqual(name);
            expect(tab).toHaveClass('unsaved');
            expect(tab.find('.fa-share-alt').length).toEqual(0); // TODO - Not use icons - font-awesome !!!
        });

    });

});
