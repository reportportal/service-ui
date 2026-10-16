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
import { noop } from 'es-toolkit';
import Parser from 'html-react-parser';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { Button, PlusIcon, Tooltip } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { validate } from 'common/utils/validation';
import { SearchField } from 'components/fields/searchField';
import { useUserPermissions } from 'hooks/useUserPermissions';
import {
  DASHBOARDS_GRID_VIEW,
  DASHBOARDS_TABLE_VIEW,
  loadingSelector,
  totalDashboardsSelector,
} from 'controllers/dashboard';
import { DASHBOARD_EVENTS } from 'analyticsEvents/dashboardsPageEvents';

import PanelViewIcon from '../img/panel-view-inline.svg';
import TableViewIcon from '../img/table-view-inline.svg';

import styles from './dashboardPageToolbar.scss';

const cx = createClassnames(styles);

const DASHBOARDS_LIMIT = 3000;
const SEARCH_MAX_LENGTH = 128;

const messages = defineMessages({
  searchPlaceholder: {
    id: 'DashboardPageToolbar.searchPlaceholder',
    defaultMessage: 'Search by name',
  },
  panelView: {
    id: 'DashboardPageToolbar.panelView',
    defaultMessage: 'Panel view',
  },
  tableView: {
    id: 'DashboardPageToolbar.tableView',
    defaultMessage: 'Table view',
  },
  createDashboard: {
    id: 'DashboardPageToolbar.createDashboard',
    defaultMessage: 'Create Dashboard',
  },
  limitTooltip: {
    id: 'DashboardHeaderButton.buttonTooltip',
    defaultMessage:
      'The limit of 3000 dashboards has been reached. To create a new one you need to delete at least one created previously',
  },
});

interface DashboardPageToolbarProps {
  filter?: string;
  gridType?: string;
  onFilterChange?: (filter: string) => void;
  onGridViewToggle?: () => void;
  onTableViewToggle?: () => void;
  onAddItem?: () => void;
}

export const DashboardPageToolbar = ({
  filter = '',
  gridType = '',
  onFilterChange = noop,
  onGridViewToggle = noop,
  onTableViewToggle = noop,
  onAddItem = noop,
}: DashboardPageToolbarProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { canWorkWithDashboard } = useUserPermissions();
  const loading = useSelector(loadingSelector);
  const totalDashboards = useSelector(totalDashboardsSelector);
  const [searchValue, setSearchValue] = useState(filter);
  // the last value sent from this input, the filter is applied with a delay
  const sentFilterRef = useRef(filter);

  useEffect(() => {
    // sync only the changes made outside of the input, so the typed text is not overwritten
    if (filter !== sentFilterRef.current) {
      sentFilterRef.current = filter;
      setSearchValue(filter);
    }
  }, [filter]);

  const isLimitReached = totalDashboards >= DASHBOARDS_LIMIT;

  const handleFilterChange = (value: string) => {
    if (validate.searchFilter(value)) {
      sentFilterRef.current = value;
      onFilterChange(value);
    }
  };

  const handleCreateClick = () => {
    trackEvent(DASHBOARD_EVENTS.CLICK_ON_ADD_NEW_DASHBOARD_BTN);
    onAddItem();
  };

  const createButton = (
    <Button
      variant="ghost"
      className={cx('create-button')}
      icon={<PlusIcon />}
      disabled={loading || isLimitReached}
      data-automation-id="createDashboardButton"
      onClick={handleCreateClick}
    >
      {formatMessage(messages.createDashboard)}
    </Button>
  );

  return (
    <div className={cx('dashboard-page-toolbar')}>
      <SearchField
        isLoading={loading}
        searchValue={searchValue}
        filter={filter}
        placeholder={formatMessage(messages.searchPlaceholder)}
        maxLength={SEARCH_MAX_LENGTH}
        setSearchValue={setSearchValue}
        onFilterChange={handleFilterChange}
      />
      <div className={cx('view-switch', { 'view-switch--with-action': canWorkWithDashboard })}>
        <button
          type="button"
          className={cx('view-button', { active: gridType === DASHBOARDS_GRID_VIEW })}
          aria-label={formatMessage(messages.panelView)}
          aria-pressed={gridType === DASHBOARDS_GRID_VIEW}
          onClick={onGridViewToggle}
        >
          {Parser(String(PanelViewIcon))}
        </button>
        <button
          type="button"
          className={cx('view-button', { active: gridType === DASHBOARDS_TABLE_VIEW })}
          aria-label={formatMessage(messages.tableView)}
          aria-pressed={gridType === DASHBOARDS_TABLE_VIEW}
          onClick={onTableViewToggle}
        >
          {Parser(String(TableViewIcon))}
        </button>
      </div>
      {canWorkWithDashboard &&
        (isLimitReached ? (
          <Tooltip content={formatMessage(messages.limitTooltip)}>{createButton}</Tooltip>
        ) : (
          createButton
        ))}
    </div>
  );
};
