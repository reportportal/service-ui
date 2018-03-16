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

export const OwnerBlock = injectIntl(({ intl, owner }) => (
  <div className={cx('owner-block')} title={intl.formatMessage(messages.ownerTitle)}>
    <div className={cx('owner-icon')} />
    <a href="/" className={cx('owner')}>{ owner }</a>
  </div>
));

OwnerBlock.propTypes = {
  owner: PropTypes.string.isRequired,
};
