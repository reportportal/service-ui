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
    var App = require('app');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');
    var _ = require('underscore');

    var config = App.getInstance();

    var DashboardListItemView = Epoxy.View.extend({
        className: 'dashboard-list-item-view',
        templateBlock: 'tpl-dashboard-block-item',
        templateList: 'tpl-dashboard-list-item',
        events: {
            'click [data-js-edit]': 'onClickEdit',
            'click [data-js-remove]': 'onClickRemove',
            'click [data-js-dashboard-info]': 'onClickItem'
        },

        bindings: {
            '[data-js-name]': 'html: getName',
            '[data-js-owner]': 'text: owner',
            '[data-js-description]': 'text: displayingDescription, classes: {hide: not(description)}',
            '[data-js-share-icon]': 'classes: {hide: not(isMy)}, attr: {title: sharedTitle}',
            '[data-js-global-icon]': 'classes: {hide: isMy}, attr: {title: sharedTitle}',
            '[data-js-icon-description]': 'text: sharedTitle',
            '[data-js-shared-container]': 'classes: {hide: not(share)}',
            '[data-js-edit]': 'classes: {hide: not(isMy)}',
            '[data-js-remove]': 'classes: {hide: not(canRemove)}'
        },
        computeds: {
            displayingDescription: {
                deps: ['description'],
                get: function (description) {
                    if (description === null) {
                        return '';
                    }
                    return description;
                }
            },
            getName: {
                deps: ['name', 'search'],
                get: function (name, search) {
                    return (search ? Util.textWrapper(name, search) : name).escapeScript();
                }
            },
            canRemove: {
                deps: ['isMy'],
                get: function (isMy) {
                    return (config.userModel.get('isAdmin') ||
                    config.userModel.getRoleForCurrentProject() === config.projectRolesEnum.project_manager ||
                    isMy);
                }
            }
        },
        initialize: function (option) {
            this.blockTemplate = option.blockTemplate;
            this.render();
        },
        render: function () {
            if (this.blockTemplate) {
                this.$el.html(Util.templates(this.templateBlock, {}));
            } else {
                this.$el.html(Util.templates(this.templateList, {}));
            }
            this.setPreview();
        },
        onClickEdit: function (e) {
            var self = this;
            e.stopPropagation();
            (new ModalEditDashboard({
                dashboardCollection: this.model.collection,
                dashboardModel: this.model,
                mode: 'edit'
            })).show().done(function (newModel) {
                self.model.set(newModel.toJSON());
            });
        },
        onClickRemove: function (e) {
            var self = this;
            e.stopPropagation();
            (new ModalConfirm({
                headerText: Localization.dialogHeader.dashboardDelete,
                bodyText: Util.replaceTemplate(Localization.dialog.dashboardDelete,
                    this.model.get('name')),
                confirmText: this.model.get('isMy') ? '' : Localization.dialog.dashboardDeleteDangerConfirmText,
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete
            })).show().done(function () {
                self.model.collection.remove(self.model);
                self.destroy();
            });
        },
        onClickItem: function () {
            if (this.model.get('isMy')) {
                config.trackingDispatcher.trackEventNumber(262);
            } else {
                config.trackingDispatcher.trackEventNumber(265);
            }
            config.router.navigate(this.model.get('url'), { trigger: true });
            config.mainScrollElement.scrollTop(0);
        },

        setPreview: function () {
            var id = this.model.get('id');
            var result = 0;
            _.each(this.model.get('id'), function (item, i) {
                result += id.charCodeAt(i);
            });
            $('[data-js-description-wrapper]', this.$el).addClass('preview-' + (result % 14));
        },

        onDestroy: function () {
            this.$el.remove();
        }
    });

    return DashboardListItemView;
});
