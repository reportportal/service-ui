/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import {
  EntityDropdown,
  EntityItemStartTime,
  EntitySearch,
  EntityContains,
  EntityInputConditional,
} from 'components/filterEntities';
import {
  CONDITION_IN,
  CONDITION_BETWEEN,
  ACTIVITIES,
  CONDITION_CNT,
  ENTITY_OBJECT_NAME,
  ENTITY_EVENT_NAME,
  ENTITY_CREATED_AT,
  ENTITY_SUBJECT_NAME,
  ENTITY_EVENTS_OBJECT_TYPE,
  ENTITY_SUBJECT_TYPE,
  ENTITY_PROJECT_NAME,
} from 'components/filterEntities/constants';
import {
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  POST_ISSUE,
  LINK_ISSUE,
  UNLINK_ISSUE,
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  DELETE_DASHBOARD,
  CREATE_WIDGET,
  UPDATE_WIDGET,
  DELETE_WIDGET,
  CREATE_FILTER,
  UPDATE_FILTER,
  DELETE_FILTER,
  CREATE_INTEGRATION,
  UPDATE_INTEGRATION,
  DELETE_INTEGRATION,
  UPDATE_PROJECT,
  UPDATE_ANALYZER,
  GENERATE_INDEX,
  DELETE_INDEX,
  CREATE_DEFECT,
  UPDATE_DEFECT,
  DELETE_DEFECT,
  ACTIONS_WITH_IMPORT,
  UPDATE_ITEM,
  LINK_ISSUE_AA,
  ANALYZE_ITEM,
  CREATE_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  MATCHED_PATTERN,
  CREATE_INVITATION_LINK,
  ASSIGN_USER,
  UNASSIGN_USER,
  CHANGE_ROLE,
  UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS,
  CREATE_PROJECT,
  IMPORT as EVENT_ACTIONS_IMPORT,
  START_IMPORT,
  FINISH_IMPORT,
  MARK_LAUNCH_AS_IMPORTANT,
  UNMARK_LAUNCH_AS_IMPORTANT,
} from 'common/constants/actionTypes';
import {
  DASHBOARD,
  LAUNCH,
  WIDGET,
  FILTER,
  IMPORT,
  PROJECT,
  DEFECT_TYPE,
  USER,
  ITEM_ISSUE,
  INTEGRATION,
  EMAIL_CONFIG,
  PATTERN_RULE,
  EMAIL_CONFIG_FILTERING_OPTION,
  DEFECT_TYPE_FILTERING_OPTION,
  ITEM_ISSUE_FILTERING_OPTION,
  PATTERN_RULE_FILTERING_OPTION,
  INDEX,
  INVITATION_LINK,
  INVITATION_LINK_FILTERING_OPTION,
  APPLICATION,
  RULE,
} from 'common/constants/eventsObjectTypes';
import {
  actionMessages,
  objectTypesMessages,
  subjectTypesMessages,
} from 'common/constants/localization/eventsLocalization';
import { ADMIN_EVENT_MONITORING_PAGE_EVENTS } from 'components/main/analytics/events';
import { useSelector } from 'react-redux';

const messages = defineMessages({
  timeCol: { id: 'EventsGrid.timeCol', defaultMessage: 'Time' },
  subjectNameCol: { id: 'EventsGrid.subjectNameCol', defaultMessage: 'Subject Name' },
  subjectTypeCol: { id: 'EventsGrid.subjectTypeCol', defaultMessage: 'Subject Type' },
  projectNameCol: { id: 'EventsGrid.projectNameCol', defaultMessage: 'Project Name' },
  actionCol: { id: 'EventsGrid.actionCol', defaultMessage: 'Action' },
  objectTypeCol: { id: 'EventsGrid.objectTypeCol', defaultMessage: 'Object Type' },
  objectNameCol: { id: 'EventsGrid.objectNameCol', defaultMessage: 'Object Name' },
  oldValueCol: { id: 'EventsGrid.oldValueCol', defaultMessage: 'Old Value' },
  newValueCol: { id: 'EventsGrid.newValueCol', defaultMessage: 'New Value' },
  contains: { id: 'EventsGrid.contains', defaultMessage: 'Contains' },
  subjectNamePlaceholder: {
    id: 'EventsGrid.userSearchPlaceholder',
    defaultMessage: 'Subject name',
  },
});

