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

    var config = App.getInstance();

    var HistoryControlView = Epoxy.View.extend({
        events: {
            'click [data-js-refresh]': 'onClickRefresh'
        },

        template: 'tpl-launch-history-control',
        initialize: function(options) {
            this.parentModel = options.parentModel;
            this.collectionItems = options.collectionItems;
            this.render();
            this.infoLine = new InfoPanelView({
                el: $('[data-js-info-line]', this.$el),
                model: this.parentModel,
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRefresh: function() {
            this.trigger('refresh::history');
        },

        destroy: function () {
            this.infoLine && this.infoLine.destroy();
            this.$el.html('');
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return HistoryControlView;
});
