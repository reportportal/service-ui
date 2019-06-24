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
    var FilterModel = require('filters/FilterModel');
    var LogItemCollection = require('launches/logLevel/LogItemCollection');
    var $ = require('jquery');

    var ModalStepItemDetails = ModalView.extend({
        template: 'tpl-modal-step-item-details',
        className: 'modal-step-item-details',
        events: {
            'click [data-js-ok]': 'onClickOk',
            'click [data-js-toggle-open-description]': 'onClickOpenDescription',
            'click [data-js-toggle-open-stacktrace]': 'onClickOpenStacktrace'
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
            var filterModel = new FilterModel({
                temp: true,
                entities: '[{"filtering_field":"level","condition":"in","value":"ERROR"}]',
                selection_parameters: '{"is_asc": false, "sorting_column": "time"}'
            });
            this.collection = new LogItemCollection({
                filterModel: filterModel,
                itemModel: this.model
            });
            this.load();
            this.render();
            this.listenTo(this.collection, 'loading:true', this.onStartLoading);
            this.listenTo(this.collection, 'loading:false', this.onStopLoading);
            this.listenTo(this.collection, 'reset', this.onResetCollection);
        },
        load: function () {
            this.collection.setPaging(1, 1); // call loading
        },
        onShown: function () {
            var innerHeight = 150;
            if ($('[data-js-description]', this.$el).innerHeight() > innerHeight) {
                $('[data-js-description-container]', this.$el).addClass('show-accordion');
            }
            if ($('[data-js-stack-trace]', this.$el).innerHeight() > innerHeight) {
                $('[data-js-stack-trace-container]', this.$el).addClass('show-accordion');
            }
            this.scrool = Util.setupBaronScroll($('[data-js-parametres]', this.$el), null, { direction: 'm' });
            Util.setupBaronScrollSize(this.scrool, { maxHeight: 200 });
            $(window).resize(); // for scroll rerender
        },
        onStartLoading: function () {
            $('[data-js-stack-trace-container]', this.$el).addClass('load');
        },
        onStopLoading: function () {
            $('[data-js-stack-trace-container]', this.$el).removeClass('load');
        },
        onResetCollection: function () {
            if (this.collection.models.length) {
                $('[data-js-stack-trace]', this.$el).html(this.collection.models[0].get('message'));
            } else {
                $('.item-stack-trace', this.$el).addClass('hide');
            }
        },
        onClickOpenDescription: function () {
            $('[data-js-description-container]', this.$el).toggleClass('open');
        },
        onClickOpenStacktrace: function () {
            $('[data-js-stack-trace-container]', this.$el).toggleClass('open');
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
            this.$el.html(Util.templates(this.template, {
                footerButtons: footerButtons,
                params: params
            }));
            this.duration = new ItemDurationView({
                model: this.model,
                el: $('[data-js-duration]', this.$el)
            });
            this.description = new MarkdownViewer({ text: this.model.get('description') });
            $('[data-js-description]', this.$el).html(this.description.$el);
        },
        onClickOk: function () {
            this.successClose();
        }
    });

    return ModalStepItemDetails;
});
