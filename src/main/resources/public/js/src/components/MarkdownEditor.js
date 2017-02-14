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
    var Epoxy = require('backbone-epoxy');
    var SimpleMDE = require('simplemde');
    var Util = require('util');


    var MainBreadcrumbsComponent = Epoxy.View.extend({
        className: 'markdown-editor',
        template: 'tpl-markdown-editor',
        events: {
        },

        initialize: function(options) {
            this.render();
            var self = this;
            var simplemde = new SimpleMDE({
                element: $('[data-js-text-area]', this.$el).get(0),
                status: false,
                toolbar: ['heading-1', 'heading-2', 'heading-3', 'clean-block', '|', 'bold', 'italic', 'strikethrough', '|', 'unordered-list', 'ordered-list', '|', 'image', 'link', '|', 'quote', 'code', '|', 'preview'],
            });
            simplemde.codemirror.on("change", function(){
                self.trigger('change', simplemde.value());
            });
        },
        render: function() {
            this.$el.html(Util.templates(this.template, {}));
        },
    });


    return MainBreadcrumbsComponent;
});
