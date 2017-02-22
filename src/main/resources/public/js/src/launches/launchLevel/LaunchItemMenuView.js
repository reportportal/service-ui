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
define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Editor = require('launchEditor');
    var Urls = require('dataUrlResolver');
    var Service = require('coreService');
    var Localization = require('localization');
    var App = require('app');
    var ChangeModeAction = require('launches/multipleActions/changeModeAction');
    var RemoveAction = require('launches/multipleActions/removeAction');
    var ForceFinish = require('launches/multipleActions/forceFinishAction');

    var config = App.getInstance();

    var ItemMenuView = Epoxy.View.extend({
        className: 'dropdown-menu launches-item-menu',
        tagName: 'ul',
        template: 'tpl-launch-edit-menu',
        events: {
            'click [data-js-edit-item]': 'showEdit',
            'click [data-js-start-analyze]': 'startAnalyzeAction',
            'click [data-js-finish]': 'finishLaunch',
            'click [data-js-switch-mode]': 'switchLaunchMode',
            'click [data-js-remove]': 'onClickRemove',
        },
        bindings: {
            '[data-js-finish]': 'attr:{title: titleForceFinish, disabled: any(titleForceFinish)}',
            '[data-js-can-export]': 'attr:{disabled:not(isExport)}',
            '[data-js-can-match]': 'attr:{disabled:not(isMatchIssues)}',
            '[data-js-can-analyze]': 'attr:{disabled:not(isAnalyze)}',
            '[data-js-switch-mode]': 'text:itemModeText, attr:{disabled:not(isChangeMode)}',
            '[data-js-remove]': 'attr: {title: removeTitle, disabled: any(removeTitle)}',
        },
        initialize: function(options) {
            this.model = options.model;
            this.exportFormats = ['pdf', 'xls', /*'xml',*/ 'html'];
            this.render();
        },
        computeds: {
            isAnalyze: {
                deps: ['launch_isProcessing'],
                get: function(launch_isProcessing) {
                    return !launch_isProcessing;
                }
            },
            isChangeMode: {
                deps: ['launch_owner'],
                get: function () {
                    return !this.model.validate.changeMode();
                }
            },
            titleForceFinish: {
                deps: ['status', 'launch_owner'],
                get: function() {
                    return this.model.validate.forceFinish();
                }
            },
            isExport: {
                deps: ['launch_status'],
                get: function(launchStatus) {
                    return (launchStatus != 'IN_PROGRESS');
                }
            },
            removeTitle: {
                deps: ['launch_owner', 'status'],
                get: function() {
                    return this.model.validate.remove();
                }
            },
            itemModeText: {
                deps: ['mode'],
                get: function(mode) {
                    return (mode == 'DEBUG') ? Localization.launches.shiftToLaunches : Localization.launches.shiftToDebug;
                }
            },
            isMatchIssues: {
                deps: ['launch_status', 'launch_isProcessing', 'launch_toInvestigate'],
                get: function(launchStatus, launchIsProcessing, launch_toInvestigate) {
                    return (launchStatus != 'IN_PROGRESS' && !launchIsProcessing && launch_toInvestigate > 0);
                }
            },
        },
        render: function() {
            var model = this.model.toJSON({computed: true});
            this.$el.html(Util.templates(this.template, {
                isDebug: this.isDebug(),
                isCustomer: Util.isCustomer(),
                getExportUrl: Urls.exportLaunchUrl,
                updateImagePath: Util.updateImagePath,
                exportFormats: this.exportFormats,
                item: model
            }));
        },
        isDebug: function(){
            return this.model.get('mode') === 'DEBUG';
        },
        startAnalyzeAction: function (e) {
            e.preventDefault();
            var self = this,
                el = $(e.currentTarget),
                id = this.model.get('id'),
                type = el.data('analyze-type') === "analyze" ? "startLaunchAnalyze" : "startLaunchMatch";
            if (!el.hasClass('disabled')) {
                Service[type](id)
                    .done(function(response){
                        self.model.set('isProcessing', true);
                        Util.ajaxSuccessMessenger("startAnalyzeAction");
                    })
                    .fail(function (error) {
                        Util.ajaxFailMessenger(error, "startAnalyzeAction");
                    })
            }
            else {
                e.stopPropagation();
            }
        },
        finishLaunch: function(){
            var self = this;
            ForceFinish({items: [this.model]}).done(function() {
                self.model.collection.load(true);
            });
        },
        onClickRemove: function() {
            var self = this;
            RemoveAction({items: [this.model]}).done(function() {
                self.model.collection.load(true);
            });
        },
        switchLaunchMode: function () {
            var self = this;
            ChangeModeAction({items: [this.model]}).done(function() {
                self.model.collection.load(true);
            });
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    });

    return ItemMenuView;
});
