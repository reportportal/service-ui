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
define(function (require, exports, module) {
    'use strict';

    var Util = require('util');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var App = require('app');
    var ModalEditDashboard = require('modals/modalEditDashboard');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');

    var config = App.getInstance();

    var DashboardListItemView = Epoxy.View.extend({
        className: 'dashboard-list-item-view',
        template: 'tpl-dashboard-list-item',

        events: {
            'click [data-js-edit]': 'onClickEdit',
            'click [data-js-remove]': 'onClickRemove',
            'click': 'onClickItem',
        },

        bindings: {
            '[data-js-name]': 'html: getName',
            '[data-js-description]': 'text: displayingDescription',
            '[data-js-share-icon]': 'classes: {hide: not(isMy)}, attr: {title: sharedTitle}',
            '[data-js-global-icon]': 'classes: {hide: isMy}, attr: {title: sharedTitle}',
            '[data-js-icon-description]': 'text: sharedTitle',
            '[data-js-shared-container]': 'classes: {hide: not(isShared)}',
            '[data-js-edit]': 'classes: {hide: not(isMy)}',
            '[data-js-remove]': 'classes: {hide: not(isMy)}',
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
                get: function(name, search){
                    return (search ? Util.textWrapper(name, search) : name).escapeScript();
                }
            }
        },

        initialize: function(options) {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickEdit: function(e) {
            e.stopPropagation();
            var self = this;
            (new ModalEditDashboard({
                dashboardCollection: this.model.collection,
                dashboardModel: this.model,
                mode: 'edit',
            })).show().done(function(newModel) {
                self.model.set(newModel.toJSON());
            })
        },
        onClickRemove: function(e) {
            e.stopPropagation();
            var self = this;
            (new ModalConfirm({
                headerText: Localization.dialogHeader.dashboardDelete,
                bodyText: Util.replaceTemplate(Localization.dialog.dashboardDelete, this.model.get('name')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            })).show().done(function() {
                self.model.collection.remove(self.model);
                self.destroy();
            })
        },
        onClickItem: function() {
            config.router.navigate(this.model.get('url'), {trigger: true});
        },

        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.remove();
        },
    });


    return DashboardListItemView;
});
