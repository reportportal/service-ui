import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './warningTooltip.scss';

const cx = classNames.bind(styles);
export const WarningTooltip = () => (
  <div>
    <p className={cx('text')}>
      <FormattedMessage
        id="WarningTooltip.description"
        defaultMessage="If you need to update your UUID, click regenerate to have new one."
      />
    </p>
    <p className={cx('warning')}>
      <FormattedMessage id="WarningTooltip.warning" defaultMessage="Warning!" />
    </p>
    <p className={cx('text')}>
      <FormattedMessage
        id="WarningTooltip.warningDescription"
        defaultMessage="All configured agents with old UUID will not be working after that"
      />
    </p>
  </div>
);
