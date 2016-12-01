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
        'jqueryUI': '../lib/jquery-ui-1.11.3',
        'bootstrap': '../lib/bootstrap.min',
        'underscore': '../lib/lodash.min',
        'backbone': '../lib/backbone',
        'backbone-mixin': '../lib/backbone-mixin',
        'backbone-epoxy': '../lib/backbone-epoxy',
        'backbone-filter': '../lib/backbone-route-filter',
        'jaddons': '../lib/jquery-addons',
        'cookie': '../lib/jquery.cookie',
        'nicescroll': '../lib/jquery.nicescroll',
        'bootswitch': '../lib/bootstrap-switch.min',
        'elementQuery': '../lib/EQCSS',
        'baron': '../lib/baron',
        'base64': '../lib/base64',
        'util': 'core/util',
        'nprogress': '../lib/nprogress',
        'localization': 'localizations/default',
        'moment': '../lib/moment.2.10.2',
        'message': 'message/message-panel',
        'app': 'core/app-config',
        'validators': 'core/validators',
        'fullscreen': '../lib/jquery.fullscreen',
        'isLoading': '../lib/jquery.isLoading',
        'equalHeightRows': '../lib/grids',
        'popup': '../lib/jquery.magnific-popup',
        'highlight': '../lib/highlight.pack',
	    'lunr': '../lib/lunr',
        //'ace': '../lib/ace/ace.custom',
        //'aceDark': '../lib/ace/theme-dark',
        //'mode-properties': '../lib/ace/mode-properties',

        'elasticColumns': '../lib/elastic-columns.min',
        // 'lazyload': '../lib/jquery.lazyload.min',
        'select2': '../lib/select2.custom',
        'daterangepicker': '../lib/daterangepicker',
        'readmore-js': '../lib/readmore',
        'gridstack': '../lib/gridstack/gridstack.custom',
        'validate': '../lib/jquery.validate',
        'd3': '../lib/d3/d3.v3.min',
        'd3Tip': '../lib/d3/d3.tip.custom',
        'nvd3': '../lib/nvd3/nv.d3.custom',
        'profile': 'login/user_profile',
        'slick': '../lib/slick',
        'landingPage': 'landing/LandingPage',
        
        'landingDocs': 'landing/documentation',
        'log': 'log/logs',
        'TestRoute': 'router/TestRoute',
        'router': 'router/router',
        'project': 'project/project',
        'projectinfo': 'project/projectinfo',
        'member': 'member/member',
        'memberService': 'member/service',
        'components': 'core/components',
        'launch': 'launch/launch-navigation',
        'launchgrid': 'launch/launch-grid',
        'launchEditor' : 'launch/launch-editor',
        'launchCrumbs': 'launch/launch-crumbs',
        'defectEditor': 'defect/defect-editor',
        'mainview': 'main-view',
        'widgets': 'widget/widgets',
        'favorites': 'favorites/favorites',
        'filters': 'filter/filters',
        'dashboard': 'dashboard/dashboard-view',
        'context': 'context',

        'dataUrlResolver': 'core/data-url-resolver',
        'callService': 'core/call-service',
        'coreService': 'core/core-service',

        'admin': 'admin/admin',
        'projects': 'admin/projects',
        'users': 'admin/users',
        'settings': 'admin/settings',
        'adminService': 'admin/service',
        'filtersPanel': 'filter/filters-panel',
        'filtersResolver': 'filter/filters-resolver',
        'filtersService': 'filter/filters-service',
        'widgetWizard': 'wizard/widget',
        'helpers': 'core/helpers',
        'storageService': 'core/storage-service',
        'register': 'register/register',
        'textile': '../lib/textile',
        'markitup': '../lib/jquery.markitup.custom',
        'markitupset': '../lib/jquery.markitup.textile',

        // TODO - not used
        //'stickyHeader': 'core/StickyHeader',
        'stickyHeader': 'core/sticky-header',

        'cacheService': 'core/cache-service',
        'scrollable': 'core/scrollable-view',
        "text": "../lib/text",
        'DemoDataSettingsView': 'project/DemoDataSettingsView',

        "colorpicker": "../lib/colorpicker/bootstrap-colorpicker",
        "colorpickerConfig": "../lib/colorpicker/bootstrap-colorpicker-cfg-custom",

        'templates': '../../compiled/templates/templates'
    },
    'shim': {
        'jqueryUI': ['jquery'],
        'slick': {
            deps: ['jquery'],
            exports: 'jQuery.fn.slick'
        },
        'bootstrap': ['jquery'],
        'equalHeightRows':  ['jquery'],
        'bootswitch': ['jquery', 'bootstrap'],
        'base64': { exports : 'Base64' },
        'cookie': ['jquery'],
        'popup': ['jquery'],
        'isLoading': ['jquery'],
        // 'lazyload': ['jquery'],
        'fullscreen': ['jquery'],
        'nicescroll': ['jquery'],
        'customScroll': ['jquery'],
        'select2': ['jquery'],
        'daterangepicker': ['jquery'],
        'gridstack': ['jquery', 'jqueryUI', 'underscore'],
        'validate': { deps : ['jquery'] },
        'elasticColumns': ['jquery'],
        'nvd3': {deps: ['d3'], exports : 'nv'},
        'widgets': ['d3', 'nvd3', 'elementQuery'],
        'markitup': ['jquery'],
        'markitupset': ['markitup'],
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