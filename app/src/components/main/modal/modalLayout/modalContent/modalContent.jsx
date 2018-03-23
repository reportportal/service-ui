import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContent.scss';

const cx = classNames.bind(styles);

export const ModalContent = ({ children, permissionMap }) => (
  <div className={cx('modal-content', { 'permission-content': permissionMap })}>
    { children }
  </div>
  );
ModalContent.propTypes = {
  children: PropTypes.node,
  permissionMap: PropTypes.bool,
};
ModalContent.defaultProps = {
  children: null,
  permissionMap: false,
};
