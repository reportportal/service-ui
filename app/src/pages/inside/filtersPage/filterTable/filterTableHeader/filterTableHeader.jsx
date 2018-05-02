import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './filterTableHeader.scss';

const cx = classNames.bind(styles);

export const FilterTableHeader = () => (
  <div className={cx('table-header')}>
    <div className={cx('header-cell', 'name-cell')}>
      <FormattedMessage id="FilterTableItem.header.name" defaultMessage="Filter name" />
    </div>
    <div className={cx('header-cell', 'options-cell')}>
      <FormattedMessage id="FilterTableItem.header.options" defaultMessage="Options" />
    </div>
    <div className={cx('header-cell', 'owner-cell')}>
      <FormattedMessage id="FilterTableItem.header.owner" defaultMessage="Owner" />
    </div>
    <div className={cx('header-cell', 'shared-cell')}>
      <FormattedMessage id="FilterTableItem.header.shared" defaultMessage="Shared" />
    </div>
    <div className={cx('header-cell', 'display-on-launches-cell')}>
      <FormattedMessage id="FilterTableItem.header.displayOnLaunches" defaultMessage="Display on launches" />
    </div>
    <div className={cx('header-cell', 'delete-cell')}>
      <FormattedMessage id="FilterTableItem.header.delete" defaultMessage="Delete" />
    </div>
  </div>
);
