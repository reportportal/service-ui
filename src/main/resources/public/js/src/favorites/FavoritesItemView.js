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

    var FavoritesItemView = Epoxy.View.extend({
        className: 'row rp-table-row',
        events: {
            'click [data-js-remove]': 'onClickRemove',
            'click [data-js-filter-edit]': 'onClickEdit',
            'click [data-js-filter-shared]': 'onClickEdit',
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
            '[data-js-remove]': 'attr: {disabled: notMyFilter}, classes: {disabled: notMyFilter}',
            '[data-js-filter-shared-icon]': 'classes: {disabled: notMyFilter}',
        },
        initialize: function() {
            this.render();
        },
        template: 'tpl-favorite-item',
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRemove: function() {
            var self = this;
            var modal = new ModalConfirm({
                headerText: Localization.dialogHeader.deleteFilter,
                bodyText: Util.replaceTemplate(Localization.dialog.deleteFilter, this.model.get('name').escapeHtml()),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            });
            modal.show()
                .done(function() {
                    self.destroy();
                    return self.model.remove();
                });
        },
        onClickEdit: function() {
            this.model.editMainInfo();
        },
        destroy: function() {
            this.remove();
        }
    });

    return  FavoritesItemView;

});
