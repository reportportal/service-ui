import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { MarkdownViewer } from 'components/main/markdown';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './stackTrace.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noItem: {
    id: 'StackTrace.emptyMessage',
    defaultMessage: 'No stack trace to display',
  },
});

export const StackTrace = injectIntl(
  ({ index, message, link, loading, intl: { formatMessage } }) => {
    let description = <NoItemMessage message={formatMessage(messages.noItem)} />;
    if (loading) {
      description = <SpinningPreloader />;
    } else if (message) {
      description = (
        <ScrollWrapper>
          <MarkdownViewer value={message} />
        </ScrollWrapper>
      );
    }

    return (
      <div className={cx('stack-trace')}>
        <div className={cx('title')}>Stack trace #{index + 1}</div>
        <div className={cx('description', { empty: !message || loading })}>{description}</div>
        <div className={cx('link')}>
          <Link to={link}>
            <FormattedMessage id="StackTrace.linkText" defaultMessage="Open in Log view" />
          </Link>
        </div>
      </div>
    );
  },
);
StackTrace.propTypes = {
  index: PropTypes.number.isRequired,
  message: PropTypes.string,
  retryId: PropTypes.number.isRequired,
  link: PropTypes.object.isRequired,
  loading: PropTypes.bool,
};
StackTrace.defaultProps = {
  message: '',
  loading: false,
};
