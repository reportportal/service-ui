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

define(function (require) {
    'use strict';

    var $ = require('jquery');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Service = require('coreService');

    var SingletonURLParamsModel = require('model/SingletonURLParamsModel');
    var SingletonAppStorage = require('storage/SingletonAppStorage');

    var DemoLoginLoginView = require('demoLogin/demoLoginLoginView');

    var TwitterNewsComponent = require('components/twitterNewsComponent/TwitterNewsComponent');

    var DemoLoginView = Epoxy.View.extend({

        className: 'login-page demo-login',
        template: 'tpl-demo-login',
        events: {
            'click [data-js-logo]': 'onClickLogo',
            'click [data-js-gh-link]': 'onClickGitHub',
            'click [data-js-fb-link]': 'onClickFaceBook',
            'click [data-js-yt-link]': 'onClickYouTube',
            'click [data-js-tw-link]': 'onClickTwitter',
            'click [data-js-vk-link]': 'onClickVk',
            'click [data-js-sl-link]': 'onClickSlack',
            'click [data-js-ml-link]': 'onClickMail',
        },
        onClickGitHub: function () {
            config.trackingDispatcher.trackEventNumber(528);
        },
        onClickFaceBook: function () {
            config.trackingDispatcher.trackEventNumber(529);
        },
        onClickYouTube: function () {
            config.trackingDispatcher.trackEventNumber(531);
        },
        onClickTwitter: function () {
            config.trackingDispatcher.trackEventNumber(530);
        },
        onClickVk: function () {
            config.trackingDispatcher.trackEventNumber(532);
        },
        onClickSlack: function () {
            config.trackingDispatcher.trackEventNumber(533);
        },
        onClickMail: function () {
            config.trackingDispatcher.trackEventNumber(534);
        },
        initialize: function () {
            var self = this;
            this.storage = new SingletonAppStorage();
            this.model = new (Epoxy.Model.extend({
                defaults: {
                    blockTime: 0
                }
            }))();
            if (this.storage.get('login_block_time')) {
                var secondsFromLastBlocking = ((Date.now() - this.storage.get('login_block_time')) / 1000).toFixed();

                if (secondsFromLastBlocking <= 30) {
                    this.model.set('blockTime', 30 - secondsFromLastBlocking);
                    this.blockFormCountdown(30 - secondsFromLastBlocking);
                }
            }

            this.render();
            this.twitterComponent = new TwitterNewsComponent();
            $('[data-js-twitter-container]', this.$el).html(this.twitterComponent.$el);
            var urlModel = new SingletonURLParamsModel();

            if (urlModel.get('reset')) {
                Service.validateRestorationKey(urlModel.get('reset'))
                    .done(function (response) {
                        if (response.is) {
                            self.restoreKey = urlModel.get('reset');
                            self.openResetPassword();
                        } else {
                            self.showRestorationError();
                        }
                    })
                    .fail(function () {
                        self.showRestorationError();
                    });
            } else if (urlModel.get('errorAuth')) {
                Util.ajaxFailMessenger(null, null, urlModel.get('errorAuth'));
                this.openLogin();
            } else {
                this.openLogin();
            }
        },

        render: function () {
            this.$el.html(Util.templates(this.template, {}));
            this.subviewContainer = $('[data-js-subpage-container]', this.$el);
        },

        openLogin: function () {
            if (this.loginSubView) {
                this.destroySubView();
            }
            this.loginSubView = new DemoLoginLoginView({ loginModel: this.model });
            this.listenTo(this.loginSubView, 'blockLoginForm', this.blockLoginForm);
            this.subviewContainer.html(this.loginSubView.el);
        },

        onClickLogo: function () {
            window.open('http://reportportal.io/');
        },
        blockLoginForm: function () {
            var date = Date.now();
            this.storage.set('login_block_time', date);
            this.blockFormCountdown(30);
        },

        blockFormCountdown: function (seconds) {
            var time = seconds;
            var self = this;
            this.timer = setInterval(function () {
                time--;
                if (time < 0) {
                    clearInterval(self.timer);
                } else {
                    self.model.set('blockTime', time);
                }
            }, 1000);
        },

        destroySubView: function () {
            this.loginSubView.destroy();
            this.stopListening();
        },

        showRestorationError: function () {
            this.openLogin();
            Util.ajaxFailMessenger(null, 'restorationExpired');
        },

        onDestroy: function () {
            clearInterval(this.timer);
            this.twitterComponent && this.twitterComponent.destroy();
            this.remove();
        }
    });

    return DemoLoginView;
});
