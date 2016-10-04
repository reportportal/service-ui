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

    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var Localization = require('localization');

    var config = App.getInstance();

    var LaunchControlView = Epoxy.View.extend({
        events: {
            'click [data-js-refresh]': 'onClickRefresh',
            'click [data-js-multi-action]': 'onClickMultiAction',
        },

        bindings: {
        },

        template: 'tpl-launch-launch-control',
        initialize: function(options) {
            this.collectionItems = options.collectionItems;
            this.render();
            if(config.userModel.getRoleForCurrentProject() == 'CUSTOMER') {
                $('[data-js-multi-action="movedebug"]', this.$el).addClass('hide');
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        activateMultiple: function() {
            $('[data-js-refresh]', this.$el).addClass('disabled');
            $('[data-js-multi-button]', this.$el).removeClass('disabled').attr({title: Localization.ui.actions});
        },
        disableMultiple: function() {
            $('[data-js-refresh]', this.$el).removeClass('disabled');
            $('[data-js-multi-button]', this.$el).addClass('disabled').attr({title: Localization.launches.actionTitle});
        },
        onClickMultiAction: function(e) {
            this.trigger('multi:action', $(e.currentTarget).data('js-multi-action'));
        },
        onClickRefresh: function() {
            this.collectionItems.load();
        },

        destroy: function () {
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return LaunchControlView;
});
