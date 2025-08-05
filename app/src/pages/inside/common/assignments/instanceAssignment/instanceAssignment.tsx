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

import { useState, ChangeEvent } from 'react';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Checkbox,
  CheckmarkIcon,
  CloseIcon,
  InfoIcon,
  Tooltip,
} from '@reportportal/ui-kit';
import {
  Organization,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';
import { Project } from 'pages/inside/common/assignments/organizationAssignment/organizationItem/projectItems';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import {
  OrganizationsSearchesResponseData,
  OrganizationSearchesItem,
} from 'controllers/instance/organizations';
import {
  ProjectsSearchesResponseData,
  ProjectsSearchesItem,
} from 'controllers/organization/projects';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { prepareQueryFilters } from 'components/filterEntities/utils';
import { URLS } from 'common/urls';
import { AddItemButton } from '../organizationAssignment/organizationItem/addItemButton';
import { MEMBER, EDITOR, VIEWER, MANAGER } from 'common/constants/projectRoles';
import styles from './instanceAssignment.scss';

const cx = classNames.bind(styles) as typeof classNames;

const messages = defineMessages({
  organization: {
    id: 'InstanceAssignment.organization',
    defaultMessage: 'Organization',
  },
  project: {
    id: 'InstanceAssignment.project',
    defaultMessage: 'Project (optional)',
  },
  organizationPlaceholder: {
    id: 'InstanceAssignment.organizationPlaceholder',
    defaultMessage: 'Enter to select organization',
  },
  projectPlaceholder: {
    id: 'InstanceAssignment.projectPlaceholder',
    defaultMessage: 'Enter to select project',
  },
  setOrganizationManager: {
    id: 'InstanceAssignment.setOrganizationManager',
    defaultMessage: 'Set as Organization Manager',
  },
  canEditProject: {
    id: 'InstanceAssignment.canEditProject',
    defaultMessage: 'Can edit the Project',
  },
  hintMessage: {
    id: 'InstanceAssignment.hintMessage',
    defaultMessage:
      "By default, invited users receive 'View only' permissions. Users with 'Can edit' permissions can modify the project and all its data (report launches, change defect types, etc.).",
  },
  availableOrganizations: {
    id: 'InstanceAssignment.availableOrganizations',
    defaultMessage: 'All available organizations have been added',
  },
  addOrganization: {
    id: 'InstanceAssignment.addOrganization',
    defaultMessage: 'Add Organization',
  },
});

interface InstanceAssignmentProps {
  onChange?: (value: Organization[]) => void;
  value?: Organization[];
}

export const InstanceAssignment = ({ onChange, value: organizations }: InstanceAssignmentProps) => {
  const { formatMessage } = useIntl();
  const [notAssignedOrganizations, setNotAssignedOrganizations] = useState<
    OrganizationSearchesItem[]
  >([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>(null);
  const [organizationProjects, setOrganizationProjects] = useState<ProjectsSearchesItem[]>(null);
  const [selectedProject, setSelectedProject] = useState<Project>(null);
  const [organizationManager, setOrganizationManager] = useState<boolean>(null);
  const [canEditProject, setCanEditProject] = useState<boolean>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const getRequestOrganizationsParams = (inputValue: string) => {
    return {
      method: 'post',
      data: prepareQueryFilters({ limit: 20, [SEARCH_KEY]: inputValue }),
    };
  };

  const makeOrganizationsOptions = (response: OrganizationsSearchesResponseData) => {
    if (response.items) {
      const filteredOrganizations = response.items.filter(
        (organization) => !(organizations || []).some(({ id }) => id === organization.id),
      );

      setNotAssignedOrganizations(filteredOrganizations);

      return filteredOrganizations.map(({ name }) => name);
    }

    return [];
  };

  const makeProjectsOptions = (response: ProjectsSearchesResponseData) => {
    if (response.items) {
      setOrganizationProjects(response.items);

      return response.items.map(({ name }) => name);
    }

    return [];
  };

  const handleChangeOrganization = (organizationName: string) => {
    const organization = notAssignedOrganizations.find(({ name }) => name === organizationName);

    if (organization) {
      setSelectedOrganization({
        id: organization.id,
        name: organization.name,
        role: organizationManager ? MANAGER : MEMBER,
        projects: [],
      });
      setSelectedProject(null);
    } else {
      setSelectedOrganization(null);
    }
  };

  const handleChangeProject = (projectName: string) => {
    const project = organizationProjects.find(({ name }) => name === projectName);

    if (project) {
      setSelectedProject({
        id: project.id,
        name: project.name,
        role: canEditProject ? EDITOR : VIEWER,
      });
    } else {
      setSelectedProject(null);
    }
  };

  const handleChangeOrganizationManager = (event: ChangeEvent<HTMLInputElement>) => {
    setOrganizationManager(event.target.checked);
  };

  const handleChangeCanEditProject = (event: ChangeEvent<HTMLInputElement>) => {
    setCanEditProject(event.target.checked);
  };

  const onCancel = () => {
    setIsOpen(false);
  };

  const handleSubmit = () => {
    const organization = {
      ...selectedOrganization,
      projects: selectedProject ? [selectedProject] : [],
    };
    onChange([...organizations, organization]);
    setIsOpen(false);
  };

  return (
    <div>
      <FieldElement name="organizations" className={cx('organizations')}>
        <OrganizationAssignment isMultiple />
      </FieldElement>
      {isOpen ? (
        <div className={cx('instance-assignment')}>
          <div className={cx('autocomplete-wrapper')}>
            <div className={cx('autocomplete-label')}>{formatMessage(messages.organization)}</div>
            <AsyncAutocomplete
              placeholder={formatMessage(messages.organizationPlaceholder)}
              getURI={URLS.organizationSearches}
              getRequestParams={getRequestOrganizationsParams}
              makeOptions={makeOrganizationsOptions}
              onChange={handleChangeOrganization}
              onBlur={handleChangeOrganization}
              createWithoutConfirmation={true}
            />
            <Checkbox
              value={organizationManager}
              onChange={handleChangeOrganizationManager}
              className={cx('autocomplete-checkbox')}
            >
              {formatMessage(messages.setOrganizationManager)}
            </Checkbox>
          </div>
          <div className={cx('autocomplete-wrapper')}>
            <div className={cx('autocomplete-label')}>{formatMessage(messages.project)}</div>
            <AsyncAutocomplete
              placeholder={formatMessage(messages.projectPlaceholder)}
              getURI={() => URLS.organizationProjectsSearches(selectedOrganization.id)}
              getRequestParams={getRequestOrganizationsParams}
              makeOptions={makeProjectsOptions}
              onChange={handleChangeProject}
              createWithoutConfirmation={true}
              className={cx('autocomplete')}
              disabled={!selectedOrganization}
            />
            <div className={cx('checkbox-wrapper')}>
              <Checkbox
                value={canEditProject || organizationManager}
                onChange={handleChangeCanEditProject}
                disabled={!selectedOrganization || organizationManager}
              >
                {formatMessage(messages.canEditProject)}
              </Checkbox>
              <Tooltip
                content={formatMessage(messages.hintMessage)}
                placement="top"
                contentClassName={cx('custom-tooltip')}
                wrapperClassName={cx('tooltip-wrapper')}
              >
                <InfoIcon />
              </Tooltip>
            </div>
          </div>
          <div className={cx('controls')}>
            <Button
              className={cx('button')}
              adjustWidthOn="content"
              onClick={handleSubmit}
              disabled={!selectedOrganization}
            >
              <CheckmarkIcon />
            </Button>
            {organizations.length > 0 && (
              <Button
                className={cx('cancel-button')}
                adjustWidthOn="content"
                variant="ghost"
                onClick={onCancel}
              >
                <CloseIcon />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className={cx('add-button')}>
          <AddItemButton
            tooltipClassname={cx('tooltip')}
            onClick={() => setIsOpen(true)}
            tooltipContent={messages.availableOrganizations}
            disabled={notAssignedOrganizations.length === 0}
            text={formatMessage(messages.addOrganization)}
          />
        </div>
      )}
    </div>
  );
};
