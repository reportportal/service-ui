import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils';
import { Input } from 'components/inputs/input';
import styles from './startEndTime.scss';

const cx = classNames.bind(styles);

export const StartEndTime = ({ start, end }) => (
  <div className={cx('start-end-time')}>
    <Input value={dateFormat(start)} disabled />
    <div className={cx('separator')}>/</div>
    <Input value={dateFormat(end)} disabled />
  </div>
);

StartEndTime.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
};
