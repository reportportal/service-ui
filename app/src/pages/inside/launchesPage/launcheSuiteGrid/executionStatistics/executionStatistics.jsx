import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './executionStatistics.scss';

const cx = classNames.bind(styles);

export const ExecutionStatistics = ({ value, bold }) => (
  <a href="/" className={cx({ 'execution-statistics': true, bold })}>{ value }</a>
);
ExecutionStatistics.propTypes = {
  value: PropTypes.string.isRequired,
  bold: PropTypes.bool,
};
ExecutionStatistics.defaultProps = {
  bold: false,
};
