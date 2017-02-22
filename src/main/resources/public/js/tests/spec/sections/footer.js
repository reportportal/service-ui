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
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Util = require('util');
    var App = require('app');
    var storageService = require('storageService');
    var SingletonAppModel = require('model/SingletonAppModel');
    var Main = require('mainview');
    var Footer = require('sections/footer');



    $('body > #sandbox').remove();
    $('body').append('<div id="sandbox"></div>');

    describe('footer section test', function () {

        var sandbox,
            footerView;

        beforeEach(function() {

            sandbox = $("#sandbox");
            sandbox.append('<section id="pageFooter" class="footer"></section>')
            footerView = new Footer({el: $('#sandbox > #pageFooter.footer')}).render();

        });

        afterEach(function () {
            footerView && footerView.destroy();
            footerView = null;
            sandbox.off().empty();
        });

        it ('should render footer view', function () {
            expect(footerView).toBeDefined();
            expect($('#pageFooter.footer', sandbox).length).toEqual(1);
        });

        it ('should render footer breadcrumbs', function () {
            expect($('.breadcrumbs', sandbox).length).toEqual(1);
        });

        it('should destroy footer view', function () {
            footerView.destroy();
            expect($('#pageFooter.footer', sandbox).html()).toEqual('');
        });

        it ('should trigger click event after clicking on links', function () {
            var links = $('.breadcrumbs a', sandbox);
            links.each(function (index) {
                spyOnEvent($(this), 'click')
                $(this).click();
                expect('click').toHaveBeenTriggeredOn(this);
            })
        })
    });
});