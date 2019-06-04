import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { DashboardItem } from './dashboardItem';
import styles from './dashboardControl.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardControlTitle: {
    id: 'dashboardControl.title',
    defaultMessage: 'Save widget on dashboard',
  },
});

@injectIntl
export class DashboardControl extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dashboards: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func,
    value: PropTypes.object,
  };

  static defaultProps = {
    onChange: () => {},
    dashboards: [],
    value: {},
  };

  render() {
    const {
      intl: { formatMessage },
      dashboards,
      onChange,
      value,
    } = this.props;

    const newDashboards = [...dashboards];

    if (newDashboards.length === 0) {
      newDashboards.push(value);
    }

    return (
      <div className={cx('dashboardControl')}>
        <h5 className={cx('dashboardControl-title')}>
          {formatMessage(messages.dashboardControlTitle)}
        </h5>
        <div className={cx('dashboardControl-list')}>
          {newDashboards.map((dashboard, index) => {
            const active = value.id ? value.id === dashboard.id : index === 0;
            const onClick = () => {
              onChange(dashboard);
            };
            return (
              <DashboardItem
                key={dashboard.name}
                active={active}
                dashboard={dashboard}
                onClick={onClick}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
