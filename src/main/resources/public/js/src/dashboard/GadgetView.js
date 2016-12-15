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


    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var ModalConfirm = require('modals/modalConfirm');
    var Localization = require('localization');

    var config = App.getInstance();

    var GadgetView = Epoxy.View.extend({
        className: 'gadget-view grid-stack-item',
        template: 'tpl-gadget-view',
        events: {
            'click [data-js-gadget-refresh]': 'onClickRefresh',
            'click [data-js-gadget-remove]': 'onClickRemove',
        },

        bindings: {
            '[data-js-name]': 'text: name',
            '[data-js-comment]': 'classes: {hide: not(description)}',
            '[data-js-shared]': 'classes: {hide: not(isShared)}',
            '[data-js-widget-type]': 'text: gadgetName',
        },
        initialize: function(options) {
            this.render();
            this.$el.addClass('load');
            this.$el.attr({'data-id': this.model.get('id')});
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
        onClickRefresh: function() {
            this.update();
        },
        update: function() {
            this.$el.addClass('load');
            var self = this;
            this.model.update()
                .always(function() {
                    self.$el.removeClass('load')
                })
        },
        onClickRemove: function(e) {
            e.stopPropagation();
            var self = this;
            (new ModalConfirm({
                headerText: Localization.dialogHeader.deletedWidget,
                bodyText: Util.replaceTemplate(Localization.dialog.deletedWidget, this.model.get('name')),
                okButtonDanger: true,
                cancelButtonText: Localization.ui.cancel,
                okButtonText: Localization.ui.delete,
            })).show().done(function() {
                self.model.trigger('remove:view', self); // for gridstack
                self.model.collection.remove(self.model);
                self.destroy();
            })
        },
        activateGadget: function() {
            this.update();
        },
        getDataForGridStack: function() {
            return [this.el, this.model.get('x'), this.model.get('y'), this.model.get('width'), this.model.get('height')];
        },
        destroy: function () {
            this.$el.remove();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            delete this;
        },
    });


    return GadgetView;
});
