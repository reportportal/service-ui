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
    var Util = require('util')

    var StepItemView = require('launches/stepLevel/StepItemView');

    var LogItemInfoDetailsView = Epoxy.View.extend({
        template: 'tpl-launch-log-item-info-details',

        events: {
            'click [data-ja-close]': 'onClickClose',
        },

        initialize: function(options) {
            this.render();
            this.itemModel = options.itemModel;
            this.parentModel = options.parentModel;
            this.itemView = new StepItemView({
                el: $('[data-js-item-detail-container]', this.$el),
                noIssue: true,
                model: this.itemModel
            })
        },

        render: function() {
            this.$el.html(Util.templates(this.template), {});
        },
        onClickClose: function() {
            this.parentModel.set({itemDetails: false});
        },

        destroy: function() {
            this.itemView.destroy();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        }
    })

    return LogItemInfoDetailsView;
});