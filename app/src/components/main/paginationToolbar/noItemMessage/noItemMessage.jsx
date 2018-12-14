import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import ErrorIcon from 'common/img/error-inline.svg';
import styles from './noItemMessage.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  noResults: {
    id: 'LogsGrid.noResults',
    defaultMessage: 'No results found',
  },
});

export const NoItemMessage = injectIntl(({ intl }) => (
  <div className={cx('no-item-message')}>
    <p className={cx('no-item-message-text')}>
      <i className={cx('no-item-message-icon')}>{Parser(ErrorIcon)}</i>
      {intl.formatMessage(messages.noResults)}
    </p>
  </div>
));