export const EventsEntities = (props) => {
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const bindDefaultValue = (key, options = {}) => {
    const { filterValues } = props;

    if (key in filterValues) {
      return filterValues[key];
    }

    return {
      filteringField: key,
      value: '',
      ...options,
    };
  };

  const getEntities = () => {
    return [
      {
        id: ACTIVITIES,
        component: EntityContains,
        value: bindDefaultValue(ACTIVITIES),
        title: formatMessage(messages.contains),
        active: true,
        removable: false,
      },
      {
        id: ENTITY_PROJECT_NAME,
        component: EntityInputConditional,
        value: bindDefaultValue(ENTITY_PROJECT_NAME, {
          condition: CONDITION_CNT,
        }),
        title: formatMessage(messages.projectNameCol),
        active: true,
        removable: false,
      },
      {
        id: ENTITY_EVENT_NAME,
        component: EntityDropdown,
        value: bindDefaultValue(ENTITY_EVENT_NAME, {
          condition: CONDITION_IN.toUpperCase(),
        }),
        title: formatMessage(messages.actionCol),
        active: true,
        removable: false,
        customProps: {
          multiple: true,
          selectAll: true,
          actionToGroup: {
            [START_IMPORT]: ACTIONS_WITH_IMPORT,
            [FINISH_IMPORT]: ACTIONS_WITH_IMPORT,
          },
          options: [
            {
              label: formatMessage(actionMessages[CREATE_DASHBOARD]),
              value: CREATE_DASHBOARD,
            },
            {
              label: formatMessage(actionMessages[UPDATE_DASHBOARD]),
              value: UPDATE_DASHBOARD,
            },
            {
              label: formatMessage(actionMessages[DELETE_DASHBOARD]),
              value: DELETE_DASHBOARD,
            },
            {
              label: formatMessage(actionMessages[CREATE_WIDGET]),
              value: CREATE_WIDGET,
            },
            {
              label: formatMessage(actionMessages[UPDATE_WIDGET]),
              value: UPDATE_WIDGET,
            },
            {
              label: formatMessage(actionMessages[DELETE_WIDGET]),
              value: DELETE_WIDGET,
            },
            {
              label: formatMessage(actionMessages[CREATE_FILTER]),
              value: CREATE_FILTER,
            },
            {
              label: formatMessage(actionMessages[UPDATE_FILTER]),
              value: UPDATE_FILTER,
            },
            {
              label: formatMessage(actionMessages[DELETE_FILTER]),
              value: DELETE_FILTER,
            },
            {
              label: formatMessage(actionMessages[CREATE_DEFECT]),
              value: CREATE_DEFECT,
            },
            {
              label: formatMessage(actionMessages[UPDATE_DEFECT]),
              value: UPDATE_DEFECT,
            },
            {
              label: formatMessage(actionMessages[DELETE_DEFECT]),
              value: DELETE_DEFECT,
            },
            {
              label: formatMessage(actionMessages[CREATE_INTEGRATION]),
              value: CREATE_INTEGRATION,
            },
            {
              label: formatMessage(actionMessages[UPDATE_INTEGRATION]),
              value: UPDATE_INTEGRATION,
            },
            {
              label: formatMessage(actionMessages[DELETE_INTEGRATION]),
              value: DELETE_INTEGRATION,
            },
            {
              label: formatMessage(actionMessages[START_LAUNCH]),
              value: START_LAUNCH,
            },
            {
              label: formatMessage(actionMessages[FINISH_LAUNCH]),
              value: FINISH_LAUNCH,
            },
            {
              label: formatMessage(actionMessages[DELETE_LAUNCH]),
              value: DELETE_LAUNCH,
            },
            {
              label: formatMessage(actionMessages[MARK_LAUNCH_AS_IMPORTANT]),
              value: MARK_LAUNCH_AS_IMPORTANT,
            },
            {
              label: formatMessage(actionMessages[UNMARK_LAUNCH_AS_IMPORTANT]),
              value: UNMARK_LAUNCH_AS_IMPORTANT,
            },
            {
              label: formatMessage(actionMessages[UPDATE_PROJECT]),
              value: UPDATE_PROJECT,
            },
            {
              label: formatMessage(actionMessages[UPDATE_ANALYZER]),
              value: UPDATE_ANALYZER,
            },
            {
              label: formatMessage(actionMessages[POST_ISSUE]),
              value: POST_ISSUE,
            },
            {
              label: formatMessage(actionMessages[LINK_ISSUE]),
              value: LINK_ISSUE,
            },
            {
              label: formatMessage(actionMessages[UNLINK_ISSUE]),
              value: UNLINK_ISSUE,
            },
            {
              label: formatMessage(actionMessages[ASSIGN_USER]),
              value: ASSIGN_USER,
            },
            {
              label: formatMessage(actionMessages[UNASSIGN_USER]),
              value: UNASSIGN_USER,
            },
            {
              label: formatMessage(actionMessages[CHANGE_ROLE]),
              value: CHANGE_ROLE,
            },
            {
              label: formatMessage(actionMessages[CREATE_INVITATION_LINK]),
              value: CREATE_INVITATION_LINK,
            },
            {
              label: formatMessage(actionMessages[GENERATE_INDEX]),
              value: GENERATE_INDEX,
            },
            {
              label: formatMessage(actionMessages[DELETE_INDEX]),
              value: DELETE_INDEX,
            },
            {
              label: formatMessage(actionMessages[EVENT_ACTIONS_IMPORT]),
              value: ACTIONS_WITH_IMPORT,
            },
            {
              label: formatMessage(actionMessages[UPDATE_ITEM]),
              value: UPDATE_ITEM,
            },
            {
              label: formatMessage(actionMessages[LINK_ISSUE_AA]),
              value: LINK_ISSUE_AA,
            },
            {
              label: formatMessage(actionMessages[ANALYZE_ITEM]),
              value: ANALYZE_ITEM,
            },
            {
              label: formatMessage(actionMessages[UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS]),
              value: UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS,
            },
            {
              label: formatMessage(actionMessages[CREATE_PATTERN]),
              value: CREATE_PATTERN,
            },
            {
              label: formatMessage(actionMessages[UPDATE_PATTERN]),
              value: UPDATE_PATTERN,
            },
            {
              label: formatMessage(actionMessages[DELETE_PATTERN]),
              value: DELETE_PATTERN,
            },
            {
              label: formatMessage(actionMessages[MATCHED_PATTERN]),
              value: MATCHED_PATTERN,
            },
            {
              label: formatMessage(actionMessages[CREATE_PROJECT]),
              value: CREATE_PROJECT,
            },
          ],
        },
      },
      {
        id: ENTITY_CREATED_AT,
        component: EntityItemStartTime,
        value: bindDefaultValue(ENTITY_CREATED_AT, {
          value: '',
          condition: CONDITION_BETWEEN.toUpperCase(),
        }),
        title: formatMessage(messages.timeCol),
        active: true,
        removable: false,
        customProps: {
          withoutDynamic: true,
          events: ADMIN_EVENT_MONITORING_PAGE_EVENTS.REFINE_FILTERS_PANEL_EVENTS.commonEvents,
        },
      },
      {
        id: ENTITY_EVENTS_OBJECT_TYPE,
        component: EntityDropdown,
        value: bindDefaultValue(ENTITY_EVENTS_OBJECT_TYPE, {
          condition: CONDITION_IN.toUpperCase(),
        }),
        title: formatMessage(messages.objectTypeCol),
        active: true,
        removable: false,
        customProps: {
          multiple: true,
          selectAll: true,
          options: [
            {
              label: formatMessage(objectTypesMessages[PROJECT]),
              value: PROJECT,
            },
            {
              label: formatMessage(objectTypesMessages[DEFECT_TYPE]),
              value: DEFECT_TYPE_FILTERING_OPTION,
            },
            {
              label: formatMessage(objectTypesMessages[ITEM_ISSUE]),
              value: ITEM_ISSUE_FILTERING_OPTION,
            },
            {
              label: formatMessage(objectTypesMessages[LAUNCH]),
              value: LAUNCH,
            },
            {
              label: formatMessage(objectTypesMessages[INTEGRATION]),
              value: INTEGRATION,
            },
            {
              label: formatMessage(objectTypesMessages[DASHBOARD]),
              value: DASHBOARD,
            },
            {
              label: formatMessage(objectTypesMessages[USER]),
              value: USER,
            },
            {
              label: formatMessage(objectTypesMessages[INVITATION_LINK]),
              value: INVITATION_LINK_FILTERING_OPTION,
            },
            {
              label: formatMessage(objectTypesMessages[WIDGET]),
              value: WIDGET,
            },
            {
              label: formatMessage(objectTypesMessages[FILTER]),
              value: FILTER,
            },
            {
              label: formatMessage(objectTypesMessages[IMPORT]),
              value: IMPORT,
            },
            { label: formatMessage(objectTypesMessages[INDEX]), value: INDEX },
            {
              label: formatMessage(objectTypesMessages[EMAIL_CONFIG]),
              value: EMAIL_CONFIG_FILTERING_OPTION,
            },
            {
              label: formatMessage(objectTypesMessages[PATTERN_RULE]),
              value: PATTERN_RULE_FILTERING_OPTION,
            },
          ],
        },
      },
      {
        id: ENTITY_OBJECT_NAME,
        component: EntityInputConditional,
        value: bindDefaultValue(ENTITY_OBJECT_NAME, {
          condition: CONDITION_CNT,
        }),
        title: formatMessage(messages.objectNameCol),
        active: true,
        removable: false,
      },
      {
        id: ENTITY_SUBJECT_TYPE,
        component: EntityDropdown,
        value: bindDefaultValue(ENTITY_SUBJECT_TYPE, {
          condition: CONDITION_IN.toUpperCase(),
        }),
        title: formatMessage(messages.subjectTypeCol),
        active: true,
        removable: false,
        customProps: {
          multiple: true,
          selectAll: true,
          options: [
            {
              label: formatMessage(subjectTypesMessages[APPLICATION]),
              value: APPLICATION,
            },
            {
              label: formatMessage(subjectTypesMessages[USER]),
              value: USER,
            },
            {
              label: formatMessage(subjectTypesMessages[RULE]),
              value: RULE,
            },
          ],
        },
      },
      {
        id: ENTITY_SUBJECT_NAME,
        component: EntitySearch,
        value: bindDefaultValue(ENTITY_SUBJECT_NAME, {
          condition: CONDITION_IN,
        }),
        title: formatMessage(messages.subjectNameCol),
        active: true,
        removable: false,
        customProps: {
          getURI: URLS.projectUsernamesSearch(projectKey),
          placeholder: formatMessage(messages.subjectNamePlaceholder),
          minLength: 1,
        },
      },
    ];
  };

  const { render, ...rest } = props;

  return render({
    intl: {
      intl: formatMessage,
    },
    projectKey,
    filterEntities: getEntities(),
    ...rest,
  });
};

EventsEntities.propTypes = {
  filterValues: PropTypes.object,
  render: PropTypes.func.isRequired,
};

EventsEntities.defaultProps = {
  filterValues: {},
};
