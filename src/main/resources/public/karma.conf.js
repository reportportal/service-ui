// Karma configuration
// Generated on Fri Jul 03 2015 10:13:11 GMT+0300 (FLE Daylight Time)

module.exports = function (config) {

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine', 'requirejs'],


        // list of files / patterns to load in the browser
        files: [
            {pattern: 'js/lib/**/*.js', included: false},
            {pattern: 'js/src/**/*.js', included: false},
            {pattern: 'js/tests/spec/**', included: false},
            {pattern: 'js/tests/mocks/**', included: false},
            {pattern: 'js/tests/lib/**', included: false},
            {pattern: 'compiled/templates/*.js', included: false},
            'js/tests/test-main.js'
        ],


        // list of files to exclude
        exclude: [
            'js/src/config.js',
            // 'js/src/application.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'/*,'PhantomJS'*/],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        client: {
            captureConsole: false
        },

        proxies:  {
            '/img/popup/overall_statistics_panel.png': 'img/popup/overall_statistics_panel.png',
            '/img/popup/filter_results.png': 'img/popup/filter_results.png',
            '/img/popup/activity_stream.png': 'img/popup/activity_stream.png',
            '/img/popup/launches_duration.png': 'img/popup/launches_duration.png',
            '/img/popup/unique_bugs_table.png': 'img/popup/unique_bugs_table.png',
            '/img/popup/trends_chart.png': 'img/popup/trends_chart.png',
            '/img/popup/launch_statistics_trend_chart.png': 'img/popup/launch_statistics_trend_chart.png',
            '/img/popup/different_launches_comparison.png': 'img/popup/different_launches_comparison.png',
            '/img/popup/to_investigate_trend.png': 'img/popup/to_investigate_trend.png',
            '/img/popup/non-passed_test-cases_trend.png': 'img/popup/non-passed_test-cases_trend.png',
            '/img/popup/growth_trend_chart.png': 'img/popup/growth_trend_chart.png',
            '/img/popup/test-cases_growth_trend_chart.png': 'img/popup/test-cases_growth_trend_chart.png',
            '/img/popup/launch_statistics_pie.png': 'img/popup/launch_statistics_pie.png'
        }
    })
}
