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
define(function (require) {
    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');
    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    require('jquery-ui/widgets/slider');

    var SliderComponent = Epoxy.View.extend({
        className: 'slider-component',
        template: 'tpl-slider-component',
        events: {
            'click [data-js-item-label]': 'onClickItemLabel'
        },
        initialize: function (options) {
            // TODO: add support for vertical orientation & range functionality
            // options = {
            //     holder: $(''),
            //     items: [{ name: '', value: '' }],
            //     defaultVal: '',
            //     orientation: 'horizontal' || 'vertical'
            // };
            this.options = options;
            this.options.holder.html(this.$el);
            this.render();
        },
        render: function () {
            var self = this;
            var nameLabels = '';
            var labelWidth = this.$el.width() / this.options.items.length;
            this.$el.html(Util.templates(this.template, this.options));
            this.options.orientation ? this.$el.addClass(this.options.orientation) : this.$el.addClass('horizontal');
            this.slider = $('[data-js-slider-container]', this.$el).slider({
                min: 1,
                max: this.options.items.length,
                range: 'min',
                orientation: this.options.orientation || 'horizontal',
                change: function (event, ui) {
                    var activeIndex = ui.value;
                    $('[data-js-item-label]', self.$el).each(function (i, elem) {
                        (i <= activeIndex - 1) ? $(elem).addClass('active') : $(elem).removeClass('active');
                    });
                    self.active = self.options.items[activeIndex - 1].value;
                    self.trigger('change');
                }
            });
            $('[data-js-slider-container]', this.$el).css({ right: labelWidth / 2, left: labelWidth / 2, width: labelWidth * (this.options.items.length - 1) });

            _.each(this.options.items, function (item, index) {
                nameLabels += '<div class="item-label" data-js-item-label data-index="' + index + '" style="width: ' + labelWidth + 'px; ">' + item.name + '</div>';
            });
            $('[data-js-labels-container]', this.$el).html(nameLabels);

            this.slider.slider('value',  _.findIndex(this.options.items, { value: this.options.defaultVal }) + 1); // set default val
        },
        onClickItemLabel: function (e) {
            this.slider && this.slider.slider('value', $(e.currentTarget).data('index') + 1);
        },
        onDestroy: function () {
            this.slider.slider('destroy');
            this.$el.html('');
            delete this;
        }
    });

    return SliderComponent;
});
