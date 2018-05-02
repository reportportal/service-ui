import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContent.scss';

const cx = classNames.bind(styles);

export const ModalContent = ({ children, fullWidthContent }) => (
  <div className={cx('modal-content', { 'full-width': fullWidthContent })}>{children}</div>
);
ModalContent.propTypes = {
  children: PropTypes.node,
  fullWidthContent: PropTypes.bool,
};
ModalContent.defaultProps = {
  children: null,
  fullWidthContent: false,
};
