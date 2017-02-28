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

    var eventTable = {
        1: ['Sidebar', 'Click on Menu Bttn Dashboards', 'Transition on Dashboards Page'],
        2: ['Sidebar', 'Click on Menu Bttn Filters', 'Transition on Filters Page'],
        3: ['Sidebar', 'Click on Menu Bttn Debug', 'Transition on Debug Page'],
        4: ['Header', 'Click on Menu Bttn Members', 'Transition on Members Page'],
        5: ['Header', 'Click on Menu Bttn Settings', 'Transition on Settings Page'],
        6: ['Header', 'Click on Profile Dropdown', 'Arise Dropdown Menu'],
        7: ['Header', 'Click on Profile link on Dropdown', 'Transition on Profile Page'],
        8: ['Header', 'Click on Administrate link on Dropdown', 'Transition to Administrate Mode'],
        9: ['Header', 'Click on Logout link on Dropdown', 'Logout and transition on Landing Page'],
        10: ['Header', 'Click on Project Dropdown', 'Arise Dropdown with list of Projects'],
        11: ['Header', 'Click on Another Project Name', 'Transition to another project'],

        12: ['Filter Launches', 'Click on Bttn Add Filters', 'Add New Filter'],
        13: ['Filter Panel', 'Click on Bttn Discard', 'Discard Filter parameters'],
        14: ['Filter Panel', 'Click on Bttn Clone', 'Clone Filter parameters'],
        15: ['Filter Panel', 'Click on Bttn Edit', 'Edit Filter parameters/Arise modal "Edit Filter"'],
        16: ['Filter Panel', 'Click on Bttn Save', 'Save Filter parameters'],
        17: ['Filter Panel', 'Click on Bttn Add Widget', 'Add New Widget from Launches Page/Arise Modal "Add Widget"'],
        18: ['Filter Launches', 'Hover on Icon Comment on Filter Tab', 'Arise Tooltip with comment from Filter Tab'],
        19: ['Filter Launches', 'Hover on Icon Shared by other on Filter Tab', 'Arise Tooltip with "Filter is shared by other user" from Filter Tab'],
        20: ['Filter Launches', 'Hover on Icon Shared on Filter Tab', 'Arise Tooltip with "Filter is shared" from Filter Tab'],
        21: ['Filter Launches', 'Hover on Icon Star on Filter Tab', 'Arise Tooltip with "Filter is not saved: from Filter Tab'],
        22: ['Launches', 'Click on All Launches', 'Transition to All Launches without filter'],
        23: ['Launches', 'Click on Item Name', 'Transition to Item page'],
        24: ['Launches', 'Click on Icon Menu near Launch Name', 'Arise Dropdown with single actions for this launch'],
        25: ['Launches', 'Click on "Move to Debug" in Launch Menu', 'Arise Modal "Move to Debug"'],
        26: ['Launches', 'Click on "Force Finish" in Launch Menu', 'Interrupt launch loading'],
        27: ['Launches', 'Click on "Match Issues in Launch" in Launch Menu', 'Starts Matching'],
        28: ['Launches', 'Click on "Analysis" in Launch Menu', 'Starts Analysing'],
        29: ['Launches', 'Click on "Delete" in Launch Menu', 'Arise Modal "Delete Launch"'],
        30: ['Launches', getExportTitle('PDF'), getExportDescription('PDF')],
        31: ['Launches', getExportTitle('XLS'), getExportDescription('XLS')],
        32: ['Launches', getExportTitle('HTML'), getExportDescription('HTML')],
        33: ['Launches', getActionLaunchTitle('NAME'), getDescriptionLaunchTitle('NAME')],
        34: ['Launches', getActionTableFilter('NAME'), getDescriptionTableFilter()],
        35: ['Launches', getActionLaunchTitle('START'), getDescriptionLaunchTitle('START')],
        36: ['Launches', getActionTableFilter('START'), getDescriptionTableFilter()],
        37: ['Launches', getActionLaunchTitle('TOTAL'), getDescriptionLaunchTitle('TOTAL')],
        38: ['Launches', getActionTableFilter('TOTAL'), getDescriptionTableFilter()],
        39: ['Launches', getActionLaunchTitle('PASSED'), getDescriptionLaunchTitle('PASSED')],
        40: ['Launches', getActionTableFilter('PASSED'), getDescriptionTableFilter()],
        41: ['Launches', getActionLaunchTitle('FAILED'), getDescriptionLaunchTitle('FAILED')],
        42: ['Launches', getActionTableFilter('FAILED'), getDescriptionTableFilter()],
        43: ['Launches', getActionLaunchTitle('SKIPPED'), getDescriptionLaunchTitle('SKIPPED')],
        44: ['Launches', getActionTableFilter('SKIPPED'), getDescriptionTableFilter()],
        45: ['Launches', getActionLaunchTitle('PRODUCT BUG'), getDescriptionLaunchTitle('PRODUCT BUG')],
        46: ['Launches', getActionTableFilter('PRODUCT BUG'), getDescriptionTableFilter()],
        47: ['Launches', getActionLaunchTitle('AUTO BUG'), getDescriptionLaunchTitle('AUTO BUG')],
        48: ['Launches', getActionTableFilter('AUTO BUG'), getDescriptionTableFilter()],
        49: ['Launches', getActionLaunchTitle('SYSTEM ISSUE'), getDescriptionLaunchTitle('SYSTEM ISSUE')],
        50: ['Launches', getActionTableFilter('SYSTEM ISSUE'), getDescriptionTableFilter()],
        51: ['Launches', getActionLaunchTitle('TO INVESTIGATE'), getDescriptionLaunchTitle('TO INVESTIGATE')],
        52: ['Launches', getActionTableFilter('TO INVESTIGATE'), getDescriptionTableFilter()],
        53: ['Launches', 'Click on Edit Icon after launch name', 'Edit Launch/Arise Modal "Edit Launch"'],
        54: ['Launches', 'Hover on Product Bug Circle', 'Arise Tooltip with "Total Product Bugs"'],
        55: ['Launches', 'Click on Tooltip "Total Product Bugs"', 'Transition to inner level of launch with Product Bugs'],
        56: ['Launches', 'Hover on Auto Bug Circle', 'Arise Tooltip with "Total Auto Bug"'],
        57: ['Launches', 'Click on Tooltip "Total Auto Bug"', 'Transition to inner level of launch with Auto Bug'],
        58: ['Launches', 'Hover on System Issue Circle', 'Arise Tooltip with "Total System Issue"'],
        59: ['Launches', 'Click on Tooltip "Total System Issue"', 'Transition to inner level of launch with System Issue'],
        60: ['Launches', 'Click on To Investigate Circle', 'Transition to inner level of launch with To Investigate'],
        61: ['Launches', 'Click on Bttn Actions', 'Arise Dropdown with list of actions'],
        62: ['Launches', 'Click on Bttn "Merge" in list of actions', 'Arise Modal "Merge Launches"'],
        63: ['Launches', 'Click on Bttn "Compare" in list of actions', 'Arise Modal "Compare Launches"'],
        64: ['Launches', 'Click on Bttn "Move to Debug" in list of actions', 'Arise Modal "Move to Debug"'],
        65: ['Launches', 'Click on Bttn "Force Finish" in list of actions', 'Force Finish'],
        66: ['Launches', 'Click on Bttn "Delete" in list of actions', 'Arise Modal "Delete Launch"'],
        67: ['Launches', 'Click on Close Icon on Tag of Launch', 'Remove launch from  selection'],
        68: ['Launches', 'Click on Close Icon of all selection', 'Unselect all launches'],
        69: ['Launches', 'Click on Close Icon on Error Tag of Launch', 'Remove launch from  selection'],
        70: ['Launches', 'Click on Bttn "Proceed Valid Items"', 'Remove invalid launches from selection'],
        71: ['Modal Launches', 'Click on Close Icon on Modal "Edit Launch"', 'Close modal "Edit Launch"'],
        72: ['Modal Launches', 'Click on Bttn Cancel on Modal "Edit Launch"', 'Close modal "Edit Launch"'],
        73: ['Modal Launches', 'Click on Bttn Save on Modal "Edit Launch"', 'Save changes "Edit Launch"'],
        74: ['Modal Launches', 'Click on Close Icon on Modal "Move to Debug"', 'Close modal "Move to Debug"'],
        75: ['Modal Launches', 'Click on Bttn Cancel on Modal "Move to Debug"', 'Close modal "Move to Debug"'],
        76: ['Modal Launches', 'Click on Bttn Save on Modal "Move to Debug"', 'Save changes "Move to Debug"'],
        77: ['Modal Launches', 'Click on Close Icon on Modal "Delete Launch"', 'Close modal "Delete Launch"'],
        78: ['Modal Launches', 'Click on Bttn Cancel on Modal "Delete Launch"', 'Close modal "Delete Launch"'],
        79: ['Modal Launches', 'Click on Bttn Delete on Modal "Delete Launch"', 'Delete launch mentioned in modal "Delete Launch"'],
        80: ['Modal Launches', 'Click on Close Icon on Modal "Merge Launches"', 'Close modal "Merge Launches"'],
        81: ['Modal Launches', 'Click on Bttn Cancel on Modal "Merge Launches"', 'Close modal "Merge Launches"'],
        82: ['Modal Launches', 'Click on Bttn Merge on Modal "Merge Launches"', 'Merge launches mentioned in modal "Merge Launches"'],

    }

    function getExportTitle(type){
        return 'Click on "Export: ' + type + '" in Launch Menu';
    }
    function getExportDescription(type){
        return 'Stars download of report in ' + type;
    }
    function getActionLaunchTitle(titleName) {
        return 'Hover on Table title "' + titleName +'"';
    }
    function getDescriptionLaunchTitle(titleName) {
        return 'Arise filter icon before Table title "' + titleName + '"';
    }
    function getActionTableFilter(titleName) {
        return 'Click on Filter Icon before Table title "' + titleName + '"';
    }
    function getDescriptionTableFilter() {
        return 'Arise new field in filter';
    }

    var TrackingDispatcher = {
        trackEvent: function(){
            this.trigger('track:event', arguments);
        },
        pageView: function() {
            this.trigger('page:view', arguments);
        },
        trackEventNumber: function(num) {
            if(!eventTable[num]) {
                console.log('event "' + num + '" not found');
                return;
            }
            this.trigger('track:event', eventTable[num]);
        }


    };

    _.extend(TrackingDispatcher, Backbone.Events);

    return TrackingDispatcher;
});
