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

    var LandingSectionWatchView = _LandingSection.extend({
        id: 'watch',
        className: 'b-watch clearfix',
        tpl: 'tpl-landing-section-watch',

        onRender: function() {
            var self = this;
            $(window)
                .off('resize.landingPageWatch')
                .on('resize.landingPageWatch', function(){
                    self.resize();
                })
        },

        onShow: function(){
            this.resize();
        },

        changeScroll: function(scrollTop, scrollBlock){
            if (scrollBlock > 400) {
                $('.js-watch__container', this.$el).removeClass("g-invisible");
                var $watch = $('.js-thewatch', this.$el);
                if (!$watch.hasClass($watch.data("animation"))) {
                    $watch.addClass($watch.data("animation"));
                }
                $('.js-watch', this.$el).each(function (i, elem) {
                    var animation = $(elem).data("animation");
                    if (!$(elem).hasClass(animation)) {
                        $(elem).addClass(animation);
                    }
                });
                $('.js-arrow', this.$el).addClass('b-watcharrow--rotate');
                return true;
            }
        },
        resize: function(){
            var watchCircleWidth = $(".js-watchcircle", this.$el).width();
            var w = watchCircleWidth / 2;
            $(".js-watchcircle").css({
                "bottom": $("body").width() > 768 ? w - 5 : w - 3,
                "margin-bottom": -w + 5,
                "height": w,
                "border-bottom-left-radius": w,
                "border-bottom-right-radius": w
            });

            $(".js-arrow").css({
                "bottom": $("body").width() > 992 ? w : w + 1
            });

            $(".js-arrowcircle").css({
                "bottom": $("body").width() > 992 ? w : w - 2
            });
        }
    });

    return LandingSectionWatchView;
});