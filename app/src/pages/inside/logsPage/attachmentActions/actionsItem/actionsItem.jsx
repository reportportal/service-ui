import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import styles from './actionsItem.scss';

const cx = classNames.bind(styles);

export const ActionsItem = ({ caption, hidden, icon, action, showCaption }) => (
  <span title={caption} onClick={hidden ? null : action} className={cx('actions-item', { hidden })}>
    <span className={cx('icon')}>{Parser(icon)}</span>
    {showCaption && <span className={cx('caption')}>{caption}</span>}
  </span>
);
ActionsItem.propTypes = {
  caption: PropTypes.string,
  hidden: PropTypes.bool,
  showCaption: PropTypes.bool,
  icon: PropTypes.any,
  action: PropTypes.func,
};
ActionsItem.defaultProps = {
  caption: '',
  hidden: false,
  showCaption: false,
  icon: '',
  action: null,
};
