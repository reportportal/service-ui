import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './executionStatistics.scss';

const cx = classNames.bind(styles);

export const ExecutionStatistics = ({ value, title, bold }) => (
  <div className={cx('execution-statistics')}>
    <span className={cx('title')}>{ title.full }</span>
    {
      !!Number(value) &&
      <a href="/" className={cx('value', { bold })}>
        { value }
      </a>
    }
  </div>
);

ExecutionStatistics.propTypes = {
  value: PropTypes.string.isRequired,
  title: PropTypes.object,
  bold: PropTypes.bool,
};
ExecutionStatistics.defaultProps = {
  bold: false,
  title: {},
};
