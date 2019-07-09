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

define(function (require) {
    'use strict';

    var Epoxy = require('backbone-epoxy');

    var LoginVersionsCollection = Epoxy.Model.extend({
        defaults: {
            branch: '',
            description: '',
            name: '',
            repo: '',
            version: '',
            updateInfo: {}
        },
        computeds: {
            newVersionTitle: {
                deps: ['repo', 'version', 'updateInfo'],
                get: function (repo, version, updateInfo) {
                    if (!repo || !updateInfo[repo]) {
                        return '';
                    }
                    if (this.semverCompare(updateInfo[repo], version) === 1) {
                        return 'Available new version: ' + updateInfo[repo];
                    }
                    return '';
                }
            },
            isNewVersion: {
                deps: ['newVersionTitle'],
                get: function (newVersionTitle) {
                    return !!newVersionTitle;
                }
            }
        },
        semverCompare: function (currentVersion, newVersion) {
            var currentVersionObject;
            var newVersionObject;
            var compareRezult;
            function parseVersion(version) {
                var identifiersSplit = version.split('+');
                var modificatorSplit = identifiersSplit[0].split('-');
                var versionsSplit = modificatorSplit[0].split('.');
                modificatorSplit.shift();
                return {
                    identificator: identifiersSplit[1],
                    modificator: modificatorSplit.join('-'),
                    versions: versionsSplit
                };
            }
            function compareVersions(curArray, newArray) {
                var maxLength = Math.max(currentVersionObject.versions.length,
                    newVersionObject.versions.length);
                var i;
                for (i = 0; i < maxLength; i += 1) {
                    if (!curArray[i]) {
                        return -1;
                    }
                    if (!newArray[i]) {
                        return 1;
                    }
                    if (curArray[i] > newArray[i]) {
                        return 1;
                    }
                    if (curArray[i] < newArray[i]) {
                        return -1;
                    }
                }
                return 0;
            }
            function compareModificator(curModificator, nextModificator) {
                if (curModificator === nextModificator) {
                    return 0;
                }
                if (curModificator === '') {
                    return 1;
                }
                if (nextModificator === '') {
                    return -1;
                }
                if (curModificator > nextModificator) {
                    return 1;
                }
                return -1;
            }
            currentVersionObject = parseVersion(currentVersion);
            newVersionObject = parseVersion(newVersion);
            compareRezult = compareVersions(currentVersionObject.versions,
                newVersionObject.versions);
            if (compareRezult !== 0) {
                return compareRezult;
            }
            return compareModificator(currentVersionObject.modificator,
                newVersionObject.modificator);
        }
    });

    return LoginVersionsCollection;
});
