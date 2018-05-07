import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './toInvestigateStatistics.scss';

const cx = classNames.bind(styles);

export const ToInvestigateStatistics = ({ value, customProps }) => (
  <div className={cx('to-investigate-statistics')}>
    <span className={cx('title')}>
      <span className={cx('circle')} />
      {customProps.abbreviation}
    </span>
    {!!value.total && (
      <a href="/" className={cx('value')}>
        {value.total}
      </a>
    )}
  </div>
);
ToInvestigateStatistics.propTypes = {
  value: PropTypes.object.isRequired,
  customProps: PropTypes.object,
};
ToInvestigateStatistics.defaultProps = {
  customProps: {},
};
