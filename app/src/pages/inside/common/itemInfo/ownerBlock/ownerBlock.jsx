import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './ownerBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  ownerTitle: {
    id: 'OwnerBlock.ownerTitle',
    defaultMessage: 'Owner',
  },
});

// TODO: add an action with filters by clicking on the owner item
export const OwnerBlock = injectIntl(({ intl, owner, disabled }) => (
  <div className={cx('owner-block', { disabled })} title={intl.formatMessage(messages.ownerTitle)}>
    <div className={cx('owner-icon')} />
    <span className={cx('owner')}>{owner}</span>
  </div>
));

OwnerBlock.propTypes = {
  owner: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

OwnerBlock.defaultProps = {
  disabled: false,
};
