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

    var LandingSectionFeaturesView = _LandingSection.extend({
        id: 'features',
        className: 'b-features clearfix',
        tpl: 'tpl-landing-section-features',

        onRender: function(){
           this.animateElements = $('.js-feature', this.$el);
        },

        changeScroll: function(scrollTop, scrollBlock){
            var allElementsActivate = true;
            this.animateElements.each(function (i, elem) {
                if(!$(elem).data('animate')) {
                    allElementsActivate = false;
                    var animation = $(elem).data("animation");
                    var iconAnimation = $(elem).find(".js-featicon").data("animation");
                    var topElement = elem.offsetParent.offsetTop + elem.offsetTop;
                    if (scrollBlock > topElement + 100 && !$(elem).hasClass("fadeIn")) {
                        $(elem).data({animate: true});
                        setTimeout(function () {
                            $(elem).removeClass("g-invisible");
                            $(elem).addClass(animation);
                            $(elem).find('.js-featicon').addClass(iconAnimation);
                        }, i * 100 + 150);
                    }
                }
            });
            return allElementsActivate;
        }
    });

    return LandingSectionFeaturesView;
});