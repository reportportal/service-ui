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

    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var Localization = require('localization');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var MarkdownViewer = require('components/markdown/MarkdownViewer');
    var $ = require('jquery');

    var ModalDefectEditor = ModalView.extend({
        template: 'tpl-modal-step-item-details',
        className: 'modal-step-item-details-editor',
        events: {
            'click [data-js-ok]': 'onClickOk'
        },
        bindings: {
            '[data-js-item-name]': 'text: name',
            '[data-js-uid]': 'text: uniqueId',
            '[data-js-tags]': 'html: getTags',
            '[data-js-tags-container]': 'classes: {hide: not(getTags)}',
            '[data-js-parametres-container] ': 'classes: {hide: not(isParameters)}',
            '[data-js-description-container]': 'classes: {hide: not(isDescription)}'
        },
        computeds: {
            getTags: {
                deps: ['tags'],
                get: function (tags) {
                    var tagsArr;
                    var tagsStr = '';
                    if (tags) {
                        tagsArr = JSON.parse(tags);
                        _.each(tagsArr, function (item) {
                            tagsStr += '<span>' + item + '</span>';
                        });
                    }
                    return tagsStr;
                }
            },
            isParameters: {
                deps: ['parameters'],
                get: function (parameters) {
                    if (parameters) {
                        return true;
                    }
                    return false;
                }
            },
            isDescription: {
                deps: ['description'],
                get: function (description) {
                    if (description) {
                        return true;
                    }
                    return false;
                }
            }
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var footerButtons = [
                {
                    btnText: Localization.ui.ok,
                    btnClass: 'rp-btn-submit btn-ok',
                    label: 'data-js-ok'
                }
            ];
            var params = this.model.get('parameters');
            this.$el.html(Util.templates(this.template, { footerButtons: footerButtons, params: params }));
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-duration]', this.$el)
            });
            this.markdownViewer = new MarkdownViewer({ text: this.model.get('description') });
            $('[data-js-description]', this.$el).html(this.markdownViewer.$el);
        },
        onClickOk: function () {
            this.successClose();
        }
    });

    return ModalDefectEditor;
});
