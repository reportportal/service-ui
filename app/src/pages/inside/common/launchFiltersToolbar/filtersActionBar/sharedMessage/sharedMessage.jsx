import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import SharedIcon from 'common/img/share-icon-inline.svg';
import styles from './sharedMessage.scss';

const cx = classNames.bind(styles);

export const SharedMessage = () => (
  <div className={cx('shared-message')}>
    <div className={cx('icon')}>{Parser(SharedIcon)}</div>
    <span className={cx('text')}>
      <FormattedMessage id="FiltersActionBar.sharedFilter" defaultMessage="Filter is shared" />
    </span>
  </div>
);
