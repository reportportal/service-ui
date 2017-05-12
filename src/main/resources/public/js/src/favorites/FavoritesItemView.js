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
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    var App = require('app');

    var config = App.getInstance();

    var FavoritesItemView = Epoxy.View.extend({
        className: 'row rp-table-row',
        events: {
            'click [data-js-remove]': 'onClickRemove',
            'click [data-js-filter-edit]': 'onClickEdit',
            'click [data-js-filter-shared]': 'onClickShared',
            'click [data-js-filter-link]': 'onClickName'
        },
        bindings: {
            ':el': 'classes: {"not-owner": notMyFilter}',
            '[data-js-filter-link]': 'text: name, attr: {href: url}, classes: {hide: not(isLaunch)}',
            '[data-js-filter-name]': 'text: name, classes: {hide: isLaunch}',
            '[data-js-description]': 'text: description',
            '[data-js-filter-options]': 'html: optionsString',
            '[data-js-owner]': 'text: owner',
            '[data-js-filter-shared]': 'classes: {hide: not(isShared)}, attr: {disabled: notMyFilter}',
            '[data-js-switch-to-launch]': 'checked: isLaunch',
            '[data-js-switch-to-launch-mobile]': 'checked: isLaunch',
            '[data-js-switch-to-launch-text]': 'text: isLaunchString',
            '[data-js-remove]': 'attr: {disabled: not(canRemove)}, classes: {disabled: not(canRemove)}',
            '[data-js-filter-shared-icon]': 'classes: {disabled: notMyFilter}'
        },
        computeds: {
            canRemove: {
                deps: ['notMyFilter'],
                get: function (notMyFilter) {
                    return (config.userModel.getRoleForCurrentProject() ===
                    config.projectRolesEnum.project_manager ||
                    !notMyFilter);
                }
            }
        },
        initialize: function () {
            this.render();
            this.listenTo(this.model, 'change:isLaunch', this.onSwitchOnLaunches);
        },
        template: 'tpl-favorite-item',
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        onSwitchOnLaunches: function () {
            config.trackingDispatcher.trackEventNumber(243);
        },
        onClickRemove: function () {
            config.trackingDispatcher.trackEventNumber(244);
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteFilter,
                bodyText: Util.replaceTemplate(
                    this.model.get('notMyFilter') ? Localization.dialog.deleteFilterDanger : Localization.dialog.deleteFilter,
                    this.model.get('name').escapeHtml()),
                confirmText: this.model.get('notMyFilter') ? Localization.dialog.deleteFilterDangerConfirmText : '',
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete
            });
            modal.show()
                .done(function () {
                    self.model.remove().always(function() {
                        self.destroy();
                        self.model.trigger('click:remove', self.model);
                    });
                });
            modal.$el.on('click', function (e) {
                var $target = $(e.target),
                    isCancel = $target.is('[data-js-cancel]'),
                    isDelete = $target.is('[data-js-ok]'),
                    isClose = ($target.is('[data-js-close]') || $target.is('[data-js-close] i'));
                if (isClose) {
                    config.trackingDispatcher.trackEventNumber(252);
                } else if (isCancel) {
                    config.trackingDispatcher.trackEventNumber(253);
                } else if (isDelete) {
                    config.trackingDispatcher.trackEventNumber(254);
                }
            });
        },
        onClickShared: function () {
            config.trackingDispatcher.trackEventNumber(246);
            this.model.editMainInfo();
        },
        onClickEdit: function () {
            config.trackingDispatcher.trackEventNumber(245);
            this.model.editMainInfo();
        },
        onClickName: function (e) {
            config.trackingDispatcher.trackEventNumber(242);
        },
        onDestroy: function () {
            this.$el.remove();
        }
    });

    return FavoritesItemView;
});
