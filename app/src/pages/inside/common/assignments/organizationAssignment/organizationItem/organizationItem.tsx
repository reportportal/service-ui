/*
 * Copyright 2025 EPAM Systems
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

import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
  BaseIconButton,
  CloseIcon,
  Dropdown,
  DropdownIcon,
  SpinLoader,
  Tooltip,
} from '@reportportal/ui-kit';

import { isBrowser } from 'es-toolkit';
import { capitalize, createClassnames, fetch } from 'common/utils';
import { EDITOR, MANAGER, MEMBER } from 'common/constants/projectRoles';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { messages as assignmentMessages } from 'common/constants/localization/assignmentsLocalization';
import { getOrgRoleTitle } from 'common/utils/permissions';
import { URLS } from 'common/urls';
import { ProjectsSearchesResponseData } from 'controllers/organization/projects';
import { OrganizationType } from 'controllers/organization';
import { idSelector } from 'controllers/user';
import { IconsBlock } from 'pages/instance/organizationsPage/organizationsPanelView/iconsBlock/iconsBlock';
import { useAssignmentsUtils } from 'pages/inside/common/assignments/hooks';

import { PROJECTS_LIMIT } from './constants';
import { AddItemButton } from './addItemButton';
import { Project, ProjectItems } from './projectItems';
import { AddProjectForm } from './addProjectForm';

import styles from './organizationItem.scss';

const cx = createClassnames(styles);

export interface Organization {
  id: number;
  name: string;
  type?: OrganizationType;
  owner_id?: number;
  isNew?: boolean;
  role: string;
  projects: Project[];
  isProjectsLoaded?: boolean;
  isProjectsLoading?: boolean;
  isExpanded?: boolean;
}

interface OrganizationItemProps {
  value: Organization;
  onChange: (updates: Partial<Organization>) => void;
  onRemove?: () => void;
  collapsable?: boolean;
  disabled?: boolean;
  invitedUserId?: number | null;
  userType?: string;
  excludeUserAssignments?: boolean;
  onAddProjectFormToggle?: (orgId: number, isOpen: boolean) => void;
  onExpandOrganization?: (orgId: number) => void;
  showUnassignProjectTooltip?: boolean;
}

export const OrganizationItem = ({
  value,
  onChange,
  onRemove,
  collapsable,
  disabled = false,
  invitedUserId,
  userType,
  excludeUserAssignments = false,
  onAddProjectFormToggle,
  onExpandOrganization,
  showUnassignProjectTooltip,
}: OrganizationItemProps) => {
  const { formatMessage } = useIntl();
  const currentUserId = useSelector(idSelector) as number;
  const {
    id,
    name,
    type,
    owner_id: ownerId,
    isNew,
    role,
    projects,
    isExpanded = true,
    isProjectsLoading,
  } = value;

  const organizationRoleDisabledTooltip = useMemo(() => {
    if (invitedUserId == null || isNew) {
      return null;
    }
    const isOwnAccount = currentUserId === invitedUserId;
    const isAssignedUserOrgOwner = ownerId != null && invitedUserId === ownerId;
    if (!isOwnAccount && !isAssignedUserOrgOwner) {
      return null;
    }
    return formatMessage(
      isOwnAccount
        ? assignmentMessages.organizationRoleDisabledOwnAccount
        : assignmentMessages.organizationRoleDisabledOwner,
    );
  }, [invitedUserId, isNew, currentUserId, ownerId, formatMessage]);

  const disableOrganizationRole = Boolean(organizationRoleDisabledTooltip);
  const menuPortalRoot = isBrowser()
    ? document.getElementById('tooltip-root') ?? document.body
    : undefined;
  const [totalProjects, setTotalProjects] = useState(0);
  const [addProjectFormOpen, setAddProjectFormOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(isExpanded);
  const roleOptions = [MEMBER, MANAGER].map((role) => ({
    label: formatMessage(getOrgRoleTitle(role)),
    value: role,
  }));
  const noProjects = totalProjects === 0;
  const allProjectsAdded = projects?.length === totalProjects;

  const prevAddProjectFormOpen = useRef(false);
  const onAddProjectFormToggleRef = useRef(onAddProjectFormToggle);

  useEffect(() => {
    onAddProjectFormToggleRef.current = onAddProjectFormToggle;
  });

  useEffect(() => {
    const wasOpen = prevAddProjectFormOpen.current;
    prevAddProjectFormOpen.current = addProjectFormOpen;
    if (addProjectFormOpen !== wasOpen) {
      onAddProjectFormToggleRef.current?.(id, addProjectFormOpen);
    }
  }, [addProjectFormOpen, id]);

  useEffect(() => {
    return () => {
      if (prevAddProjectFormOpen.current) {
        onAddProjectFormToggleRef.current?.(id, false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const data = { method: 'post', data: { limit: PROJECTS_LIMIT } };
    fetch(URLS.organizationProjectsSearches(id), data)
      .then(({ total_count }: ProjectsSearchesResponseData) => {
        setTotalProjects(total_count);
      })
      .catch(() => {
        setTotalProjects(0);
      });
  }, [id]);

  useEffect(() => {
    if (isOpen) {
      onExpandOrganization?.(id);
    }
  }, [isOpen, id, onExpandOrganization]);

  const handleRoleChange = (newRole: string) => {
    if (newRole === MANAGER) {
      const updatedProjects = projects.map((project) => ({
        ...project,
        role: EDITOR,
      }));
      onChange({ role: newRole, projects: updatedProjects });
      return;
    }
    onChange({ role: newRole });
  };

  const handleAddProject = (newProject: Project) => {
    onChange({ projects: [...projects, newProject] });
    setAddProjectFormOpen(false);
  };

  const handleProjectChange = (projectId: number, updates: Partial<Project>) => {
    const updatedProjects = projects.map((item) =>
      item.id === projectId ? { ...item, ...updates } : item,
    );
    onChange({ projects: updatedProjects });
  };

  const handleProjectRemove = (projectId: number) => {
    const updatedProjects = projects.filter((item) => item.id !== projectId);
    onChange({ projects: updatedProjects });
  };

  const itemDisabled = disabled || addProjectFormOpen;
  const collapseDisabled = collapsable && itemDisabled;

  const handleCollapsable = () => {
    if (collapseDisabled) return;
    setIsOpen(!isOpen);
  };

  const { unassignTooltip } = useAssignmentsUtils({
    currentUserId,
    userId: invitedUserId,
    userType,
    organizationType: type,
    ownerId,
  });

  const renderRemoveButton = () => {
    if (!onRemove) return null;

    const commonTooltipMessage = assignmentMessages.unassignOrganizationUser;

    const button = (
      <BaseIconButton
        className={cx('remove-button')}
        onClick={onRemove}
        disabled={!!unassignTooltip || itemDisabled}
      >
        <CloseIcon />
      </BaseIconButton>
    );

    return (
      <Tooltip
        placement="top"
        content={
          unassignTooltip
            ? `${formatMessage(unassignTooltip)}`
            : `${capitalize(formatMessage(commonTooltipMessage))}`
        }
        tooltipClassName={cx('custom-tooltip')}
        wrapperClassName={cx('tooltip-wrapper')}
      >
        {button}
      </Tooltip>
    );
  };

  return (
    <div className={cx('organization')}>
      <div className={cx('header')}>
        <div
          className={cx('name', { pointer: collapsable && !collapseDisabled })}
          title={name}
          onClick={collapsable ? handleCollapsable : null}
        >
          {collapsable && (
            <div className={cx('icon', { rotated: !isOpen, disabled: collapseDisabled })}>
              <DropdownIcon />
            </div>
          )}
          <span className={cx('name-label', { disabled: itemDisabled })}>{name}</span>
          {!!type && (
            <IconsBlock organizationType={type} iconClassName={cx({ disabled: itemDisabled })} />
          )}
        </div>
        <div className={cx('controls')}>
          <div className={cx('role-slot')}>
            {disableOrganizationRole ? (
              <Tooltip
                placement="top"
                content={organizationRoleDisabledTooltip}
                wrapperClassName={cx('tooltip-wrapper')}
              >
                <Dropdown
                  disabled
                  className={cx('role')}
                  value={role}
                  options={roleOptions}
                  onChange={handleRoleChange}
                  variant="ghost"
                  menuPortalRoot={menuPortalRoot}
                />
              </Tooltip>
            ) : (
              <Dropdown
                disabled={disableOrganizationRole || itemDisabled}
                className={cx('role')}
                value={role}
                options={roleOptions}
                onChange={handleRoleChange}
                variant="ghost"
                menuPortalRoot={menuPortalRoot}
              />
            )}
          </div>
          {renderRemoveButton()}
        </div>
      </div>
      {isOpen && (
        <div className={cx({ collapsable })}>
          {isProjectsLoading ? (
            <div className={cx('projects-loader')}>
              <SpinLoader />
            </div>
          ) : (
            <>
              <ProjectItems
                projects={projects}
                canEditByDefault={role === MANAGER}
                disabled={itemDisabled}
                onChange={handleProjectChange}
                onRemove={handleProjectRemove}
                showUnassignProjectTooltip={showUnassignProjectTooltip}
              />

              <div className={cx('add-project')}>
                {addProjectFormOpen ? (
                  <AddProjectForm
                    projects={projects}
                    organizationId={id}
                    canEditByDefault={role === MANAGER}
                    invitedUserId={invitedUserId}
                    excludeUserAssignments={excludeUserAssignments}
                    onSave={handleAddProject}
                    onCancel={() => setAddProjectFormOpen(false)}
                  />
                ) : (
                  <AddItemButton
                    tooltipClassname={cx('tooltip-wrapper')}
                    onClick={() => setAddProjectFormOpen(true)}
                    tooltipContent={noProjects ? messages.noProjects : messages.allProjectsAdded}
                    disabled={noProjects || allProjectsAdded || disabled}
                    text={formatMessage(messages.addProject)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
