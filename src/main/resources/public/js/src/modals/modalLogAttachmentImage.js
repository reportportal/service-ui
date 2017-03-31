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
    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var Urls = require('dataUrlResolver');
    var App = require('app');

    var config = App.getInstance();

    var ModalLogAttachmentImage = ModalView.extend({
        tpl: 'tpl-modal-log-attachment-image',
        className: 'modal-log-attachment-image',

        events: {
            'click [data-js-image]': 'openImgInNewWindow',
            'click [data-js-rotate]': 'onClickRotate',
            'click [data-js-close]': 'onClickClose',
            'click [data-js-cancel]': 'onClickCancel'
        },

        initialize: function(options) {
            this.rotate = 0;
            this.imageSrc = Urls.getFileById(options.imageId);
            this.render();
        },

        onShow: function () {
            this.$modalWrapper.addClass('loading');
            var self = this;
            $('[data-js-image]', this.$el).load(function () {
                self.$modalWrapper.removeClass('loading');
            })
        },

        render: function() {
            this.$el.html(Util.templates(this.tpl, {imageSrc: this.imageSrc}));
        },
        onClickClose: function(){
            config.trackingDispatcher.trackEventNumber(509);
        },
        onClickCancel: function(){
            config.trackingDispatcher.trackEventNumber(511);
        },
        onClickRotate: function() {
            config.trackingDispatcher.trackEventNumber(510);
            this.rotate += 90;
            if (!this.nativeSize) {
                this.nativeSize = {
                    width: $('[data-js-image-block]', this.$el).width(),
                    height: $('[data-js-image-block]', this.$el).height(),
                }
            }
            $('[data-js-image]', this.$el).css('transform', 'rotate('+this.rotate+'deg)');
            if ((this.rotate/90)%2 == 1) {
                $('[data-js-image-block]', this.$el).css({height: this.nativeSize.width});
            } else {
                $('[data-js-image-block]', this.$el).css({height: this.nativeSize.height});
            }
        },
        openImgInNewWindow: function () {
            window.open(this.imageSrc);
        }
    });

    return ModalLogAttachmentImage;
});
