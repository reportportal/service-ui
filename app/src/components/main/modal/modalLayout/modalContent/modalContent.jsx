import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContent.scss';

const cx = classNames.bind(styles);

export const ModalContent = ({ children }) => (
  <div className={cx('modal-content')}>
    { children }
  </div>
  );
ModalContent.propTypes = {
  children: PropTypes.node,
};
ModalContent.defaultProps = {
  children: null,
};
