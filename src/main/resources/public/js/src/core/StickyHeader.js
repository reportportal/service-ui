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

    var fixedClass = 'affix'
    var App = require('app');
    var config = App.getInstance();

    var StickyHeader = function (options) {
        if (!options.fixedBlock || options.fixedBlock.length == 0) {
            console.log('StickyHeader: fixed block not defined');
            return;
        }
        this.topMargin = (options.topMargin) ? options.topMargin : 0;
        this.originBlock = options.fixedBlock;
        this.clearOriginBlock();
        this.cloneBlock = this.originBlock.clone();

        this.scrollTop = config.mainScrollElement.scrollTop();

        this.isShow = null;

        this.originBlock.after(this.cloneBlock);
        this.sync();

        this.bindScrollChange = this.scrollChange.bind(this);
        this.bindResize = this.resize.bind(this);

        $.subscribe('scroll:change', this.bindScrollChange);
        $.subscribe('window:resize', this.bindResize);

        this.checkScroll();
    };

    StickyHeader.prototype.scrollChange = function (e, data) {
        this.scrollTop = data.top;
        if (!this.isShow) {
            this.sync();
        }
        this.checkScroll();
    };

    StickyHeader.prototype.resize = function () {
        this.sync();
        this.checkScroll();
    };

    StickyHeader.prototype.sync = function () {
        var showBlock = this.cloneBlock;
        if (!this.isShow) {
            showBlock = this.originBlock;
        }
        this.originBlockTop = showBlock.offset().top + this.scrollTop - this.topMargin;
        this.syncWidth();
    };

    StickyHeader.prototype.syncWidth = function () {
        if (this.isShow) {
            this.originBlock.width(this.cloneBlock.width());
        }
    };

    StickyHeader.prototype.checkScroll = function (){
        if (this.scrollTop >= this.originBlockTop) {
            this.show();
        } else {
            this.hide();
        }
    };

    StickyHeader.prototype.show = function () {
        if (this.isShow == null || !this.isShow) {
            this.isShow = true;
            this.originBlock.addClass(fixedClass).css({top: this.topMargin});
            this.cloneBlock.css({display: 'block'});
            this.syncWidth();
        }
    };

    StickyHeader.prototype.hide = function () {
        if (this.isShow == null || this.isShow) {
            this.isShow = false;
            this.clearOriginBlock();
            this.cloneBlock.css({display: 'none'});
        }
    };

    StickyHeader.prototype.clearOriginBlock = function() {
        this.originBlock.removeClass(fixedClass).attr('style', '');
    };

    StickyHeader.prototype.updateClone = function () {
        debugger;
        this.cloneBlock.remove();
        this.cloneBlock = this.originBlock.clone();
        this.cloneBlock.addClass(fixedClass).css({top: 0});
        this.sync();
        this.originBlock.after(this.cloneBlock);
        this.checkScroll();
    };

    StickyHeader.prototype.destroy = function () {
        if(this.originBlock) {
            this.cloneBlock.remove();
            this.clearOriginBlock();
        }
        $.unsubscribe("scroll:change", this.bindScrollChange);
        $.unsubscribe('window:resize', this.bindResize);
    };

    return StickyHeader;
});
