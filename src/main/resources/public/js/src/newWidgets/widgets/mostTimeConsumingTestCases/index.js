define(function (require) {
    'use strict';

    var MostTimeConsumingTestCasesView = require('newWidgets/widgets/mostTimeConsumingTestCases/MostTimeConsumingTestCasesView');
    var MostTimeConsumingTestCasesSettings = require('newWidgets/widgets/mostTimeConsumingTestCases/MostTimeConsumingTestCasesSettings');

    MostTimeConsumingTestCasesView.getConfig = MostTimeConsumingTestCasesSettings.getConfig;
    MostTimeConsumingTestCasesView.getSettings = MostTimeConsumingTestCasesSettings.getSettings;

    return MostTimeConsumingTestCasesView;
});
