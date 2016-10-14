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
define(function(require, exports, module) {
    'use strict';

    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var LoginView = require('landing/LoginView');
    var UserModel = require('model/UserModel');

    var config = App.getInstance();

    var LandingHeaderView = Backbone.Epoxy.View.extend({
        tpl: 'tpl-landing-header',
        bindings: {
            ':el': 'classes: {"b-header--dark": darkMenu, authorized: auth}',
            '[data-js-return-button]': 'attr: {href: lastInsideHash}'
        },
        events: {
            'click .js-logo': 'onClickLogo',
            'mouseover .js-headermenu li': 'onMouseOverMenuLi',
            'mouseout .js-headermenu': 'onMouseOutMenu',
            'click .b-menu__link': 'onClickMenuItem',
            'click .navbar-toggle': 'onOpenMenuMobile',
            'click [data-js-show-login]': 'onClickShowLogin',
            'keydown': 'keyDownHandler',
        },
        initialize: function(){
            this.render();
            this.$menuItems = $('.b-menu__link', this.$el);
            this.listenTo(this.model, 'change:activeSlide', this.onChangeActiveSlide);
            this.logo = $(".js-logo", this.$el);
            this.loginView = new LoginView({el: $('.js-loginblock', this.$el).get()});
            this.viewModel = new UserModel();
        },
        onClickShowLogin: function() {
            if(config.userModel.get('auth')){
                window.location.href = '';
            }
            $(".js-navbar", this.$el).removeClass('in');

            // $(".b-contents--open").removeClass("b-contents--open");
            // $(".b-docs__nav--open").removeClass("b-docs__nav--open");
            this.loginView.toggle();
        },
        showLoginBlock: function() {
            var self = this;
            this.viewModel.isAuth().fail(function(){
                $(".js-navbar", self.$el).removeClass('in');
                self.loginView.show();
            });
        },
        keyDownHandler : function(e) {
            switch (e.which) {
                case 27:
                    return this.onOpenMenuMobile();
                break;
            }
        },
        render: function() {
            this.$el.html(Util.templates(this.tpl));
            return this;
        },
        onClickMenuItem: function(e) {
            $(".js-navbar", this.$el).removeClass("in");
            var $link = $(e.target);
            if($link.attr('href')){
                e.preventDefault();
                if($link.attr('href') == '#documentation'){
                    this.trigger('clickDocumentation')
                }else{
                    this.trigger('clickMenu', $link.attr('href'));
                }
            }
        },
        onMouseOverMenuLi: function(e) {
            this.moveLineToElement($(e.currentTarget));
        },
        onMouseOutMenu: function() {
            var $activeEl = $(".active", this.$el);
            if ($activeEl.length) {
                this.moveLineToElement($activeEl);
            } else {
                this.hideMenuLine();
            }
        },
        onChangeActiveSlide: function(model, activeSlide) {
            this.$menuItems.removeClass('active');
            if (activeSlide == 0) {
                this.hideMenuLine();
                return;
            }
            // watch block not shown
            if (activeSlide > 1) {
                activeSlide--;
            }
            var $activeElement = this.$menuItems.eq(activeSlide-1);
            $activeElement.addClass('active');
            this.moveLineToElement($activeElement);
        },
        moveLineToElement: function(elem) {
            var _item_position = elem.position();
            $(".js-menuline")
                .stop()
                .animate({
                    'left': _item_position.left,
                    'width': elem.width()
                }, 150);
        },
        hideMenuLine: function() {
            var _item_offset = this.logo.offset();
            $(".js-menuline")
                .stop()
                .animate({
                    'left': (_item_offset.left < 50 ? 50 : _item_offset.left),
                    'width': 0
                }, 150);
        },
        onClickLogo: function() {
            $(".js-navbar", this.$el).removeClass("in");
            this.trigger('clickMenu', '#trees');
        },
        onOpenMenuMobile: function() {
            this.loginView.hide();
        },
        destroy: function () {
            // TODO
        }
    })

    return LandingHeaderView;

});