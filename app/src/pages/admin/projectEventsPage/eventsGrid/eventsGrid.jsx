import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { actionMessages, objectTypesMessages } from 'common/constants/eventsLocalization';
import { NoItemMessage } from 'components/main/noItemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  ENTITY_ACTION,
  ENTITY_CREATION_DATE,
  ENTITY_OBJECT_NAME,
  ENTITY_OBJECT_TYPE,
  ENTITY_USER,
} from 'components/filterEntities/constants';

import styles from './eventsGrid.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  timeCol: { id: 'EventsGrid.timeCol', defaultMessage: 'Time' },
  userCol: { id: 'EventsGrid.userCol', defaultMessage: 'User' },
  actionCol: { id: 'EventsGrid.actionCol', defaultMessage: 'Action' },
  objectTypeCol: { id: 'EventsGrid.objectTypeCol', defaultMessage: 'Object Type' },
  objectNameCol: { id: 'EventsGrid.objectNameCol', defaultMessage: 'Object Name' },
  oldValueCol: { id: 'EventsGrid.oldValueCol', defaultMessage: 'Old Value' },
  newValueCol: { id: 'EventsGrid.newValueCol', defaultMessage: 'New Value' },
});

const TimeColumn = ({ className, value }) => (
  <div className={cx('time-col', className)}>
    <AbsRelTime startTime={value.lastModified} />
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
  <div className={cx('user-col', className)}>{value.user}</div>
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
    {value.actionType && actionMessages[value.actionType]
      ? formatMessage(actionMessages[value.actionType])
      : value.actionType}
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
    {value.objectType && objectTypesMessages[value.objectType]
      ? formatMessage(objectTypesMessages[value.objectType])
      : value.objectType}
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
  <div className={cx('object-name-col', className)}>{value.details.objectName}</div>
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
    intl: intlShape.isRequired,
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
      id: ENTITY_CREATION_DATE,
      title: {
        full: this.props.intl.formatMessage(messages.timeCol),
      },
      sortable: true,
      maxHeight: 170,
      component: TimeColumn,
    },
    {
      id: ENTITY_USER,
      title: {
        full: this.props.intl.formatMessage(messages.userCol),
      },
      sortable: true,
      component: UserColumn,
    },
    {
      id: ENTITY_ACTION,
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
      id: ENTITY_OBJECT_TYPE,
      title: {
        full: this.props.intl.formatMessage(messages.objectTypeCol),
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
        />
        {!data.length &&
          !loading && <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />}
      </Fragment>
    );
  }
}
