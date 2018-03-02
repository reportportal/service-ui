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

    var $ = require('jquery');
    var ModalView = require('modals/_modalView');
    var Util = require('util');
    var Localization = require('localization');

    var ModalAnalyseLaunches = ModalView.extend({

        template: 'tpl-modal-analyse-launches',
        className: 'modal-analyse-launches',
        events: {
            'click [data-js-analyze]': 'onAnalyze'
        },
        initialize: function (options) {
            this.render();
            $('[value="' + options.analyzerMode + '"]', this.$el).attr('checked', 'checked');
        },
        render: function () {
            var footerButtons = [
                {
                    btnText: Localization.ui.cancel,
                    btnClass: 'rp-btn-cancel',
                    label: 'data-js-cancel'
                },
                {
                    btnText: Localization.ui.analyse,
                    btnClass: 'rp-btn-submit',
                    label: 'data-js-analyze'
                }
            ];
            this.$el.html(Util.templates(this.template, { footerButtons: footerButtons }));
        },
        onKeySuccess: function () {
            $('[data-js-analyze]', this.$el).focus().trigger('click');
        },

        onAnalyze: function () {
            this.successClose({
                analyzerMode: $('input:checked', this.$el).val()
            });
        }
    });

    return ModalAnalyseLaunches;
});
