import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import styles from './projectsGrid.scss';
import { ProjectMenu } from '../projectMenu';

const cx = classNames.bind(styles);

export const NameColumn = ({ className, value }) => (
  <div className={cx('projects-col', className)}>{value.projectName}</div>
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
