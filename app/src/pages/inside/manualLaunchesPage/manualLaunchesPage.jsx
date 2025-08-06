import React from 'react';
import classNames from 'classnames/bind';
import { ManualLaunchesPageHeader } from './manualLaunchesPageHeader';
import { ManualLaunchesEmptyState } from './emptyState/manualLaunchesEmptyState';
import styles from './manualLaunchesPage.scss';

const cx = classNames.bind(styles);

export const ManualLaunchesPage = () => {
  return (
    <div className={cx('manual-launches-page')}>
      <ManualLaunchesPageHeader />
      <ManualLaunchesEmptyState />
    </div>
  );
};
