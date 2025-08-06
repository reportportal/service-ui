import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { messages } from './messages';
import { MembersPageHeader } from '../../organization/common/membersPage/membersPageHeader';

export const ManualLaunchesPageHeader = () => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);

  return (
    <MembersPageHeader
      title={formatMessage(messages.manualLaunchesTitle)}
      organizationName={organizationName}
      projectName={projectName}
    />
  );
};

ManualLaunchesPageHeader.propTypes = {
  isMembersLoading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool,
  onInvite: PropTypes.func,
};

ManualLaunchesPageHeader.defaultProps = {
  hasPermission: false,
  onInvite: () => {},
};
