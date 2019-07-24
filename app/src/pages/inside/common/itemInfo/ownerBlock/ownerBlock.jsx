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

export const OwnerBlock = injectIntl(({ intl, owner, disabled, onClick }) => {
  const clickHandler = () => {
    onClick(owner);
  };
  return (
    <div
      className={cx('owner-block', { disabled })}
      title={intl.formatMessage(messages.ownerTitle)}
      onClick={clickHandler}
    >
      <div className={cx('owner-icon')} />
      <span className={cx('owner')}>{owner}</span>
    </div>
  );
});

OwnerBlock.propTypes = {
  owner: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

OwnerBlock.defaultProps = {
  disabled: false,
  onClick: () => {},
};
