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
    var Util = require('util');
    var Epoxy = require('backbone-epoxy');
    var FilterEntityChoiceView = require('filterEntities/FilterEntityChoiceView');
    var App = require('app');

    var config = App.getInstance();

    var FilterEntitiesChoiceView = Epoxy.View.extend({
        template: 'tpl-filter-entities-choice',
        events: {
            'click [data-toggle="dropdown"]': 'onClickMoreEntities'
        },
        initialize: function (options) {
            this.filterLevel = options.filterLevel;
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
            this.$choiceList = $('[data-js-entity-choice-list]', this.$el);
            _.each(this.collection.models, function(model) {
                this.$choiceList.append((new FilterEntityChoiceView({
                    model: model,
                    filterLevel: this.filterLevel
                })).$el);
            }, this)
        },
        onClickMoreEntities: function(){
            if(this.filterLevel == 'suit'){
                config.trackingDispatcher.trackEventNumber(97.1);
            }
            else if(this.filterLevel == 'test'){
                config.trackingDispatcher.trackEventNumber(136);
            }
        }

    });

    return FilterEntitiesChoiceView;
});
