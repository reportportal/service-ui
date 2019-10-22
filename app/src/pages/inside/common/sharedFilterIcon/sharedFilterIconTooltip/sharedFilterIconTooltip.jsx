import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './sharedFilterIconTooltip.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const SharedFilterIconTooltip = ({ intl, currentUser, owner }) => (
  <div className={cx('share-tooltip')}>
    {currentUser === owner || owner === undefined
      ? intl.formatMessage(messages.sharedFilter)
      : intl.formatMessage(messages.sharedByFilter, { owner })}
  </div>
);
SharedFilterIconTooltip.propTypes = {
  intl: PropTypes.object.isRequired,
  currentUser: PropTypes.string,
  owner: PropTypes.string,
};

SharedFilterIconTooltip.defaultProps = {
  currentUser: '',
  owner: undefined,
};
