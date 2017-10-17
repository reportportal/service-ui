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

    var Epoxy = require('backbone-epoxy');
    var Util = require('util');
    var Urls = require('dataUrlResolver');
    var App = require('app');

    var config = App.getInstance();

    var LogItemModel = Epoxy.Model.extend({
        defaults: {
            id: '',
            binary_content: null,
            message: '',
            test_item: '',
            time: 0,
            active: false,
            empty: false,
            level: null // INFO, ERROR,
        },
        computeds: {
            timeString: {
                deps: ['time'],
                get: function (time) {
                    return Util.dateFormat(time);
                }
            },
            imagePath: {
                deps: ['binary_content'],
                get: function (binary_content) {
                    if (!binary_content || config.userModel.get('token') === config.userModel.defaults.token) { return ''; }
                    if (!~binary_content.content_type.search('image/')) {
                        var type = binary_content.content_type.split('/')[1];
                        switch (type) {
                            case 'CSS':
                            case 'css': return 'img/launch/attachments/css.svg';
                            case 'HTML':
                            case 'html': return 'img/launch/attachments/html.svg';
                            case 'JAVASCRIPT':
                            case 'javascript': return 'img/launch/attachments/js.svg';
                            case 'CSV':
                            case 'csv': return 'img/launch/attachments/csv.svg';
                            case 'JSON':
                            case 'json': return 'img/launch/attachments/json.svg';
                            case 'PHP':
                            case 'php': return 'img/launch/attachments/php.svg';
                            case 'XML':
                            case 'xml': return 'img/launch/attachments/xml.svg';
                            case 'PLAIN':
                            case 'plain': return 'img/launch/attachments/txt.svg';
                            case 'RAR':
                            case 'rar':
                            case 'TAZ':
                            case 'taz':
                            case 'TAR':
                            case 'tar':
                            case 'GZIP':
                            case 'gzip':
                            case 'ZIP':
                            case 'zip': return 'img/launch/attachments/archive.svg';
                            default: return 'img/launch/attachment.png';
                        }
                    }
                    return Urls.getFileById(binary_content.thumbnail_id);
                }
            },
            mainImagePath: {
                deps: ['binary_content'],
                get: function (binaryContent) {
                    if (binaryContent && binaryContent.id && config.userModel.get('token') !== config.userModel.defaults.token) {
                        if (!~binaryContent.content_type.search('image/')) {
                            return this.get('imagePath');
                        }
                        return Urls.getFileById(binaryContent.id);
                    }
                    return '';
                }
            },
            shortId: {
                deps: ['id'],
                get: function (id) {
                    return id.substr(20);
                }
            }
        }
    });

    return LogItemModel;
});
