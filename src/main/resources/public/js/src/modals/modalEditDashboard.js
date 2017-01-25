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

    var ModalView = require('modals/_modalView');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var UserModel = require('model/UserModel');

    var ModalEditDashboard = ModalView.extend({
        template: 'tpl-modal-edit-dashboard',
        className: 'modal-edit-dashboard',

        bindings: {
            '[data-js-name-input]': 'value: name',
            '[data-js-is-shared]': 'checked: isShared',
            '[data-js-description]': 'value: description',
        },

        events: {
            'click [data-js-ok]': 'onClickOk',
        },

        initialize: function(options) {
            var dashboardModel = options.dashboardModel;
            var currentUserName = (dashboardModel.get('owner') === '') ? (new UserModel().get('name')) : dashboardModel.get('owner');
            var dashboardNames = _.map(options.dashboardCollection.models, function(model) {
                if (dashboardModel.get('name') != model.get('name') && currentUserName === model.get('owner')) {
                    return model.get('name');
                }
            });
            this.render(options);

            this.model = new Epoxy.Model({
                name: dashboardModel.get('name'),
                isShared: dashboardModel.get('isShared'),
                description: dashboardModel.get('description'),
            });
            Util.hintValidator($('[data-js-name-input]', this.$el), [{
                validator: 'minMaxRequired',
                type: 'dashboardName',
                min: 3,
                max: 128
            }, {validator: 'noDuplications', type: 'dashboardName', source: dashboardNames, isCaseSensitive: true}]);
            Util.hintValidator($('[data-js-description]', this.$el), {
                validator: 'maxRequired',
                type: '',
                max: 256
            });
        },
        render: function(options) {
            this.$el.html(Util.templates(this.template, options));
        },
        onKeySuccess: function () {
            $('[data-js-ok]', this.$el).focus().trigger('click');
        },
        onClickOk: function() {
            $('[data-js-name-input]', this.$el).trigger('validate');
            if ($('.validate-error', this.$el).length) return;
            this.successClose(this.model);
        }

    });

    return ModalEditDashboard;
});