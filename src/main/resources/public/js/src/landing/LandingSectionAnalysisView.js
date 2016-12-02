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

    var LandingSectionAnalysisView = _LandingSection.extend({
        id: 'analysis',
        className: 'b-common b-autotrees clearfix',
        tpl: 'tpl-landing-section-analysis',
        fallenLeaves: false,

        changeScroll: function(scrollTop, scrollBlock){
            var self = this;
            var allElementsActivate = true;
            $('#analysis [data-js-scroll-action]').not('.activate').each(function(i, elem){
                allElementsActivate = false;
                if(scrollBlock > elem.offsetTop + elem.offsetHeight*0.75){
                    self.showAndAnimateElements($('.js-commonel', elem));
                    $(elem).addClass('activate');
                }
            });
            if(!this.fallenLeaves){
                this.fallenLeaves = true;
                this.redLeavesFalling();
            }
            return allElementsActivate;
        },
        redLeavesFalling: function(){
            var $leaves = $(".js-redleaves"),
                animation = "swing",
                frontMoveUpClass = "b-redleaf--moveup",
                backMoveUpClass = "b-redleaf__back--moveup",
                leavesArr = $leaves.find(".js-redleaves--front .js-redleaf"),
                timer = 0,
                randomLeaves = [];

            while (randomLeaves.length < 5) {
                var number = Math.floor((Math.random() * 17))
                if (randomLeaves.indexOf(number) == -1 && number != 17) {
                    randomLeaves.push(number);
                }
            }

            $.each(leavesArr, function (i, elem) {
                var leafNumber = randomLeaves[i];
                setTimeout(function () {
                    $(elem).addClass(frontMoveUpClass).delay(leafNumber * 150 + 300).queue(function () {
                        $(this).addClass(animation).dequeue();
                    }).delay(1500).queue(function () {
                        $(this).removeClass(animation).removeClass(frontMoveUpClass).dequeue();
                    });
                    backRedLeavesFalling($(elem), leafNumber);
                }, timer);
                timer += leafNumber * 150 + 3000;
            });

            function backRedLeavesFalling(parentLeaf, leafNumber) {
                $leaves.find(".js-redleaves--back .js-redleaf").each(function (i, elem) {
                    if (i != leafNumber) {
                        setTimeout(function () {
                            $(elem).addClass(backMoveUpClass).delay(300).queue(function () {
                                $(this).removeClass(backMoveUpClass).dequeue();
                            })
                        }, i * 150);
                    } else {
                        setTimeout(function () {
                            $(elem).addClass(backMoveUpClass).delay(500).queue(function () {
                                $(this).addClass(animation).dequeue();
                            }).delay(1300).queue(function () {
                                $(this).removeClass(animation).removeClass(backMoveUpClass).dequeue();
                            });
                        }, leafNumber * 150);
                        return false;
                    }
                })
            }
        }

    });

    return LandingSectionAnalysisView;
});