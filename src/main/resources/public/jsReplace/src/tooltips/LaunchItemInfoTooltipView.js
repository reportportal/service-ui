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
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var Localization = require('localization');


    var LaunchStepTicketTooltipView = Epoxy.View.extend({
        template: 'tpl-launch-item-info-tooltip',
        className: 'launch-item-tooltip launch-suite-step-items',

        bindings: {
            '[data-js-name-link]': 'attr: {href: url}',
            '[data-js-name]': 'text: name',
            '[data-js-analize-label]': 'classes: {visible: isProcessing}',
            '[data-js-launch-number]': 'text: numberText',
            '[data-js-status]': 'text: status',
            '[data-js-owner-block]': 'classes: {hide: not(owner)}',
            '[data-js-owner-name]': 'text: owner',
            '[data-js-time-from-now]': 'text: startFromNow',
            '[data-js-time-exact]': 'text: startFormat',
            '[data-js-tags-container]': 'sortTags: tags',
            '[data-js-method-type]': 'text: showMethodType',
            '[data-js-step-block]': 'classes: {hide: not(isStepItem)}'
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
            isStepItem: {
                deps: ['type'],
                get: function(type) {
                    if( type == 'SUITE' || type == 'STORY' || type == 'TEST' || type == 'SCENARIO') {
                        return false;
                    }
                    return true;
                }
            }
        },

        initialize: function(options) {
            this.render();
            this.markdownViewer = new MarkdownViewer({text: this.model.get('description')});
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-item-status]', this.$el)
            });
        },

        render: function() {
            this.$el.html(Util.templates(this.template));
        },
        onDestroy: function () {
            this.markdownViewer && this.markdownViewer.destroy();
        }
    });

    return LaunchStepTicketTooltipView;
});
