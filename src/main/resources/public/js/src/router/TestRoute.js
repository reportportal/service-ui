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

    var TestRoute = function() {
        this.tests = {};
    };

    TestRoute.prototype.addTest = function(testName, func) {
        this.tests[testName] = func;
    };

    TestRoute.prototype.checkTest = function(testName, func) {
        var testRouteSelf = this;

        return function() {
            var args = arguments;
            var context = this;
            if(!testRouteSelf.tests[testName]) throw 'TestRoute: test not defined';
            testRouteSelf.tests[testName]()
                .done(function(){
                    func.apply(context, args);
                });
        }
    };

    return TestRoute;
});
