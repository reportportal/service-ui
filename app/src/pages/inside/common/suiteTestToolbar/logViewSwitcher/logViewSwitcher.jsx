import React from 'react';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import LogIcon from 'common/img/log-view-inline.svg';
import ListIcon from 'common/img/list-view-tiny-inline.svg';
import { LIST_VIEW, LOG_VIEW } from 'controllers/testItem/constants';
import styles from './logViewSwitcher.scss';

const cx = classNames.bind(styles);

export const LogViewSwitcher = ({ viewMode, onToggleView }) => (
  <div className={cx('view-switcher')}>
    <button
      className={cx('switcher-button', viewMode === LIST_VIEW ? 'list-view-active' : 'list-view')}
      onClick={() => viewMode === LOG_VIEW && onToggleView(LIST_VIEW)}
    >
      <i className={cx('icon')}>{Parser(ListIcon)}</i>
    </button>
    <button
      className={cx('switcher-button', viewMode === LOG_VIEW ? 'log-view-active' : 'log-view')}
      onClick={() => viewMode === LIST_VIEW && onToggleView(LOG_VIEW)}
    >
      <i className={cx('icon')}>{Parser(LogIcon)}</i>
    </button>
  </div>
);

LogViewSwitcher.propTypes = {
  viewMode: PropTypes.string,
  onToggleView: PropTypes.func.isRequired,
};

LogViewSwitcher.defaultProps = {
  viewMode: LIST_VIEW,
};
