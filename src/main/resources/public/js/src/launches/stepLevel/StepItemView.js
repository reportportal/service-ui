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
    var App = require('app');
    var Localization = require('localization');
    var LaunchSuiteStepItemMenuView = require('launches/common/LaunchSuiteStepItemMenuView');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var StepItemIssueView = require('launches/stepLevel/StepItemIssueView');
    var DefectEditor = require('launches/stepLevel/DefectEditorView');
    var SingletonUserStorage = require('storage/SingletonUserStorage');

    var config = App.getInstance();


    var StepItemView = Epoxy.View.extend({
        template: 'tpl-launch-step-item',
        events: {
            'click [data-js-name]': 'onClickName',
            'click [data-js-launch-menu]:not(.rendered)': 'showItemMenu',
            'click [data-js-issue-type]': 'showDefectEditor',
            'click [data-js-time-format]': 'toggleStartTimeView'
        },
        bindings: {
            '[data-js-name]': 'text: name, attr: {href: url}',
            '[data-js-description]': 'text: description',
            '[data-js-status]': 'text: status',
            '[data-js-method-type]': 'text: showMethodType',
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-time-exact]': 'text: startFormat',
            '[data-js-status-class]': 'classes: {danger: highlightedFailed, "select-state": select}',
            '[data-js-select-item]': 'checked:select',
        },
        computeds: {
            showMethodType: function(){
                return Localization.testTableMethodTypes[this.getBinding('type')];
            },
            highlightedFailed: function(){
                return this.getBinding('status') == 'FAILED';
            }
        },
        initialize: function(options) {
            this.noIssue = options.noIssue;
            this.userStorage = new SingletonUserStorage();
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {
                model: this.model.toJSON({computed: true}),
                noIssue: this.noIssue,
                isCollapsedMethod: this.isCollapsedMethod()
            }));
            this.renderDuration();
            if(this.hasIssue() && !this.noIssue){
                this.renderIssue();
            }
        },
        renderDuration: function(){
            this.duration = new ItemDurationView({
                model: this.model,
                $el: $('[data-js-item-status]', this.$el)
            });
        },
        toggleStartTimeView: function (e) {
            var $el = $(e.currentTarget),
                table = $el.closest('[data-js-table-container]'),
                timeFormat = this.userStorage.get('startTimeFormat');
            if(timeFormat === 'exact'){
                table.removeClass('exact-driven');
                timeFormat = ''
            }
            else {
                table.addClass('exact-driven');
                timeFormat = 'exact';
            }
            this.userStorage.set('startTimeFormat', timeFormat);
        },
        isCollapsedMethod: function () {
            return this.model.get('type') !== 'STEP' &&  this.model.get('status') !== 'FAILED';
        },
        hasIssue: function(){
            var issue = this.model.get('issue');
            return issue ? true : false;
        },
        renderIssue: function(){
            this.issueView = new StepItemIssueView({
                model: this.model,
                $container: $('[data-js-step-issue]', this.$el)
            });
        },
        showItemMenu: function (e) {
            var $link = $(e.currentTarget);
            this.menu = new LaunchSuiteStepItemMenuView({
                model: this.model
            });

            $link
                .after(this.menu.$el)
                .addClass('rendered')
                .dropdown();
        },
        showDefectEditor: function(e){
            e.preventDefault();
            var el = $(e.currentTarget);
            if(!el.hasClass('disabled')){
                this.setupEditor();
            }
            e.stopPropagation();
        },
        setupEditor: function () {
            this.removeEditor();
            this.$editor = new DefectEditor({
                origin: $('[data-js-defect-editor]', this.$el),
                model: this.model
            });
            this.listenTo(this.$editor, 'defect::editor::hide', this.onHideEditor);
            this.onShowEditor();
        },
        onShowEditor: function(){
            $('[data-js-status-class]', this.$el).addClass('selected');
            $('[data-js-step-issue]', this.$el).hide();
            $('[data-js-select-cell]', this.$el).hide();
        },
        onHideEditor: function(){
            $('[data-js-status-class]', this.$el).removeClass('selected');
            $('[data-js-step-issue]', this.$el).show();
            $('[data-js-select-cell]', this.$el).show();
        },
        removeEditor: function () {
            if (this.$editor) {
                this.$editor.destroy();
                this.$editor = null;
            }
        },
        onClickName: function(e) {
            e.preventDefault();
            var href = $(e.currentTarget).attr('href');
            if(href != '') {
                this.model.trigger('drill:item', this.model);
                config.router.navigate(href, {trigger: true});
            } else {
                var currentPath = window.location.hash;
                currentPath += '&log.item=' + this.model.get('id');
                config.router.navigate(currentPath, {trigger: true});
            }

        },
        destroy: function () {
            this.menu && this.menu.destroy();
            this.issueView && this.issueView.destroy();
            this.duration && this.duration.destroy();
            this.removeEditor();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });

    return StepItemView;
});
