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

export const DashboardControl = injectIntl(({ dashboards, onChange, value, intl }) => {
  const newDashboards = [...dashboards];
  if (newDashboards.length === 0) {
    newDashboards.push(value);
  }
  return (
    <div className={cx('dashboardControl')}>
      <h5 className={cx('dashboardControl-title')}>
        {intl.formatMessage(messages.dashboardControlTitle)}
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
});

DashboardControl.propTypes = {
  dashboards: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  value: PropTypes.object,
  intl: intlShape.isRequired,
};
DashboardControl.defaultProps = {
  onChange: () => {},
  dashboards: [],
  value: {},
};
