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

import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { BaseIconButton, CloseIcon, Dropdown } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { EDITOR, MANAGER, MEMBER } from 'common/constants/projectRoles';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { getOrgRoleTitle } from 'common/utils/permissions';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { PROJECTS_LIMIT } from './constants';
import styles from './organizationItem.scss';
import { AddProjectButton } from './addProjectButton';
import { Project, ProjectItems } from './projectItems';
import { AddProjectForm } from './addProjectForm';
import { ProjectsSearchesResponseData } from 'controllers/organization/projects';

const cx = classNames.bind(styles) as typeof classNames;

export interface Organization {
  id: number;
  name: string;
  role: string;
  projects: Project[];
}

interface OrganizationItemProps {
  value: Organization;
  onChange: (updates: Partial<Organization>) => void;
  onRemove?: () => void;
}

export const OrganizationItem = ({ value, onChange, onRemove }: OrganizationItemProps) => {
  const { formatMessage } = useIntl();
  const { id, name, role, projects } = value;
  const [totalProjects, setTotalProjects] = useState(0);
  const [addProjectFormOpen, setAddProjectFormOpen] = useState(false);
  const roleOptions = [MEMBER, MANAGER].map((role) => ({
    label: formatMessage(getOrgRoleTitle(role)),
    value: role,
  }));
  const noProjects = totalProjects === 0;
  const allProjectsAdded = projects?.length === totalProjects;

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

  return (
    <div className={cx('organization')}>
      <div className={cx('header')}>
        <div className={cx('name')} title={name}>
          {name}
        </div>
        <div className={cx('controls')}>
          <Dropdown
            className={cx('role')}
            value={role}
            options={roleOptions}
            onChange={handleRoleChange}
            variant="ghost"
          />
          {onRemove && (
            <BaseIconButton className={cx('remove-button')} onClick={onRemove}>
              <CloseIcon />
            </BaseIconButton>
          )}
        </div>
      </div>

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
            onSave={handleAddProject}
            onCancel={() => setAddProjectFormOpen(false)}
          />
        ) : (
          <AddProjectButton
            tooltipClassname={cx('tooltip-wrapper')}
            onClick={() => setAddProjectFormOpen(true)}
            tooltipContent={noProjects ? messages.noProjects : messages.allProjectsAdded}
            disabled={noProjects || allProjectsAdded}
          />
        )}
      </div>
    </div>
  );
};
