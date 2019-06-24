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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');

    var config = App.getInstance();

    var LogControlView = Epoxy.View.extend({
        events: {
            'click [data-js-button-prev]': 'onClickPrev',
            'click [data-js-button-next]': 'onClickNext',
            'click [data-js-button-refresh]': 'onClickRefresh',
            'click [data-js-button-load-selection]': 'loadSelection'
        },

        template: 'tpl-launch-log-control',
        initialize: function (options) {
            this.collectionItems = options.collectionItems;
            this.render();
            this.updateNavButton(this.collectionItems.logOptions.item);
            this.listenTo(this.collectionItems, 'change:log:item', this.updateNavButton);
        },
        updateNavButton: function (currentActiveId) {
            var index = 0;
            var isExtremePrev = (this.collectionItems.pagingData.number === 1);
            var isExtremeNext = (this.collectionItems.pagingData.number
                === this.collectionItems.pagingData.totalPages);
            _.each(this.collectionItems.models, function (model, n) {
                if (model.get('id') === currentActiveId) {
                    index = n;
                }
            });
            this.setButtonState($('[data-js-button-prev]', this.$el), this.collectionItems.at(index - 1), isExtremePrev);
            this.setButtonState($('[data-js-button-next]', this.$el), this.collectionItems.at(index + 1), isExtremeNext);
        },
        setButtonState: function ($el, model, isExtreme) {
            if (!model && isExtreme) {
                $el.addClass('disabled');
                $el.removeAttr('href');
                $el.attr({ title: '', disabled: 'disabled' });
                return;
            } else if (!model && !isExtreme) {
                if ($el.attr('data-js-button-prev') !== undefined) {
                    $el.removeAttr('href');
                    $el.attr({ 'data-js-button-load-selection': '', title: 'previous page' });
                    return;
                }
                if ($el.attr('data-js-button-next') !== undefined) {
                    $el.removeAttr('href');
                    $el.attr({ 'data-js-button-load-selection': '', title: 'next page' });
                    return;
                }
            }
            $el.removeClass('disabled');
            $el.removeAttr('disabled');
            $el.removeAttr('data-js-button-load-selection');
            $el.attr({
                href: this.collectionItems.getPathByLogItemId(model.get('id')),
                title: model.get('name')
            }).data({ id: model.get('id') });
        },
        loadSelection: function (e) {
            this.listenTo(this.collectionItems, 'loading', this.selectionLoadingHandler);
            if ($(e.currentTarget).attr('data-js-button-next') !== undefined) {
                this.collectionItems.setPaging(
                    this.collectionItems.pagingData.number + 1, this.collectionItems.pagingData.size
                );
                this.lastClickedNavButton = 'next';
            }
            if ($(e.currentTarget).attr('data-js-button-prev') !== undefined) {
                this.lastClickedNavButton = 'prev';
                this.collectionItems.setPaging(
                    this.collectionItems.pagingData.number - 1, this.collectionItems.pagingData.size
                );
            }
        },
        selectionLoadingHandler: function (isLoading) {
            var currentModelId;
            if (isLoading) {
                $('[data-js-preloader]', this.$el).show();
                $('[data-js-button-prev]', this.$el).prop('disabled', true);
                $('[data-js-button-next]', this.$el).prop('disabled', true);
                return;
            }
            $('[data-js-button-prev]', this.$el).removeProp('disabled');
            $('[data-js-button-next]', this.$el).removeProp('disabled');
            $('[data-js-preloader]', this.$el).hide();
            switch (this.lastClickedNavButton) {
            case 'next':
                currentModelId = this.collectionItems.models[0].id;
                this.collectionItems.setLogItem(currentModelId);
                this.updateNavButton(currentModelId);
                break;
            case 'prev':
                currentModelId = this.collectionItems.models[this.collectionItems.length - 1].id;
                this.collectionItems.setLogItem(currentModelId);
                this.updateNavButton(currentModelId);
                break;
            default:
            }
            this.stopListening(this.collectionItems, 'loading');
        },
        // attachHotkeys: function () {
        //     $(window).on('keydown.logControl', function (e) {
        //         if ((e.ctrlKey && e.shiftKey && e.keyCode === 39) || (e.ctrlKey && e.shiftKey && e.keyCode === 39)) {
        //             $('[data-js-button-next]', this.$el).trigger('click');
        //         }
        //         if ((e.ctrlKey && e.shiftKey && e.keyCode === 37) || (e.ctrlKey && e.shiftKey && e.keyCode === 37)) {
        //             $('[data-js-button-prev]', this.$el).trigger('click');
        //         }
        //     }.bind(this));
        // },
        onClickPrev: function (e) {
            config.trackingDispatcher.trackEventNumber(186);
            this.onClickNavigation(e);
        },
        onClickNext: function (e) {
            config.trackingDispatcher.trackEventNumber(187);
            this.onClickNavigation(e);
        },
        onClickNavigation: function (e) {
            var $nav = $(e.currentTarget);
            e.preventDefault();
            if ($nav.attr('data-js-button-load-selection') !== undefined) { return; }
            this.collectionItems.setLogItem($nav.data('id')); // triggers 'change:log:item' & executes this.updateNavButton
        },
        onClickRefresh: function () {
            config.trackingDispatcher.trackEventNumber(188);
            this.collectionItems.trigger('update:logs');
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            // this.attachHotkeys();
        },

        onDestroy: function () {
            this.$el.html('');
            $(window).off('keydown.logControl');
            delete this;
        }
    });


    return LogControlView;
});
