var allTestFiles = [];
var TEST_REGEXP = /\/spec\//i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
        // console.log(file);
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var normalizedTestModule = file.replace('/js/src/js/', '/js/');
        allTestFiles.push(normalizedTestModule);
    }
});

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/js/src',
    paths: {
        // spec: '../tests/spec',
        router: 'router/router',

        initialState: '../tests/lib/initialState',

        app: 'core/app-config',
        jquery: '../lib/jquery-latest',
        'jquery-ui': '../lib/jQuery-ui',
        jaddons: '../lib/jquery-addons',
        underscore: '../lib/lodash.min',
        backbone: '../lib/backbone',
        'backbone-epoxy': '../lib/backbone-epoxy',
        util: 'core/util',
        baron: '../lib/baron-scroll',
        TestRoute: 'router/TestRoute',
        landingPage: 'landing/LandingPage',
        cookie: '../lib/jquery.cookie',
        nicescroll: '../lib/jquery.nicescroll',
        bootstrap: '../lib/bootstrap.min',
        nprogress: '../lib/nprogress',
        'localization': 'localizations/localizationController',
        momentLib: '../lib/moment.2.10.2',
        momentRu: '../lib/momentRu',
        moment: 'localizations/localizationDates',
        message: 'message/message-panel',
        templates: '../../compiled/templates/templates',
        mainview: 'main-view',
        favorites: 'favorites',
        // register: 'register/register',
        // components: 'core/components',
        daterangepicker: '../lib/daterangepicker',
        select2: '../lib/select2.custom',
        // launchgrid: 'launch/launch-grid',
        // launchCrumbs: 'launch/launch-crumbs',
        defectEditor: 'defect/defect-editor',
        member: 'member/member',
        memberService: 'member/service',
        stickyHeader: 'core/sticky-header',
        launchCrumbs: 'launch/launch-crumbs',
        log: 'log/logs',
        DemoDataSettingsView: 'project/DemoDataSettingsView',
        dropzone: '../lib/dropzone-amd-module',
        PerfCascade: '../lib/perf-cascade/perf-cascade',
        dataUrlResolver: 'core/data-url-resolver',
        projectinfo: 'project/projectinfo',
        validators: 'core/validators',
        validate: '../lib/jquery.validate',

        filtersPanel: 'filter/filters-panel',
        filtersResolver: 'filter/filters-resolver',

        colorpicker: '../lib/colorpicker/bootstrap-colorpicker',
        colorpickerConfig: '../lib/colorpicker/bootstrap-colorpicker-cfg-custom',

        callService: 'core/call-service',
        coreService: 'core/core-service',
        storageService: 'core/storage-service',
        // dashboard: 'dashboard/dashboard-view',
        fullscreen: '../lib/jquery.fullscreen',
        highlight: '../lib/highlight.pack',
        gridstack: '../lib/gridstack/gridstack.custom',
        gridstackUi: '../lib/gridstack/gridstack.jQueryUI',

        d3: '../lib/d3/d3.v3.min',
        'c3': '../lib/c3',
        landingMain: 'landing/main',
        landingUI: 'landing/ui',
        landingDocs: 'landing/documentation',

        admin: 'admin/admin',
        projects: 'admin/projects',
        users: 'admin/users',

        adminService: 'admin/service',

        stickyHeader: 'core/sticky-header',
        cacheService: 'core/cache-service',
        scrollable: 'core/scrollable-view',

        SwipeGallery: '../lib/SwipeGallery',
        Hammer: '../lib/hammer',
        spectrum: '../lib/spectrum/spectrum',
        simplemde: '../lib/markdown/simplemde.min',

        fakeData: '../tests/mocks/data',
        adminFakeData: '../tests/mocks/adminData',
        jasminejQuery: '../tests/lib/jasmine-jquery.2.0.5'

    },
    shim: {
        jquery: {
            exports: '$'
        },
        jasminejQuery: { exports: 'jasminejQuery', deps: ['jquery'] },

        'jquery-ui': ['jquery'],
        bootstrap: ['jquery'],
        cookie: ['jquery'],
        fullscreen: ['jquery'],
        nicescroll: ['jquery'],
        select2: ['jquery'],
        daterangepicker: ['jquery'],
        gridstack: ['jquery', 'underscore'],
        gridstackUi: ['gridstack'],
        validate: { deps: ['jquery'] },
        spectrum: ['jquery'],
        simplemde: ['jquery']
    },

    // dynamically load all test files
    // deps: allTestFiles,
    deps: [

        '../tests/spec/dashboard/dashboardListItemViewTests',
        '../tests/spec/dashboard/gadgetViewTests',
        '../tests/spec/dashboard/dashboardItemViewTests',

        '../tests/spec/components/paging',

        '../tests/spec/sections/header',
        '../tests/spec/sections/sidebar',
        '../tests/spec/sections/footer',
        '../tests/spec/sections/content'

        // old tests

        // '../tests/spec/dashboards/add-dashboard',
        // '../tests/spec/dashboards/edit-dashboard',
        // '../tests/spec/dashboards/dashboards-menu',
        // '../tests/spec/dashboards/dashboards',

        // '../tests/spec/login/login',

        // '../tests/spec/widgets/widgets',

        // '../tests/spec/post_bug_to_jira/post_bug_to_bts',
        // '../tests/spec/post_bug_to_jira/load_bug_to_bts',

        // '../tests/spec/project/projectinfo',

        // '../tests/spec/favorites/favorites',

        // '../tests/spec/wizard/widget-wizard',

        // '../tests/spec/project/project',

        // '../tests/spec/admin/admin',

        // '../tests/spec/member/member_assigned',
        // '../tests/spec/member/assign_member',
        // '../tests/spec/member/invite_member',

        // '../tests/spec/filter/filters-panel',

        // '../tests/spec/test_item_editor/testItemEditor',

        // '../tests/spec/launches/historyGrid',

    ],

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});
