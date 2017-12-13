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

require.config({
    'paths': {
        'application': 'application',
        'jquery': '../lib/jquery-latest',
        'jquery-ui': '../lib/jQuery-ui',
        'bootstrap': '../lib/bootstrap.min',
        'underscore': '../lib/lodash.min',
        'lodash': '../lib/lodash.min',
        'backbone': '../lib/backbone',
        'backbone-epoxy': '../lib/backbone-epoxy',
        'jaddons': '../lib/jquery-addons',
        'cookie': '../lib/jquery.cookie',
        // 'nicescroll': '../lib/jquery.nicescroll',
        'baron': '../lib/baron-scroll',
        'util': 'core/util',
        'nprogress': '../lib/nprogress',
        'localization': 'localizations/localizationController',
        'momentLib': '../lib/moment.2.10.2',
        'momentRu': '../lib/momentRu',
        'moment': 'localizations/localizationDates',
        'SwipeGallery': '../lib/SwipeGallery',
        'Hammer': '../lib/hammer',
        'PerfCascade': '../lib/perf-cascade/perf-cascade',
        'message': 'message/message-panel',
        'app': 'core/app-config',
        'validators': 'core/validators',
        'fullscreen': '../lib/jquery.fullscreen',
        'select2': '../lib/select2.custom',
        'daterangepicker': '../lib/daterangepicker',
        'gridstack': '../lib/gridstack/gridstack.custom',
        'gridstackUi': '../lib/gridstack/gridstack.jQueryUI',
        'validate': '../lib/jquery.validate',
        'd3': '../lib/d3/d3.v3.min',
        'c3': '../lib/c3',

        'log': 'log/logs',
        'TestRoute': 'router/TestRoute',
        'router': 'router/router',
        'projectinfo': 'project/projectinfo',
        'member': 'member/member',
        'memberService': 'member/service',
        'launchgrid': 'launch/launch-grid',
        'launchCrumbs': 'launch/launch-crumbs',
        'mainview': 'main-view',
        //'favorites': 'favorites/favorites',
        // 'dashboard': 'dashboard/dashboard-view',
        'context': 'context',

        'dataUrlResolver': 'core/data-url-resolver',
        'callService': 'core/call-service',
        'coreService': 'core/core-service',

        'admin': 'admin/admin',
        'projects': 'admin/projects',
        'users': 'admin/users',
        'settings': 'admin/settings',
        'adminService': 'admin/service',
        'storageService': 'core/storage-service',
        //'register': 'register/register',

        'simplemde': '../lib/markdown/simplemde.min',

        // TODO - not used
        //'stickyHeader': 'core/StickyHeader',
        'stickyHeader': 'core/sticky-header',

        'cacheService': 'core/cache-service',
        'scrollable': 'core/scrollable-view',

        "spectrum": "../lib/spectrum/spectrum",
        "dropzone": "../lib/dropzone-amd-module",

        'templates': '../../compiled/templates/templates'
    },
    'shim': {
        'cookie': ['jquery'],
        'bootstrap': ['jquery'],
        'fullscreen': ['jquery'],
        'dropzone': ['jquery'],
        'customScroll': ['jquery'],
        'select2': ['jquery'],
        'daterangepicker': ['jquery'],
        'gridstack': ['jquery', 'underscore'],
        'gridstackUi': ['gridstack'],
        'validate': { deps : ['jquery'] },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        }
    }
});

require(['application']);
