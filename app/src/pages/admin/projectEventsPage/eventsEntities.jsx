import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';

import moment from 'moment/moment';
import {
  EntityDropdown,
  EntityItemStartTime,
  EntitySearch,
  EntityContains,
} from 'components/filterEntities';
import { bindDefaultValue } from 'components/filterEntities/utils';
import {
  ENTITY_ACTION,
  ENTITY_OBJECT_TYPE,
  ENTITY_USER,
  CONDITION_IN,
  CONDITION_BETWEEN,
  ENTITY_START_TIME,
  ACTIVITIES,
  ENTITY_CREATION_DATE,
} from 'components/filterEntities/constants';
import {
  START_LAUNCH,
  FINISH_LAUNCH,
  DELETE_LAUNCH,
  POST_ISSUE,
  LINK_ISSUE,
  UNLINK_ISSUE,
  CREATE_USER,
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  DELETE_DASHBOARD,
  CREATE_WIDGET,
  UPDATE_WIDGET,
  DELETE_WIDGET,
  CREATE_FILTER,
  UPDATE_FILTER,
  DELETE_FILTER,
  CREATE_BTS,
  UPDATE_BTS,
  DELETE_BTS,
  UPDATE_PROJECT,
  UPDATE_ANALYZER,
  GENERATE_INDEX,
  DELETE_INDEX,
  UPDATE_DEFECT,
  DELETE_DEFECT,
  START_IMPORT,
  FINISH_IMPORT,
  UPDATE_NOTIFICATIONS,
  SWITCH_ON_NOTIFICATIONS,
  SWITCH_OFF_NOTIFICATIONS,
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
  USER_FILTER,
  TEST_ITEM,
  EXTERNAL_SYSTEM,
} from 'common/constants/eventsObjectTypes';

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
  focusUserSearchPlaceholder: {
    id: 'EventsGrid.focusUserSearchPlaceholder',
    defaultMessage: 'At least 3 symbols required.',
  },
});
@connect(
  (state) => ({
    usersSearchUrl: URLS.projectUsernamesSearch(activeProjectSelector(state)),
  }),
  {},
)
@injectIntl
export class EventsEntities extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    filterValues: PropTypes.object,
    render: PropTypes.func.isRequired,
    usersSearchUrl: PropTypes.string.isRequired,
  };

  static defaultProps = {
    loading: false,
    events: [],
    filterValues: {},
  };

  getEntities = () => {
    const { intl } = this.props;
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
        id: ENTITY_ACTION,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_ACTION, {
          value: [
            START_LAUNCH,
            FINISH_LAUNCH,
            DELETE_LAUNCH,
            POST_ISSUE,
            LINK_ISSUE,
            UNLINK_ISSUE,
            CREATE_USER,
            CREATE_DASHBOARD,
            UPDATE_DASHBOARD,
            DELETE_DASHBOARD,
            CREATE_WIDGET,
            UPDATE_WIDGET,
            DELETE_WIDGET,
            CREATE_FILTER,
            UPDATE_FILTER,
            DELETE_FILTER,
            CREATE_BTS,
            UPDATE_BTS,
            DELETE_BTS,
            UPDATE_PROJECT,
            UPDATE_ANALYZER,
            GENERATE_INDEX,
            DELETE_INDEX,
            UPDATE_DEFECT,
            DELETE_DEFECT,
            START_IMPORT,
            FINISH_IMPORT,
            UPDATE_NOTIFICATIONS,
            SWITCH_ON_NOTIFICATIONS,
            SWITCH_OFF_NOTIFICATIONS,
          ].join(','),
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.actionCol),
        active: true,
        removable: false,
        customProps: {
          multiple: true,
          selectAll: true,
          options: [
            {
              label: 'Create dashboard',
              value: CREATE_DASHBOARD,
            },
            {
              label: 'Update Dashboard',
              value: UPDATE_DASHBOARD,
            },
            {
              label: 'Delete dashboard',
              value: DELETE_DASHBOARD,
            },
            {
              label: 'Create widget',
              value: CREATE_WIDGET,
            },
            {
              label: 'Update widget',
              value: UPDATE_WIDGET,
            },
            {
              label: 'Delete widget',
              value: DELETE_WIDGET,
            },
            {
              label: 'Create filter',
              value: CREATE_FILTER,
            },
            {
              label: 'Update filter',
              value: UPDATE_FILTER,
            },
            {
              label: 'Delete filter',
              value: DELETE_FILTER,
            },
            {
              label: 'Update defect',
              value: UPDATE_DEFECT,
            },
            {
              label: 'Delete defect',
              value: DELETE_DEFECT,
            },
            {
              label: 'Create BTS',
              value: CREATE_BTS,
            },
            {
              label: 'Update BTS',
              value: UPDATE_BTS,
            },
            {
              label: 'Delete BTS',
              value: DELETE_BTS,
            },
            {
              label: 'Start launch',
              value: START_LAUNCH,
            },
            {
              label: 'Finish launch',
              value: FINISH_LAUNCH,
            },
            {
              label: 'Delete launch',
              value: DELETE_LAUNCH,
            },
            {
              label: 'Update project',
              value: UPDATE_PROJECT,
            },
            {
              label: 'Update Auto-Analysis',
              value: UPDATE_ANALYZER,
            },
            {
              label: 'Post issue',
              value: POST_ISSUE,
            },
            {
              label: 'Link issue',
              value: LINK_ISSUE,
            },
            {
              label: 'Unlink issue',
              value: UNLINK_ISSUE,
            },
            {
              label: 'Create user',
              value: CREATE_USER,
            },
            {
              label: 'Remove index',
              value: DELETE_INDEX,
            },
            {
              label: 'Generate index',
              value: GENERATE_INDEX,
            },
            {
              label: 'Start import',
              value: START_IMPORT,
            },
            {
              label: 'Finish import',
              value: FINISH_IMPORT,
            },
            {
              label: 'Update notifications',
              value: UPDATE_NOTIFICATIONS,
            },
            {
              label: 'Switch on notifications',
              value: SWITCH_ON_NOTIFICATIONS,
            },
            {
              label: 'Switch off notifications',
              value: SWITCH_OFF_NOTIFICATIONS,
            },
          ],
        },
      },
      {
        id: ENTITY_CREATION_DATE,
        component: EntityItemStartTime,
        value: this.bindDefaultValue(ENTITY_START_TIME, {
          value: `${moment()
            .startOf('day')
            .subtract(1, 'months')
            .valueOf()},${moment()
            .endOf('day')
            .valueOf() + 1}`,
          condition: CONDITION_BETWEEN,
        }),
        title: intl.formatMessage(messages.timeCol),
        active: true,
        removable: false,
      },
      {
        id: ENTITY_OBJECT_TYPE,
        component: EntityDropdown,
        value: this.bindDefaultValue(ENTITY_OBJECT_TYPE, {
          value: [
            DASHBOARD,
            LAUNCH,
            WIDGET,
            FILTER,
            IMPORT,
            PROJECT,
            DEFECT_TYPE,
            USER,
            USER_FILTER,
            TEST_ITEM,
            EXTERNAL_SYSTEM,
          ].join(','),
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
              label: 'Project',
              value: PROJECT,
            },
            {
              label: 'Defect type',
              value: DEFECT_TYPE,
            },
            {
              label: 'Test item',
              value: TEST_ITEM,
            },
            {
              label: 'Launch',
              value: LAUNCH,
            },
            {
              label: 'External system',
              value: EXTERNAL_SYSTEM,
            },
            {
              label: 'Dashboard',
              value: DASHBOARD,
            },
            {
              label: 'User',
              value: USER,
            },
            {
              label: 'Widget',
              value: WIDGET,
            },
            {
              label: 'User filter',
              value: USER_FILTER,
            },
            {
              label: 'Filter',
              value: FILTER,
            },
            {
              label: 'Import',
              value: IMPORT,
            },
          ],
        },
      },
      /* TODO EPMRPP-38214 */
      // {
      //   id: ENTITY_OBJECT_NAME,
      //   component: EntityItemName,
      //   value:
      //     ENTITY_OBJECT_NAME in filterValues
      //       ? filterValues[ENTITY_OBJECT_NAME]
      //       : {
      //           filteringField: ENTITY_OBJECT_NAME,
      //           value: '',
      //           condition: CONDITION_CNT,
      //         },
      //   title: intl.formatMessage(messages.objectNameCol),
      //   active: true,
      //   removable: false,
      // },
      {
        id: ENTITY_USER,
        component: EntitySearch,
        value: this.bindDefaultValue(ENTITY_USER, {
          condition: CONDITION_IN,
        }),
        title: intl.formatMessage(messages.userCol),
        active: true,
        removable: false,
        customProps: {
          uri: this.props.usersSearchUrl,
          placeholder: intl.formatMessage(messages.userSearchPlaceholder),
          focusPlaceholder: intl.formatMessage(messages.focusUserSearchPlaceholder),
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
