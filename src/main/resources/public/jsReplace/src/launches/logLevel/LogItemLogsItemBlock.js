define(function (require) {
    'use strict';

    var LogItemLogsItems = require('launches/logLevel/LogItemLogsItem');


    var LogItemLogsItemBlock = LogItemLogsItems.extend({
        template: 'tpl-launch-log-item-logs-item-default',

        afterInitialize: function () {
            this.listenTo(this.messageView, 'reset', this.activateAccordion);
        },

        activateAccordion: function () {

            var minHeight = 133;
            if (this.model.get('level') === 'ERROR') {
                minHeight = 238;
            }
            if (this.$el.innerHeight() > minHeight) {

                this.$el.addClass('show-accordion');
            } else {
                this.$el.removeClass('show-accordion');
            }
        }
    });

    return LogItemLogsItemBlock;
});
