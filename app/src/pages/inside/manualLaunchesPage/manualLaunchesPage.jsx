import React from 'react';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { ManualLaunchesEmptyState } from './emptyState/manualLaunchesEmptyState';
import { messages } from './messages';
import styles from './manualLaunchesPage.scss';

const cx = classNames.bind(styles);

export const ManualLaunchesPage = () => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);

  return (
    <div className={cx('manual-launches-page')}>
      <LocationHeaderLayout
        title={formatMessage(messages.manualLaunchesTitle)}
        organizationName={organizationName}
        projectName={projectName}
      />
      <ManualLaunchesEmptyState />
    </div>
  );
};
