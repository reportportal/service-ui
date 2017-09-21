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

    var _ = require('underscore');
    var langEn = require('localizations/en-EU');
    var langRu = require('localizations/ru-RU');
    var SingletonAppStorage = require('storage/SingletonAppStorage');

    var appStorage = new SingletonAppStorage();
    var lang = appStorage.get('appLanguage') || 'en';
    var langRuSafe = extendLoc(langEn, langRu);
    var Localization = {};

    function extendLoc(baseLoc, newLoc) {
        var result = _.cloneDeep(baseLoc);
        var consoleString = '';
        _.each(result, function (section, sectionKey) {
            _.each(section, function (item, itemKey) {
                if (newLoc[sectionKey] && newLoc[sectionKey][itemKey]) {
                    result[sectionKey][itemKey] = newLoc[sectionKey][itemKey];
                } else {
                    consoleString += sectionKey + ' -> ' + itemKey + '\n';
                }
            });
        });
        if ('DEBUG_STATE') {
            console.log('Undefined localization: \n' + consoleString);
        }
        return result;
    }

    switch (lang) {
    case 'ru':
        Localization = langRuSafe;
        break;
    default:
        Localization = langEn;
    }
    return Localization;
});
