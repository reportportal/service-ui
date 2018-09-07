import React from 'react';
import classNames from 'classnames/bind';
import styles from './iconStateIndicators.scss';

const cx = classNames.bind(styles);

export const DefaultIcon = () => <div className={cx('indicator-default')}>.zip</div>;
