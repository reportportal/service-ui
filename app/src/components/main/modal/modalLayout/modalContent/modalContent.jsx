import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContent.scss';

const cx = classNames.bind(styles);

export const ModalContent = ({ className, children }) => (
  <div className={cx('modal-content', className)}>{children}</div>
);
ModalContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
ModalContent.defaultProps = {
  children: null,
  className: '',
};
