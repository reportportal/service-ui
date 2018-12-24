import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
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

const ActionColumn = ({ className, value }) => {
  const formattedActionType = value.actionType.split(/(?=[A-Z])/).join(' ');
  return <div className={cx('action-col', className)}>{formattedActionType}</div>;
};
ActionColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
ActionColumn.defaultProps = {
  value: {},
};

const ObjectTypeColumn = ({ className, value }) => (
  <div className={cx('object-type-col', className)}>{value.objectType}</div>
);
ObjectTypeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
ObjectTypeColumn.defaultProps = {
  value: {},
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

const OldValueColumn = ({ className, value }) => (
  <div className={cx('old-value-col', className)}>
    {value.details.history.map((item) => (
      <React.Fragment key={item.toString()}>
        <div className={cx('value-field')}>{item.field}:</div>
        <div className={cx('old-value')}>{item.oldValue}</div>
      </React.Fragment>
    ))}
  </div>
);
OldValueColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
OldValueColumn.defaultProps = {
  value: {},
};

const NewValueColumn = ({ className, value }) => (
  <div className={cx('new-value-col', className)}>
    {value.details.history.map((item) => (
      <React.Fragment key={item.toString()}>
        <div className={cx('value-field')}>{item.field}:</div>
        <div className={cx('new-value')}>{item.newValue}</div>
      </React.Fragment>
    ))}
  </div>
);
NewValueColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
NewValueColumn.defaultProps = {
  value: {},
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
    },
    {
      id: 'object_type',
      title: {
        full: this.props.intl.formatMessage(messages.objectTypeCol),
      },
      component: ObjectTypeColumn,
    },
    {
      id: 'object_name',
      title: {
        full: this.props.intl.formatMessage(messages.objectNameCol),
      },
      component: ObjectNameColumn,
    },
    {
      id: 'old_value',
      title: {
        full: this.props.intl.formatMessage(messages.oldValueCol),
      },
      component: OldValueColumn,
    },
    {
      id: 'new_value',
      title: {
        full: this.props.intl.formatMessage(messages.newValueCol),
      },
      component: NewValueColumn,
    },
  ];

  COLUMNS = this.getColumns();

  render() {
    return <Grid columns={this.COLUMNS} data={this.props.data} loading={this.props.loading} />;
  }
}
