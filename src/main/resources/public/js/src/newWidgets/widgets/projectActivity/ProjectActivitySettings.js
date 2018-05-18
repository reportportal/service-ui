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

    var $ = require('jquery');
    var _ = require('underscore');
    var Localization = require('localization');

    var eventsItems = [
        { value: 'start_launch', name: Localization.forms.startLaunch },
        { value: 'finish_launch', name: Localization.forms.finishLaunch },
        { value: 'delete_launch', name: Localization.forms.deleteLaunch },
        { value: 'update_issue', name: Localization.forms.updateIssue },
        { value: 'create_user', name: Localization.forms.createUser },
        { value: 'update_dashboard', name: Localization.forms.updateDashboard },
        { value: 'update_widget', name: Localization.forms.updateWidget },
        { value: 'update_filter', name: Localization.forms.updateFilter },
        { value: 'update_bts', name: Localization.forms.updateBts },
        { value: 'update_project', name: Localization.forms.updateProject },
        { value: 'update_analyzer', name: Localization.forms.updateAutoAnalysis },
        { value: 'update_defects', name: Localization.forms.updateDefects },
        { value: 'import', name: Localization.forms.import }

    ];
    var groupedActions = {
        update_dashboard: ['create_dashboard', 'update_dashboard', 'delete_dashboard'],
        update_widget: ['create_widget', 'update_widget', 'delete_widget'],
        update_filter: ['create_filter', 'update_filter', 'delete_filter'],
        update_bts: ['create_bts', 'update_bts', 'delete_bts'],
        update_defects: ['update_defect', 'delete_defect'],
        update_issue: ['post_issue', 'link_issue', 'unlink_issue'],
        import: ['start_import', 'finish_import'],
        update_analyzer: ['update_analyzer', 'generate_index', 'delete_index']
    };

    return {
        getConfig: function () {
            return {
                gadget_name: Localization.widgets.projectActivityPanel,
                img: 'project-activity-panel.svg',
                description: Localization.widgets.projectActivityPanelDescription,
                widget_type: 'activity_panel', // TODO remove after refactoring,
                hasPreview: false
            };
        },
        getSettings: function () {
            var async = $.Deferred();
            async.resolve([
                {
                    control: 'dropDown',
                    options: {
                        label: Localization.widgets.widgetCriteria,
                        items: eventsItems,
                        placeholder: Localization.wizard.criteriaSelectTitle,
                        multiple: true,
                        getValue: function (model, self) {
                            var widgetOptions = model.getWidgetOptions();
                            var result = [];
                            if (widgetOptions && widgetOptions.actionType) {
                                _.each(widgetOptions.actionType, function (action) {
                                    _.each(groupedActions, function (groupedAction, groupedActionKey) {
                                        if (~groupedAction.indexOf(action)) {
                                            result.push(groupedActionKey);
                                        } else {
                                            result.push(action);
                                        }
                                    });
                                });
                                return _.uniq(result);
                            }
                            return _.map(self.model.get('items'), function (item) {
                                return item.value;
                            });
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            var result = [];
                            _.each(value, function (activityType) {
                                if (_.has(groupedActions, activityType)) {
                                    result = result.concat(groupedActions[activityType]);
                                } else {
                                    result.push(activityType);
                                }
                            });
                            widgetOptions.actionType = _.uniq(result);
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'input',
                    options: {
                        name: Localization.widgets.items,
                        min: 1,
                        max: 150,
                        def: 50,
                        numOnly: true,
                        action: 'limit'
                    }
                },
                {
                    control: 'inputItems',
                    options: {
                        entity: 'user',
                        label: Localization.widgets.typeUserName,
                        placeholder: Localization.widgets.enterUserName,
                        minItems: 0,
                        maxItems: 64,
                        getValue: function (model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (widgetOptions.userRef) {
                                return widgetOptions.userRef;
                            }
                            return [];
                        },
                        setValue: function (value, model) {
                            var widgetOptions = model.getWidgetOptions();
                            if (!value || !value.length || (value.length === 1 && !value[0])) {
                                widgetOptions.userRef && delete widgetOptions.userRef;
                            } else {
                                widgetOptions.userRef = value;
                            }
                            model.setWidgetOptions(widgetOptions);
                        }
                    }
                },
                {
                    control: 'static',
                    options: {
                        action: 'criteria',
                        fields: ['name', 'userRef', 'last_modified', 'actionType', 'objectType', 'projectRef', 'loggedObjectRef', 'history']
                    }
                }
            ]);

            return async.promise();
        }
    };
});
