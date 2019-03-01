import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { actionMessages, objectTypesMessages } from 'common/constants/eventsLocalization';

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
    <AbsRelTime startTime={value.lastModifiedDate} />
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
  <div className={cx('user-col', className)}>{value.userRef}</div>
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
    {value.actionType && formatMessage(actionMessages[value.actionType])}
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
    {value.objectType && formatMessage(objectTypesMessages[value.objectType])}
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
  };

  static defaultProps = {
    data: [],
    loading: false,
  };
  getColumns = () => [
    {
      id: 'time',
      title: {
        full: this.props.intl.formatMessage(messages.timeCol),
      },
      maxHeight: 170,
      component: TimeColumn,
    },
    {
      id: 'user',
      title: {
        full: this.props.intl.formatMessage(messages.userCol),
      },
      component: UserColumn,
    },
    {
      id: 'action',
      title: {
        full: this.props.intl.formatMessage(messages.actionCol),
      },
      component: ActionColumn,
      customProps: {
        formatMessage: this.props.intl.formatMessage,
      },
    },
    {
      id: 'objectType',
      title: {
        full: this.props.intl.formatMessage(messages.objectTypeCol),
      },
      component: ObjectTypeColumn,
      customProps: {
        formatMessage: this.props.intl.formatMessage,
      },
    },
    {
      id: 'objectName',
      title: {
        full: this.props.intl.formatMessage(messages.objectNameCol),
      },
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
    return <Grid columns={this.COLUMNS} data={this.props.data} loading={this.props.loading} />;
  }
}
