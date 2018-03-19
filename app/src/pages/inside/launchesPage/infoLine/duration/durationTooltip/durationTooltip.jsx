import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './durationTooltip.scss';

const cx = classNames.bind(styles);

export const DurationTooltip = () => (
  <div className={cx('duration-tooltip')}>
    <FormattedMessage id="DurationTooltip.message" defaultMessage="Duration is interval between first child starts and last child ends. But if child run in parallel, end time is a time of longest child, in this case duration will not be equal to child duration sum." />
  </div>
  );
