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

import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  WrappedFieldArrayProps,
  formValueSelector,
  change,
  untouch,
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

import { createClassnames, fetch } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import {
  Organization,
  OrganizationAssignment,
} from 'pages/inside/common/assignments/organizationAssignment';
import { Project } from 'pages/inside/common/assignments/organizationAssignment/organizationItem/projectItems';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { AsyncAutocompleteV2 } from 'componentLibrary/autocompletes/asyncAutocompleteV2';
import {
  OrganizationsSearchesResponseData,
  OrganizationSearchesItem,
  ORGANIZATIONS_SEARCH_KEY,
} from 'controllers/instance/organizations';
import {
  ProjectsSearchesResponseData,
  ProjectsSearchesItem,
} from 'controllers/organization/projects';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { OrganizationType } from 'controllers/organization';
import { prepareQueryFilters } from 'components/filterEntities/utils';
import { URLS } from 'common/urls';
import { AddItemButton } from '../organizationAssignment/organizationItem/addItemButton';
import { MEMBER, EDITOR, VIEWER, MANAGER } from 'common/constants/projectRoles';
import { UPSA } from 'common/constants/accountType';
import { ORGANIZATIONS } from 'pages/instance/allUsersPage/allUsersHeader/createUserModal/constants';
import {
  EPAM_DELIVERY_PORTAL_URL,
  messages as invitationMessages,
} from 'common/constants/localization/invitationsLocalization';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExternalLink } from 'pages/inside/common/externalLink';

import styles from './instanceAssignment.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  organization: {
    id: 'InstanceAssignment.organization',
    defaultMessage: 'Organization',
  },
  project: {
    id: 'InstanceAssignment.project',
    defaultMessage: 'Project',
  },
  organizationPlaceholder: {
    id: 'InstanceAssignment.organizationPlaceholder',
    defaultMessage: 'Enter to select organization',
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
  disabledCanEditProjectHint: {
    id: 'InstanceAssignment.disabledCanEditProjectHint',
    defaultMessage:
      "Users with the Manager's role possess 'Can edit' permissions across all projects within the organization",
  },
});

interface InstanceAssignmentItem {
  id?: number;
  name: string;
  type?: OrganizationType;
  owner_id?: number;
  isNew?: boolean;
  role: string;
  projects: Project[];
}

export interface InstanceAssignmentProps extends InstanceAssignmentArrayProps<InstanceAssignmentItem> {
  formName: string;
  formNamespace?: string;
  isOrganizationRequired: boolean;
  invitedUserId?: number | null;
  userType?: string;
  excludeUserAssignments?: boolean;
  header?: string;
  addButtonPlacement?: 'header' | 'bottom';
  addFormPlacement?: 'top' | 'bottom';
  withEmptyState?: boolean;
  emptyStateText?: string;
  onExpandOrganization?: (orgId: number) => void;
  showUnassignProjectTooltip?: boolean;
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

export const ORGANIZATION = 'organization';
export const FORM_FIELDS = {
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
  invitedUserId = null,
  userType,
  excludeUserAssignments = false,
  header,
  addButtonPlacement = 'bottom',
  addFormPlacement = 'bottom',
  withEmptyState = false,
  emptyStateText,
  onExpandOrganization,
  showUnassignProjectTooltip,
}: InstanceAssignmentProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const selector = formValueSelector(formName);
  const isAddingProject = useSelector(
    (state) => selector(state, 'isAddingProject') as boolean | undefined,
  );
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
  const [areOrganizationsExhausted, setAreOrganizationsExhausted] = useState(false);
  const [totalOrganizationsInSystem, setTotalOrganizationsInSystem] = useState(0);
  const [organizationProjects, setOrganizationProjects] = useState<ProjectsSearchesItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [userOrgIds, setUserOrgIds] = useState<Set<number>>(new Set());
  const allOrganizations = fields.getAll();
  const selectedOrgFromList =
    selectedOrganizationId != null
      ? notAssignedOrganizations.find((o) => o.id === selectedOrganizationId)
      : undefined;
  const isUpsaExternalOrgSelection =
    userType === UPSA && selectedOrgFromList?.type === OrganizationType.EXTERNAL;
  const renderEpamDeliveryLink = useCallback(
    (chunks: ReactNode) => (
      <ExternalLink href={EPAM_DELIVERY_PORTAL_URL} variant="compact" isColoredIcon={false}>
        {chunks}
      </ExternalLink>
    ),
    [],
  );
  const epamInviteForbiddenDescription = useMemo(
    () =>
      formatMessage(invitationMessages.epamInviteForbidden, {
        link: renderEpamDeliveryLink,
      }),
    [formatMessage, renderEpamDeliveryLink],
  );
  const formContainerRef = useRef<HTMLDivElement>(null);
  const emptyList = !allOrganizations?.length;
  const [isOpen, setIsOpen] = useState<boolean>(emptyList && !withEmptyState);
  const shouldFormBeOpen = isOpen || (emptyList && !withEmptyState);
  const shouldShowEmptyState = !shouldFormBeOpen && emptyList && withEmptyState;
  const shouldShowAddButton = !shouldFormBeOpen && !shouldShowEmptyState;
  const shouldShowFormCloseButton = withEmptyState || !emptyList;

