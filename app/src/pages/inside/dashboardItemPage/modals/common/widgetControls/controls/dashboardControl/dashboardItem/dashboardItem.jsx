import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './dashboardItem.scss';

const cx = classNames.bind(styles);

export const DashboardItem = ({ dashboard, onClick, active }) => {
  const { name } = dashboard;
  return (
    <div
      className={cx('dashboard-item', {
        active,
      })}
      onClick={onClick}
    >
      {name}
    </div>
  );
};

DashboardItem.defaultProps = {
  onClick: () => {},
  active: false,
  dashboard: {},
};

DashboardItem.propTypes = {
  dashboard: PropTypes.object,
  onClick: PropTypes.func,
  active: PropTypes.bool,
};
