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
    var FilterModel = require('filters/FilterModel');
    var App = require('app');
    var InfoPanelView = require('launches/common/InfoPanelView');
    var Localization = require('localization');

    var config = App.getInstance();

    var SuiteControlView = Epoxy.View.extend({
        events: {
            'click [data-js-refresh]': 'onClickRefresh',
            'click [data-js-milti-delete]': 'onClickMultiDelete',
            'click [data-js-history]': 'onClickHistory'
        },

        bindings: {
            '[data-js-history]': 'classes: {hide: not(validateForHistoryBtn)}',
            '[data-js-refresh-counter]': 'text: refreshItems, classes: {hide: not(refreshItems)}'
        },

        computeds: {
            validateForHistoryBtn: function(){
                var interrupted = config.launchStatus.interrupted,
                    showBtn = this.parentModel.get('status') !== interrupted && this.launchModel.get('status') !== interrupted && !_.isEmpty(this.collectionItems.models);
                return showBtn;
            },
            activeMultiDelete: function() {
                return !(this.launchModel.get('status') == config.launchStatus.inProgress)
            },
            getHistoryHref: function(){
                return this.getHistoryLink();
            }
        },

        template: 'tpl-launch-suite-control',
        initialize: function(options) {
            this.context = options.context;
            this.filterModel = options.filterModel;
            this.parentModel = options.parentModel;
            this.launchModel = options.launchModel;
            this.collectionItems =  options.collectionItems;
            this.render();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    refreshItems: 0,
                }
            }));
            this.listenTo(this.collectionItems, 'change:description change:tags', this.increaseRefreshItemsCount);
            this.listenTo(this.collectionItems, 'loading', this.resetRefreshItems);
            this.filterEntities = new FilterEntitiesView({
                el: $('[data-js-refine-entities]', this.$el),
                filterLevel: 'suit',
                model: this.filterModel
            });
            this.infoLine = new InfoPanelView({
                el: $('[data-js-info-line]', this.$el),
                model: this.parentModel,
            });
            if(!this.getBinding('activeMultiDelete')) {
                $('[data-js-milti-delete]', this.$el).attr({title: Localization.launches.launchNotInProgress});
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {context: this.context}));
        },
        activateMultiple: function() {
            $('[data-js-refresh]', this.$el).addClass('disabled');
            if (this.getBinding('activeMultiDelete')) {
                $('[data-js-milti-delete]', this.$el).removeClass('disabled').attr({title: Localization.launches.deleteBulk});
                $('[data-js-history]', this.$el).addClass('disabled');
            }
        },
        onClickMultiDelete: function() {
            this.trigger('multi:action', 'remove');
        },
        disableMultiple: function() {
            $('[data-js-refresh]', this.$el).removeClass('disabled');
            if (this.getBinding('activeMultiDelete')) {
                $('[data-js-milti-delete]', this.$el).addClass('disabled').attr({title: Localization.launches.actionTitle});
                $('[data-js-history]', this.$el).removeClass('disabled');
            }
        },
        onClickRefresh: function() {
            this.collectionItems.load();
            this.resetRefreshItems();
        },
        increaseRefreshItemsCount: function (model) {
            if (this.isAnyFilterEnabled() && this.isFilteredAttrChanged(model)) {
                this.model.set({refreshItems: this.model.get('refreshItems') + 1});
            }
        },
        resetRefreshItems: function() {
            this.model.set({refreshItems: 0});
        },
        isFilteredAttrChanged: function(model) {
            var self = this;
            var isFilteredAttrChanged = false;
            _.each(this.getFilterEntities(), function (filter) {
                _.each(self.getChangedAttrs(model), function (changedAttrVal, changedAttrKey) {
                    if (_.isMatch(filter, {filtering_field: changedAttrKey})) {
                        isFilteredAttrChanged = true;
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

    return SuiteControlView;
});