  useEffect(() => {
    dispatch(change(formName, 'isAddingOrganization', shouldFormBeOpen));
  }, [shouldFormBeOpen, dispatch, formName]);

  useEffect(() => {
    const allOrganizationsIds = new Set((allOrganizations || []).map(({ id }) => id));
    const totalAddedIds = excludeUserAssignments
      ? new Set([...allOrganizationsIds, ...userOrgIds])
      : allOrganizationsIds;
    const totalAvailableToAdd = totalOrganizationsInSystem - totalAddedIds.size;
    setAreOrganizationsExhausted(totalOrganizationsInSystem > 0 && totalAvailableToAdd <= 0);
  }, [allOrganizations, totalOrganizationsInSystem, userOrgIds, excludeUserAssignments]);

  useEffect(() => {
    if (isOpen && formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen]);

  const resetOrganization = () => {
    dispatch(
      change(formName, formNamespace, {
        name: null,
        role: false,
        projects: [],
      }),
    );
    dispatch(untouch(formName, FORM_FIELDS.ORGANIZATION.NAME));
  };

  const handleOrganizationNameFocus = useCallback(() => {
    dispatch(untouch(formName, FORM_FIELDS.ORGANIZATION.NAME));
  }, [dispatch, formName]);

  useEffect(() => {
    setSelectedOrganizationId(null);
    setSelectedProjectId(null);
    setOrganizationProjects([]);
    setTotalProjects(0);
    setNotAssignedOrganizations([]);
    resetOrganization();
    const orgs = fields.getAll?.();
    setIsOpen(!orgs?.length && !withEmptyState);

    let isActive = true;

    fetch(URLS.organizationSearches(), {
      method: 'post',
      data: { limit: 1 },
    })
      .then((response: OrganizationsSearchesResponseData) => {
        if (isActive) {
          setTotalOrganizationsInSystem(response.total_count);
        }
      })
      .catch(() => {
        if (isActive) {
          setTotalOrganizationsInSystem(0);
        }
      });

    if (!invitedUserId) {
      setUserOrgIds(new Set());
      return () => {
        isActive = false;
      };
    }

    fetch(URLS.organizationSearches(), {
      method: 'post',
      data: {
        limit: 300,
        search_criteria: [
          { filter_key: 'org_user_id', operation: 'EQ', value: String(invitedUserId) },
        ],
      },
    })
      .then((response: OrganizationsSearchesResponseData) => {
        if (!isActive) {
          return;
        }
        const ids = new Set<number>((response.items ?? []).map((org) => org.id));
        setUserOrgIds(ids);
      })
      .catch(() => {
        if (isActive) {
          setUserOrgIds(new Set());
        }
      });

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitedUserId]);

  const getRequestOrganizationsParams = (inputValue: string) => ({
    method: 'post',
    data: prepareQueryFilters({ limit: 20, [ORGANIZATIONS_SEARCH_KEY]: inputValue }),
  });

  const getRequestProjectsParams = (inputValue: string) => ({
    method: 'post',
    data: prepareQueryFilters({ limit: 20, [SEARCH_KEY]: inputValue }),
  });

  const makeOrganizationsOptions = (response: OrganizationsSearchesResponseData) => {
    if (response.items) {
      const isUpsaUser = userType === UPSA;
      const filteredOrganizations = response.items.filter(
        (organization) =>
          !(allOrganizations || []).some(({ id }) => id === organization.id) &&
          (!excludeUserAssignments || !userOrgIds.has(organization.id)) &&
          !(
            isUpsaUser &&
            organization.type === OrganizationType.EXTERNAL &&
            !excludeUserAssignments
          ),
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
    setSelectedOrganizationId(null);
    setSelectedProjectId(null);
    setOrganizationProjects([]);
    setTotalProjects(0);
    resetOrganization();
  };

  const handleSubmit = () => {
    if (isUpsaExternalOrgSelection) {
      return;
    }

    const { name, role, projects } = organization as InstanceAssignmentItem;

    setIsOpen(false);
    setOrganizationProjects([]);
    setSelectedOrganizationId(null);
    setSelectedProjectId(null);
    setNotAssignedOrganizations((prev) => prev.filter((org) => org.id !== selectedOrganizationId));

    fields.push({
      id: selectedOrganizationId,
      name,
      type: selectedOrgFromList?.type,
      owner_id: selectedOrgFromList?.owner_id,
      isNew: !userOrgIds.has(selectedOrganizationId),
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

  const renderAddOrganizationForm = () => (
    <div className={cx('instance-assignment')} ref={formContainerRef}>
      <div className={cx('instance-assignment-main')}>
        <div className={cx('autocomplete-wrapper')}>
          <FieldProvider name={FORM_FIELDS.ORGANIZATION.NAME}>
            <FieldErrorHint provideHint={false}>
              <AsyncAutocompleteV2
                key={`organization-${invitedUserId}`}
                inputProps={{
                  onFocus: handleOrganizationNameFocus,
                  label: formatMessage(messages.organization),
                  clearable: true,
                  className: isUpsaExternalOrgSelection
                    ? cx('organization-field-ups-error')
                    : undefined,
                  onClear: () => {
                    dispatch(change(formName, FORM_FIELDS.ORGANIZATION.NAME, null));
                    dispatch(change(formName, FORM_FIELDS.ORGANIZATION.PROJECTS.NAME, null));
                    setSelectedOrganizationId(null);
                    setSelectedProjectId(null);
                    setOrganizationProjects([]);
                    setTotalProjects(0);
                  },
                }}
                placeholder={formatMessage(messages.organizationPlaceholder)}
                getURI={URLS.organizationSearches}
                getRequestParams={getRequestOrganizationsParams}
                makeOptions={makeOrganizationsOptions}
                createWithoutConfirmation
                skipOptionCreation
                popoverClassName={cx('popover-organization')}
                onChange={(organizationName: string) => {
                  const selectedOrg = notAssignedOrganizations.find(
                    ({ name }) => name === organizationName,
                  );
                  setSelectedOrganizationId(selectedOrg?.id || null);
                  dispatch(change(formName, FORM_FIELDS.ORGANIZATION.PROJECTS.NAME, null));
                  setSelectedProjectId(null);
                  setOrganizationProjects([]);
                  setTotalProjects(selectedOrg?.relationships?.projects?.meta?.count ?? 0);
                }}
                isRequired={isOrganizationRequired}
                useFixedPositioning
                dropdownMatchInputWidth
                customEmptyListMessage={formatMessage(COMMON_LOCALE_KEYS.NO_AVAILABLE_OPTIONS)}
              />
            </FieldErrorHint>
          </FieldProvider>
          <FieldProvider name={FORM_FIELDS.ORGANIZATION.ROLE}>
            <Checkbox
              onChange={(e) => {
                const checked = e.target.checked;
                dispatch(change(formName, FORM_FIELDS.ORGANIZATION.ROLE, checked));
                dispatch(change(formName, FORM_FIELDS.ORGANIZATION.PROJECTS.ROLE, checked));
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
              <AsyncAutocompleteV2
                key={`project-${selectedOrganizationId}-${invitedUserId}`}
                inputProps={{
                  label: formatMessage(messages.project),
                  clearable: totalProjects > 0 && !!selectedOrganizationId,
                  placeholder: formatMessage(invitationMessages.selectSearchProject),
                  onClear: () => {
                    dispatch(change(formName, FORM_FIELDS.ORGANIZATION.PROJECTS.NAME, null));
                    setSelectedProjectId(null);
                  },
                }}
                placeholder={formatMessage(invitationMessages.selectSearchProject)}
                getURI={() => URLS.organizationProjectsSearches(selectedOrganizationId)}
                getRequestParams={getRequestProjectsParams}
                makeOptions={makeProjectsOptions}
                onChange={handleProjectChange}
                createWithoutConfirmation
                skipOptionCreation
                className={cx('autocomplete')}
                disabled={!selectedOrganizationId || isUpsaExternalOrgSelection}
                customEmptyListMessage={
                  totalProjects === 0 && selectedOrganizationId
                    ? formatMessage(invitationMessages.noProjectsCreated)
                    : formatMessage(COMMON_LOCALE_KEYS.NO_AVAILABLE_OPTIONS)
                }
                isDropdownMode={totalProjects === 0 && selectedOrganizationId}
                icon={totalProjects === 0 && selectedOrganizationId ? <div /> : undefined}
                useFixedPositioning
                dropdownMatchInputWidth
              />
            </FieldErrorHint>
          </FieldProvider>
          <div className={cx('checkbox-wrapper', { 'can-edit-hint': hasOrgNameError })}>
            <div className={cx('can-edit-container')}>
              {organization?.role ? (
                <Tooltip
                  content={formatMessage(messages.disabledCanEditProjectHint)}
                  placement="top-start"
                  contentClassName={cx('checkbox-tooltip-content')}
                  wrapperClassName={cx('checkbox-tooltip-wrapper')}
                >
                  <FieldProvider name={FORM_FIELDS.ORGANIZATION.PROJECTS.ROLE}>
                    <Checkbox className={cx('disabled-checkbox')} disabled />
                  </FieldProvider>
                </Tooltip>
              ) : (
                <FieldProvider name={FORM_FIELDS.ORGANIZATION.PROJECTS.ROLE}>
                  <Checkbox disabled={!selectedOrganizationId || isUpsaExternalOrgSelection} />
                </FieldProvider>
              )}
              <span
                className={cx('can-edit-label', {
                  'can-edit-label--disabled':
                    organization?.role || !selectedOrganizationId || isUpsaExternalOrgSelection,
                })}
              >
                {formatMessage(messages.canEditProject)}
              </span>
            </div>
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
            disabled={!selectedOrganizationId || isUpsaExternalOrgSelection}
          >
            <CheckmarkIcon />
          </Button>
          {shouldShowFormCloseButton && (
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
      {isUpsaExternalOrgSelection && (
        <div className={cx('ups-external-org-error')}>{epamInviteForbiddenDescription}</div>
      )}
    </div>
  );

  const renderAddOrganizationButton = () => (
    <div className={cx('add-button', { bottom: addButtonPlacement === 'bottom' })}>
      <AddItemButton
        tooltipClassname={cx('tooltip')}
        onClick={() => setIsOpen(true)}
        tooltipContent={areOrganizationsExhausted ? messages.availableOrganizations : undefined}
        disabled={areOrganizationsExhausted || !!isAddingProject}
        text={formatMessage(messages.addOrganization)}
      />
    </div>
  );

  return (
    <div className={cx('forms-wrapper')}>
      <div className={cx('header')}>
        {header && <h4>{header}</h4>}
        {shouldShowAddButton && addButtonPlacement === 'header' && renderAddOrganizationButton()}
      </div>
      {shouldFormBeOpen && addFormPlacement === 'top' && renderAddOrganizationForm()}
      {shouldShowEmptyState && (
        <div className={cx('empty-state')}>
          {emptyStateText && <span>{emptyStateText}</span>}
          {renderAddOrganizationButton()}
        </div>
      )}
      <FieldElement name={ORGANIZATIONS} className={cx('organizations')}>
        <OrganizationAssignment
          isMultiple
          formName={formName}
          invitedUserId={invitedUserId}
          userType={userType}
          excludeUserAssignments={excludeUserAssignments}
          isOrganizationFormOpen={isOpen}
          onExpandOrganization={onExpandOrganization}
          showUnassignProjectTooltip={showUnassignProjectTooltip}
        />
      </FieldElement>
      {shouldFormBeOpen && addFormPlacement === 'bottom' && renderAddOrganizationForm()}
      {shouldShowAddButton && addButtonPlacement === 'bottom' && renderAddOrganizationButton()}
    </div>
  );
};
