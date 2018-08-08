import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './modalContent.scss';

const cx = classNames.bind(styles);

export const ModalContent = ({ children, stretchedContent }) => (
  <div className={cx('modal-content', { 'stretched-content': stretchedContent })}>{children}</div>
);
ModalContent.propTypes = {
  children: PropTypes.node,
  stretchedContent: PropTypes.bool,
};
ModalContent.defaultProps = {
  children: null,
  stretchedContent: false,
};
