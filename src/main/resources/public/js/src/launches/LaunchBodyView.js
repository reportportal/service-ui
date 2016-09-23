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
define(function (require, exports, module) {
    'use strict';

    var SingletonDefectTypeCollection = require('defectType/SingletonDefectTypeCollection');

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');

    var LaunchControlView = require('launches/launchLevel/LaunchControlView');
    var LaunchTableView = require('launches/launchLevel/LaunchTableView');
    var SuiteControlView = require('launches/suiteLevel/SuiteControlView');
    var SuiteTableView = require('launches/suiteLevel/SuiteTableView');
    var StepControlView = require('launches/stepLevel/StepControlView');
    var StepTableView = require('launches/stepLevel/StepTableView');
    var LogControlView = require('launches/logLevel/LogControlView');
    var LogBodyView = require('launches/logLevel/LogBodyView');

    var LaunchSuiteStepItemCollection = require('launches/common/LaunchSuiteStepItemCollection');

    var LaunchCrumbs = require('launches/LaunchCrumbs');
    var Util = require('util');

    var config = App.getInstance();


    var LaunchBodyView = Epoxy.View.extend({
        template: 'tpl-launch-body',
        initialize: function() {
            this.render();
            this.crumbs = new LaunchCrumbs({
                el: $('[data-js-crumbs]', this.$el),
            });
            this.collectionItems = new LaunchSuiteStepItemCollection();
            this.listenTo(this.collectionItems, 'change:params', this.onChangeParamsFilter);
            this.listenTo(this.collectionItems, 'drill:item', this.onDrillItem);
            this.listenTo(this.collectionItems, 'change:log:item', this.onChangeLogItem);
            this.listenTo(this.collectionItems, 'set:log:item', this.onSetLogItem);
            this.listenTo(this.crumbs, 'change:path', this.onChangeItemCrumbs);
        },
        onChangeParamsFilter: function(params) {
            var mainHash = window.location.hash.split('?')[0];
            config.router.navigate(mainHash + '?' + params, {trigger: false, replace: true});
        },
        onChangeLogItem: function(logItemId) {
            this.crumbs.setLogItem(this.collectionItems.get(logItemId));
            config.router.navigate(this.collectionItems.getPathByLogItemId(logItemId), {trigger: false});
        },
        onSetLogItem: function(logItemId) {
            this.crumbs.setLogItem(this.collectionItems.get(logItemId));
        },
        onDrillItem: function(itemModel) {
            this.crumbs.cacheItem(itemModel);
        },
        onChangeItemCrumbs: function(launchModel, parentModel, optionsURL) {
            var self = this;
            this.collectionItems.update(launchModel, parentModel, optionsURL)
                .done(function() {
                    self.onChangePathId();
                })
                .always(function() {
                    $('[data-js-preloader-launch-body]', self.$el).removeClass('rp-display-block');
                })
                .fail(function() {
                    config.router.show404Page();
                })
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        update: function(partPath, optionsURL) {
            var self = this;
            this.body && this.body.destroy();
            this.control && this.control.destroy();
            $('[data-js-preloader-launch-body]', this.$el).addClass('rp-display-block');
            this.crumbs.update(partPath, optionsURL)
        },
        onChangePathId: function() {
            var info = this.collectionItems.getInfoByCollection();
            switch(info.type) {
                case 'LAUNCH': {
                    this.renderLaunchLevel(info.filterModel);
                    this.trigger('change:level', 'LAUNCH');
                    break;
                }
                case 'SUITE':
                case 'STORY':
                case 'TEST':
                case 'SCENARIO': {
                    this.renderSuiteLevel(info);
                    this.trigger('change:level', 'SUITE');
                    break;
                }
                case 'STEP':
                case 'BEFORE_CLASS':
                case 'BEFORE_GROUPS':
                case 'BEFORE_METHOD':
                case 'BEFORE_SUITE':
                case 'BEFORE_TEST':
                case 'AFTER_CLASS':
                case 'AFTER_GROUPS':
                case 'AFTER_METHOD':
                case 'AFTER_SUITE':
                case 'AFTER_TEST': {
                    this.renderStepLevel(info);
                    this.trigger('change:level', 'STEP');
                    break;
                }
                case 'LOG': {
                    this.trigger('change:level', 'LOG');
                    this.renderLogLevel(info);
                    break;
                }
            }
        },
        renderLogLevel: function(info) {
            this.control = new LogControlView({
                el: $('[data-js-controls-container]', this.$el),
                collectionItems: this.collectionItems,
            });
            this.body = new LogBodyView({
                el: $('[data-js-info-container]', this.$el),
                collectionItems: this.collectionItems,
                launchModel: info.launchModel,
            })
        },
        renderStepLevel: function(info) {
            this.control = new StepControlView({
                el: $('[data-js-controls-container]', this.$el),
                filterModel: info.filterModel,
                parentModel: (info.parentModel || info.launchModel),
                collectionItems: this.collectionItems,
            });
            this.body = new StepTableView({
                el: $('[data-js-info-container]', this.$el),
                filterModel: info.filterModel,
                collectionItems: this.collectionItems,
            })
        },
        renderSuiteLevel: function(info) {
            this.control = new SuiteControlView({
                filterModel: info.filterModel,
                parentModel: (info.parentModel || info.launchModel),
                el: $('[data-js-controls-container]', this.$el),
                collectionItems: this.collectionItems,
            });
            this.body = new SuiteTableView({
                el: $('[data-js-info-container]', this.$el),
                filterModel: info.filterModel,
                collectionItems: this.collectionItems,
            })
        },
        renderLaunchLevel: function(filterModel) {
            this.control = new LaunchControlView({
                el: $('[data-js-controls-container]', this.$el),
                collectionItems: this.collectionItems
            });
            this.body = new LaunchTableView({
                el: $('[data-js-info-container]', this.$el),
                filterModel: filterModel,
                collectionItems: this.collectionItems,
            });
        },
        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return LaunchBodyView;
});
