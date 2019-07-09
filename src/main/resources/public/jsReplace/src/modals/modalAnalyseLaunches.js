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
            'click [data-js-analyze]': 'onAnalyze',
            'change input': 'onChange'
        },
        initialize: function (options) {
            this.render();
            $('input[value="' + options.analyzerMode + '"]', this.$el).attr('checked', 'checked');
            $('input[value="TO_INVESTIGATE"]', this.$el).attr('checked', 'checked');
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
        onChange: function() {
            this.hideWarningBlock();
        },
        onKeySuccess: function () {
            $('[data-js-analyze]', this.$el).focus().trigger('click');
        },
        onAnalyze: function () {
            var strategy = $('[data-js-strategy-options] input:checked', this.$el).val();
            var extendedOptions = [];
            $('[data-js-extended-strategy-options] input:checked', this.$el).each(function(){
                extendedOptions.push($(this).val());
            });
            if (!extendedOptions.length) {
                this.showWarningBlock(Localization.dialog.analyseWarning1);
                return;
            }
            if (strategy === 'CURRENT_LAUNCH' && ~extendedOptions.indexOf('AUTO_ANALYZED') && ~extendedOptions.indexOf('MANUALLY_ANALYZED')) {
                this.showWarningBlock(Localization.dialog.analyseWarning2);
                return;
            }
            this.successClose({
                analyzerMode: $('[data-js-strategy-options] input:checked', this.$el).val(),
                analyzeItemsMode: extendedOptions,
            });
        }
    });

    return ModalAnalyseLaunches;
});
