define(function (require) {
    'use strict';

    var Util = require('util');
    var $ = require('jquery');
    var LogItemLogsItems = require('launches/logLevel/LogItemLogsItem');
    var LogMessageView = require('launches/logLevel/LogMessageView');

    var LogItemLogsItemBlock = LogItemLogsItems.extend({
        template: 'tpl-launch-log-item-logs-item-console',
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'scrollTo', this.scrollTo);
            this.messageView = new LogMessageView({ message: this.model.get('message') });
            $('[data-js-message]', this.$el).html(this.messageView.$el);
            this.listenTo(this.messageView, 'load', this.activateAccordion);
        },
        render: function () {
            this.$el.html(Util.templates(this.template));
        }
    });

    return LogItemLogsItemBlock;
})
