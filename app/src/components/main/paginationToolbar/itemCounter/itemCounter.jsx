import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';

import styles from './itemCounter.scss';

const cx = classNames.bind(styles);

export const ItemCounter = ({ activePage, pageSize, itemCount }) => {
  const endIndex = activePage * pageSize;
  const startIndex = endIndex - pageSize;
  return (
    <div className={cx('item-counter')}>
      {`${startIndex + 1} - ${endIndex < itemCount ? endIndex : itemCount}`}{' '}
      <FormattedMessage id="Common.of" defaultMessage="of" /> {itemCount}
    </div>
  );
};
ItemCounter.propTypes = {
  activePage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
};
