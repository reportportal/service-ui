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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');

    var LogControlView = Epoxy.View.extend({
        events: {
            'click [data-js-button-prev]': 'onClickNavigation',
            'click [data-js-button-next]': 'onClickNavigation',
            'click [data-js-button-refresh]': 'onClickRefresh',
        },

        template: 'tpl-launch-log-control',
        initialize: function(options) {
            this.collectionItems = options.collectionItems;
            this.render();
            this.updateNavButton(this.collectionItems.logOptions.item);
        },
        updateNavButton: function(currentActiveId) {
            var index = 0;
            _.each(this.collectionItems.models, function(model, n){
                if(model.get('id') == currentActiveId) {
                    index = n;
                    return;
                }
            });
            this.setButtonState($('[data-js-button-prev]', this.$el), this.collectionItems.at(index - 1));
            this.setButtonState($('[data-js-button-next]', this.$el), this.collectionItems.at(index + 1));
        },
        setButtonState: function($el, model) {
            if(!model) {
                $el.addClass('disabled');
                $el.removeAttr('href');
                $el.attr({title: '', disabled: 'disabled'});
                return;
            }
            $el.removeClass('disabled');
            $el.removeAttr('disabled');
            $el.attr({
                href: this.collectionItems.getPathByLogItemId(model.get('id')),
                title: model.get('name'),
            }).data({id: model.get('id')});
        },
        onClickNavigation: function(e) {
            e.preventDefault();
            var $nav = $(e.currentTarget);
            this.collectionItems.setLogItem($nav.data('id'));
            this.updateNavButton($nav.data('id'));
        },
        onClickRefresh: function() {
            this.collectionItems.trigger('update:logs');
            // this.collectionItems.setLogItem(this.collectionItems.logOptions.item);
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },

        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return LogControlView;

});