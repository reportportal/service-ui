define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var _ = require('underscore');
    var BaseWidgetView = require('newWidgets/_BaseWidgetView');
    var Util = require('util');
    var Moment = require('moment');
    var App = require('app');
    var ItemDurationView = require('launches/common/ItemDurationView');

    var config = App.getInstance();

    var TestCasesItemView = Epoxy.View.extend({
        template: 'tpl-widget-time-consuming-table-item',
        bindings: {
            '[data-js-status]': 'text: status',
            '[data-js-name]': 'text: name, attr: {href: getItemUrl}'
        },
        computeds: {
            getItemUrl: {
                deps: ['id'],
                get: function (id) {
                    return this.url + '&log.item=' + id;
                }
            }
        },
        initialize: function (options) {
            this.url = options.url;
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {
                dateFormat: Util.dateFormat,
                moment: Moment,
                start_time: this.model.get('start_time')
            }));
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-duration]', this.$el),
            });
        }
    });

    var MostTimeConsumingTestCasesTableView = BaseWidgetView.extend({
        template: 'tpl-widget-time-consuming-table',
        itemTemplate: 'tpl-widget-time-consuming-table-item',
        render: function () {
            var contentData = this.model.getContent();
            if (!this.isEmptyData(contentData)) {
                this.scrollers = [];
                this.$el.html(Util.templates(this.template, contentData));
                _.each(contentData.result, function (item) {
                    var itemView = new TestCasesItemView({
                        model: new Epoxy.Model(item),
                        url: this.getFilterByUIDRedirectLink(contentData.lastLaunch[0].id, item.uniqueId)
                    });
                    $('[data-js-items-container]', this.$el).append(itemView.$el);
                }, this);
                this.scrollers.push(Util.setupBaronScroll($('[data-js-scroll-table]', this.$el)));
                Util.hoverFullTime(this.$el);
            } else {
                this.addNoAvailableBock();
            }

        },
        onBeforeDestroy: function () {
            _.each(this.scrollers, function (baronScrollElem) {
                baronScrollElem.baron && baronScrollElem.baron().dispose();
            });
        }
    });
    return MostTimeConsumingTestCasesTableView;
});
