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
'use strict';

define(function(require, exports, module) {
    var Backbone = require('backbone');

    var text = {
        shared: "Shared",
        own: "OWN",
        notShared: "NotShared"
    };

    var TrackingDispatcher = {
        trackEvent: function(){
            this.trigger('trackEvent', arguments);
        },
        trackSiteSearch: function(){
            this.trigger('trackSiteSearch', arguments);
        },

        userLoggedIn: function (login) {
            this.trackEvent('"Nav", "Login", "Login " + login');
        },
        userLoggedOut: function (login) {
            this.trackEvent('"Nav", "Logout", "Logout " + login');
        },
        projectChanged: function (project) {
            this.trackEvent("Nav", "Project changed", "Project " + project);
        },
        adminPage: function () {
            this.trackEvent("Nav", "Admin page", "Admin page visited ");
        },
        profilePage: function () {
            this.trackEvent("Nav", "Profile page", "Profile page visited ");
        },

        profileInfoEdit: function () {
            this.trackEvent("Profile", "Edit personal data", "Information updated");
        },
        profilePasswordChanged: function () {
            this.trackEvent("Profile", "Change password", "Password changed");
        },
        profilePhotoUploaded: function () {
            this.trackEvent("Profile", "Upload photo", "Photo uploaded");
        },

        logViewOpened: function (type, name) {
            this.trackEvent("Test", "Log view opened", ["Log for " + type]);
        },
        logViewPaging: function (page, totalPages) {
            this.trackEvent("Test", "Logs paged", "Pg:" + page + " / " + totalPages);
        },
        jiraTicketPost: function (screens, logs) {
            this.trackEvent("Test", "Jira ticket post", "Pic: " + screens + " logs: " + logs);
        },
        jiraTicketLoad: function (num) {
            this.trackEvent("Test", "Ticket load", "Number of tickets: " + num);
        },
        jiraTicketDelete: function () {
            this.trackEvent("Test", "Ticket deleted", "Ticket deleted");
        },
        defectStateChange: function (was, is) {
            this.trackEvent("Test", "Defect type changed", "Defect " + was +  "->" + is);
        },
        historyLineNavigation: function (diff) {
            var direction = diff < 0 ? "forward" :  "back";
            this.trackEvent("Test", "History line nav", "History "+ Math.abs(diff) + " steps " + direction);
        },
        testItemActivityExpanded: function (name) {
            this.trackEvent("Test", "Test item activity expanded");
        },
        screenShotOpen: function () {
            this.trackEvent("Test", "Screen shot opened");
        },
        logLevelIn: function (level) {
            this.trackEvent("Test", "Log level", "Log level " + level);
        },
        searchLogMessage: function (string) {
            this.trackSiteSearch("Test", "Message contains search", string);
        },
        nextPreviousTest: function(direction){
            this.trackEvent("Test", "Next-Previous test case", "NxtPrv: " + direction);
        },

        logWithAttach: function () {
            this.trackEvent("Log with attach", "Logs filtered by attach");
        },
        matchIssue: function (type) {
            this.trackEvent("Match issue called", type);
        },

        filterClicked: function (isShared, name) {
            this.trackEvent("Filters", "Filter name clicked", ["F.Click " + isShared, name]);
        },
        filterShared: function (isOn, name) {
            this.trackEvent("Filters", "Filter shared", ["F.Shared " + isOn, name]);
        },
        filterFavoured: function (isOn, name) {
            this.trackEvent("Filters", "Filter faved", ["F.Fav " + isOn, name]);
        },

        launchesMerge: function (count) {
            this.trackEvent("Launch", "Merge Launch", "Merge " + count);
        },
        filterAdded: function (type, criteria) {
            this.trackEvent("Launch", "Filter added", ["F.Add " + type, criteria]);
        },
        filterCndChanged: function (type) {
            this.trackEvent("Launch", "Filter condition changed", type);
        },
        debugOn: function (status) {
            this.trackEvent("Launch", "Debug ON " + status);
        },
        debugOff: function (status) {
            this.trackEvent("Launch", "Debug OFF " + status);
        },
        filterTagClick: function (tag) {
            this.trackEvent("Launch", "Filter tag click",  "Tag " + tag);
        },
        refreshGrid: function (level) {
            this.trackEvent("Launches grid refresh", level);
        },
        listView: function (type, amount) {
            this.trackEvent("Launch", "List view", "ListView " + type, amount);
        },
        historyView: function (depth) {
            this.trackEvent("Launch", "HistoryView", "depth " + depth);
        },
        drillDown: function (level) {
            this.trackEvent("Launch", "Drilldown", "lvl " + level);
        },
        tabSaved: function (amount) {
            var type = amount > 1 ? 'Tab saved All' : 'Tab saved',
                subType = amount > 1 ? 'Tab saved. All' : 'Tab saved. one';
            this.trackEvent("Launch", type, subType, amount);
        },
        preconditionMethods: function(status) {
            this.trackEvent("Launch", "Hide preconditions", "Hide pre: " + status);
        },

        dashboardSwitched: function (isShared) {
            var type = isShared ? text.shared : text.own;
            this.trackEvent("Dash", "Dash switched", "Dash open " + type);
        },
        dashboardDel: function (isShared) {
            var type = isShared ? text.shared : text.own;
            this.trackEvent("Dash", "Dash del", "Dash del " + type);
        },
        dashboardAdd: function (isShared) {
            var type = isShared ? text.shared : text.notShared;
            this.trackEvent("Dash", "Dash added", "Dash add " + type);
        },
        dashboardRefresh: function (isShared) {
            // todo: implement when logic will be attached
        },
        dashboardExport: function (isShared) {
            // todo: implement when logic will be attached
        },
        dashboardFullScreen: function (isShared) {
            this.trackEvent("Dash", "Dash full screen", "Dash FULL is shared - " + isShared);
        },

        widgetAdded: function (type) {
            this.trackEvent("Wdg", "Wdg added", "Wdg " + type);
        },
        widgetRemoveType: function (type) {
            this.trackEvent("Wdg", "Wdg removed", "Wdg " + type);
        },
        widgetRemoveIsShared: function (isShared) {
            var type = isShared ? text.shared : text.own;
            this.trackEvent("Wdg", "Wdg removed", "Wdg " + type);
        },
        widgetRefresh: function (type) {
            this.trackEvent("Wdg", "Wdgt refresh", "Wdgt refresh " + type);
        },
        widgetExport: function (type) {
        // todo: implement when logic will be attached
        },


    };

    _.extend(TrackingDispatcher, Backbone.Events);

    return TrackingDispatcher;
});