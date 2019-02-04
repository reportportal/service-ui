import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './notFound.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  notFound: {
    id: 'LaunchesPage.notFound',
    defaultMessage: 'Launch is not found',
  },
  notFoundDescription: {
    id: 'LaunchesPage.checkQuery',
    defaultMessage: 'Failed to load data for launches table',
  },
});

export const NotFound = injectIntl(({ intl: { formatMessage } }) => (
  <div className={cx('launch-not-found')}>
    <NoItemMessage message={formatMessage(messages.notFound)} />
    <p className={cx('launch-not-found-hint')}>{formatMessage(messages.notFoundDescription)}</p>
  </div>
));
