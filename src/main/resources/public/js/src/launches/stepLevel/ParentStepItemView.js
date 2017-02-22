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

    var $ = require('jquery');
    var Backbone = require('backbone');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var App = require('app');
    var Localization = require('localization');
    var ItemDurationView = require('launches/common/ItemDurationView');
    var StepLogDefectTypeView = require('launches/common/StepLogDefectTypeView');
    var ModalLaunchItemEdit = require('modals/modalLaunchItemEdit');

    var config = App.getInstance();

    var ParentStepItemView = Epoxy.View.extend({
        template: 'tpl-launch-step-parent',
        events: {
        },
        bindings: {
        },
        bindingHandlers: {
        },
        computeds: {
        },
        initialize: function(options) {
            this.render();
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {model: this.model.toJSON(), getParentUrl: this.getParentUrl}));
        },
        getParentUrl: function(id){
            var url = window.location.hash;
            return url.split('|')[0] + "/" + id;
        },
        destroy: function () {
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.$el.html('');
            delete this;
        },
    });

    return ParentStepItemView;
});
