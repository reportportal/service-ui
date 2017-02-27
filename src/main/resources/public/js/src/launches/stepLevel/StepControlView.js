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
            '[data-js-history]': 'classes: {hide: not(validateForHistoryBtn)}',
            '[data-js-multi-action="remove"]': 'attr: {disabled: not(activeMultiDelete), title: multipleDeleteTooltip}',
            '[data-js-multi-action="loadbug"]': 'attr: {disabled: any(loadBugTooltip), title: loadBugTooltip}',
            '[data-js-multi-action="postbug"]': 'attr: {disabled: any(postBugTooltip), title: postBugTooltip}',
            '[data-js-refresh-counter]': 'text: refreshItems, classes: {hide: not(refreshItems)}'
        },

        computeds: {
            validateForHistoryBtn: function(){
                var interrupted = config.launchStatus.interrupted,
                    showBtn = this.parentModel.get('status') !== interrupted && this.launchModel.get('status') !== interrupted && !this.collectionItems.validateForAllCases() && !_.isEmpty(this.collectionItems.models);
                return showBtn;
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
            this.context = options.context;
            this.filterModel = options.filterModel;
            this.launchModel = options.launchModel;
            this.parentModel = options.parentModel;
            this.collectionItems =  options.collectionItems;
            this.appModel = new SingletonAppModel();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    refreshItems: 0,
                }
            }));
            this.listenTo(this.collectionItems, 'change:issue change:description change:tags', this.increaseRefreshItemsCount);
            this.listenTo(this.collectionItems, 'loading', this.resetRefreshItems);
            this.listenTo(this.collectionItems, 'change:issue', this.updateParentModel);
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
            this.$el.html(Util.templates(this.template, {context: this.context}));
        },
        updateParentModel: function () {
            _.each(this.parentModel.collection.models, function (model) {
                model.updateData(true);
            });
        },
        activateMultiple: function() {
            $('[data-js-refresh], [data-js-history-view]', this.$el).addClass('disabled');
            $('[data-js-multi-button]', this.$el).removeClass('disabled').attr({title: Localization.ui.actions});
            $('[data-js-history]', this.$el).addClass('disabled');
        },
        disableMultiple: function() {
            $('[data-js-refresh], [data-js-history-view]', this.$el).removeClass('disabled');
            $('[data-js-multi-button]', this.$el).addClass('disabled').attr({title: Localization.launches.actionTitle});
            $('[data-js-history]', this.$el).removeClass('disabled');
        },
        onClickMultiAction: function(e) {
            this.trigger('multi:action', $(e.currentTarget).data('js-multi-action'));
        },
        onClickRefresh: function() {
            this.collectionItems.load();
            this.resetRefreshItems();
        },
        resetRefreshItems: function() {
            this.model.set({refreshItems: 0});
        },
        increaseRefreshItemsCount: function (model) {
            if (this.isAnyFilterEnabled() && this.isFilteredAttrChanged(model)) {
                this.model.set({refreshItems: this.model.get('refreshItems') + 1});
            }
        },
        isFilteredAttrChanged: function(model) {
            var self = this;
            var isFilteredAttrChanged = false;
            _.each(this.getFilterEntities(), function (filter) {
                _.each(self.getChangedAttrs(model), function (changedAttrVal, changedAttrKey) {
                    if (changedAttrKey === 'issue$issue_type' && filter.filtering_field == 'issue$issue_type') {
                        if (!_.contains(filter.value.split(','), changedAttrVal) && _.isMatch(filter, {filtering_field: changedAttrKey})) {
                            isFilteredAttrChanged = true;
                        }
                    } else {
                        if (_.isMatch(filter, {filtering_field: changedAttrKey})) {
                            isFilteredAttrChanged = true;
                        }
                    }
                })
            });
            return isFilteredAttrChanged;
        },
        getFilterEntities: function() {
            if (this.filterModel.get('newEntities') !== '') {
                return JSON.parse(this.filterModel.get('newEntities'));
            } else {
                return JSON.parse(this.filterModel.get('entities'));
            }
        },
        getChangedAttrs: function (model) {
            var changedAttrs = model.changedAttributes();
            if (changedAttrs.issue) {
                if (JSON.parse(changedAttrs.issue).issue_type !== JSON.parse(model.previousAttributes().issue).issue_type) {
                    changedAttrs.issue$issue_type = JSON.parse(changedAttrs.issue).issue_type;
                }
                if (JSON.parse(changedAttrs.issue).comment !== JSON.parse(model.previousAttributes().issue).comment) {
                    changedAttrs.issue$issue_comment = JSON.parse(changedAttrs.issue).comment;
                }
                delete changedAttrs.issue;
            }
            return changedAttrs;
        },
        isAnyFilterEnabled: function () {
             return !((this.filterModel.get('newEntities') === '' && this.filterModel.get('entities') === '[]') ||
            (this.filterModel.get('newEntities') === '[]' && this.filterModel.get('entities') === '[]'));
        },
        getHistoryLink: function(){
            var currentPath = window.location.hash;
            currentPath += '&history.item=' + this.parentModel.get('id');
            return currentPath;
        },
        onClickHistory: function(e){
            e.preventDefault();
            if(!$(e.currentTarget).hasClass('disabled')){
                config.router.navigate(this.getHistoryLink(), {trigger: true});
            }
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
