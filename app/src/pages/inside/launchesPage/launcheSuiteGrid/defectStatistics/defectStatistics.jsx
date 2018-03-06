import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './defectStatistics.scss';

const cx = classNames.bind(styles);

export const DefectStatistics = ({ value }) => (
  <a href="/" className={cx('defect-statistics')}>{ value.total }</a>
);
DefectStatistics.propTypes = {
  value: PropTypes.object.isRequired,
};
