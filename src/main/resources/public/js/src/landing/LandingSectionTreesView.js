/*
 * Copyright 2016 EPAM Systems
 * 
 * 
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
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
'use strict';

define(function(require, exports, module) {
    var _LandingSection = require('landing/_LandingSection')

    var LandingSectionTreesView = _LandingSection.extend({
        id: 'trees',
        className: 'b-trees',
        tpl: 'tpl-landing-section-trees',

        onRender: function(){
            this.paralaxElements = $('.js-forest', this.$el);
        },

        changeScroll: function(scrollTop, scrollBlock){
            var bodyWidth = $("body").width();
            this.paralaxElements.each(function (key, elem) {
                if (!$(elem).hasClass('js-leaf')) {
                    setElementsTop($(elem), -1*(scrollTop * $(elem).data("speed")));
                } else if (bodyWidth > 768) {
                    setElementsTop($(elem), -1.3*(scrollTop * $(elem).data("speed")));
                } else {
                    setElementsTop($(elem), 0);
                }
            });

            function setElementsTop($selector, top) {
                $selector.css({
                    'transform': 'translate(0, ' + top + 'px)'
                });
            }
        }
    });

    return LandingSectionTreesView;
});