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
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var SingletonRegistryInfoModel = require('model/SingletonRegistryInfoModel');
    var LoginVersionsItemView = require('login/loginVersions/LoginVersionsItemView');
    var LoginVersionsCollection = require('login/loginVersions/LoginVersionsCollection');

    var LoginVersionsView = Epoxy.View.extend({
        className: 'login-versions',
        template: 'tpl-login-versions',

        initialize: function () {
            var registryModel = new SingletonRegistryInfoModel();
            var self = this;
            this.renderViews = [];
            this.collection = new LoginVersionsCollection();
            this.listenTo(this.collection, 'add', this.onAddService);
            this.render();
            registryModel.ready.done(function () {
                _.each(registryModel.get('services'), function (service) {
                    self.collection.add(service.build);
                });
            });
            $.ajax({
                url: '//status.reportportal.io/versions',
                dataType: 'jsonp',
                jsonp: 'jsonp',
                crossDomain: true,
                async: true
            })
                .done(function (data) {
                    registryModel.ready.done(function () {
                        _.each(self.collection.models, function (model) {
                            model.set({ updateInfo: data });
                        });
                    });
                });
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onAddService: function (model) {
            var serviceView = new LoginVersionsItemView({ model: model });
            this.renderViews.push(serviceView);
            $('[data-js-build-versions]', this.$el).append(serviceView.$el);
        },
        onDestroy: function () {
            _.each(this.renderViews, function (view) {
                view.destroy();
            });
        }
    });

    return LoginVersionsView;
});
