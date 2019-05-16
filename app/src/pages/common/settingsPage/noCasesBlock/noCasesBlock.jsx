import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './noCasesBlock.scss';

const cx = classNames.bind(styles);

export const NoCasesBlock = ({ noItemsMessage, notificationsInfo, children }) => (
  <div className={cx('no-cases-block')}>
    <h3 className={cx('no-items-message')}>{noItemsMessage}</h3>
    <div className={cx('notifications-info')}>{notificationsInfo}</div>
    {children}
  </div>
);

NoCasesBlock.propTypes = {
  noItemsMessage: PropTypes.string,
  notificationsInfo: PropTypes.string,
  children: PropTypes.node,
};

NoCasesBlock.defaultProps = {
  noItemsMessage: '',
  notificationsInfo: '',
  children: {},
};
