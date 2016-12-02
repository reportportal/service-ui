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
    var Backbone = require('backbone'),
        Epoxy = require('backbone-epoxy'),
        Util = require('util'),
        _ = require('underscore'),

        App = require('app'),
        // Router = require('router'),

        LandingHeader = require('landing/LandingHeaderView'),

        LandingSectionTreesView = require('landing/LandingSectionTreesView'),
        LandingSectionFeaturesView = require('landing/LandingSectionFeaturesView'),
        LandingSectionWatchView = require('landing/LandingSectionWatchView'),
        LandingSectionAnalysisView = require('landing/LandingSectionAnalysisView'),
        LandingSectionProductionUsageView = require('landing/LandingSectionProductionUsageView'),
        LandingSectionDistributionView = require('landing/LandingSectionDistributionView'),
        LandingSectionResultAnalysisView = require('landing/LandingSectionResultAnalysisView'),

        LandingDocumentationView = require('landing/LandingDocumentationView')

    var config = App.getInstance();
    var LendingModel = Backbone.Model.extend({
        defaults: {
            darkMenu: false,
            activeSlide: 0
        }
    });


    var LandingPage = Backbone.Epoxy.View.extend({
        className: 'landing-page js-landing-page',
        tpl: 'tpl-landing-page',

        initialize: function(){
            this.model = new LendingModel();
            this.render();
            this.listenTo(this.landingHeader, 'clickMenu', this.onClickMenu);
            this.listenTo(this.landingHeader, 'clickDocumentation', this.onClickDocumentation);
            this.currentShow = '';
            this.scrollElement = config.mainScrollElement;
        },
        render: function() {
            this.$el.html(Util.templates(this.tpl));
            this.landingHeader = new LandingHeader({el: $('header.b-header', this.$el), model: this.model});
        },
        
        showLoginBlock: function(){
            if(!this.landingHeader) return;
            this.landingHeader.showLoginBlock();
        },

        showParallax: function(){
            if(this.currentShow == 'documentation') this.hideDocumentation();
            if(this.currentShow == 'parallax') return;
            this.currentShow = 'parallax';
            this.section = [
                (new LandingSectionTreesView()),
                (new LandingSectionFeaturesView()),
                (new LandingSectionWatchView()),
                (new LandingSectionAnalysisView()),
                (new LandingSectionProductionUsageView()),
                (new LandingSectionDistributionView()),
                (new LandingSectionResultAnalysisView())
            ];
            var $containerSection = $('.js-main-container', this.$el);
            _.each(this.section, function(section){
                $containerSection.append(section.$el);
                section.onShow();
            });

            this.scrollerAnimate = new ScrollerAnimate(this.section);
            var self = this;
            this.scrollElement
                .off('scroll.landingPage')
                .on("scroll.landingPage", function (e) {
                    self.onScroll();
                });
            $(window)
                .off('resize.landingPage')
                .on('resize.landingPage', function(){
                    self.scrollerAnimate.resize();
                })
        },
        hideParallax: function() {
            this.scrollElement.off('scroll.landingPage');
            $(window).off('resize.landingPage');
            this.scrollerAnimate = null;
            this.section = null;
            $('.js-main-container', this.$el).html('');
        },
        showDocumentation: function(id) {
            if(this.currentShow == 'parallax') this.hideParallax();
            if(this.currentShow == 'documentation'){
                this.documentation.changeAnchor(id);
                return;
            }
            this.currentShow = 'documentation';
            this.model.set({activeSlide: 7});
            this.$el.addClass('documentation');
            this.documentation = new LandingDocumentationView({id: id});
            this.documentation.render($('.js-docs-container', this.$el));
        },
        hideDocumentation: function(){
            this.$el.removeClass('documentation');
            if(this.documentation) this.documentation.remove();
        },
        hide: function(){
            if(this.currentShow == 'parallax') this.hideParallax();
        },
        onScroll: function() {
            var scrollTop = this.scrollElement.scrollTop();
            var activeSlide = this.scrollerAnimate.activateScroll(scrollTop);
            this.model.set({activeSlide: activeSlide});
            if(scrollTop > this.scrollerAnimate.scrollMap[1].scrollStart){
                this.model.set({darkMenu: true});
            }else {
                this.model.set({darkMenu: false});
            }
        },
        onClickMenu: function(href) {
            this.showParallax();
            config.router.navigate('', {trigger: false});
            var $scrollElement = $(href);
            if($scrollElement){
                this.scrollElement.animate({
                    scrollTop: $scrollElement.get(0).offsetTop - 200
                }, 200);
            }
        },
        onClickDocumentation: function() {
            config.router.navigate('documentation', {trigger: true});
        }
        
    });

    function ScrollerAnimate(blocks){
        this.blocks = blocks;
        this.scrollMap = [];
        this.documentHeight = 0;

        this._createScrollMap = function(){
            this.scrollMap = [];
            this.documentHeight = document.documentElement.clientHeight;
            for(var i = 0; i < this.blocks.length; i++){
                this.scrollMap.push({
                    scrollStart: this.blocks[i].el.offsetTop,
                    scrollEnd: this.blocks[i].el.offsetTop + this.blocks[i].el.offsetHeight
                });
            }
        };

        this.activateScroll = function(scrollTop){
            var scrollBottom = scrollTop + this.documentHeight,
                showBlockIndexs = [];
            for(var i = 0; i < this.scrollMap.length; i++){
                if((this.scrollMap[i].scrollStart <= scrollBottom && scrollTop < this.scrollMap[i].scrollStart)
                    || (this.scrollMap[i].scrollEnd <= scrollBottom && scrollTop < this.scrollMap[i].scrollEnd)
                    || (this.scrollMap[i].scrollEnd > scrollBottom && scrollTop >= this.scrollMap[i].scrollStart)){
                    showBlockIndexs.push(i);
                    if(!this.blocks[i].activate){
                        if(this.blocks[i].changeScroll(scrollTop, scrollBottom - this.scrollMap[i].scrollStart)){
                            this.blocks[i].activate = true;
                        }
                    }
                }
            }
            // return middle block index
            if(showBlockIndexs.length != 2) return showBlockIndexs[parseInt(showBlockIndexs.length/2)];
            var middleScreen = scrollBottom - this.documentHeight/2,
                blockSeparate = this.scrollMap[showBlockIndexs[0]].scrollEnd;
            if(blockSeparate > middleScreen) return showBlockIndexs[0];
            return showBlockIndexs[1];
        };

        this.resize = function(){
            this._createScrollMap();
            this.activateScroll(config.mainScrollElement.scrollTop());
        }

        this._createScrollMap();
    }


    return LandingPage;
});