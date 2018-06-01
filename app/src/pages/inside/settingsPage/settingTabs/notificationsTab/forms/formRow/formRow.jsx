import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './formRow.scss';

const cx = classNames.bind(styles);

export const FormRow = ({ note, children }) => (
  <div className={cx('form-row')}>
    {children}
    <div className={cx('form-note')}>{note && note()}</div>
  </div>
);
FormRow.propTypes = {
  note: PropTypes.func,
  children: PropTypes.node,
};
FormRow.defaultProps = {
  note: () => {},
  children: null,
};
