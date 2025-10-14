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

import { useIntl } from 'react-intl';

import { BaseIconButton, CloseIcon, Dropdown, Tooltip } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { getRoleTitle } from 'common/utils/permissions';
import { messages } from 'common/constants/localization/invitationsLocalization';

import styles from './projectItems.scss';

const cx = createClassnames(styles);

export interface Project {
  id: number;
  name: string;
  role: string;
}

interface ProjectItemsProps {
  projects: Project[];
  canEditByDefault: boolean;
  onChange: (id: number, updates: Partial<Project>) => void;
  onRemove: (id: number) => void;
}

export const ProjectItems = ({
  projects = [],
  canEditByDefault,
  onChange,
  onRemove,
}: ProjectItemsProps) => {
  const { formatMessage } = useIntl();
  const roleOptions = [VIEWER, EDITOR].map((role) => ({
    label: formatMessage(getRoleTitle(role)),
    value: role,
  }));

  const handleRoleChange = (projectId: number) => (value: string) => {
    onChange(projectId, { role: value });
  };

  const renderRole = (project: Project) => (
    <Dropdown
      className={cx('role')}
      value={project.role}
      options={roleOptions}
      onChange={handleRoleChange(project.id)}
      variant="ghost"
      disabled={canEditByDefault}
    />
  );

  return projects.map((project) => (
    <div className={cx('project')} key={project.id}>
      <div className={cx('name')}>{project.name}</div>
      <div className={cx('controls')}>
        {canEditByDefault ? (
          <Tooltip
            wrapperClassName={cx('tooltip-wrapper')}
            content={formatMessage(messages.managersCanEditAll)}
            placement="top"
          >
            {renderRole(project)}
          </Tooltip>
        ) : (
          renderRole(project)
        )}
        <BaseIconButton className={cx('remove-button')} onClick={() => onRemove(project.id)}>
          <CloseIcon />
        </BaseIconButton>
      </div>
    </div>
  ));
};
