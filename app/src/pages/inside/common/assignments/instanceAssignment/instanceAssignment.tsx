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

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  WrappedFieldArrayProps,
  formValueSelector,
  change,
  getFormSyncErrors,
  getFormMeta,
} from 'redux-form';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Checkbox,
  CheckmarkIcon,
  CloseIcon,
  InfoIcon,
  Tooltip,
} from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
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
import {
  CREATE_USER_FORM,
  ORGANIZATIONS,
} from 'pages/instance/allUsersPage/allUsersHeader/createUserModal/constants';

import styles from './instanceAssignment.scss';

const cx = createClassnames(styles);

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

interface InstanceAssignmentItem {
  id?: number;
  name: string;
  role: string;
  projects: Project[];
}

interface InstanceAssignmentProps extends InstanceAssignmentArrayProps<InstanceAssignmentItem> {
  formName: string;
  formNamespace?: string;
  isOrganizationRequired: boolean;
}

interface InstanceAssignmentArrayProps<T> extends WrappedFieldArrayProps<T> {
  fields: WrappedFieldArrayProps<T>['fields'] & {
    getAll?: () => T[] | undefined;
  };
}

interface ReduxFormState {
  form: {
    createUserForm?: {
      values?: {
        organization?: Organization;
      };
    };
  };
}

const ORGANIZATION = 'organization';
const FORM_FIELDS = {
  ORGANIZATION: {
    NAME: `${ORGANIZATION}.name`,
    ROLE: `${ORGANIZATION}.role`,
    PROJECTS: {
      NAME: `${ORGANIZATION}.projects[0].name`,
      ROLE: `${ORGANIZATION}.projects[0].role`,
    },
  },
};

