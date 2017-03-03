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

        54.1: ['Launches', 'Hover on Product Bug Circle', 'Arise Tooltip with "Total Product Bugs"'],
        54.2: ['Launches', 'Click on Product Bug Circle', 'Transition to inner level of launch with Product Bugs'],
        55: ['Launches', 'Click on Tooltip "Total Product Bugs"', 'Transition to inner level of launch with Product Bugs'],
        56.1: ['Launches', 'Hover on Auto Bug Circle', 'Arise Tooltip with "Total Auto Bug"'],
        56.2: ['Launches', 'Click on Auto Bug Circle', 'Transition to inner level of launch with Auto Bug'],
        57: ['Launches', 'Click on Tooltip "Total Auto Bug"', 'Transition to inner level of launch with Auto Bug'],
        58.1: ['Launches', 'Hover on System Issue Circle', 'Arise Tooltip with "Total System Issue"'],
        58.2: ['Launches', 'Click on System Issue Circle', 'Transition to inner level of launch with System Issue'],
        59: ['Launches', 'Click on Tooltip "Total System Issue"', 'Transition to inner level of launch with System Issue'],
        60: ['Launches', 'Click on To Investigate tag', 'Transition to inner level of launch with To Investigate'],

        61.1: ['Launches', 'Click on item icon "select all launches"', 'Select/unselect all launches'],
        61.2: ['Launches', 'Click on item icon "select one launch"', 'Select/unselect one launch'],

        61.3: ['Launches', 'Click on Bttn Actions', 'Arise Dropdown with list of actions'],
        62: ['Launches', 'Click on Bttn "Merge" in list of actions', 'Arise Modal "Merge Launches"'],
        63: ['Launches', 'Click on Bttn "Compare" in list of actions', 'Arise Modal "Compare Launches"'],
        64: ['Launches', 'Click on Bttn "Move to Debug" in list of actions', 'Arise Modal "Move to Debug"'],
        65: ['Launches', 'Click on Bttn "Force Finish" in list of actions', 'Force Finish'],
        66: ['Launches', 'Click on Bttn "Delete" in list of actions', 'Arise Modal "Delete Launch"'],

        67: ['Launches', 'Click on Close Icon on Tag of Launch', 'Remove launch from  selection'],
        68: ['Launches', 'Click on Close Icon of all selection', 'Unselect all launches'],
        //69: ['Launches', 'Click on Close Icon on Error Tag of Launch', 'Remove launch from  selection'],
        70: ['Launches', 'Click on Bttn "Proceed Valid Items"', 'Remove invalid launches from selection'],

        71.1: ['Modal Launches', 'Click on Close Icon on Modal "Edit Launch"', 'Close modal "Edit Launch"'],
        71.2: ['Modal Launches', 'Edit description in Modal "Edit Launch"', 'Edit launch description'],
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
        83: ['Suite', 'Click on Bread Crumb icon Plus/Minus', 'Show/Hide all names of items'],
        84: ['Suite', 'Click on Bread Crumb All', 'Transition to Launches Page'],
        85: ['Suite', 'Click on Bread Crumb Item name', 'Transition to Item'],
        86: ['Suite', 'Click on Bttn Delete', 'Delete selected Items'],
        87: ['Suite', 'Click on Bttn History', 'Transition to History View Page'],
        88: ['Suite', 'Click on Bttn Refresh', 'Refresh the page'],
        89: ['Suite', 'Hover on Status bar', getTooltipDescription()],
        90: ['Suite', 'Hover on Duration', getTooltipDescription()],
        91: ['Suite', 'Hover on Info line "PB"', getTooltipDescription()],
        92: ['Suite', 'Hover on Info line "AB"', getTooltipDescription()],
        93: ['Suite', 'Hover on Info line "SI"', getTooltipDescription()],
        94: ['Suite', 'Hover on Info line "TI"', getTooltipDescription()],
        95: ['Suite', 'Hover on Info line "ND"', getTooltipDescription()],
        96: ['Suite', 'Enter parameters to refine by name', 'Refine by name'],
        97.1: ['Suite', 'Click on Refine bttn More', 'Arise dropdown with parameters'],
        97.2: ['Suite', 'Select parameters to refine', 'Show parameters fields to refine'],
        98: ['Suite', 'Click on item icon "edit"', 'Arise Modal "Edit Item"'],
        99: ['Suite', 'Click on item icon "select all items"', 'Select/unselect all items'],
        100.1: ['Suite', 'Click on item icon "select one item"', 'Select/unselect one item'],
        100.2: ['Suite', 'Click on icon "close" on selected item', 'Remove item from  selection'],
        100.3: ['Suite', 'Click on icon "close" of all selection', 'Unselect all items'],
        100.4: ['Suite', 'Click on Bttn "Proceed Valid Items"', 'Remove invalid items from selection'],
        101: ['Suite', 'Click on Close Icon on Modal "Edit Item"', 'Close modal "Edit Item"'],
        102: ['Suite', 'Edit description in Modal "Edit Item"', 'Edit description'],
        103: ['Suite', 'Click on Bttn Cancel on Modal "Edit Item"', 'Close modal "Edit Item"'],
        104: ['Suite', 'Click on Bttn Save on Modal "Edit Item"', 'Save changes'],
        105: ['Suite', 'Click on icon "filter" on Name', '"Suite name" input becomes active'],
        106: ['Suite', 'Click on icon "sorting" on Name', 'Sort items by name'],
        107: ['Suite', 'Click on icon "filter" on Start time', 'Arises active "Start time" input'],
        108: ['Suite', 'Click on icon "sorting" on Start time', 'Sort items by Start time'],
        109: ['Suite', 'Click on icon "filter" on Total', 'Arises active "Total" input'],
        110: ['Suite', 'Click on icon "sorting" on Total', 'Sort items by Total'],
        111: ['Suite', 'Click on icon "filter" on Passed', 'Arises active "Passed" input'],
        112: ['Suite', 'Click on icon "sorting" on Passed', 'Sort items by Passed'],
        113: ['Suite', 'Click on icon "filter" on Failed', 'Arises active "Failed" input'],
        114: ['Suite', 'Click on icon "sorting" on Failed', 'Sort items by Failed'],
        115: ['Suite', 'Click on icon "filter" on Skipped', 'Arises active "Skipped" input'],
        116: ['Suite', 'Click on icon "sorting" on Skipped', 'Sort items by Skipped'],
        117: ['Suite', 'Click on icon "filter" on Product Bug', 'Arises active "Product Bug" input'],
        118: ['Suite', 'Click on icon "sorting" on Product Bug', 'Sort items by Product Bug'],
        119: ['Suite', 'Click on icon "filter" on Auto Bug', 'Arises active "Auto Bug" input'],
        120: ['Suite', 'Click on icon "sorting" on Auto Bug', 'Sort items by Auto Bug'],
        121: ['Suite', 'Click on icon "filter" on System Issue', 'Arises active "System Issue" input'],
        122: ['Suite', 'Click on icon "sorting" on System Issue', 'Sort items by System Issue'],
        123: ['Suite', 'Click on icon "filter" on To Investigate', 'Arises active "To Investigate" input'],
        124: ['Suite', 'Click on icon "sorting" on To Investigatee', 'Sort items by To Investigate'],
        125: ['Suite', 'Hover on PB Circle', 'Arise Tooltip with "Total Product Bugs"'],
        126.1: ['Suite', 'Click on PB Circle', 'Transition to PB list view'],
        126.2: ['Suite', 'Click on Tooltip "Total Product Bugs"', 'Transition to PB list view'],
        127: ['Suite', 'Hover on AB Circle', 'Arise Tooltip with "Total Auto Bug"'],
        128.1: ['Suite', 'Click on AB Circle', 'Transition to AB list view '],
        128.2: ['Suite', 'Click on Tooltip "Auto Bug"', 'Transition to AB list view '],
        129: ['Suite', 'Hover on SI Circle', 'Arise Tooltip with "Total System Issue"'],
        130.1: ['Suite', 'Click on SI Circle', 'Transition to SI list view '],
        130.2: ['Suite', 'Click on Tooltip "Total System Issue"', 'Transition to SI list view'],
        131: ['Suite', 'Click on TI tag', 'Transition to TI list view '],
        132: ['History View', 'Select "history depth"', 'Show parameter of selected "history depth"'],
        133: ['History View', 'Click on item', 'Transition to "Item"'],
        134: ['History View', 'Hover on defect type tag', getTooltipDescription()],
        135: ['Test', 'Enter parameters to refine by name', 'Refine by name'],
        136: ['Test', 'Click on Refine bttn More', 'Arise dropdown with parameters'],
        137: ['Test', 'Select parameters to refine', 'Show parameters fields to refine'],
        138: ['Test', 'Click on Method type switcher', 'Show/Hide method type'],
        139: ['Test', 'Click on icon "filter" Method type', 'Arises active "Method type" input'],
        140: ['Test', 'Click on icon "sorting" Method type', 'Sort items by Method type'],
        141: ['Test', 'Click on icon "filter" Name', '"Suite name" input becomes active'],
        142: ['Test', 'Click on icon "sorting" Name', 'Sort items by Name'],
        143: ['Test', 'Click on icon "filter" Status', 'Arises active "Status" input'],
        144: ['Test', 'Click on icon "sorting" Status', 'Sort items by Status'],
        145: ['Test', 'Click on icon "filter" Start time', 'Arises active "Start time" input'],
        146: ['Test', 'Click on icon "sorting" Start time', 'Sort items by Start time'],
        147: ['Test', 'Click on icon "filter" Defect type', 'Arises active "Defect type" input'],
        148: ['Test', 'Click on icon "sorting" Defect type', 'Sort items by Defect type'],
        149: ['Test', 'Click on item icon "edit"', 'Arise Modal "Edit Item"'],
        150: ['Test', 'Click on icon "edit" of Defect type tag', 'Arise Modal "Edit Defect Type"'],
        151: ['Test', 'Click on item icon "select all items"', 'Select/unselect all items'],
        152: ['Test', 'Click on item icon "select one item"', 'Select/unselect one item'],
        153: ['Test', 'Click on Close Icon on Modal "Edit Item"', 'Close modal "Edit Item"'],
        154: ['Test', 'Edit description in Modal "Edit Item"', 'Edit description'],
        155: ['Test', 'Click on Bttn Cancel on Modal "Edit Item"', 'Close modal "Edit Item"'],
        156: ['Test', 'Click on Bttn Save on Modal "Edit Item"', 'Save changes'],
        157: ['Test', 'Click on Close Icon on Modal "Edit Defect Type"', 'Close modal "Edit Defect Type"'],
        158: ['Test', 'Edit description in Modal "Edit Defect Type"', 'Edit description'],
        159: ['Test', 'Click on Bttn Cancel on Modal "Edit Defect Type"', 'Close modal "Edit Defect Type"'],
        160: ['Test', 'Click on Bttn Save on Modal "Edit Defect Type"', 'Save changes'],
        161: ['Test', 'Click on icon "close" on selected item', 'Unselect item'],
        162: ['Test', 'Click on Bttn "Proceed Valid Items"', 'Remove invalid launches from selection'],
        163: ['Test', 'Click on Close Icon of all selection', 'Close panel with selected items'],
        164: ['Test', 'Click on Bttn "Edit Defect"', 'Arise Modal "Edit Defect Type"'],
        165: ['Test', 'Click on Bttn "Post Bug"', 'Arise Modal "Post Bug"'],
        166: ['Test', 'Click on Bttn "Load Bug"', 'Arise Modal "Load Bug"'],
        167: ['Test', 'Click on Bttn "Delete"', 'Arise Modal "Delete Item"'],
        168: ['Test', 'Click on Bttn "History"', 'Transition to History View Page'],
        169: ['Test', 'Click on Bttn "Refresh"', 'Refresh page'],
        170: ['Test', 'Click on Icon Close on Modal Post Bug', 'Close Modal Post Bug'],
        171: ['Test', 'Click on Screenshots switcher on Modal Post Bug', 'On/off Screenshots in Modal Post Bug'],
        172: ['Test', 'Click on Logs switcher on Modal Post Bug', 'On/off Logs in Modal Post Bug'],
        173: ['Test', 'Click on Comment switcher on Modal Post Bug', 'On/off Comment in Modal Post Bug'],
        174: ['Test', 'Click on Bttn Cancel on Modal Post Bug', 'Close Modal Post Bug'],
        175: ['Test', 'Click on Bttn Post on Modal Post Bug', 'Post bug'],
        176: ['Test', 'Click on Icon Close on Modal Load Bug', 'Close Modal Load Bug'],
        177: ['Test', 'Click on Bttn Add New Issue on Modal Load Bug', 'Add input in Modal Load Bug'],
        178: ['Test', 'Click on Bttn Cancel on Modal Load Bug', 'Close Modal Load Bug'],
        179: ['Test', 'Click on Bttn Load on Modal Load Bug', 'Load bug'],
        180: ['Test', 'Click on Icon Close on Modal Delete Item', 'Close Modal Delete Item'],
        181: ['Test', 'Click on Bttn Cancel on Modal Delete Item', 'Close Modal Delete Item'],
        182: ['Test', 'Click on Bttn Delete on Modal Delete Item', 'Delete item'],

        183: ['Log', 'Click on Bread Crumb icon Plus/Minus', 'Show/Hide all names of items'],
        184: ['Log', 'Click on Bread Crumb All', 'Transition to Launches Page'],
        185: ['Log', 'Click on Bread Crumb Item name', 'Transition to Item'],
        186: ['Log', 'Click on Bttn prev Method', 'Transition to prev Method Item'],
        187: ['Log', 'Click on Bttn next Method', 'Transition to next Method Item'],
        188: ['Log', 'Click on Bttn Refresh', 'Refresh page'],

        189: ['Log', 'Hover on History execution tab', 'Arise tooltip'],
        190: ['Log', 'Click on History execution tab', 'Transition to item log page'],
        191: ['Log', 'Hover on Defect type tag', 'Arise icon Edit'],
        192: ['Log', 'Click on Defect type tag', 'Arise Modal Edit Defect type'],
        193: ['Log', 'Click on Bttn Post Bug', 'Arise Modal Post Bug'],
        194: ['Log', 'Click on Bttn Load Bug', 'Arise Modal Load Bug'],
        195: ['Log', 'Click on Bttn Match issues in launch', 'Begin autoanalysis'],

        196: ['Log', 'Hover on Stack Trace tab', 'Tab becomes active'],
        197: ['Log', 'Hover on Attachments tab', 'Tab becomes active'],
        198: ['Log', 'Hover on Item Details tab', 'Tab becomes active'],
        199: ['Log', 'Hover on History of Actions tab', 'Tab becomes active'],
        200: ['Log', 'Click on Stack Trace tab', 'Open Stack Trace tab'],
        201: ['Log', 'Click on Attachments tab', 'Open Attachments tab'],
        202: ['Log', 'Click on Item Details tab', 'Open Item Details tab'],
        203: ['Log', 'Click on History of Actions tab', 'Open History of Actions tab'],

        204: ['Log', 'Click on Log level filter', 'Arise log level filter dropdown'],
        205: ['Log', 'Select Log level filter in dropdown', 'Filter by selected parametr'],
        206: ['Log', 'Click on checkbox Logs with attachments', 'Check/uncheck logs with attachments'],
        207: ['Log', 'Click on Bttn Next Error', 'Transition to next error page'],
        208: ['Log', 'Click on Bttn Previous Log message page', 'Transition to previous log message page'],
        209: ['Log', 'Click on Bttn Next Log message page', 'Transition to next log message page'],

        210: ['Log', 'Enter filter parameter in Log message input', 'Filter log messages by parameter'],
        211: ['Log', 'Click on icon Sorting on Time in Log Message', 'Sort logs'],
        212: ['Log', 'Click on Attachment in Log Message', 'Open Attachment'],
        213: ['Log', 'Click on icon Expand in Log Message', 'Expand/close log'],
        214: ['Log', 'Click on Go to Stack Trace link in Stack Trace tab', 'Open Stack Trace log message'],

        215: ['Log', 'Click on Icon Close on Modal Post Bug', 'Close Modal Post Bug'],
        216: ['Log', 'Click on Screenshots switcher on Modal Post Bug', 'On/off Screenshots in Modal Post Bug'],
        217: ['Log', 'Click on Logs switcher on Modal Post Bug', 'On/off Logs in Modal Post Bug'],
        218: ['Log', 'Click on Comment switcher on Modal Post Bug', 'On/off Comment in Modal Post Bug'],
        219: ['Log', 'Click on Bttn Cancel on Modal Post Bug', 'Close Modal Post Bug'],
        220: ['Log', 'Click on Bttn Post on Modal Post Bug', 'Post bug'],
        221: ['Log', 'Click on Icon Close on Modal Load Bug', 'Close Modal Load Bug'],
        222: ['Log', 'Click on Bttn Add New Issue on Modal Load Bug', 'Add imputs in Modal Load Bug'],
        223: ['Log', 'Click on Bttn Cancel on Modal Load Bug', 'Close Modal Load Bug'],
        224: ['Log', 'Click on Bttn Load on Modal Load Bug', 'Load bug'],

        240: ['Filters', 'Enter parameter for search', 'Show filters by parameter'],
        241: ['Filters', 'Click on Bttn Add Filter', 'Transition to Launches Page'],
        242: ['Filters', 'Click on Filter name', 'Transition to Launch Page'],
        243: ['Filters', 'Click on Filter on/off switcher', 'Show/hide Filter on Launch Page'],
        244: ['Filters', 'Click on icon Delete on Filter Page', 'Arise Modal Delete filter'],
        245: ['Filters', 'Click on icon Edit on Filter name', 'Arise Modal Edite filter'],
        246: ['Filters', 'Click on icon Shared on Filter', 'Arise Modal Edite filter'],

        247: ['Filters', 'Click on icon Close on Modal Edit Filter', 'Close Modal Edit Filter'],
        248: ['Filters', 'Enter description in Modal Edit Filter', 'Description'],
        249: ['Filters', 'Click on Share on/off in Modal Edit Filter', 'Share/unshare Filter'],
        250: ['Filters', 'Click on Bttn Cancel in Modal Edit Filter', 'Close Modal Edit Filter'],
        251: ['Filters', 'Click on Bttn Update in Modal Edit Filter', 'Update Modal Edit Filter'],
        252: ['Filters', 'Click on icon Close on Modal Delete Filter', 'Close Modal Delete Filter'],
        253: ['Filters', 'Click on Bttn Cancel in Modal Delete Filter', 'Close Modal Delete Filter'],
        254: ['Filters', 'Click on Bttn Delete in Modal Delete Filter', 'Delete Filter'],
        255: ['Filters', 'Click on Bttn Add Filter on empty page', 'Transition to Launches Page'],


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
    function getTooltipDescription(){
        return 'Arise tooltip';
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
