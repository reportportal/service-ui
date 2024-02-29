/*
 * Copyright 2019 EPAM Systems
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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';

import {
  EntityDropdown,
  EntityItemStartTime,
  EntitySearch,
  EntityContains,
  EntityInputConditional,
} from 'components/filterEntities';
import { bindDefaultValue } from 'components/filterEntities/utils';
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
} from 'common/constants/eventsObjectTypes';

import {
  actionMessages,
  objectTypesMessages,
} from 'common/constants/localization/eventsLocalization';
import { ADMIN_EVENT_MONITORING_PAGE_EVENTS } from 'components/main/analytics/events';

const messages = defineMessages({
  timeCol: { id: 'EventsGrid.timeCol', defaultMessage: 'Time' },
  userCol: { id: 'EventsGrid.userCol', defaultMessage: 'User' },
  actionCol: { id: 'EventsGrid.actionCol', defaultMessage: 'Action' },
  objectTypeCol: { id: 'EventsGrid.objectTypeCol', defaultMessage: 'Object Type' },
  objectNameCol: { id: 'EventsGrid.objectNameCol', defaultMessage: 'Object Name' },
  oldValueCol: { id: 'EventsGrid.oldValueCol', defaultMessage: 'Old Value' },
  newValueCol: { id: 'EventsGrid.newValueCol', defaultMessage: 'New Value' },
  contains: { id: 'EventsGrid.contains', defaultMessage: 'Contains' },
  userSearchPlaceholder: {
    id: 'EventsGrid.userSearchPlaceholder',
    defaultMessage: 'Enter username',
  },
});
@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {},
)
@injectIntl
export class EventsEntities extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
  };

  static defaultProps = {
    loading: false,
    events: [],
    filterValues: {},
  };

  getEntities = () => {
    const { intl, activeProject } = this.props;
    return [
      {
        id: ACTIVITIES,
        component: EntityContains,
        value: this.bindDefaultValue(ACTIVITIES),
        title: intl.formatMessage(messages.contains),
        active: true,
        removable: false,
      },
      {
        id: ENTITY_EVENT_NAME,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_EVENT_NAME, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.actionCol),
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
              label: intl.formatMessage(actionMessages[CREATE_DASHBOARD]),
              value: CREATE_DASHBOARD,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_DASHBOARD]),
              value: UPDATE_DASHBOARD,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_DASHBOARD]),
              value: DELETE_DASHBOARD,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_WIDGET]),
              value: CREATE_WIDGET,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_WIDGET]),
              value: UPDATE_WIDGET,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_WIDGET]),
              value: DELETE_WIDGET,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_FILTER]),
              value: CREATE_FILTER,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_FILTER]),
              value: UPDATE_FILTER,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_FILTER]),
              value: DELETE_FILTER,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_DEFECT]),
              value: CREATE_DEFECT,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_DEFECT]),
              value: UPDATE_DEFECT,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_DEFECT]),
              value: DELETE_DEFECT,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_INTEGRATION]),
              value: CREATE_INTEGRATION,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_INTEGRATION]),
              value: UPDATE_INTEGRATION,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_INTEGRATION]),
              value: DELETE_INTEGRATION,
            },
            {
              label: intl.formatMessage(actionMessages[START_LAUNCH]),
              value: START_LAUNCH,
            },
            {
              label: intl.formatMessage(actionMessages[FINISH_LAUNCH]),
              value: FINISH_LAUNCH,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_LAUNCH]),
              value: DELETE_LAUNCH,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_PROJECT]),
              value: UPDATE_PROJECT,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_ANALYZER]),
              value: UPDATE_ANALYZER,
            },
            {
              label: intl.formatMessage(actionMessages[POST_ISSUE]),
              value: POST_ISSUE,
            },
            {
              label: intl.formatMessage(actionMessages[LINK_ISSUE]),
              value: LINK_ISSUE,
            },
            {
              label: intl.formatMessage(actionMessages[UNLINK_ISSUE]),
              value: UNLINK_ISSUE,
            },
            {
              label: intl.formatMessage(actionMessages[ASSIGN_USER]),
              value: ASSIGN_USER,
            },
            {
              label: intl.formatMessage(actionMessages[UNASSIGN_USER]),
              value: UNASSIGN_USER,
            },
            {
              label: intl.formatMessage(actionMessages[CHANGE_ROLE]),
              value: CHANGE_ROLE,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_INVITATION_LINK]),
              value: CREATE_INVITATION_LINK,
            },
            {
              label: intl.formatMessage(actionMessages[GENERATE_INDEX]),
              value: GENERATE_INDEX,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_INDEX]),
              value: DELETE_INDEX,
            },
            {
              label: intl.formatMessage(actionMessages[EVENT_ACTIONS_IMPORT]),
              value: ACTIONS_WITH_IMPORT,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_ITEM]),
              value: UPDATE_ITEM,
            },
            {
              label: intl.formatMessage(actionMessages[LINK_ISSUE_AA]),
              value: LINK_ISSUE_AA,
            },
            {
              label: intl.formatMessage(actionMessages[ANALYZE_ITEM]),
              value: ANALYZE_ITEM,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS]),
              value: UPDATE_AUTO_PATTERN_ANALYSIS_SETTINGS,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_PATTERN]),
              value: CREATE_PATTERN,
            },
            {
              label: intl.formatMessage(actionMessages[UPDATE_PATTERN]),
              value: UPDATE_PATTERN,
            },
            {
              label: intl.formatMessage(actionMessages[DELETE_PATTERN]),
              value: DELETE_PATTERN,
            },
            {
              label: intl.formatMessage(actionMessages[MATCHED_PATTERN]),
              value: MATCHED_PATTERN,
            },
            {
              label: intl.formatMessage(actionMessages[CREATE_PROJECT]),
              value: CREATE_PROJECT,
            },
          ],
        },
      },
      {
        id: ENTITY_CREATED_AT,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(ENTITY_CREATED_AT, {
          value: '',
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.timeCol),
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
        value: this.bindDefaultValue(ENTITY_EVENTS_OBJECT_TYPE, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.objectTypeCol),
        active: true,
        removable: false,
        customProps: {
          multiple: true,
          selectAll: true,
          options: [
            {
              label: intl.formatMessage(objectTypesMessages[PROJECT]),
              value: PROJECT,
            },
            {
              label: intl.formatMessage(objectTypesMessages[DEFECT_TYPE]),
              value: DEFECT_TYPE_FILTERING_OPTION,
            },
            {
              label: intl.formatMessage(objectTypesMessages[ITEM_ISSUE]),
              value: ITEM_ISSUE_FILTERING_OPTION,
            },
            {
              label: intl.formatMessage(objectTypesMessages[LAUNCH]),
              value: LAUNCH,
            },
            {
              label: intl.formatMessage(objectTypesMessages[INTEGRATION]),
              value: INTEGRATION,
            },
            {
              label: intl.formatMessage(objectTypesMessages[DASHBOARD]),
              value: DASHBOARD,
            },
            {
              label: intl.formatMessage(objectTypesMessages[USER]),
              value: USER,
            },
            {
              label: intl.formatMessage(objectTypesMessages[INVITATION_LINK]),
              value: INVITATION_LINK_FILTERING_OPTION,
            },
            {
              label: intl.formatMessage(objectTypesMessages[WIDGET]),
              value: WIDGET,
            },
            {
              label: intl.formatMessage(objectTypesMessages[FILTER]),
              value: FILTER,
            },
            {
              label: intl.formatMessage(objectTypesMessages[IMPORT]),
              value: IMPORT,
            },
            { label: intl.formatMessage(objectTypesMessages[INDEX]), value: INDEX },
            {
              label: intl.formatMessage(objectTypesMessages[EMAIL_CONFIG]),
              value: EMAIL_CONFIG_FILTERING_OPTION,
            },
            {
              label: intl.formatMessage(objectTypesMessages[PATTERN_RULE]),
              value: PATTERN_RULE_FILTERING_OPTION,
            },
          ],
        },
      },
      {
        id: ENTITY_OBJECT_NAME,
        component: EntityInputConditional,
        value: this.bindDefaultValue(ENTITY_OBJECT_NAME, {
          condition: CONDITION_CNT,
        }),
        title: intl.formatMessage(messages.objectNameCol),
        active: true,
        removable: false,
      },
      {
        id: ENTITY_SUBJECT_NAME,
        component: EntitySearch,
        value: this.bindDefaultValue(ENTITY_SUBJECT_NAME, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.userCol),
        active: true,
        removable: false,
        customProps: {
          getURI: URLS.searchEventsBySubjectName(activeProject),
          placeholder: intl.formatMessage(messages.userSearchPlaceholder),
          minLength: 1,
        },
      },
    ];
  };
  bindDefaultValue = bindDefaultValue;
  render() {
    const { render, ...rest } = this.props;
    return render({
      ...rest,
      filterEntities: this.getEntities(),
    });
  }
}
