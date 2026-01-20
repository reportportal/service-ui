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

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { BaseIconButton, Button, PlusIcon, Tooltip } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { SearchField } from 'components/fields/searchField';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { withFilter } from 'controllers/filter';
import { NAMESPACE } from 'controllers/instance/organizations/constants';
import { organizationsListLoadingSelector } from 'controllers/instance/organizations';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { createFilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { organizationPluginSelector } from 'controllers/plugins';
import { OrganizationsFilter } from './organizationsFilter';
import PanelViewIcon from '../img/panel-view-inline.svg';
import TableViewIcon from '../img/table-view-inline.svg';
import { messages } from '../messages';
import { OrganizationsSorting } from './organizationsSorting';
import { OrganizationsExport } from './organizationsExport';
import styles from './organizationsPageHeader.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

const FilterEntitiesURLContainer = createFilterEntitiesURLContainer(null, NAMESPACE);

export const OrganizationsPageHeader = ({
  hasPermission,
  isEmpty,
  searchValue,
  setSearchValue,
  openPanelView,
  openTableView,
  isOpenTableView,
  appliedFiltersCount,
  setAppliedFiltersCount,
  onCreateOrganization,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const projectsLoading = useSelector(organizationsListLoadingSelector);
  const { canWorkWithOrganizationFilter, canWorkWithOrganizationsSorting, canManageOrganizations } =
    useUserPermissions();
  const organizationPlugin = useSelector(organizationPluginSelector);

  const onMouseEnter = () => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.HOVER_CREATE_BUTTON);
  };

  return (
    <div className={cx('organizations-page-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.title)}</span>
        {!isEmpty && (
          <div className={cx('actions')}>
            <div className={cx('filters')}>
              <SearchFieldWithFilter
                isLoading={projectsLoading}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                event={ORGANIZATION_PAGE_EVENTS.SEARCH_ORGANIZATION_FIELD}
              />
              {canWorkWithOrganizationFilter && (
                <FilterEntitiesURLContainer
                  debounced={false}
                  additionalFilter="name"
                  render={({ entities, onChange }) => (
                    <OrganizationsFilter
                      appliedFiltersCount={appliedFiltersCount}
                      setAppliedFiltersCount={setAppliedFiltersCount}
                      entities={entities}
                      onFilterChange={onChange}
                    />
                  )}
                />
              )}
              {canWorkWithOrganizationsSorting && <OrganizationsSorting />}
            </div>
            <div className={cx('view-toggle')}>
              <BaseIconButton
                className={cx('panel-icon', { active: !isOpenTableView })}
                onClick={openPanelView}
                variant={'text'}
              >
                {Parser(PanelViewIcon)}
              </BaseIconButton>
              <BaseIconButton
                className={cx('panel-icon', { active: isOpenTableView })}
                onClick={openTableView}
                variant={'text'}
              >
                {Parser(TableViewIcon)}
              </BaseIconButton>
            </div>
            <div className={cx('primary-actions')}>
              {canManageOrganizations && (
                <OrganizationsExport appliedFiltersCount={appliedFiltersCount} />
              )}
            </div>
            {hasPermission &&
              (organizationPlugin?.enabled ? (
                <Button variant={'ghost'} icon={<PlusIcon />} onClick={onCreateOrganization}>
                  {formatMessage(messages.createOrganization)}
                </Button>
              ) : (
                <Tooltip
                  content={formatMessage(
                    organizationPlugin
                      ? messages.pluginIsDisabledMessage
                      : messages.notUploadedPluginMessage,
                  )}
                  tooltipClassName={cx(
                    organizationPlugin ? 'tooltip-not-uploaded' : 'tooltip-disabled',
                  )}
                  wrapperClassName={cx('tooltip-wrapper')}
                  placement="bottom"
                >
                  <div onMouseEnter={onMouseEnter}>
                    <Button
                      variant={'ghost'}
                      icon={<PlusIcon />}
                      onClick={onCreateOrganization}
                      disabled
                    >
                      {formatMessage(messages.createOrganization)}
                    </Button>
                  </div>
                </Tooltip>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

OrganizationsPageHeader.propTypes = {
  hasPermission: PropTypes.bool,
  isEmpty: PropTypes.bool,
  searchValue: PropTypes.string || null,
  setSearchValue: PropTypes.func.isRequired,
  openPanelView: PropTypes.func.isRequired,
  openTableView: PropTypes.func.isRequired,
  isOpenTableView: PropTypes.bool.isRequired,
  appliedFiltersCount: PropTypes.bool.isRequired,
  setAppliedFiltersCount: PropTypes.func.isRequired,
  onCreateOrganization: PropTypes.func.isRequired,
};

OrganizationsPageHeader.defaultProps = {
  isEmpty: false,
};
