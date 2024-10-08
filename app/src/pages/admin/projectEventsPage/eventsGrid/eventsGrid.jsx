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

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import {
  actionMessages,
  objectTypesMessages,
} from 'common/constants/localization/eventsLocalization';
import { NoItemMessage } from 'components/main/noItemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  ENTITY_CREATED_AT,
  ENTITY_EVENTS_OBJECT_TYPE,
  ENTITY_EVENT_NAME,
  ENTITY_OBJECT_NAME,
  ENTITY_SUBJECT_NAME,
} from 'components/filterEntities/constants';

import styles from './eventsGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  timeCol: { id: 'EventsGrid.timeCol', defaultMessage: 'Time' },
  userCol: { id: 'EventsGrid.userCol', defaultMessage: 'User' },
  actionCol: { id: 'EventsGrid.actionCol', defaultMessage: 'Action' },
  objectTypeCol: { id: 'EventsGrid.objectTypeCol', defaultMessage: 'Object Type' },
  objectTypeColShort: { id: 'EventsGrid.objectTypeColShort', defaultMessage: 'Type' },
  objectNameCol: { id: 'EventsGrid.objectNameCol', defaultMessage: 'Object Name' },
  objectNameColShort: { id: 'EventsGrid.objectNameColShort', defaultMessage: 'Name' },
  oldValueCol: { id: 'EventsGrid.oldValueCol', defaultMessage: 'Old Value' },
  newValueCol: { id: 'EventsGrid.newValueCol', defaultMessage: 'New Value' },
});

const TimeColumn = ({ className, value }) => (
  <div className={cx('time-col', className)}>
    <AbsRelTime startTime={value.created_at} />
  </div>
);
TimeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
TimeColumn.defaultProps = {
  value: {},
};

const UserColumn = ({ className, value }) => (
  <div className={cx('user-col', className)}>{value.subject_name}</div>
);
UserColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
UserColumn.defaultProps = {
  value: {},
};

const ActionColumn = ({ className, value, customProps: { formatMessage } }) => (
  <div className={cx('action-col', className)}>
    {value.event_name && actionMessages[value.event_name]
      ? formatMessage(actionMessages[value.event_name])
      : value.event_name}
  </div>
);
ActionColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func,
  }),
};
ActionColumn.defaultProps = {
  value: {},
  customProps: {},
};

const ObjectTypeColumn = ({ className, value, customProps: { formatMessage } }) => (
  <div className={cx('object-type-col', className)}>
    {value.object_type && objectTypesMessages[value.object_type]
      ? formatMessage(objectTypesMessages[value.object_type])
      : value.object_type}
  </div>
);
ObjectTypeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    formatMessage: PropTypes.func,
  }),
};
ObjectTypeColumn.defaultProps = {
  value: {},
  customProps: {},
};

const ObjectNameColumn = ({ className, value }) => (
  <div className={cx('object-name-col', className)}>{value.object_name}</div>
);
ObjectNameColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
ObjectNameColumn.defaultProps = {
  value: {},
};

const ValueColumn = ({ className, value, customProps: { valueType } }) => (
  <div className={cx('value-col', className)}>
    {value.details.history.map((item) => (
      <React.Fragment key={`${item.field}__${item.oldValue}__${item.newValue}`}>
        <div className={cx('value-field')}>{item.field}:</div>
        <div className={cx('value')}>{item[valueType]}</div>
      </React.Fragment>
    ))}
  </div>
);
ValueColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
  customProps: PropTypes.shape({
    valueType: PropTypes.string,
  }),
};
ValueColumn.defaultProps = {
  value: {},
  customProps: {},
};
@injectIntl
export class EventsGrid extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    intl: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    sortingColumn: PropTypes.string,
    sortingDirection: PropTypes.string,
    onChangeSorting: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    loading: false,
    sortingColumn: null,
    sortingDirection: null,
    onChangeSorting: () => {},
  };

  getColumns = () => [
    {
      id: ENTITY_CREATED_AT,
      title: {
        full: this.props.intl.formatMessage(messages.timeCol),
      },
      sortable: true,
      maxHeight: 170,
      component: TimeColumn,
    },
    {
      id: ENTITY_SUBJECT_NAME,
      title: {
        full: this.props.intl.formatMessage(messages.userCol),
      },
      sortable: true,
      component: UserColumn,
    },
    {
      id: ENTITY_EVENT_NAME,
      title: {
        full: this.props.intl.formatMessage(messages.actionCol),
      },
      sortable: true,
      component: ActionColumn,
      customProps: {
        formatMessage: this.props.intl.formatMessage,
      },
    },
    {
      id: ENTITY_EVENTS_OBJECT_TYPE,
      title: {
        full: this.props.intl.formatMessage(messages.objectTypeCol),
        short: this.props.intl.formatMessage(messages.objectTypeColShort),
      },
      sortable: true,
      component: ObjectTypeColumn,
      customProps: {
        formatMessage: this.props.intl.formatMessage,
      },
    },
    {
      id: ENTITY_OBJECT_NAME,
      title: {
        full: this.props.intl.formatMessage(messages.objectNameCol),
        short: this.props.intl.formatMessage(messages.objectNameColShort),
      },
      sortable: true,
      component: ObjectNameColumn,
    },
    {
      id: 'oldValue',
      title: {
        full: this.props.intl.formatMessage(messages.oldValueCol),
      },
      component: ValueColumn,
      customProps: {
        valueType: 'oldValue',
      },
    },
    {
      id: 'newValue',
      title: {
        full: this.props.intl.formatMessage(messages.newValueCol),
      },
      component: ValueColumn,
      customProps: {
        valueType: 'newValue',
      },
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    const { data, loading, intl, sortingColumn, sortingDirection, onChangeSorting } = this.props;
    return (
      <Fragment>
        <Grid
          columns={this.COLUMNS}
          data={data}
          loading={loading}
          sortingColumn={sortingColumn}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          headerClassName={cx('events-grid-header')}
          gridRowClassName={cx('events-grid-row')}
          className={cx('events-grid')}
        />
        {!data.length && !loading && (
          <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
        )}
      </Fragment>
    );
  }
}
