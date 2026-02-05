/*
 * Copyright 2026 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'components/main/icon';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import { useCanLockDashboard } from 'common/hooks';

export const DeleteFilterButton = ({ onDelete, filter }) => {
  const canLock = useCanLockDashboard();
  const isDisabled = filter.locked && !canLock;

  return (
    <LockedDashboardTooltip locked={filter.locked} variant="filter">
      <Icon type="icon-delete" onClick={() => onDelete(filter)} disabled={isDisabled} />
    </LockedDashboardTooltip>
  );
};

DeleteFilterButton.propTypes = {
  onDelete: PropTypes.func,
  filter: PropTypes.object,
};
DeleteFilterButton.defaultProps = {
  onDelete: () => {},
  filter: {},
};
