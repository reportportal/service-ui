import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './iconStateIndicators.scss';
import { ACCEPT_FILE_TYPES_ABBR } from '../../constants';

const cx = classNames.bind(styles);

export const DefaultIcon = ({ fileType }) => (
  <div className={cx('indicator-default')}>{`.${ACCEPT_FILE_TYPES_ABBR[fileType]}`}</div>
);

DefaultIcon.propTypes = {
  fileType: PropTypes.string,
};
DefaultIcon.defaultProps = {
  fileType: '',
};
