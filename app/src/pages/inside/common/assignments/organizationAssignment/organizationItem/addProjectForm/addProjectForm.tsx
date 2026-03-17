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

import { ChangeEvent, useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  CheckmarkIcon,
  CloseIcon,
  InfoIcon,
  Tooltip,
} from '@reportportal/ui-kit';
import { createClassnames, fetch } from 'common/utils';
import { useIntl } from 'react-intl';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import { URLS } from 'common/urls';
import {
  ProjectsSearchesItem,
  ProjectsSearchesResponseData,
} from 'controllers/organization/projects';
import { getAppliedFilters } from 'controllers/instance/events/utils';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { Project } from '../projectItems';
import styles from './addProjectForm.scss';

const cx = createClassnames(styles);

interface AddProjectFormProps {
  projects: Project[];
  organizationId: number;
  canEditByDefault: boolean;
  invitedUserId?: number | null;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

export const AddProjectForm = ({
  organizationId,
  canEditByDefault,
  invitedUserId,
  projects,
  onSave,
  onCancel,
}: AddProjectFormProps) => {
  const { formatMessage } = useIntl();
  const [canEdit, setCanEdit] = useState(canEditByDefault);
  const [items, setItems] = useState<ProjectsSearchesItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<Pick<Project, 'id' | 'name'>>(null);
  const [userProjectIds, setUserProjectIds] = useState<Set<number>>(new Set());
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  useEffect(() => {
    setCanEdit(canEditByDefault);
  }, [canEditByDefault]);

  useEffect(() => {
    let active = true;

    setSelectedProject(null);
    setUserProjectIds(new Set());
    setAutocompleteKey((k) => k + 1);

    if (!invitedUserId) {
      return undefined;
    }

    fetch(URLS.organizationProjectsSearches(organizationId), {
      method: 'post',
      data: {
        limit: 300,
        search_criteria: [{ filter_key: 'userId', operation: 'EQ', value: String(invitedUserId) }],
      },
    })
      .then((response: ProjectsSearchesResponseData) => {
        if (!active) return;
        const ids = new Set<number>((response.items ?? []).map((p) => p.id));
        setUserProjectIds(ids);
        setAutocompleteKey((k) => k + 1);
      })
      .catch(() => {
        if (active) setUserProjectIds(new Set());
      });

    return () => {
      active = false;
    };
  }, [invitedUserId, organizationId]);

  const getRequestParams = (inputValue: string) => {
    return {
      method: 'post',
      data: {
        limit: 20,
        search_criteria: getAppliedFilters({ [SEARCH_KEY]: inputValue }).search_criterias,
      },
    };
  };

  const makeOptions = (response: ProjectsSearchesResponseData) => {
    if (response.items) {
      const filtered = response.items.filter(
        (item) =>
          !projects.some((project: Project) => project.id === item.id) &&
          !userProjectIds.has(item.id),
      );
      setItems(filtered);
      return filtered.map((item) => item.name);
    }

    return [];
  };

  const handleChangeCanEdit = (event: ChangeEvent<HTMLInputElement>) => {
    setCanEdit(event.target.checked);
  };

  const handleChangeProject = (projectName: string) => {
    const project: ProjectsSearchesItem = items.find((item) => item.name === projectName);

    if (project) {
      setSelectedProject({ id: project.id, name: project.name });
      return;
    }

    setSelectedProject(null);
  };

  const handleSubmit = () => {
    const project: Project = {
      ...selectedProject,
      role: canEdit ? EDITOR : VIEWER,
    };
    onSave(project);
  };

  return (
    <div className={cx('form')}>
      <div className={cx('projects')}>
        <AsyncAutocompleteV2
          key={autocompleteKey}
          inputProps={{
            clearable: !!selectedProject,
            onClear: () => setSelectedProject(null),
          }}
          placeholder={formatMessage(messages.selectSearchProject)}
          getURI={() => URLS.organizationProjectsSearches(organizationId)}
          getRequestParams={getRequestParams}
          makeOptions={makeOptions}
          onChange={handleChangeProject}
          createWithoutConfirmation
          skipOptionCreation
          customEmptyListMessage={formatMessage(COMMON_LOCALE_KEYS.NO_AVAILABLE_OPTIONS)}
          useFixedPositioning
          dropdownMatchInputWidth
        />
      </div>
      <div className={cx('checkbox-wrapper')}>
        <Checkbox value={canEdit} onChange={handleChangeCanEdit} disabled={canEditByDefault}>
          {formatMessage(messages.canEdit)}
        </Checkbox>
        <Tooltip
          content={formatMessage(messages.hintMessage)}
          placement="top"
          contentClassName={cx('custom-tooltip')}
          wrapperClassName={cx('tooltip-wrapper')}
        >
          <InfoIcon className={cx('icon')} />
        </Tooltip>
      </div>
      <div className={cx('buttons')}>
        <Button
          className={cx('button', 'save')}
          adjustWidthOn="content"
          onClick={handleSubmit}
          disabled={!selectedProject}
        >
          <CheckmarkIcon />
        </Button>
        <Button
          className={cx('button', 'cancel')}
          adjustWidthOn="content"
          variant="ghost"
          onClick={onCancel}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};
