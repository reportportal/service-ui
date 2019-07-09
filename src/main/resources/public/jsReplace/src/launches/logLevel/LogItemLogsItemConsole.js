define(function (require) {
    'use strict';

    var LogItemLogsItems = require('launches/logLevel/LogItemLogsItem');

    var LogItemLogsItemBlock = LogItemLogsItems.extend({
        template: 'tpl-launch-log-item-logs-item-console'
    });

    return LogItemLogsItemBlock;
})
