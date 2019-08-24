import React from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './shareTooltip.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  sharedByFilter: {
    id: 'ShareTooltip.sharedByFilter',
    defaultMessage: 'Filter is shared by {owner}',
  },
  sharedFilter: {
    id: 'ShareTooltip.sharedFilter',
    defaultMessage: 'Filter is shared by you',
  },
});

export const ShareTooltip = ({ intl, currentUser, owner }) => (
  <div className={cx('share-tooltip')}>
    {currentUser === owner
      ? intl.formatMessage(messages.sharedFilter)
      : intl.formatMessage(messages.sharedByFilter, { owner })}
  </div>
);
ShareTooltip.propTypes = {
  intl: PropTypes.object.isRequired,
  currentUser: PropTypes.string,
  owner: PropTypes.string,
};

ShareTooltip.defaultProps = {
  currentUser: '',
  owner: '',
};
