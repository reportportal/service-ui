/**
 * Created by Alexey_Krylov1 on 8/22/2016.
 */
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

    var FilterEntitiesView = require('filterEntities/FilterEntitiesView');
    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var InfoPanelView = require('launches/common/InfoPanelView');
    var App = require('app');
    var Localization = require('localization');
    var SingletonAppModel = require('model/SingletonAppModel');

    var config = App.getInstance();

    var StepControlView = Epoxy.View.extend({
        events: {
            'click [data-js-refresh]': 'onClickRefresh',
            'click [data-js-multi-action]': 'onClickMultiAction',
            'click [data-js-history]': 'onClickHistory'
        },

        bindings: {
            '[data-js-history]': 'attr: {href:getHistoryHref, style: validateForHistoryBtn}',
            '[data-js-multi-action="remove"]': 'attr: {disabled: not(activeMultiDelete), title: multipleDeleteTooltip}',
            '[data-js-multi-action="loadbug"]': 'attr: {disabled: any(loadBugTooltip), title: loadBugTooltip}',
            '[data-js-multi-action="postbug"]': 'attr: {disabled: any(postBugTooltip), title: postBugTooltip}',
        },

        computeds: {
            validateForHistoryBtn: function(){
                var interrupted = config.launchStatus.interrupted,
                    showBtn = this.parentModel.get('status') !== interrupted && this.launchModel.get('status') !== interrupted && !this.collectionItems.validateForAllCases() && !_.isEmpty(this.collectionItems.models);
                return 'display: ' + ( !showBtn ? 'none' : 'inline-block' );
            },
            getHistoryHref: function(){
                return this.getHistoryLink();
            },
            activeMultiDelete: function() {
                return !(this.launchModel.get('status') == config.launchStatus.inProgress)
            },
            multipleDeleteTooltip: function() {
                if (this.getBinding('activeMultiDelete')) {
                    return '';
                }
                return Localization.launches.launchNotInProgress;
            },
            loadBugTooltip: function() {
                if (!this.appModel.get('isBtsAdded')) {
                    return Localization.launches.configureTBSLoad;
                }
                return '';
            },
            postBugTooltip: function() {
                if (!this.appModel.get('isBtsConfigure')) {
                    return Localization.launches.configureTBS;
                }
                return '';
            }
        },

        template: 'tpl-launch-step-control',
        initialize: function(options) {
            this.filterModel = options.filterModel;
            this.launchModel = options.launchModel;
            this.parentModel = options.parentModel;
            this.collectionItems =  options.collectionItems;
            this.appModel = new SingletonAppModel();
            this.render();
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-refine-entities]', this.$el),
                filterLevel: 'test',
                model: this.filterModel
            });
            this.infoLine = new InfoPanelView({
                el: $('[data-js-info-line]', this.$el),
                model: this.parentModel,
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        activateMultiple: function() {
            $('[data-js-refresh], [data-js-history-view]', this.$el).addClass('disabled');
            $('[data-js-multi-button]', this.$el).removeClass('disabled').attr({title: Localization.ui.actions});
        },
        disableMultiple: function() {
            $('[data-js-refresh], [data-js-history-view]', this.$el).removeClass('disabled');
            $('[data-js-multi-button]', this.$el).addClass('disabled').attr({title: Localization.launches.actionTitle});
        },
        onClickMultiAction: function(e) {
            this.trigger('multi:action', $(e.currentTarget).data('js-multi-action'));
        },
        onClickRefresh: function() {
            this.collectionItems.load();
        },
        getHistoryLink: function(){
            var currentPath = window.location.hash;
            currentPath += '&history.item=' + this.parentModel.get('id');
            return currentPath;
        },
        onClickHistory: function(e){
            e.preventDefault();
            config.router.navigate(this.getHistoryLink(), {trigger: true});
        },
        destroy: function () {
            this.filterEntities && this.filterEntities.destroy();
            this.infoLine && this.infoLine.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return StepControlView;
});
