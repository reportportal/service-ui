import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Popover, MeatballMenuIcon, Button } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import styles from './popoverTools.scss';

const cx = classNames.bind(styles);

export const PopoverTools = () => {
  const { formatMessage } = useIntl();

  return (
    <Popover
      className={cx('popover-tools')}
      content={
        <ul>
          <li>
            <button className={cx('popover-tools__item-button')}>
              {formatMessage(COMMON_LOCALE_KEYS.RENAME)}
            </button>
          </li>
          <li>
            <button className={cx('popover-tools__item-button', 'popover-tools__item-button-red')}>
              {formatMessage(COMMON_LOCALE_KEYS.DELETE)}
            </button>
          </li>
        </ul>
      }
      placement="bottom-end"
    >
      <Button variant="ghost" className={cx('popover-tools__meatball-button')}>
        <MeatballMenuIcon />
      </Button>
    </Popover>
  );
};
