/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import styles from './projectsGrid.scss';
import { ProjectMenu } from '../projectMenu';
import { ProjectStatisticButton } from '../projectStatisticButton';
import { ProjectName } from '../projectName';

const cx = classNames.bind(styles);

export const NameColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>
    <ProjectName project={value} />
  </div>
);
NameColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
NameColumn.defaultProps = {
  value: {},
};

export const ProjectTypeColumn = ({ className, value }) => (
  <div className={cx('projects-col', 'project-type-col', className)}>
    {value.entryType.toLowerCase()}
  </div>
);
ProjectTypeColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
ProjectTypeColumn.defaultProps = {
  value: {},
};

export const OrganizationColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>{value.organization}</div>
);
OrganizationColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
OrganizationColumn.defaultProps = {
  value: {},
};

export const MembersColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>{value.usersQuantity}</div>
);
MembersColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
MembersColumn.defaultProps = {
  value: {},
};

export const LaunchesColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>{value.launchesQuantity}</div>
);
LaunchesColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
LaunchesColumn.defaultProps = {
  value: {},
};

export const LastLaunchColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>
    {value.lastRun ? (
      <AbsRelTime startTime={value.lastRun} />
    ) : (
      <FormattedMessage id="LastLaunchColumn.noLaunches" defaultMessage="0 days ago" />
    )}
  </div>
);
LastLaunchColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
LastLaunchColumn.defaultProps = {
  value: {},
};

export const MenuColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>
    <ProjectMenu project={value} />
  </div>
);
MenuColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
MenuColumn.defaultProps = {
  value: {},
};

export const StatisticColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>
    <ProjectStatisticButton projectName={value.projectName} />
  </div>
);
StatisticColumn.propTypes = {
  className: PropTypes.string.isRequired,
  value: PropTypes.object,
};
StatisticColumn.defaultProps = {
  value: {},
};
