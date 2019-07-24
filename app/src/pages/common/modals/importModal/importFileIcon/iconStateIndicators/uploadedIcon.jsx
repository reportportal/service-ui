import React from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import SuccessIcon from 'common/img/ic-success-inline.svg';
import styles from './iconStateIndicators.scss';

const cx = classNames.bind(styles);

export const UploadedIcon = () => <div className={cx('indicator-icon')}>{Parser(SuccessIcon)}</div>;
