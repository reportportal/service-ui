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
    var Localization = require('localization');

    var ProjectEventsItemView = Epoxy.View.extend({

        className: 'project-events-item row rp-table-row',
        template: 'tpl-project-events-table-item',
        valueTemplate: 'tpl-project-events-item-value',
        events: {
            'click [data-js-time-format]': 'toggleTimeView'
        },
        bindings: {
            '[data-js-time-from-now]': 'text: lastModifiedDateFromNow',
            '[data-js-time-exact]': 'text: lastModifiedDateFormat',
            '[data-js-user]': 'text: userRef',
            '[data-js-action]': 'localizedActionType: actionType',
            '[data-js-object-type]': 'localizedObjectType: objectType',
            '[data-js-object-name]': 'text: objectName',
            '[data-js-old-val]': 'valueString: history',
            '[data-js-new-val]': 'valueString: history'
        },
        bindingHandlers: {
            localizedActionType: {
                set: function ($element, value) {
                    $element.text(Localization.projectEvents.eventTypes[value]);
                }
            },
            localizedObjectType: {
                set: function ($element, value) {
                    $element.text(Localization.projectEvents.objectTypes[value]);
                }
            },
            valueString: {
                set: function ($element, values) {
                    var link;
                    var isOld = $element.hasClass('old-val-grid-cell');
                    var $wrapper = $(document.createElement('div')).addClass('values-wrapper');

                    _.each(values, function (value) {
                        var $valueView;
                        var oldLinks = [];
                        var newLinks = [];
                        var actionType = this.view.model.get('actionType');
                        if (
                            actionType === 'post_issue'
                            || actionType === 'link_issue'
                            || actionType === 'unlink_issue'
                        ) {
                            _.each(value, function (val, key) {
                                var linkParts;
                                if (key === 'newValue' || key === 'oldValue') {
                                    _.each(val.split(','), function (item) {
                                        linkParts = item.split(':');
                                        link = '<a target="_blank" href="' + linkParts[1] + ':' + linkParts[2] + '">' + linkParts[0] + '</a>';
                                        (key === 'newValue') ? newLinks.push(link) : oldLinks.push(link);
                                    });
                                }
                            });
                        }
                        $valueView = $(document.createElement('div')).addClass('value-item').html(
                            Util.templates(this.view.valueTemplate, {
                                valueFieldName: value.field,
                                value: isOld ?
                                    ((value.oldValue && oldLinks.length) ? oldLinks.join(', ') : value.oldValue) :
                                    ((value.newValue && newLinks.length) ? newLinks.join(', ') : value.newValue)
                            })
                        );
                        $wrapper.append($valueView);
                    }.bind(this));
                    $element.html($wrapper);
                }
            }
        },
        initialize: function (options) {
            this.model = options.eventModel;
            this.render();
        },
        render: function () {
            this.$el.html(Util.templates(this.template, {}));
        },
        toggleTimeView: function () {
            this.model.collection.trigger('change:time:format');
        },
        update: function () {

        },
        onDestroy: function () {
            this.$el.html('');
            delete this;
        }
    });
    return ProjectEventsItemView;
});
