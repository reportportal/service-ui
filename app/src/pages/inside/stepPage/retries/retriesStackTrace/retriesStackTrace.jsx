/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import track from 'react-tracking';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events';
import { MarkdownViewer } from 'components/main/markdown';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './retriesStackTrace.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noItem: {
    id: 'RetriesStackTrace.emptyMessage',
    defaultMessage: 'No stack trace to display',
  },
});

export const RetriesStackTrace = track()(
  injectIntl(
    ({ index, message, link, loading, intl: { formatMessage }, tracking: { trackEvent } }) => {
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
        <div className={cx('retries-stack-trace')}>
          <div className={cx('title')}>Stack trace #{index + 1}</div>
          <div className={cx('description', { empty: !message || loading })}>{description}</div>
          <div className={cx('link')}>
            <Link
              to={link}
              onClick={() => trackEvent(STEP_PAGE_EVENTS.CLICK_LINK_OPEN_RETRY_IN_LOG_VIEW)}
            >
              <FormattedMessage id="StackTrace.linkText" defaultMessage="Open in Log view" />
            </Link>
          </div>
        </div>
      );
    },
  ),
);
RetriesStackTrace.propTypes = {
  intl: PropTypes.object.isRequired,
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }).isRequired,
  index: PropTypes.number.isRequired,
  message: PropTypes.string,
  retryId: PropTypes.number.isRequired,
  link: PropTypes.object.isRequired,
  loading: PropTypes.bool,
};
RetriesStackTrace.defaultProps = {
  message: '',
  loading: false,
};
