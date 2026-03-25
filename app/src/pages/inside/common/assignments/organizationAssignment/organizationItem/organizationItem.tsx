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

import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  BaseIconButton,
  CloseIcon,
  Dropdown,
  DropdownIcon,
  SpinLoader,
  Tooltip,
} from '@reportportal/ui-kit';

import { createClassnames, fetch } from 'common/utils';
import { EDITOR, MANAGER, MEMBER } from 'common/constants/projectRoles';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { getOrgRoleTitle } from 'common/utils/permissions';
import { URLS } from 'common/urls';
import { ProjectsSearchesResponseData } from 'controllers/organization/projects';

import { PROJECTS_LIMIT } from './constants';
import { AddItemButton } from './addItemButton';
import { Project, ProjectItems } from './projectItems';
import { AddProjectForm } from './addProjectForm';

import styles from './organizationItem.scss';

const cx = createClassnames(styles);

export interface Organization {
  id: number;
  name: string;
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
  organizationRoleDisabledTooltip?: string | null;
  addProjectDisabled?: boolean;
  invitedUserId?: number | null;
  onAddProjectFormToggle?: (orgId: number, isOpen: boolean) => void;
  onExpandOrganization?: (orgId: number) => void;
}

export const OrganizationItem = ({
  value,
  onChange,
  onRemove,
  collapsable,
  organizationRoleDisabledTooltip = null,
  addProjectDisabled = false,
  invitedUserId,
  onAddProjectFormToggle,
  onExpandOrganization,
}: OrganizationItemProps) => {
  const disableOrganizationRole = Boolean(organizationRoleDisabledTooltip);
  const { formatMessage } = useIntl();
  const { id, name, role, projects, isExpanded = true, isProjectsLoading } = value;
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

  const collapseDisabled = collapsable && addProjectFormOpen;

  const handleCollapsable = () => {
    if (collapseDisabled) return;
    setIsOpen(!isOpen);
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
          {name}
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
                />
              </Tooltip>
            ) : (
              <Dropdown
                disabled={disableOrganizationRole}
                className={cx('role')}
                value={role}
                options={roleOptions}
                onChange={handleRoleChange}
                variant="ghost"
              />
            )}
          </div>
          {onRemove && (
            <BaseIconButton className={cx('remove-button')} onClick={onRemove}>
              <CloseIcon />
            </BaseIconButton>
          )}
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
                onChange={handleProjectChange}
                onRemove={handleProjectRemove}
              />

              <div className={cx('add-project')}>
                {addProjectFormOpen ? (
                  <AddProjectForm
                    projects={projects}
                    organizationId={id}
                    canEditByDefault={role === MANAGER}
                    invitedUserId={invitedUserId}
                    onSave={handleAddProject}
                    onCancel={() => setAddProjectFormOpen(false)}
                  />
                ) : (
                  <AddItemButton
                    tooltipClassname={cx('tooltip-wrapper')}
                    onClick={() => setAddProjectFormOpen(true)}
                    tooltipContent={noProjects ? messages.noProjects : messages.allProjectsAdded}
                    disabled={noProjects || allProjectsAdded || addProjectDisabled}
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
