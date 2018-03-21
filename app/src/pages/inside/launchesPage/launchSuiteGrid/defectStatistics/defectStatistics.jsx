import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './defectStatistics.scss';

const cx = classNames.bind(styles);

export const DefectStatistics = ({ value, customProps, type }) => (
  <div className={cx('defect-statistics')}>
    <span className={cx('title')}>
      <span className={cx('circle', { [`type-${type}`]: type })} />
      { customProps.abbreviation }
    </span>
    <a href="/" className={cx('value')}>{ value.total }</a>
  </div>
  );
DefectStatistics.propTypes = {
  type: PropTypes.string,
  value: PropTypes.object.isRequired,
  customProps: PropTypes.object,
};
DefectStatistics.defaultProps = {
  type: '',
  customProps: {},
};
