


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
        jqueryUI: '../lib/jquery-ui',
        'jaddons': '../lib/jquery-addons',
        underscore: '../lib/lodash.min',
        backbone: '../lib/backbone-min-my',
        'backbone-epoxy': '../lib/backbone-epoxy',
        util: 'core/util',
        'baron': '../lib/baron',
        'TestRoute': 'router/TestRoute',
        'landingPage': 'landing/LandingPage',
        cookie: '../lib/jquery.cookie',
        nicescroll: '../lib/jquery.nicescroll',
        bootstrap: '../lib/bootstrap.min',
        bootswitch: '../lib/bootstrap-switch.min',
        elementQuery: '../lib/EQCSS',
        base64: '../lib/base64',
        nprogress: '../lib/nprogress',
        localization: 'localizations/default',
        moment: '../lib/moment.2.10.2',
        message: 'message/message-panel',
        templates: '../../compiled/templates/templates',
        mainview: 'main-view',
        favorites: 'favorites/favorites',
        register: 'register/register',
        filters: 'filter/filters',
        components: 'core/components',
        lazyload: '../lib/jquery.lazyload.min',
        daterangepicker: '../lib/daterangepicker',
        'readmore-js': '../lib/readmore',
        select2: '../lib/select2.custom',
        launch: 'launch/launch-navigation',
        launchgrid: 'launch/launch-grid',
        launchCrumbs: 'launch/launch-crumbs',
        defectEditor: 'defect/defect-editor',
        log: 'log/logs',
        member: 'member/member',
        memberService: 'member/service',
        launchEditor: 'launch/launch-editor',
        stickyHeader: 'core/sticky-header',
        'launchCrumbs': 'launch/launch-crumbs',
        log: 'log/logs',
        'DemoDataSettingsView': 'project/DemoDataSettingsView',

        dataUrlResolver: 'core/data-url-resolver',
        project: 'project/project',
        'projectinfo': 'project/projectinfo',
        validators: 'core/validators',
        validate: '../lib/jquery.validate',

        filtersPanel: 'filter/filters-panel',
        filtersResolver: 'filter/filters-resolver',
        filtersService: 'filter/filters-service',
        profile: 'login/user_profile',
        ace: '../lib/ace/ace.custom',
        aceDark: '../lib/ace/theme-dark',
        'mode-properties': '../lib/ace/mode-properties',

        "colorpicker": "../lib/colorpicker/bootstrap-colorpicker",
        "colorpickerConfig": "../lib/colorpicker/bootstrap-colorpicker-cfg-custom",

        'lunr': '../lib/lunr',

        callService: 'core/call-service',
        coreService: 'core/core-service',
        storageService: 'core/storage-service',
        widgetWizard: 'wizard/widget',
        widgets: 'widget/widgets',
        dashboard: 'dashboard/dashboard-view',
        'fullscreen': '../lib/jquery.fullscreen',
        'isLoading': '../lib/jquery.isLoading',
        'equalHeightRows': '../lib/grids',
        'popup': '../lib/jquery.magnific-popup',
        'highlight': '../lib/highlight.pack',
        'gridstack': '../lib/gridstack/gridstack.custom',
        helpers: 'core/helpers',

        d3: '../lib/d3/d3.v3.min',
        nvd3: '../lib/nvd3/nv.d3.custom',
        d3Tip: '../lib/d3/d3.tip.custom',
        elasticColumns: '../lib/elastic-columns.min',
        'slick': '../lib/slick',
        'landingMain': 'landing/main',
        'landingUI': 'landing/ui',
        'landingDocs': 'landing/documentation',

        admin: 'admin/admin',
        projects: 'admin/projects',
        users: 'admin/users',
        settings: 'admin/settings',
        adminService: 'admin/service',

        'textile': '../lib/textile',
        'markitup': '../lib/jquery.markitup.custom',
        'markitupset': '../lib/jquery.markitup.textile',
        'stickyHeader': 'core/sticky-header',
        'cacheService': 'core/cache-service',
        'scrollable': 'core/scrollable-view',
        "text" : "../lib/text",

        fakeData: '../tests/mocks/data',
        adminFakeData: '../tests/mocks/adminData',
        jasminejQuery: '../tests/lib/jasmine-jquery.2.0.5'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'jasminejQuery': {exports: 'jasminejQuery', deps : ["jquery"] },
        'jqueryUI': ['jquery'],
        'bootstrap': ['jquery'],
        'equalHeightRows':  ['jquery'],
        'bootswitch': ['jquery', 'bootstrap'],
        'base64': {exports: 'Base64'},
        'cookie': ['jquery'],
        'isLoading': ['jquery'],
        'lazyload': ['jquery'],
        'fullscreen': ['jquery'],
        'nicescroll': ['jquery'],
        'select2': ['jquery'],
        'daterangepicker': ['jquery'],
        'gridstack': ['jquery', 'jqueryUI', 'underscore'],
        'validate': {deps: ["jquery"]},
        'elasticColumns': ['jquery'],
        'nvd3': {deps: ['d3'], exports: 'nv'},
        'widgets': ['d3', 'nvd3', 'elementQuery'],
        'markitup': ['jquery'],
        'markitupset': ['markitup']
    },

    // dynamically load all test files
    // deps: allTestFiles,
    deps: [
        '../tests/spec/login/login',

        '../tests/spec/dashboards/add-dashboard',
        '../tests/spec/dashboards/edit-dashboard',
        '../tests/spec/dashboards/dashboards-menu',
        '../tests/spec/dashboards/dashboards',

        '../tests/spec/widgets/widgets',

        '../tests/spec/post_bug_to_jira/post_bug_to_bts',
        '../tests/spec/post_bug_to_jira/load_bug_to_bts',

        '../tests/spec/project/projectinfo',

        //'../tests/spec/favorites/favorites',

        '../tests/spec/components/paging',

        '../tests/spec/test_item_editor/testItemEditor',

        '../tests/spec/launches/historyGrid',

        '../tests/spec/user_profile/user_profile',

        '../tests/spec/wizard/widget-wizard',

        '../tests/spec/project/project',

        '../tests/spec/admin/admin',

        '../tests/spec/member/member_assigned',
        '../tests/spec/member/assign_member',
        '../tests/spec/member/invite_member',

        //
        // '../tests/spec/filter/filters-panel',
    ],

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});
