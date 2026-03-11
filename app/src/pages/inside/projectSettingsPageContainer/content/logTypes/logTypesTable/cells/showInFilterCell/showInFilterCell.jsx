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

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Toggle, Tooltip } from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { logTypesSelector, updateLogTypeAction, projectKeySelector } from 'controllers/project';
import { PROJECT_SETTINGS_LOG_TYPES_EVENTS } from 'components/main/analytics/events/ga4Events/projectSettingsPageEvents';
import { MAX_FILTERABLE_LOG_TYPES } from '../../../modals/constants';
import { messages } from '../../../messages';
import styles from './showInFilterCell.scss';

const cx = classNames.bind(styles);

export const ShowInFilterCell = ({ logType, isEditable }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const projectKey = useSelector(projectKeySelector);
  const logTypes = useSelector(logTypesSelector);
  const { is_filterable: isFilterable, is_system: isSystem } = logType;
  const filterableLogTypesCount = useMemo(
    () => logTypes.filter((type) => type.is_filterable).length,
    [logTypes],
  );
  const noMoreFilterableLogTypes = filterableLogTypesCount >= MAX_FILTERABLE_LOG_TYPES;
  const showTooltip = (noMoreFilterableLogTypes && !isFilterable) || !isEditable;
  const tooltipMessage = isEditable
    ? messages.noMoreFilterableLogTypesTooltip
    : messages.noPermissionsToUpdateTooltip;
  const tooltipPlacement = isEditable ? 'top' : 'top-end';

  const handleToggle = () => {
    const newFilterableValue = !isFilterable;

    const onSuccess = () => {
      trackEvent(
        PROJECT_SETTINGS_LOG_TYPES_EVENTS.toggleShowInLogFilter(isSystem, newFilterableValue),
      );
    };

    const data = { ...logType, is_filterable: newFilterableValue };

    dispatch(updateLogTypeAction(data, logType.id, projectKey, onSuccess));
  };

  if (showTooltip) {
    return (
      <Tooltip
        content={formatMessage(tooltipMessage)}
        wrapperClassName={cx('tooltip-wrapper')}
        tooltipClassName={cx('tooltip')}
        placement={tooltipPlacement}
      >
        <Toggle value={isFilterable} disabled />
      </Tooltip>
    );
  }

  return <Toggle value={isFilterable} onChange={handleToggle} />;
};

ShowInFilterCell.propTypes = {
  logType: PropTypes.object,
  isEditable: PropTypes.bool,
};
