import React from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import styles from './iconStateIndicators.scss';
import SuccessIcon from './img/ic-success-inline.svg';

const cx = classNames.bind(styles);

export const UploadedIcon = () => <div className={cx('indicator-icon')}>{Parser(SuccessIcon)}</div>;
