/*
 * This file is part of Report Portal.
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */
define(function (require) {
    'use strict';

    var Util = require('util');
    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var UserModel = require('model/UserModel');

    var ApiBodyView = Epoxy.View.extend({
        className: 'api-body',
        template: 'tpl-api-body',

        events: {
            'change [data-js-select-type-input]': 'onChangeType'
        },

        initialize: function () {
            this.render();
            this.userModel = new UserModel();
            this.onChangeType();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onChangeType: function () {
            var type = $('[data-js-select-type-input]:checked', this.$el).val();
            this.loadApi(type);
        },
        loadApi: function (basePath) {
            var self = this;
            var $container = $('[data-js-iframe-container]', this.$el);
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', 'swagger-ui/index.html?url=' + basePath);
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('frameborder', '0');
            iframe.onload = function () {
                iframe.contentWindow.successStartCallback = function () {
                    self.$el.removeClass('load');
                };
                iframe.contentWindow.changeHeightCallback = function () {
                    iframe.style.height = iframe.contentWindow.document.body.clientHeight + 'px';
                };
                iframe.contentWindow.changeInfoCallback = function (info, path) {
                    $('[data-js-status]', self.$el).text('[ base url: ' + path + ' , api version: ' + info.version + ' ]');
                };
                iframe.contentWindow.failRequestCallback = function () {
                    self.userModel.logout();
                };
            };
            this.$el.addClass('load');
            $('[data-js-status]', this.$el).text('');
            $container.html(iframe);
        },
        onDestroy: function () {
            this.$el.empty();
        }
    });


    return ApiBodyView;
});
