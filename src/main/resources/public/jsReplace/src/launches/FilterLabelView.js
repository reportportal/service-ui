/*
 * Copyright 2016 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/epam/ReportPortal
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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var FilterListener = require('controlers/filterControler/FilterListener');
    var Localization = require('localization');
    var SimpleTooltipView = require('tooltips/SimpleTooltipView');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var config = App.getInstance();


    var FilterLabelView = Epoxy.View.extend({
        tagName: 'a',
        className: 'filter-item',
        template: 'tpl-launch-filter-label',

        events: {
            'click [data-js-filter-close]': 'onClickRemove',
            click: 'onClickLabel',
            dblclick: 'showCriteria'
        },
        bindings: {
            '[data-js-filter-shared]': 'classes: {hide: any(not(share), notMyFilter)}',
            '[data-js-filter-name]': 'text: filterName(name, id)',
            '[data-js-filter-comment]': 'classes: {hide: not(description)}',
            '[data-js-filter-not-my]': 'classes: {hide: not(notMyFilter)}',
            '[data-js-filter-not-save]': 'classes: {hide: all(not(temp), not(newEntities), not(newSelectionParameters))}',
            ':el': 'attr: {href: url}, classes: {active: active}'
        },
        bindingFilters: {
            filterName: function (name, id) {
                if (id === 'all') {
                    return Localization.launches.noFilter;
                }
                return name;
            }
        },
        initialize: function () {
            this.filterListener = new FilterListener();
            this.filterEvents = this.filterListener.events;
            this.render();
            this.setTooltip();
            this.listenTo(this.model, 'change', this.update);
        },
        onClickLabel: function (e) {
            e.preventDefault();
            config.router.navigate(this.model.get('url'), { trigger: true });
        },
        showCriteria: function (e) {
            e.preventDefault();
            this.trigger('showCriteria');
        },
        setTooltip: function () {
            var self = this;
            if (this.model.get('description')) {
                Util.appendTooltip(function () {
                    self.markdownViewer && self.markdownViewer.destroy();
                    self.markdownViewer = new MarkdownViewer({ text: self.model.get('description') });
                    return self.markdownViewer.$el;
                }, $('[data-js-filter-comment]', this.$el));
            }
            Util.appendTooltip(function () {
                var tooltip = new SimpleTooltipView({
                    message: Localization.launches.filterIsSharedByOtherUser
                });
                return tooltip.$el;
            }, $('[data-js-filter-not-my]', this.$el));
            Util.appendTooltip(function () {
                var tooltip = new SimpleTooltipView({
                    message: Localization.launches.filterIsShared
                });
                return tooltip.$el;
            }, $('[data-js-filter-shared]', this.$el));
            Util.appendTooltip(function () {
                var tooltip = new SimpleTooltipView({
                    message: Localization.filters.notSaveDescription
                });
                return tooltip.$el;
            }, $('[data-js-filter-not-save]', this.$el));
        },
        update: function () {
            this.setTooltip();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function () {
            this.filterListener.trigger(
                this.filterEvents.ON_CHANGE_IS_LAUNCH,
                {
                    data: this.model.attributes,
                    isLaunch: false
                }
            );
            this.destroy();
        },
        onDestroy: function () {
            this.markdownViewer && this.markdownViewer.destroy();
            this.$el.remove();
            delete this;
        }
    });


    return FilterLabelView;
});
