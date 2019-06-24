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

define(function(require, exports, module) {
    'use strict';

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Localization = require('localization');
    var App = require('app');
    var config = App.getInstance();
    var UserModel = require('model/UserModel');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');


    var LoginLoginAuthButtonView = Epoxy.View.extend({
        className:'login-login-auth-button',
        template: 'tpl-new-login-auth-button',

        events: {
            'click [data-js-auth-button]': 'onClickButton',
        },

        initialize: function (options) {
            this.render();
            $('[data-js-auth-button]', this.$el).html(options.button);
            this.path = options.path;
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickButton: function () {
            window.location = window.location.protocol + '//' + window.location.host + '/uat' + this.path;
        },
    });

    return LoginLoginAuthButtonView;
});
