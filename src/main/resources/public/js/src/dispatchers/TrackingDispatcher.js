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
        15: ['Filter Panel', 'Click on Bttn Edit', 'Edit Filter parameters/Arise modul "Edit Filter"'],
        16: ['Filter Panel', 'Click on Bttn Save', 'Save Filter parameters'],
        17: ['Filter Panel', 'Click on Bttn Add Widget', 'Add New Widget from Launches Page/Arise Modul "Add Widget"'],
        18: ['Filter Launches', 'Hover on Icon Comment on Filter Tab', 'Arise Tooltip with comment from Filter Tab'],
        19: ['Filter Launches', 'Hover on Icon Shared by other on Filter Tab', 'Arise Tooltip with "Filter is shared by other user" from Filter Tab'],
        20: ['Filter Launches', 'Hover on Icon Shared on Filter Tab', 'Arise Tooltip with "Filter is shared" from Filter Tab'],
        21: ['Filter Launches', 'Hover on Icon Star on Filter Tab', 'Arise Tooltip with "Filter is not saved: from Filter Tab'],
        22: ['Launches', 'Click on All Launches', 'Transition to All Launches without filter'],
        23: ['Launches', 'Click on Item Name', 'Transition to Item page'],
        24: ['Launches', 'Click on Icon Menu near Launch Name', 'Arise Dropdown with single actions for this launch'],
        25: ['Launches', 'Click on "Move to Debug" in Launch Menu', 'Arise Modul "Move to Debug"'],
        26: ['Launches', 'Click on "Force Finish" in Launch Menu', 'Interrupt launch loading'],
        27: ['Launches', 'Click on "Match Issues in Launch" in Launch Menu', 'Starts Matching'],
        28: ['Launches', 'Click on "Analysis" in Launch Menu', 'Starts Analysing'],
        29: ['Launches', 'Click on "Delete" in Launch Menu', 'Arise Modul "Delete Launch"'],
        30: ['Launches', 'Click on "Export: PDF" in Launch Menu', 'Stars download of report in PDF'],
        31: ['Launches', 'Click on "Export: XLS" in Launch Menu', 'Stars download of report in XLS'],
        32: ['Launches', 'Click on "Export: HTML" in Launch Menu', 'Stars download of report in HTML'],
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
