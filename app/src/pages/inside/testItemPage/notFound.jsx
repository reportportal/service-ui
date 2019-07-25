import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './notFound.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  launchNotFound: {
    id: 'LaunchesPage.launchNotFound',
    defaultMessage: 'Launch is not found',
  },
  notFoundDescription: {
    id: 'LaunchesPage.checkQuery',
    defaultMessage: 'Failed to load data for launches table',
  },
  itemNotFound: {
    id: 'LaunchesPage.itemNotFound',
    defaultMessage: 'Item is not found',
  },
});

export const NotFound = injectIntl(({ intl: { formatMessage }, isItemNotFound }) => (
  <div className={cx('launch-not-found')}>
    <NoItemMessage
      message={formatMessage(isItemNotFound ? messages.itemNotFound : messages.launchNotFound)}
    />
    <p className={cx('launch-not-found-hint')}>{formatMessage(messages.notFoundDescription)}</p>
  </div>
));
