/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require) {
    'use strict';

    var _ = require('underscore');
    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var InfoPanelView = require('launches/common/InfoPanelView');
    var App = require('app');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');

    var config = App.getInstance();

    var StepControlView = Epoxy.View.extend({
        events: {
            'click [data-js-refresh]': 'onClickRefresh',
            'click [data-js-multi-action]': 'onClickMultiAction',
            'click [data-js-history]': 'onClickHistory'
        },

        bindings: {
            '[data-js-history]': 'classes: {hide: not(validateForHistoryBtn)}',
            '[data-js-multi-action="remove"]': 'attr: {disabled: not(activeMultiDelete), title: multipleDeleteTooltip}',
            '[data-js-multi-action="loadbug"]': 'attr: {disabled: any(loadBugTooltip), title: loadBugTooltip}',
            '[data-js-multi-action="postbug"]': 'attr: {disabled: any(postBugTooltip), title: postBugTooltip}',
            '[data-js-multi-action="ignoreaa"], [data-js-multi-action="includeaa"]': 'attr: {disabled: any(ignoreActionTooltip), title: ignoreActionTooltip}',
            '[data-js-refresh-counter]': 'text: refreshItems, classes: {hide: not(refreshItems)}'
        },

        computeds: {
            validateForHistoryBtn: {
                deps: ['itemsCount'],
                get: function () {
                    var interrupted = config.launchStatus.interrupted;
                    var showBtn = (this.launchModel.get('status') !== interrupted)
                        && !this.collectionItems.validateForAllCases()
                        && !_.isEmpty(this.collectionItems.models);
                    return showBtn;
                }
            },
            getHistoryHref: function () {
                return this.getHistoryLink();
            },
            activeMultiDelete: function () {
                return !(this.launchModel.get('status') === config.launchStatus.inProgress);
            },
            multipleDeleteTooltip: function () {
                if (this.getBinding('activeMultiDelete')) {
                    return '';
                }
                return Localization.launches.launchNotInProgress;
            },
            loadBugTooltip: function () {
                if (!this.appModel.get('isBtsAdded')) {
                    return Localization.launches.configureTBSLoad;
                }
                return '';
            },
            postBugTooltip: function () {
                if (!this.appModel.get('isBtsConfigure')) {
                    return Localization.launches.configureTBS;
                }
                return '';
            },
            ignoreActionTooltip: function () {
                if (this.registryInfoModel.get('isAnalyzerOn')) {
                    return '';
                }
                return Localization.launches.noAnalyzer;
            }
        },

        template: 'tpl-launch-step-control',
        initialize: function (options) {
            this.registryInfoModel = new SingletonRegistryInfoModel();
            this.context = options.context;
            this.filterModel = options.filterModel;
            this.launchModel = options.launchModel;
            this.parentModel = options.parentModel;
            this.collectionItems = options.collectionItems;
            this.appModel = new SingletonAppModel();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    refreshItems: 0,
                    itemsCount: 0
                }
            }))();
            this.listenTo(this.collectionItems, 'loading', this.resetRefreshItems);
            this.listenTo(this.collectionItems, 'change:issue', _.debounce(this.updateInfoLine.bind(this), 50));
            this.listenTo(this.collectionItems, 'reset', this.resetCollectionItems);
            this.render();
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-refine-entities]', this.$el),
                filterLevel: 'test',
                model: this.filterModel
            });
            this.infoLine = new InfoPanelView({
                el: $('[data-js-info-line]', this.$el),
                model: this.parentModel
            });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, { context: this.context }));
        },
        updateInfoLine: function () {
            this.parentModel.collection.forceUpdate();
        },
        resetCollectionItems: function () {
            this.model.set({ itemsCount: this.collectionItems.models.length });
        },
        activateMultiple: function () {
            $('[data-js-refresh], [data-js-history-view]', this.$el).addClass('disabled');
            $('[data-js-multi-button]', this.$el).removeClass('disabled').attr({ title: Localization.ui.actions });
            $('[data-js-history]', this.$el).addClass('disabled');
        },
        disableMultiple: function () {
            $('[data-js-refresh], [data-js-history-view]', this.$el).removeClass('disabled');
            $('[data-js-multi-button]', this.$el).addClass('disabled').attr({ title: Localization.launches.actionTitle });
            $('[data-js-history]', this.$el).removeClass('disabled');
        },
        onClickMultiAction: function (e) {
            var type = $(e.currentTarget).data('js-multi-action');
            switch (type) {
            case 'editdefect':
                config.trackingDispatcher.trackEventNumber(164);
                break;
            case 'postbug':
                config.trackingDispatcher.trackEventNumber(165);
                break;
            case 'loadbug':
                config.trackingDispatcher.trackEventNumber(166);
                break;
            case 'remove':
                config.trackingDispatcher.trackEventNumber(167);
                break;
            default:
                break;
            }
            this.trigger('multi:action', type);
        },
        onClickRefresh: function () {
            config.trackingDispatcher.trackEventNumber(169);
            this.collectionItems.load();
            this.updateInfoLine();
            this.resetRefreshItems();
        },
        resetRefreshItems: function () {
            this.model.set({ refreshItems: 0 });
        },
        getHistoryLink: function () {
            var currentPath = window.location.hash;
            currentPath += '&history.item=' + this.parentModel.get('id');
            return currentPath;
        },
        onClickHistory: function (e) {
            e.preventDefault();
            if (!$(e.currentTarget).hasClass('disabled')) {
                config.trackingDispatcher.trackEventNumber(168);
                config.router.navigate(this.getHistoryLink(), { trigger: true });
            }
        },
        onDestroy: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.infoLine && this.infoLine.destroy();
        }
    });

    return StepControlView;
});
