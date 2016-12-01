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

define(function (require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var App = require('app');

    var config = App.getInstance();

    var isMarked = false,
        elements,
        $parent,
        $window = $(window),
        $mainContainer = $("#mainContainer"),
        width = 0,
        height = 0,
        heightIncrement = 0,
        kickOffHeight = 0,
        fixedClass = 'affix';

    var tracker = function (e, data) {
        if (data.top >= kickOffHeight) {
            if (!isMarked) {
                setupDimensions();
                isMarked = true;
            }
        } else {
            if (isMarked) {
                removeFixedClass();
            }
        }
    };

    var removeFixedClass = function () {
        _.forEach(elements, function ($element) {
            $element.removeClass(fixedClass).attr('style', '');
            $element.parent().css('paddingTop', '0');
        });
        isMarked = false;
    };

    var setupDimensions = function (e) {
        var cloneHeader = elements[1].clone();
        cloneHeader.addClass(fixedClass).css({width: elements[1].width()});
        elements[1].after(cloneHeader);

        // var withClass = !e;
        // heightIncrement = 0;
        // $parent = elements[0].parent();
        // width = $parent.outerWidth();
        // _.forEach(elements, function ($element, index) {
        //     $element.dHeight = $element.height();
        // })
        // _.forEach(elements, function ($element, index) {
        //     height = $element.dHeight;
        //     if (index === 0 && elements.length > 1) {
        //         $element.css({height: height + "px"});
        //     } else {
        //         $element.css({top: heightIncrement + "px"});
        //     }
        //     heightIncrement += height;
        //
        //     $element.css('width', width + 'px');
        //     $element.parent().css('paddingTop', height + 'px');
        //     withClass && $element.addClass(fixedClass);
        // });
    };

    var resizeCorrector = function () {
        removeFixedClass();
        if ($window.scrollTop() >= kickOffHeight) {
            setupDimensions();
        }
    };

    var setupSticker = function (elems, kickOffIndex) {
        if (!elems || !elems.length) return;
        if (isMarked) {
            clearSticker();
        }
        elements = elems;
        kickOffHeight = elems[kickOffIndex] ? elems[kickOffIndex].get(0).offsetTop + 60 : 0;
        $window.on('resize.header', resizeCorrector);
        $.subscribe("scroll:change", tracker);
        tracker(null, {top: config.mainScrollElement.scrollTop()});
    };

    var updateKickOff = function (index) {
        kickOffHeight = elements[index] ? elements[index].get(0).offsetTop : 0;
    };

    var clearSticker = function (remain) {
        if (!$parent) return;
        $parent.attr('style', '');
        removeFixedClass();   
        kickOffHeight = 0;
        clearElements();
    };

    var clearElements = function () {
        $parent = null;
        elements = null;
        $window.off('resize.header', resizeCorrector);
        $.unsubscribe("scroll:change", tracker);
    };

    return {
        setupSticker: setupSticker,
        updateKickOff: updateKickOff,
        clearSticker: clearSticker
    }

});