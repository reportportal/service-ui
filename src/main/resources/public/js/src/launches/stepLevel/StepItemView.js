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
    var ItemDurationView = require('launches/common/ItemDurationView');
    var StepLogDefectTypeView = require('launches/common/StepLogDefectTypeView');
    var ModalLaunchItemEdit = require('modals/modalLaunchItemEdit');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');

    var config = App.getInstance();

    var StepItemView = Epoxy.View.extend({
        template: 'tpl-launch-step-item',
        events: {
            'click [data-js-name-link]': 'onClickName',
            'click [data-js-time-format]': 'toggleStartTimeView',
            'click [data-js-item-edit]': 'onClickEdit',
            'click [data-js-tag]': 'onClickTag',
        },
        bindings: {
            '[data-js-name-link]': 'attr: {href: url}',
            '[data-js-name]': 'text: name',
            // '[data-js-description]': 'text: description',
            '[data-js-status]': 'text: status',
            '[data-js-owner-block]': 'classes: {hide: not(owner)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-tags-container]': 'sortTags: tags',
            '[data-js-method-type]': 'text: showMethodType',
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-time-exact]': 'text: startFormat',
            '[data-js-status-class]': 'classes: {failed: highlightedFailed, "select-state": select, "collapse-method": validateForCollapsed}',
            '[data-js-select-item]': 'checked:select, attr: {disabled: launch_isProcessing}',
        },
        bindingHandlers: {
            sortTags: {
                set: function($element) {
                    var sortTags = this.view.model.get('sortTags');
                    if(!sortTags.length){
                        $element.addClass('hide');
                    } else {
                        $element.removeClass('hide');
                    }
                    var $tagsBlock = $('[data-js-tags]', $element);
                    $tagsBlock.html('');
                    _.each(sortTags, function(tag) {
                        $tagsBlock.append('  <a data-js-tag="' + tag + '">' + tag.replaceTabs() + '</a>')
                    })
                }
            }
        },
        computeds: {
            showMethodType: {
                deps: ['type'],
                get: function(type){
                    return Localization.testTableMethodTypes[type];
                }
            },
            highlightedFailed: {
                deps: ['status'],
                get: function(status){
                    return status == 'FAILED';
                }
            },
            validateForCollapsed: {
                deps: ['status', 'type'],
                get: function(status, type){
                    return (type.indexOf('METHOD')>=0 || type.indexOf('CLASS')>=0) && status !== 'FAILED';
                }
            }
        },
        initialize: function(options) {
            this.noIssue = options.noIssue;
            this.filterModel = options.filterModel;
            this.render();
            this.listenTo(this.model, 'scrollToAndHighlight', this.highlightItem);
            var self = this;
            this.markdownViewer = new MarkdownViewer({text: this.model.get('description')});
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
            this.listenTo(this.model, 'change:description', function(model, description){ self.markdownViewer.update(description); });
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
        highlightItem: function() {
            $('[data-js-status-class]',this.$el).prepend('<div class="highlight"></div>');
            var self = this;
            config.mainScrollElement.animate({ scrollTop: this.el.offsetTop}, 500, function() {
                $('[data-js-status-class]',self.$el).addClass('hide-highlight');
            });

        },
        renderDuration: function(){
            this.duration && this.duration.destroy();
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-item-status]', this.$el)
            });
        },
        toggleStartTimeView: function (e) {
            this.model.collection.trigger('change:time:format')
        },
        isCollapsedMethod: function () {
            return this.model.get('type') !== 'STEP' &&  this.model.get('status') !== 'FAILED';
        },
        hasIssue: function(){
            var issue = this.model.get('issue');
            return issue ? true : false;
        },
        renderIssue: function(){
            this.issueView = new StepLogDefectTypeView({
                model: this.model,
                el: $('[data-js-step-issue]', this.$el)
            });
        },
        onClickTag: function(e) {
            var tag = $(e.currentTarget).data('js-tag');
            this.addFastFilter('tags', tag);
        },
        addFastFilter: function(filterId, value) {
            this.filterModel.trigger('add_entity', filterId, value);
        },
        onClickName: function(e) {
            e.preventDefault();
            config.trackingDispatcher.trackEventNumber(23);
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
        onClickEdit: function() {
            var modal = new ModalLaunchItemEdit({
                item: this.model,
            })
            modal.show();
        },
        destroy: function () {
            this.issueView && this.issueView.destroy();
            this.duration && this.duration.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });

    return StepItemView;
});