export const InstanceAssignment = ({
  fields,
  formName,
  formNamespace,
  isOrganizationRequired = false,
}: InstanceAssignmentProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const selector = formValueSelector(formName);
  const errors = useSelector((state) => getFormSyncErrors(formName)(state)) as {
    organization: { name: string };
  };
  const meta = useSelector((state) => getFormMeta(formName)(state)) as {
    organization?: { name?: { touched?: boolean } };
  };
  const hasOrgNameError = !!errors?.organization?.name && !!meta?.organization?.name?.touched;
  const organization = useSelector(
    (state: ReduxFormState): Organization => selector(state, formNamespace) as Organization,
  );
  const [notAssignedOrganizations, setNotAssignedOrganizations] = useState<
    OrganizationSearchesItem[]
  >([]);
  const [organizationProjects, setOrganizationProjects] = useState<ProjectsSearchesItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const allOrganizations = fields.getAll();

  const resetOrganization = () => {
    dispatch(
      change(formName, formNamespace, {
        name: null,
        role: false,
        projects: [],
      }),
    );
  };

  const getRequestOrganizationsParams = (inputValue: string) => {
    return {
      method: 'post',
      data: prepareQueryFilters({ limit: 20, [SEARCH_KEY]: inputValue }),
    };
  };

  const makeOrganizationsOptions = (response: OrganizationsSearchesResponseData) => {
    if (response.items) {
      const filteredOrganizations = response.items.filter(
        (organization) => !(allOrganizations || []).some(({ id }) => id === organization.id),
      );

      setNotAssignedOrganizations(filteredOrganizations);

      return filteredOrganizations.map(({ name }) => name);
    }

    setNotAssignedOrganizations([]);

    return [];
  };

  const makeProjectsOptions = (response: ProjectsSearchesResponseData) => {
    if (response.items) {
      setOrganizationProjects(response.items);

      return response.items.map(({ name }) => name);
    }

    setOrganizationProjects([]);

    return [];
  };

  const onCancel = () => {
    setIsOpen(false);
    resetOrganization();
  };

  const handleSubmit = () => {
    const { name, role, projects } = organization as InstanceAssignmentItem;

    setIsOpen(false);
    setOrganizationProjects([]);
    setSelectedOrganizationId(null);
    setSelectedProjectId(null);

    fields.push({
      id: selectedOrganizationId,
      name,
      role: role ? MANAGER : MEMBER,
      projects:
        projects?.length > 0 && selectedProjectId
          ? [
              {
                id: selectedProjectId,
                name: projects[0].name,
                role: projects[0].role ? EDITOR : VIEWER,
              },
            ]
          : [],
    });

    resetOrganization();
  };

  const handleProjectChange = (projectName: string) => {
    const project = organizationProjects.find(({ name }) => name === projectName);

    setSelectedProjectId(project ? project.id : null);
  };

  return (
    <div>
      <FieldElement name={ORGANIZATIONS} className={cx('organizations')}>
        <OrganizationAssignment isMultiple />
      </FieldElement>
      {isOpen || allOrganizations?.length === 0 ? (
        <div className={cx('instance-assignment')}>
          <div className={cx('autocomplete-wrapper')}>
            <FieldProvider name={FORM_FIELDS.ORGANIZATION.NAME}>
              <FieldErrorHint provideHint={false}>
                <AsyncAutocomplete
                  inputProps={{
                    label: formatMessage(messages.organization),
                  }}
                  placeholder={formatMessage(messages.organizationPlaceholder)}
                  getURI={URLS.organizationSearches}
                  getRequestParams={getRequestOrganizationsParams}
                  makeOptions={makeOrganizationsOptions}
                  createWithoutConfirmation={true}
                  onChange={(organizationName: string) => {
                    setSelectedOrganizationId(
                      notAssignedOrganizations.find(({ name }) => name === organizationName)?.id,
                    );
                  }}
                  isRequired={isOrganizationRequired}
                />
              </FieldErrorHint>
            </FieldProvider>
            <FieldProvider name={FORM_FIELDS.ORGANIZATION.ROLE}>
              <Checkbox
                onChange={(e) => {
                  const checked = e.target.checked;

                  dispatch(change(CREATE_USER_FORM, FORM_FIELDS.ORGANIZATION.ROLE, checked));
                  dispatch(
                    change(CREATE_USER_FORM, FORM_FIELDS.ORGANIZATION.PROJECTS.ROLE, checked),
                  );
                }}
                className={cx('autocomplete-checkbox')}
              >
                {formatMessage(messages.setOrganizationManager)}
              </Checkbox>
            </FieldProvider>
          </div>
          <div className={cx('autocomplete-wrapper')}>
            <FieldProvider name={FORM_FIELDS.ORGANIZATION.PROJECTS.NAME}>
              <FieldErrorHint provideHint={false}>
                <AsyncAutocomplete
                  inputProps={{
                    label: formatMessage(messages.project),
                  }}
                  placeholder={formatMessage(messages.projectPlaceholder)}
                  getURI={() => URLS.organizationProjectsSearches(selectedOrganizationId)}
                  getRequestParams={getRequestOrganizationsParams}
                  makeOptions={makeProjectsOptions}
                  onChange={handleProjectChange}
                  createWithoutConfirmation={true}
                  className={cx('autocomplete')}
                  disabled={!selectedOrganizationId}
                />
              </FieldErrorHint>
            </FieldProvider>
            <div className={cx('checkbox-wrapper', { 'can-edit-hint': hasOrgNameError })}>
              <FieldProvider name={FORM_FIELDS.ORGANIZATION.PROJECTS.ROLE}>
                <Checkbox disabled={!selectedOrganizationId || !!organization.role}>
                  {formatMessage(messages.canEditProject)}
                </Checkbox>
              </FieldProvider>
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
          <div className={cx('controls', { 'controls-hint': hasOrgNameError })}>
            <Button
              className={cx('button')}
              adjustWidthOn="content"
              onClick={handleSubmit}
              disabled={!selectedOrganizationId}
            >
              <CheckmarkIcon />
            </Button>
            {allOrganizations?.length > 0 && (
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
